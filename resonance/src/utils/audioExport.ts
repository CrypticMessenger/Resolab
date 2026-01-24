
import { SourceData } from '@/types/spaudio';
import { generateImpulseResponse } from './reverbUtils';

// Helper to calculate position based on automation
// Duplicates logic from SourceObject to avoid class instantiation dependencies
function calculatePosition(
    t: number,
    basePos: { x: number, y: number, z: number },
    automationType: string,
    params: any
): { x: number, y: number, z: number } {

    let pos = { ...basePos };

    if (automationType === 'orbit') {
        const radius = params.radius || 5;
        const speed = params.speed || 1;
        const centerX = params.centerX || 0;
        const centerZ = params.centerZ || 0;

        const initialAngleDeg = params.initialAngle || 0;
        const initialAngleRad = (initialAngleDeg * Math.PI) / 180;
        const angle = t * speed + initialAngleRad;

        pos.x = centerX + Math.cos(angle) * radius;
        pos.z = centerZ + Math.sin(angle) * radius;
        // Y remains basePos.y
    }
    else if (automationType === 'linear') {
        const target = params.targetPos || { x: 0, y: 0, z: 0 };
        const duration = params.duration || 10;
        let progress = Math.min(t / duration, 1);
        if (t < 0) progress = 0;

        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        pos.x = basePos.x + (target.x - basePos.x) * ease;
        pos.y = basePos.y + (target.y - basePos.y) * ease;
        pos.z = basePos.z + (target.z - basePos.z) * ease;
    }
    else if (automationType === 'pulse') {
        const freq = params.frequency || 1;
        const amp = params.amplitude || 2;
        const offset = Math.sin(t * freq * Math.PI * 2) * amp;
        pos.y = basePos.y + offset;
    }

    return pos;
}

// Helper to write string to DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

export type ExportSettings = {
    sampleRate: number;
    bitDepth: 16 | 24 | 32;
    reverbLevel?: number; // Optional gain (0-1)
};

