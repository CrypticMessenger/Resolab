// Utility to generate high-quality Impulse Responses (IR) for convolution reverb

export async function generateImpulseResponse(
    audioCtx: BaseAudioContext, // Supports both AudioContext and OfflineAudioContext
    duration: number = 2.5,
    decay: number = 2.0,
    brightness: number = 0.5 // 0 to 1 (Dark to Bright)
): Promise<AudioBuffer> {

    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;

    // We use an OfflineAudioContext to render the IR properly with filters
    // @ts-ignore - Prefix handling
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new OfflineContext(2, length, sampleRate);

    // 1. White Noise Source
    const noiseBuffer = ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
        const data = noiseBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // 2. Frequency Shaping (LowPass Filter Sweep)
    // Simulates air absorption: High freqs decay faster than low freqs.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.1; // Smooth roll-off

    // Brightness controls the starting frequency and how fast it closes
    const startFreq = 20000; // Start open
    const endFreq = 200 + (brightness * 3000); // End frequency
    filter.frequency.setValueAtTime(startFreq, 0);
    // Envelope the filter down over the duration
    filter.frequency.exponentialRampToValueAtTime(endFreq, duration * 0.8);

    // 3. Amplitude Envelope (Exponential Decay)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, decay);

    // Routing
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();

    // Render
    return await ctx.startRendering();
}
