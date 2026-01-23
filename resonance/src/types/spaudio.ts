import * as THREE from 'three';

export type SourceType = 'none' | 'file' | 'generated';

export interface AutomationPoint {
    time: number;
    value: { x: number; y: number; z: number };
}

export interface AutomationTrack {
    points: AutomationPoint[];
}

export type AutomationType = 'none' | 'orbit' | 'linear' | 'pulse';

export interface AutomationParams {
    // Orbit
    radius?: number;
    speed?: number;
    centerX?: number;
    centerZ?: number;

    // Linear
    targetPos?: { x: number; y: number; z: number };

    // Pulse
    frequency?: number;
    amplitude?: number;
}

export interface SourceData {
    id: string;
    name: string;
    color: string;
    position: { x: number; y: number; z: number };
    volume: number;
    sourceType: SourceType;
    isPlaying: boolean;
    hasTrajectory: boolean;

    // Timeline
    timelineStart: number;
    timelineDuration?: number;

    // Automation
    automationType?: AutomationType;
    automationParams?: AutomationParams;

    // Legacy (keeping for compatibility if needed, but typed as generic any in usage before)
    automation?: AutomationTrack;

    // Storage
    fileSize?: number; // Size in bytes
    fileUrl?: string; // Persisted URL
    error?: string; // Error state (e.g. "missing")
}

export interface EditorState {
    name: string;
    x: number;
    y: number;
    z: number;
    vol: number;
    sourceType: SourceType;
    isPlaying: boolean;

    // Timeline
    timelineStart?: number;
    timelineDuration?: number;

    // Automation
    automationType?: AutomationType;
    automationParams?: AutomationParams;
}