export async function renderTimelineToWav(
    sources: SourceData[],
    totalDuration: number,
    onProgress: (msg: string) => void,
    settings: ExportSettings = { sampleRate: 44100, bitDepth: 16 }
): Promise<Blob> {

    // 1. Setup Context with selected Sample Rate
    const sampleRate = settings.sampleRate;
    const length = Math.ceil(totalDuration * sampleRate);
    // @ts-ignore - types might be missing for OfflineAudioContext on simple setups
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, length, sampleRate);

    onProgress("Downloading assets...");

    // 2. Load Buffers
    const bufferMap = new Map<string, AudioBuffer>();

    for (const source of sources) {
        if (source.fileUrl && !bufferMap.has(source.fileUrl)) {
            try {
                onProgress(`Loading: ${source.name || source.fileUrl.substring(0, 30)}...`);

                let arrayBuffer: ArrayBuffer;

                // Blob URLs need special handling - use XMLHttpRequest for better compatibility
                if (source.fileUrl.startsWith('blob:')) {
                    arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', source.fileUrl!, true);
                        xhr.responseType = 'arraybuffer';
                        xhr.onload = () => {
                            if (xhr.status === 200 || xhr.status === 0) {
                                resolve(xhr.response);
                            } else {
                                reject(new Error(`XHR failed: ${xhr.status}`));
                            }
                        };
                        xhr.onerror = () => reject(new Error('XHR network error'));
                        xhr.send();
                    });
                } else {
                    // Remote URLs - use fetch
                    const response = await fetch(source.fileUrl);
                    if (!response.ok) {
                        throw new Error(`Fetch failed: ${response.status}`);
                    }
                    arrayBuffer = await response.arrayBuffer();
                }

                // Decode audio data (will resample to context sample rate if needed)
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                bufferMap.set(source.fileUrl, audioBuffer);
                console.log(`Loaded: ${source.name || "Unknown Asset"}`);
            } catch (e) {
                console.error(`Failed to load ${source.fileUrl}`, e);
                onProgress(`Error loading: ${source.name || "Unknown Asset"}`);
            }
        }
    }

    // ... inside renderTimelineToWav ...

    // 2.5 Setup Global Reverb Bus
    // Create Reverb Node
    const reverbNode = ctx.createConvolver();
    // Generate IR synchronously-ish (await works in offline ctx setup phase)
    try {
        const irBuffer = await generateImpulseResponse(ctx, 3.0, 2.5, 0.4);
        reverbNode.buffer = irBuffer;
    } catch (e) {
        console.warn("Export reverb generation failed", e);
    }

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = settings.reverbLevel !== undefined ? settings.reverbLevel : 0.1;
    // TODO: Pass actual reverb level from EditorState or a new param. 
    // For now hardcode 0.1 matching default editor state, OR allow user to set?
    // User sets Global Reverb Level in Editor. We should pass it.

    // Connect Reverb to Destination
    reverbNode.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    onProgress("Scheduling timeline...");

    // 3. Setup Graph
    sources.forEach(source => {
        if (!source.fileUrl) return; // Skip if no audio
        const buffer = bufferMap.get(source.fileUrl);
        if (!buffer) return;

        const srcNode = ctx.createBufferSource();
        srcNode.buffer = buffer;
        srcNode.loop = true; // Default behavior as per Editor

        const panner = ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 2;
        panner.maxDistance = 50;

        const gain = ctx.createGain();
        gain.gain.value = source.volume;

        // Connections
        srcNode.connect(panner);
        panner.connect(gain);
        gain.connect(ctx.destination);

        // Reverb Send (After Panner, mimicking editor flow)
        // Editor flow: Source -> panner -> reverbGain -> reverb -> mainGain
        // Wait, Editor flow in initGlobalAudio was:
        // reverb -> revGain -> mainGain.
        // And Source initAudio: panner.connect(mainGain); panner.connect(reverbNode);
        // So yes, it's a send.
        panner.connect(reverbNode);

        // ... rest of scheduling logic ...

        // Schedule Start/Stop
        const startTime = source.timelineStart || 0;
        const duration = source.timelineDuration || totalDuration;

        // Ensure start is valid
        if (startTime >= totalDuration) return;

        srcNode.start(startTime);
        srcNode.stop(Math.min(startTime + duration, totalDuration));

        // Automation Baking
        const curveStep = 0.05;
        const curveLength = Math.ceil(duration / curveStep) + 1;

        const xCurve = new Float32Array(curveLength);
        const yCurve = new Float32Array(curveLength);
        const zCurve = new Float32Array(curveLength);

        for (let i = 0; i < curveLength; i++) {
            const timeOffset = i * curveStep; // Time relative to start
            if (timeOffset > duration) break;

            const pos = calculatePosition(
                timeOffset,
                source.position,
                source.automationType,
                source.automationParams
            );

            xCurve[i] = pos.x;
            yCurve[i] = pos.y;
            zCurve[i] = pos.z;
        }

        // Apply Curves
        try {
            if (curveLength > 1) {
                panner.positionX.setValueCurveAtTime(xCurve, startTime, duration);
                panner.positionY.setValueCurveAtTime(yCurve, startTime, duration);
                panner.positionZ.setValueCurveAtTime(zCurve, startTime, duration);
            } else {
                panner.setPosition(xCurve[0], yCurve[0], zCurve[0]);
            }
        } catch (e) {
            console.warn("Curve error", e);
            panner.setPosition(xCurve[0], yCurve[0], zCurve[0]);
        }
    });

    onProgress("Rendering audio...");
    const renderedBuffer = await ctx.startRendering();

    onProgress(`Encoding WAV (${settings.bitDepth}-bit)...`);
    return bufferToWav(renderedBuffer, settings.bitDepth);
}

// WAV Encoder with Bit Depth Support
function bufferToWav(buffer: AudioBuffer, bitDepth: 16 | 24 | 32): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = bitDepth === 32 ? 3 : 1; // 1 = PCM, 3 = IEEE Float
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    // Interleave
    const length = buffer.length * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // Write WAV Header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write Interleaved Data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = buffer.getChannelData(channel)[i];
            const s = Math.max(-1, Math.min(1, sample)); // Clip

            if (bitDepth === 16) {
                // 16-bit PCM
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                offset += 2;
            } else if (bitDepth === 24) {
                // 24-bit PCM
                const val = s < 0 ? s * 0x800000 : s * 0x7FFFFF;
                const intVal = Math.floor(val);
                view.setUint8(offset, intVal & 0xFF);
                view.setUint8(offset + 1, (intVal >> 8) & 0xFF);
                view.setUint8(offset + 2, (intVal >> 16) & 0xFF); // Sample is signed, 24-bit works via 2's complement naturally if we just cast bits?
                // Actually setUint8 preserves lower 8 bits.
                // For negative numbers, >> works.
                offset += 3;
            } else if (bitDepth === 32) {
                // 32-bit Float
                view.setFloat32(offset, s, true);
                offset += 4;
            }
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}

