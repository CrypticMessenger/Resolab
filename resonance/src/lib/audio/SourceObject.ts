import * as THREE from 'three';
import { SourceType } from '@/types/spaudio';

export class SourceObject {
    id: string;
    name: string;
    color: THREE.Color;

    timelineStart: number = 0;
    timelineDuration: number | null = null;
    automation: any | null = null; // Type 'AutomationTrack' imported later or defined in types

    // State
    isPlaying: boolean = false;
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: -5 };
    basePosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: -5 }; // The user-defined "Anchor"
    volume: number = 1.0;
    // Trajectory is now method-based, not a stored closure function
    // trajectoryFunc: Function | null = null; // Removing this in favor of computed method
    trajectoryStartTime: number = 0;
    sourceType: SourceType = 'none';

    buffer: AudioBuffer | null = null;
    fileUrl: string | null = null; // URL for remote storage
    fileSize: number = 0; // Size in bytes
    error?: string; // Error state

    get hasTrajectory(): boolean {
        return this.automationType !== 'none';
    }

    // 3D Mesh
    mesh: THREE.Mesh;
    targetMesh: THREE.Mesh;
    trajectoryLine: THREE.Line;

    // Audio Nodes
    audioElement: HTMLAudioElement;
    panner: PannerNode | null = null;
    gain: GainNode | null = null;
    analyser: AnalyserNode | null = null;
    sourceNode: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null;
    mediaSourceRaw: MediaElementAudioSourceNode | null = null;
    dataArray: Uint8Array | null = null;

    constructor(id: string, name: string, color: THREE.Color) {
        this.id = id;
        this.name = name;
        this.color = color;

        // 3D Mesh
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            roughness: 0.4,
            metalness: 0.2,
            transparent: true, opacity: 0.9
        });
        this.mesh = new THREE.Mesh(geometry, material);

        // Add a subtle glow halo instead of wireframe
        // const glowGeo = new THREE.SphereGeometry(0.8, 32, 32);
        // const glowMat = new THREE.MeshBasicMaterial({ 
        //     color: color, 
        //     transparent: true, 
        //     opacity: 0.1,
        //     side: THREE.BackSide
        // });
        // const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        // this.mesh.add(glowMesh);

        this.mesh.userData = { id: id };
        this.mesh.castShadow = true;
        this.mesh.position.set(0, 0, -5);
        this.basePosition = { ...this.position };

        // Ghost Target Mesh (Visualizer for Linear movement)
        const targetGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const targetMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.targetMesh = new THREE.Mesh(targetGeo, targetMat);
        this.targetMesh.userData = { id: id, isTarget: true };
        this.targetMesh.visible = false;

        // Trajectory Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        this.trajectoryLine = new THREE.Line(lineGeo, lineMat);
        this.trajectoryLine.visible = false;

        // Audio Element
        this.audioElement = new Audio();
        this.audioElement.loop = true;
        this.audioElement.crossOrigin = "anonymous";
    }

    initAudio(ctx: AudioContext, destination: AudioNode, reverbSend: AudioNode) {
        if (this.panner) return;

        this.panner = ctx.createPanner();
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
        this.panner.refDistance = 2;
        this.panner.maxDistance = 50;

        this.gain = ctx.createGain();
        this.gain.gain.value = this.volume;

        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 32;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.panner.connect(this.gain);
        this.gain.connect(this.analyser);
        this.analyser.connect(destination);
        this.panner.connect(reverbSend);

        this.updatePosition(this.position.x, this.position.y, this.position.z);
    }

    updatePosition(x: number, y: number, z: number) {
        // This is the "User" moving the source (setting the anchor)
        this.position = { x, y, z };
        this.basePosition = { x, y, z };

        // Immediate visual update
        this.renderPosition(x, y, z);
    }

    // Helper to update 3D/Audio without changing "State"
    private renderPosition(x: number, y: number, z: number) {
        this.mesh.position.set(x, y, z);

        // Update Trajectory Line Visuals from Anchor to Target (if Linear)
        if (this.automationType === 'linear' && this.targetPosition) {
            // For linear, visual line should connect Base -> Target
            // Even if currently interpolating, the "path" is static relative to anchor
            const positions = new Float32Array([
                this.basePosition.x, this.basePosition.y, this.basePosition.z,
                this.targetPosition.x, this.targetPosition.y, this.targetPosition.z
            ]);
            this.trajectoryLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }

        if (this.panner) {
            if (this.panner.positionX) {
                this.panner.positionX.value = x;
                this.panner.positionY.value = y;
                this.panner.positionZ.value = z;
            } else {
                this.panner.setPosition(x, y, z);
            }
        }
    }

    play(ctx: AudioContext, offset: number = 0, when: number = 0) {
        if (!this.panner) return;
        if (ctx.state === 'suspended') ctx.resume();

        this.stop(); // Stop existing before playing new

        if (this.sourceType === 'file') {
            if (!this.mediaSourceRaw) {
                this.mediaSourceRaw = ctx.createMediaElementSource(this.audioElement);
            }
            this.sourceNode = this.mediaSourceRaw;
            this.sourceNode.connect(this.panner);

            this.audioElement.currentTime = offset;
            this.audioElement.play().catch(e => console.warn("Autoplay blocked", e));
        }
        else if (this.sourceType === 'generated' && this.buffer) {
            this.sourceNode = ctx.createBufferSource();
            this.sourceNode.buffer = this.buffer;
            this.sourceNode.loop = true;
            this.sourceNode.connect(this.panner);
            (this.sourceNode as AudioBufferSourceNode).start(when, offset);
        }
        this.isPlaying = true;
    }

    seek(time: number) {
        if (this.sourceType === 'file') {
            this.audioElement.currentTime = time;
        }
        // Buffer sources can't be "seeked" without restarting, handled by play(..., offset)
    }

    stop() {
        if (this.sourceType === 'file') {
            this.audioElement.pause();
        } else if (this.sourceNode && (this.sourceNode as AudioBufferSourceNode).stop) {
            try { (this.sourceNode as AudioBufferSourceNode).stop(); } catch (e) { }
        }
        this.isPlaying = false;
    }
    // Automation
    automationType: 'none' | 'orbit' | 'linear' | 'pulse' = 'none';
    automationParams: any = {};

    // Config properties for linear movement visualizer
    targetPosition: { x: number; y: number; z: number } | null = null;

    // Called every frame by Editor
    applyTrajectory(currentTime: number) {
        if (this.automationType === 'none') {
            // Ensure we are at base position if no automation
            // (Could be optimized to not run every frame, but safe for now)
            this.renderPosition(this.basePosition.x, this.basePosition.y, this.basePosition.z);
            return;
        }

        // Relative time in timeline
        const t = Math.max(0, currentTime - this.timelineStart);
        const duration = this.automationParams.duration || this.timelineDuration || 5;

        let finalPos = { ...this.basePosition };

        if (this.automationType === 'orbit') {
            const radius = this.automationParams.radius || 5;
            const speed = this.automationParams.speed || 1;
            const centerX = this.automationParams.centerX || 0;
            const centerZ = this.automationParams.centerZ || 0;

            // Orbit is usually absolute around a center, OR relative to base? 
            // Previous impl was absolute center. User might expect "Orbit around ME" or "Orbit around ITSELF".
            // Let's stick to "Orbit around defined center params" but maybe use basePos as the center?
            // "Orbit" preset usually means "Go around head". 
            // If user moves source, does it offset the orbit?
            // Let's implement: Calculated Circle + BasePosition Offset (so you can move the whole circle)
            // Actually, "Orbit" usually implies Center (0,0,0). 
            // Let's force Center to be (0,0,0) offset by Params, ignoring BasePos X/Z but respecting Y?
            // User feedback "Pulse... move core center" implies they expect BasePos to modify the automation result.

            // New Orbit Logic: Circle around (centerX, centerZ) + BasePosition offset? 
            // No, that's confusing. 
            // Let's assume Orbit is Absolute Center (0,0,0) by default, and user changes Center parameters.
            // BUT BasePos.y should be respected.

            const angle = t * speed;
            finalPos.x = centerX + Math.cos(angle) * radius;
            finalPos.z = centerZ + Math.sin(angle) * radius;
            finalPos.y = this.basePosition.y;
        }
        else if (this.automationType === 'linear') {
            const target = this.targetPosition || { x: 0, y: 0, z: 0 };

            // Time progress
            const progress = Math.min(t / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            finalPos.x = this.basePosition.x + (target.x - this.basePosition.x) * ease;
            finalPos.y = this.basePosition.y + (target.y - this.basePosition.y) * ease;
            finalPos.z = this.basePosition.z + (target.z - this.basePosition.z) * ease;
        }
        else if (this.automationType === 'pulse') {
            const freq = this.automationParams.frequency || 1;
            const amp = this.automationParams.amplitude || 2;

            // Sine wave on Y axis relative to Base Position
            const offset = Math.sin(t * freq * Math.PI * 2) * amp;
            finalPos.y = this.basePosition.y + offset;
        }

        this.renderPosition(finalPos.x, finalPos.y, finalPos.z);
    }

    updateAutomation() {
        // Visuals Setup
        this.targetMesh.visible = (this.automationType === 'linear');
        this.trajectoryLine.visible = (this.automationType === 'linear');

        if (this.automationType === 'linear') {
            const target = this.automationParams.targetPos || { x: 0, y: 0, z: 0 };
            this.targetPosition = target;
            this.targetMesh.position.set(target.x, target.y, target.z);
        }
    }
}
