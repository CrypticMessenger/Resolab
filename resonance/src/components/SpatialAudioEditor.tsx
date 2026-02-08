"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { SourceObject } from '@/lib/audio/SourceObject';
import { SourceData, SourceType, EditorState } from '@/types/spaudio';
import { subscriptionManager, UserTier } from '@/lib/subscription';

import Tooltip from './spaudio/Tooltip';
import GlobalControls from './spaudio/GlobalControls';
import EditorSidebar from './spaudio/EditorSidebar';
import Timeline from './spaudio/Timeline';
import MediaLibraryModal from './spaudio/MediaLibraryModal';
import GeminiSettingsModal from './spaudio/GeminiSettingsModal';
import AuthButton from './auth/AuthButton';
import { useTheme } from "next-themes";
import { createClient } from '@/utils/supabase/client';
import ThinkingPanel from './ThinkingPanel';
import AutoFoleyModal from './AutoFoleyModal';
import { findBestAssetMatch } from '@/lib/assetLibrary';

import { generateSpatialSceneAction, analyzeVideoAction } from '@/actions/gemini';
import { renderTimelineToWav, ExportSettings } from '@/utils/audioExport';
import { saveAudioFile, getFileUrl, getAudioFile } from '@/utils/indexedDB';
import ExportSettingsModal from './spaudio/ExportSettingsModal';
import { generateImpulseResponse } from '@/utils/reverbUtils';


export default function SpatialAudioEditor({ projectId }: { projectId?: string }) {
    const supabase = createClient();

    // --- Refs ---
    const containerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const mainSceneGainRef = useRef<GainNode | null>(null);
    const reverbNodeRef = useRef<ConvolverNode | null>(null);
    const reverbGainRef = useRef<GainNode | null>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sourcesRef = useRef<SourceObject[]>([]);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());
    const animationFrameRef = useRef<number>(0);

    // Recording Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const wavProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const wavLeftRef = useRef<Float32Array[]>([]);
    const wavRightRef = useRef<Float32Array[]>([]);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- State ---
    const [sourcesList, setSourcesList] = useState<SourceData[]>([]);
    const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string; color: string }>({
        visible: false, x: 0, y: 0, text: '', color: '#fff'
    });
    const [isPro, setIsPro] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [aiStatus, setAiStatus] = useState('');
    const [promptInput, setPromptInput] = useState('');
    const [showLibrary, setShowLibrary] = useState(false);
    const [showExportSettings, setShowExportSettings] = useState(false);
    const [reverbGlobal, setReverbGlobal] = useState(0); // Default 0 as requested

    // Account Usage State
    const [accountUsage, setAccountUsage] = useState({ usedBytes: 0, fileCount: 0 });

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState("Untitled Project");

    // Use static limits from manager
    const limits = subscriptionManager.getLimits();

    // Fetch Account Usage
    const fetchAccountUsage = async () => {
        // Mock usage for demo
        setAccountUsage({ usedBytes: 0, fileCount: 0 });
    };

    useEffect(() => {
        fetchAccountUsage();
    }, []);

    // Timeline State
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(30); // Default 30s
    const [isPlaying, setIsPlaying] = useState(false);

    // Refs for Animation Loop (to avoid stale closures)
    const currentTimeRef = useRef(0);
    const isPlayingRef = useRef(false);
    const lastFrameTimeRef = useRef<number>(0);

    // Sync refs with state
    useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    // --- Gemini Config State ---
    const [showGeminiSettings, setShowGeminiSettings] = useState(false);
    const [geminiConfig, setGeminiConfig] = useState({ apiKey: "", modelName: "gemini-3-flash-preview" });

    useEffect(() => {
        const stored = localStorage.getItem('resolab_gemini_config');
        if (stored) {
            try {
                setGeminiConfig(JSON.parse(stored));
            } catch (e) { console.error("Failed to parse gemini config", e); }
        }
    }, []);

    const handleSaveGeminiConfig = (config: { apiKey: string; modelName: string }) => {
        setGeminiConfig(config);
        localStorage.setItem('resolab_gemini_config', JSON.stringify(config));
    };

    // Editor UI State
    const [editorState, setEditorState] = useState<EditorState>({
        name: '',
        x: 0, y: 0, z: 0,
        vol: 100,
        sourceType: 'none',
        isPlaying: false,
        timelineStart: 0,
        timelineDuration: 10
    });

    const [isSceneReady, setIsSceneReady] = useState(false);

    const { theme } = useTheme();

    // Update Scene Background on Theme Change
    // useEffect(() => {
    //     if (sceneRef.current) {
    //         sceneRef.current.background = new THREE.Color(theme === 'light' ? 0xffffff : 0x050505);
    //     }
    // }, [theme]);

    // --- Constants ---
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // --- Initialization ---
    // --- Persistence & Auth ---
    // --- Persistence & Auth ---
    useEffect(() => {
        // Force PRO state for demo
        setIsPro(true);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('name, data')
                .eq('id', projectId)
                .single();

            if (data) {
                if (data.name) setProjectName(data.name);
                if ((data as any).data) {
                    console.log("Loading project data...", (data as any).data);
                    loadProject((data as any).data);
                }
            } else if (error) {
                console.error("Error loading project:", error);
            }
        };

        fetchProject();
    }, [projectId]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Cleanup any existing children (Prevent Duplicate Canvases)
        if (containerRef.current.children.length > 0) {
            console.warn("Found existing canvas in container. Force clearing.");
            containerRef.current.innerHTML = '';
        }

        // 1. Three.js Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 15);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        // Ensure canvas is absolute/top-left to prevent flow layout issues if duplicates somehow occur
        renderer.domElement.style.display = 'block';

        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lights & Helpers
        scene.add(new THREE.AmbientLight(0x404040));
        const dl = new THREE.DirectionalLight(0xffffff, 1);
        dl.position.set(10, 20, 10); dl.castShadow = true; scene.add(dl);
        // Grid Helper Color Adjustment
        const gridColor = 0x333333;
        const gridCenterColor = 0x111111;
        scene.add(new THREE.GridHelper(100, 100, gridCenterColor, gridColor));

        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.y = 0.01;
        scene.add(axesHelper);

        // Head Group
        const headGroup = new THREE.Group();

        // Main Head Sphere
        const headGeo = new THREE.SphereGeometry(0.6, 32, 32);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headGroup.add(headMesh);

        // Headphones (Torus)
        const headphoneGeo = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
        const headphoneMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });

        const leftEar = new THREE.Mesh(headphoneGeo, headphoneMat);
        leftEar.position.set(-0.6, 0, 0);
        leftEar.rotation.y = Math.PI / 2;
        headGroup.add(leftEar);

        const rightEar = new THREE.Mesh(headphoneGeo, headphoneMat);
        rightEar.position.set(0.6, 0, 0);
        rightEar.rotation.y = Math.PI / 2;
        headGroup.add(rightEar);

        // Headband (Arc)
        const headbandGeo = new THREE.TorusGeometry(0.65, 0.05, 16, 32, Math.PI);
        const headband = new THREE.Mesh(headbandGeo, headphoneMat);
        headband.rotation.z = Math.PI / 2; // Arc over top
        headGroup.add(headband);

        // Visor (Direction Indicator)
        const visorGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.1, 0.5); // Front of face
        headGroup.add(visor);

        scene.add(headGroup);

        // 1b. Restore Existing Sources (Crucial for HMR / Re-renders)
        // If the scene was recreated (e.g. theme change), re-add existing sources
        if (sourcesRef.current.length > 0) {
            console.log("Restoring existing sources to new scene:", sourcesRef.current.length);
            sourcesRef.current.forEach(s => {
                scene.add(s.mesh);
                scene.add(s.targetMesh);
                scene.add(s.trajectoryLine);
            });
        }

        // 2. Event Listeners
        const onResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', onResize);

        const onMouseMove = (event: MouseEvent) => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

            setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY - 20 }));
        };
        window.addEventListener('mousemove', onMouseMove);

        // 3. Animation Loop
        const animate = () => {
            try {
                animationFrameRef.current = requestAnimationFrame(animate);
                const now = Date.now();

                // Raycasting
                if (cameraRef.current && sceneRef.current) {
                    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
                    const intersectObjects = sourcesRef.current.map(s => s.mesh);
                    const intersects = raycasterRef.current.intersectObjects(intersectObjects);

                    if (intersects.length > 0) {
                        const hitObj = intersects[0].object;
                        const source = sourcesRef.current.find(s => s.id === hitObj.userData.id);
                        if (source) {
                            setTooltip(prev => ({
                                ...prev,
                                visible: true,
                                text: source.name,
                                color: '#' + source.color.getHexString()
                            }));
                        }
                    } else {
                        setTooltip(prev => ({ ...prev, visible: false }));
                    }
                }

                // Source Updates
                sourcesRef.current.forEach(s => {
                    // Timeline Logic
                    if (isPlayingRef.current) {
                        const t = currentTimeRef.current;
                        const duration = s.timelineDuration || 10;
                        const isActive = t >= s.timelineStart && t < s.timelineStart + duration;

                        if (isActive && !s.isPlaying) {
                            if (audioCtxRef.current) s.play(audioCtxRef.current, t - s.timelineStart);
                        } else if (!isActive && s.isPlaying) {
                            s.stop();
                        }
                    }

                    // Automation
                    if (s.automationType !== 'none') {
                        // Use Timeline Time if playing, otherwise use current time or preview time?
                        // Actually, if we scrub, we want to see result.
                        // If playing, use `currentTimeRef.current`.
                        // If NOT playing, use `currentTime`.

                        // Note: `currentTimeRef` is updated in animate loop for smooth playback, 
                        // `currentTime` state is used for seeking/rendering ticks.

                        if (typeof s.applyTrajectory === 'function') {
                            const t = currentTimeRef.current;
                            s.applyTrajectory(t);
                        } else {
                            // Fallback for HMR / Stale objects
                            console.warn("applyTrajectory missing on source", s.id);
                        }
                    }


                    // Visualizer
                    if (s.isPlaying && s.analyser && s.dataArray) {
                        s.analyser.getByteFrequencyData(s.dataArray as any);
                        let sum = 0; for (let i = 0; i < s.dataArray.length; i++) sum += s.dataArray[i];
                        const avg = sum / s.dataArray.length;
                        const scale = 1 + (avg / 50);
                        s.mesh.scale.set(scale, scale, scale);
                        // @ts-expect-error - emissiveIntensity exists on StandardMaterial
                        s.mesh.material.emissiveIntensity = avg / 100;
                    }
                });

                // Timeline Increment
                if (isPlayingRef.current) {
                    const delta = (now - lastFrameTimeRef.current) / 1000;
                    if (delta < 0.1) { // Prevent huge jumps
                        const next = currentTimeRef.current + delta;

                        // Calculate dynamic end time based on sources
                        const maxSourceTime = sourcesRef.current.reduce((max, s) => {
                            return Math.max(max, s.timelineStart + (s.timelineDuration || 10));
                        }, 0);
                        // Add a small buffer or ensure at least minimal playback
                        const stopTime = Math.max(maxSourceTime, 2.0);

                        if (next >= stopTime) {
                            setIsPlaying(false);
                            isPlayingRef.current = false; // Immediate update
                            setCurrentTime(0);
                            currentTimeRef.current = 0;
                            sourcesRef.current.forEach(s => s.stop());
                        } else {
                            setCurrentTime(next);
                            currentTimeRef.current = next;
                        }
                    }
                }
                lastFrameTimeRef.current = now;

                controls.update();
                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                }
            } catch (e) {
                console.error("CRITICAL: Animation Loop Crashed", e);
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
        animate();

        // Initial Source only if new project
        if (!projectId) {
            createSource();
        }

        // Set Ready
        setIsSceneReady(true);

        return () => {
            // Set Not Ready
            setIsSceneReady(false);

            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameRef.current);
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]); // Re-run init if theme changes to reset grid/bg properly, or we could just update props

    // --- Load Project ---
    // --- Load Project ---
    useEffect(() => {
        if (!projectId || !isSceneReady) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                const json = await res.json();
                if (json.project && json.project.data && Object.keys(json.project.data).length > 0) {
                    console.log("Scene Ready. Loading project data now.");
                    loadProject(json.project.data);
                }
            } catch (e) {
                console.error("Failed to load project", e);
            }
        };
        fetchProject();
    }, [projectId, isSceneReady]);

    // --- Audio Logic ---
    const initGlobalAudio = async () => {
        if (audioCtxRef.current) return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const mainGain = ctx.createGain();
        mainGain.connect(ctx.destination);
        mainSceneGainRef.current = mainGain;

        const reverb = ctx.createConvolver();
        const revGain = ctx.createGain();
        revGain.gain.value = 0; // Default off to match state
        reverb.connect(revGain);
        revGain.connect(mainGain);
        reverbNodeRef.current = reverb;
        reverbGainRef.current = revGain;

        // High Quality Impulse Response
        try {
            const buffer = await generateImpulseResponse(ctx, 3.0, 2.5, 0.4); // Longer, warmer
            reverb.buffer = buffer;
        } catch (e) {
            console.error("Failed to generate reverb IR", e);
        }
    };

    const syncSourceList = () => {

        setSourcesList(sourcesRef.current.map(s => ({
            id: s.id,
            name: s.name,
            color: '#' + s.color.getHexString(),
            position: s.position,
            volume: s.volume,
            sourceType: s.sourceType,
            isPlaying: s.isPlaying,
            hasTrajectory: s.hasTrajectory,
            timelineStart: s.timelineStart,
            timelineDuration: s.timelineDuration || 10,
            automationType: s.automationType,
            automationParams: s.automationParams,
            error: s.error
        })));
    };

    const addSource = (sourceType: SourceType | 'generated' = 'none', x: number = 0, y: number = 0, z: number = 0, name?: string, fileUrlOverride?: string) => {
        initGlobalAudio();

        const id = Date.now().toString() + Math.random().toString().slice(2, 5);
        const hue = Math.random() * 360;
        const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
        const sourceName = name || `Source ${sourcesRef.current.length + 1}`;

        const newSource = new SourceObject(id, sourceName, color);
        newSource.position = { x, y, z };
        // Update mesh position immediately
        newSource.mesh.position.set(x, y, z);
        newSource.targetMesh.position.set(x, y, z);
        newSource.sourceType = sourceType === 'generated' ? 'generated' : sourceType as SourceType;

        // Apply File URL Override (Virtual Wiring)
        if (fileUrlOverride) {
            newSource.fileUrl = fileUrlOverride;
            newSource.audioElement.src = fileUrlOverride;
            // If generated, we treat it as file for playback logic usually, or 'generated' specific buffer logic?
            // For hackathon simplicity, we treat remote URLs as 'file' stream
            if (sourceType === 'generated') newSource.sourceType = 'file';
        }

        if (audioCtxRef.current && mainSceneGainRef.current && reverbNodeRef.current) {
            newSource.initAudio(audioCtxRef.current, mainSceneGainRef.current, reverbNodeRef.current);
        }

        sourcesRef.current.push(newSource);
        if (sceneRef.current) {
            sceneRef.current.add(newSource.mesh);
            sceneRef.current.add(newSource.targetMesh);
            sceneRef.current.add(newSource.trajectoryLine);
        }

        syncSourceList();
        selectSource(id);
    };

    const createSource = () => addSource('none', 0, 0, 0);

    const selectSource = (id: string) => {
        setActiveSourceId(id);
        const source = sourcesRef.current.find(s => s.id === id);
        if (source) {
            setEditorState({
                name: source.name,
                x: source.position.x,
                y: source.position.y,
                z: source.position.z,
                vol: source.volume * 100,
                sourceType: source.sourceType,
                isPlaying: source.isPlaying,
                timelineStart: source.timelineStart,
                timelineDuration: source.timelineDuration ?? undefined,
                automationType: source.automationType,
                automationParams: source.automationParams
            });
        }
    };



    const updateActiveSource = (updates: Partial<EditorState>) => {
        if (!activeSourceId) return;
        const source = sourcesRef.current.find(s => s.id === activeSourceId);
        if (!source) return;

        if (updates.name !== undefined) source.name = updates.name;

        // Handle Automation Updates
        if (updates.automationType !== undefined) {
            source.automationType = updates.automationType;
            // Reset params if switching types? For now keep them or reset if needed.
            // If switching to linear, maybe init target pos to current pos + offset?
            if (source.automationType === 'linear' && !source.automationParams.targetPos) {
                source.automationParams.targetPos = { ...source.position, z: source.position.z - 5 };
            }
            source.updateAutomation();
            syncSourceList();
        }
        if (updates.automationParams !== undefined) {
            source.automationParams = updates.automationParams;
            // Re-apply trajectory for live-preview if paused or just to ensure immediate update
            if (typeof source.applyTrajectory === 'function') {
                const t = currentTimeRef.current; // Use current constrained time
                source.applyTrajectory(t);
            }
            source.updateAutomation(); // Update visualizer lines
        }

        if (updates.x !== undefined || updates.y !== undefined || updates.z !== undefined) {
            // Manual move kills trajectory IF not in automation mode? 
            // Actually, if we are in 'orbit' or 'linear', moving the source manually sets the START position.
            // But trajectoryFunc overrides it every frame if playing or previewing.
            // We should allow moving the "Anchor" / Start position.

            // If dragging GHOST TARGET
            if (updates.automationParams?.targetPos) {
                // This path is triggered by the ghost drag logic below, passing updates.automationParams
            } else {
                source.updatePosition(
                    updates.x ?? source.position.x,
                    updates.y ?? source.position.y,
                    updates.z ?? source.position.z
                );
                // If automated, re-apply trajectory immediately to reflect new base pos
                if (source.automationType !== 'none') {
                    source.updateAutomation(); // Update visuals
                    if (typeof source.applyTrajectory === 'function') {
                        source.applyTrajectory(currentTime); // Re-calc position
                    }
                }
            }
        }
        if (updates.vol !== undefined) {
            source.volume = updates.vol / 100;
            if (source.gain) source.gain.gain.value = source.volume;
        }

        setEditorState(prev => ({ ...prev, ...updates }));
        if (updates.name !== undefined) syncSourceList();
    };

    // Mouse Interaction for Draggable Targets
    const isDraggingRef = useRef(false);
    const dragTargetRef = useRef<{ id: string, isTarget: boolean } | null>(null);
    const dragPlaneRef = useRef(new THREE.Plane());
    const dragOffsetRef = useRef(new THREE.Vector3());

    const onMouseDown = (event: React.MouseEvent) => {
        if (!cameraRef.current || !sceneRef.current) return;

        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        // Intersect Source Meshes + Target Meshes
        const allMeshes = sourcesRef.current.flatMap(s => [s.mesh, s.targetMesh]);
        // Filter visible ones
        const visibleMeshes = allMeshes.filter(m => m.visible);

        const intersects = raycasterRef.current.intersectObjects(visibleMeshes);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const object = hit.object;

            if (event.button === 0) { // Left click
                isDraggingRef.current = true;
                dragTargetRef.current = { id: object.userData.id, isTarget: !!object.userData.isTarget };

                // Select if not target (or even if target? implied source selection)
                selectSource(object.userData.id);

                // Setup Drag Plane
                dragPlaneRef.current.setFromNormalAndCoplanarPoint(
                    cameraRef.current.getWorldDirection(new THREE.Vector3()),
                    hit.point
                );

                dragOffsetRef.current.copy(hit.point).sub(object.position);

                // Disable orbit controls
                // controls.enabled = false; // We need access to controls ref to disable
            }
        }
    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        dragTargetRef.current = null;
    };

    // Add Event Listeners for Mouse Down/Up to container
    useEffect(() => {
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('mousedown', onMouseDown as any);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            if (canvas) canvas.removeEventListener('mousedown', onMouseDown as any);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // Update onMouseMove to handle drag
    useEffect(() => {
        const onMouseMoveGlobal = (event: MouseEvent) => {
            if (isDraggingRef.current && dragTargetRef.current && raycasterRef.current && cameraRef.current) {
                mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

                raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
                const ray = raycasterRef.current.ray;
                const targetPoint = new THREE.Vector3();
                ray.intersectPlane(dragPlaneRef.current, targetPoint);

                const newPos = targetPoint.sub(dragOffsetRef.current);

                if (dragTargetRef.current.isTarget) {
                    // Update Target Position
                    const source = sourcesRef.current.find(s => s.id === dragTargetRef.current?.id);
                    if (source) {
                        const targetPos = { x: newPos.x, y: newPos.y, z: newPos.z };
                        const newParams = { ...source.automationParams, targetPos };
                        updateActiveSource({ automationParams: newParams });
                    }
                } else {
                    // Update Source Position
                    updateActiveSource({ x: newPos.x, y: newPos.y, z: newPos.z });
                }
            }
        };
        window.addEventListener('mousemove', onMouseMoveGlobal);
        return () => window.removeEventListener('mousemove', onMouseMoveGlobal);
    }, [activeSourceId]); // Re-bind if needed, or keep ref based. Ref based is better for perf.


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeSourceId || !e.target.files?.[0]) return;
        const file = e.target.files[0];

        const source = sourcesRef.current.find(s => s.id === activeSourceId);
        if (!source) return;

        // Set file size
        source.fileSize = file.size;

        // 1. Immediate local playback (Optimistic)
        const localUrl = URL.createObjectURL(file);
        source.audioElement.src = localUrl;
        source.sourceType = 'file';

        if (source.name.startsWith("Source ")) {
            source.name = file.name.substring(0, 15);
            updateActiveSource({ name: source.name });
        }

        updateActiveSource({ sourceType: 'file' });
        // Removed auto-play
        // if (audioCtxRef.current) source.play(audioCtxRef.current);
        // updateActiveSource({ isPlaying: true });
        syncSourceList();

        // 2. Upload to Supabase Storage (Global Path)
        if (!currentUserId) {
            console.error("No user ID found for upload");
            return;
        }

        setAiStatus("Uploading file...");
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('audio-files')
                .upload(fileName, file);

            if (error) throw error;

            // Increment Account Usage
            await supabase.rpc('increment_storage', {
                bytes: file.size,
                file_count: 1
            });
            fetchAccountUsage(); // Sync

            const { data: { publicUrl } } = supabase.storage
                .from('audio-files')
                .getPublicUrl(fileName);

            source.fileUrl = publicUrl;
            console.log("File uploaded:", publicUrl);
            setAiStatus("");
        } catch (err) {
            console.error("Upload failed:", err);
            setAiStatus("Upload Failed");
            // We don't stop playback, but warn user
            alert("Failed to upload file to cloud. It will not be saved.");
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            sourcesRef.current.forEach(s => s.stop());
        } else {
            setIsPlaying(true);
            isPlayingRef.current = true;
            lastFrameTimeRef.current = Date.now();
        }
    };

    const toggleSourcePlayback = () => {
        if (!activeSourceId) return;
        const source = sourcesRef.current.find(s => s.id === activeSourceId);
        if (!source) return;

        if (source.isPlaying) {
            source.stop();
            updateActiveSource({ isPlaying: false });
        } else {
            // Stop global playback if running to prevent conflict
            if (isPlayingRef.current) {
                setIsPlaying(false);
                isPlayingRef.current = false;
                sourcesRef.current.forEach(s => s.stop());
            }

            if (audioCtxRef.current) source.play(audioCtxRef.current);
            updateActiveSource({ isPlaying: true });
        }
        syncSourceList();
    };

    const handleSeek = (time: number) => {
        setCurrentTime(time);
        currentTimeRef.current = time;

        if (!isPlaying) {
            // Preview frame?
            // For now just update time, user has to play to hear.
        } else {
            // If playing, we need to resync sources
            sourcesRef.current.forEach(s => {
                const isActive = time >= s.timelineStart &&
                    (s.timelineDuration === null || time < s.timelineStart + s.timelineDuration);
                if (isActive) {
                    if (audioCtxRef.current) s.play(audioCtxRef.current, time - s.timelineStart);
                } else {
                    s.stop();
                }
            });
        }
    };

    const handleUpdateSourceTimeline = (id: string, updates: { timelineStart?: number; timelineDuration?: number }) => {
        const source = sourcesRef.current.find(s => s.id === id);
        if (!source) return;

        if (updates.timelineStart !== undefined) source.timelineStart = updates.timelineStart;
        if (updates.timelineDuration !== undefined) source.timelineDuration = updates.timelineDuration;

        // Update automation (e.g. Linear duration depends on this)
        if (source.automationType !== 'none') source.updateAutomation();

        syncSourceList();
        if (activeSourceId === id) selectSource(id);
    };



    const stopMotion = () => {
        if (!activeSourceId) return;
        const source = sourcesRef.current.find(s => s.id === activeSourceId);
        if (source) {
            source.automationType = 'none';
            // Reset to base position visually
            if (typeof source.applyTrajectory === 'function') {
                source.applyTrajectory(0);
            }
            syncSourceList();
        }
    };

    const deleteSource = (id: string) => {
        const sourceIndex = sourcesRef.current.findIndex(s => s.id === id);
        if (sourceIndex === -1) return;

        const source = sourcesRef.current[sourceIndex];

        // Cleanup
        if (sceneRef.current) {
            sceneRef.current.remove(source.mesh);
            sceneRef.current.remove(source.targetMesh);
            sceneRef.current.remove(source.trajectoryLine);
        }
        source.stop();

        // Remove from ref
        sourcesRef.current.splice(sourceIndex, 1);

        // Update state
        syncSourceList();

        // If active source was deleted, deselect
        if (activeSourceId === id) {
            setActiveSourceId(null);
        }
    };

    const handleSelectLibraryFile = async (url: string | null, size: number, name: string, id?: string) => {
        if (!activeSourceId) return;

        // If no URL but we have ID, try to get it (Persistence recovery path)
        if (!url && id) {
            const fileRecord = await getAudioFile(id);
            if (fileRecord) {
                url = getFileUrl(fileRecord.blob);
            } else {
                console.error("File not found in DB:", id);
                return;
            }
        }

        if (!url) return;

        // Check limits (File count check skipped as we are assigning to existing source usually, 
        // but if we were creating new source we would check. Here we assume assigning to active source).
        // Actually, if active source wasn't a file before, it becomes one.

        const currentTotalSizeMB = sourcesRef.current.reduce((acc, s) => acc + (s.fileSize || 0), 0) / (1024 * 1024);
        const newFileSizeMB = size / (1024 * 1024);

        // We reuse canUploadFile logic for project size check
        // We reuse canUploadFile logic for project size check
        const storageCheck = subscriptionManager.canUploadFile(currentTotalSizeMB, newFileSizeMB);
        // Skipped storage check for demo

        const source = sourcesRef.current.find(s => s.id === activeSourceId);
        if (!source) return;

        source.fileSize = size;
        source.fileUrl = url;
        source.indexedDbId = id; // Save persistence ID
        source.sourceType = 'file';

        // Update name if default
        if (source.name.startsWith("Source ")) {
            source.name = name.split('/').pop() || name;
            updateActiveSource({ name: source.name });
        }

        // Load Audio
        source.audioElement.crossOrigin = "anonymous";
        source.audioElement.onerror = (e) => {
            console.error("Failed to load audio file:", source.audioElement.src);
            console.error("MediaError:", source.audioElement.error);
            console.error("Event:", e);
            source.error = "missing"; // Set error state
            syncSourceList();
        };
        source.audioElement.onloadeddata = () => {
            source.error = undefined; // Clear error
            syncSourceList();
        };

        // Cache Busting: Only for remote URLs, NOT blob URLs
        if (url.startsWith('blob:')) {
            source.audioElement.src = url;
        } else {
            source.audioElement.src = url + `?t=${Date.now()}`;
        }

        source.audioElement.load();

        updateActiveSource({ sourceType: 'file' });

        // Removed auto-play
        // if (audioCtxRef.current) source.play(audioCtxRef.current);
        // updateActiveSource({ isPlaying: true });
        syncSourceList();
    };

    const handleLibraryUploadNew = async (file: File) => {
        // We only require a file, no auth check needed for local.
        if (!file) return null;

        try {
            const savedRecord = await saveAudioFile(file);
            const publicUrl = getFileUrl(savedRecord.blob);

            return {
                url: publicUrl,
                size: savedRecord.size,
                name: savedRecord.name,
                id: savedRecord.id // <--- Return ID
            };
        } catch (e: any) {
            console.error("Failed to save to IndexedDB:", e);
            throw e;
        }
    };

    // --- IAMF Export (Server-Side) ---
    // --- Audio Export (Client-Side Offline Render) ---
    const startExportFlow = () => {
        setShowExportSettings(true);
    };

    const runExport = async (settings: ExportSettings) => {
        console.log("Starting Audio Export...", settings);
        setIsRecording(true);
        setAiStatus("Preparing Export...");

        try {
            // Prepare Sources Data - use audioElement.src as the source of truth for URLs
            const exportSources = sourcesRef.current.map(s => ({
                id: s.id,
                name: s.name,
                position: { ...s.position },
                volume: s.volume,
                timelineStart: s.timelineStart,
                timelineDuration: s.timelineDuration || 10,
                automationType: s.automationType,
                automationParams: { ...s.automationParams },
                sourceType: s.sourceType,
                // Use audioElement.src as the actual playing URL (works for both blob and remote URLs)
                fileUrl: s.audioElement?.src || s.fileUrl || null
            } as SourceData));

            setAiStatus("Rendering...");

            // Calculate dynamic duration based on sources
            const calculatedDuration = exportSources.reduce((max, s) => {
                if (s.sourceType !== 'file' && s.sourceType !== 'generated') return max;
                const end = s.timelineStart + (s.timelineDuration || 10);
                return Math.max(max, end);
            }, 0);

            // Use calculated duration, but ensure at least 1 second if empty
            const exportDuration = Math.max(calculatedDuration, 1);
            console.log("Export Duration:", exportDuration);

            const wavBlob = await renderTimelineToWav(
                exportSources,
                exportDuration,
                (msg) => setAiStatus(msg),
                { ...settings, reverbLevel: reverbGlobal }
            );

            // Trigger Download
            const url = URL.createObjectURL(wavBlob);
            const link = document.createElement('a');
            link.href = url;
            // Filename includes settings
            // Filename includes settings
            const suffix = settings.bitDepth === 32 ? '32bit_float' : `${settings.bitDepth}bit`;
            const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${safeName}_${Math.round(settings.sampleRate / 1000)}k_${suffix}.wav`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setAiStatus("Export Complete");

        } catch (err: any) {
            console.error("Export Error:", err);
            setAiStatus("Export Failed");
            alert(`Export Error: ${err.message}`);
        } finally {
            setIsRecording(false);
            setTimeout(() => setAiStatus(""), 3000);
        }
    };

    const handleExportSuccess = async () => {
        // Increment export count in DB
        // Increment export count in DB - Skipped for demo
    };

    const stopRecording = () => {
        if (!isRecording) return;
        setIsRecording(false);
        if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);

        if (isPro) {
            // Finish WAV
            if (wavProcessorRef.current && mainSceneGainRef.current) {
                wavProcessorRef.current.disconnect();
                mainSceneGainRef.current.disconnect(wavProcessorRef.current);
            }
            // Export WAV
            const flatLeft = flattenArray(wavLeftRef.current);
            const flatRight = flattenArray(wavRightRef.current);
            exportWav(flatLeft, flatRight, audioCtxRef.current?.sampleRate || 44100);
            handleExportSuccess();
        } else {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        }
    };

    const flattenArray = (arr: Float32Array[]) => {
        const len = arr.reduce((acc, val) => acc + val.length, 0);
        const res = new Float32Array(len);
        let offset = 0;
        for (const a of arr) { res.set(a, offset); offset += a.length; }
        return res;
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportWav = (left: Float32Array, right: Float32Array, sampleRate: number) => {
        // Simple WAV encoder
        const bufferLength = left.length * 2 * 2 + 44;
        const buffer = new ArrayBuffer(bufferLength);
        const view = new DataView(buffer);

        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + left.length * 4, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, left.length * 4, true);

        let offset = 44;
        for (let i = 0; i < left.length; i++) {
            const sL = Math.max(-1, Math.min(1, left[i]));
            const sR = Math.max(-1, Math.min(1, right[i]));
            view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
            offset += 2;
            view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
            offset += 2;
        }
        const blob = new Blob([view], { type: 'audio/wav' });
        downloadBlob(blob, 'spatial_scene_pro.wav');
    };

    // --- Auto-Save Logic ---
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'unsaved'>('idle');
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Watch for changes that require saving
    useEffect(() => {
        if (!projectId) return;

        // Skip initial load or extraneous updates if needed
        // but for now, any change to these dependencies means user intent changed.

        // Don't save if we are just playing back
        if (isPlayingRef.current) return;

        setSaveStatus('unsaved');

        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

        autoSaveTimeoutRef.current = setTimeout(() => {
            saveProject();
        }, 2000); // 2 second debounce

        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        sourcesList,
        editorState.x, editorState.y, editorState.z,
        editorState.vol, editorState.name,
        editorState.timelineStart, editorState.timelineDuration,
        editorState.automationType, editorState.automationParams
        // Note: We exclude isPlaying, currentTime from deps
    ]);


    // --- Save / Load ---
    const saveProject = async () => {
        const data = {
            sources: sourcesRef.current.map(s => ({
                id: s.id,
                name: s.name,
                color: '#' + s.color.getHexString(),
                position: s.position,
                volume: s.volume,
                timelineStart: s.timelineStart,
                timelineDuration: s.timelineDuration,
                automationType: s.automationType,
                automationParams: s.automationParams,
                sourceType: s.sourceType,
                fileUrl: s.fileUrl,
                indexedDbId: s.indexedDbId // <--- Save ID
            })),
            editorState
        };

        if (projectId) {
            try {
                setSaveStatus('saving');
                setAiStatus("Saving...");
                await supabase
                    .from('projects')
                    .update({
                        data: data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', projectId)
                    .select();

                console.log("Project saved successfully!");
                setSaveStatus('saved');
                setAiStatus("Saved");

                // Clear "Saved" status after a while to be clean, or keep it?
                // Standard is usually 'Saved' stays until change. 
                setTimeout(() => setAiStatus(""), 2000);
            } catch (err) {
                console.error("Save failed:", err);
                setSaveStatus('error');
                setAiStatus("Save Failed. Check Connection.");
            }
        } else {
            // Fallback to file download if no project ID (shouldn't happen in dashboard flow)
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            downloadBlob(blob, 'spaudio-project.json');
        }
    };

    const loadProject = (data: any) => {
        // Handle Legacy Format (Array of sources) vs New Format (Object with global)
        const sourcesData = Array.isArray(data) ? data : (data.sources || []);
        const globalData = !Array.isArray(data) ? data.global : null;

        // Ensure audio context exists before restoring sources
        initGlobalAudio();

        // Restore Global Settings
        if (globalData && globalData.reverbGain !== undefined) {
            setReverbGlobal(globalData.reverbGain);
            if (reverbGainRef.current) reverbGainRef.current.gain.value = globalData.reverbGain;
        } else {
            // Legacy project: Default to 0 and SYNC ENGINE
            setReverbGlobal(0);
            if (reverbGainRef.current) reverbGainRef.current.gain.value = 0;
        }

        // Clear existing
        sourcesRef.current.forEach(s => {
            if (sceneRef.current) {
                sceneRef.current.remove(s.mesh);
                sceneRef.current.remove(s.targetMesh);
                sceneRef.current.remove(s.trajectoryLine);
            }
            s.stop();
        });
        sourcesRef.current = [];

        // Load new
        if (sourcesData) {
            sourcesData.forEach((sData: any) => {
                const color = new THREE.Color(sData.color);
                const s = new SourceObject(sData.id, sData.name, color);

                // Safe Coordinate Extraction
                const safeX = Number(sData.position?.x) || 0;
                const safeY = Number(sData.position?.y) || 0;
                const safeZ = typeof sData.position?.z === 'number' ? sData.position.z : -5;

                // Use updatePosition to sync mesh and panner immediately
                s.updatePosition(safeX, safeY, safeZ);

                s.volume = sData.volume;
                s.timelineStart = sData.timelineStart || 0;
                s.timelineDuration = sData.timelineDuration;
                s.sourceType = sData.sourceType || 'none';
                s.automationType = sData.automationType || 'none';
                s.automationParams = sData.automationParams || {};
                // Recalculate trajectory
                if (s.automationType !== 'none') s.updateAutomation();

                // Restore audio from URL
                // Restore audio from URL
                if (s.sourceType === 'file') {
                    // Logic to restore from IndexedDB if possible
                    if (sData.indexedDbId) {
                        // Async restoration handled by a separate checks? 
                        // We can't await here easily inside forEach without Promise.all
                        // Better to trigger a floating promise/effect or just do it here carefully.
                        // We'll mark it as loading or similar?
                        s.indexedDbId = sData.indexedDbId;
                        getAudioFile(s.indexedDbId!).then(record => {
                            if (record) {
                                const url = getFileUrl(record.blob);
                                s.fileUrl = url;
                                s.audioElement.src = url;
                                s.audioElement.load();
                                syncSourceList();
                                console.log("Restored audio from IndexedDB:", s.name);
                            } else {
                                console.warn("Failed to find file in IndexedDB:", sData.indexedDbId);
                                s.error = "missing";
                                syncSourceList();
                            }
                        });
                    } else if (sData.fileUrl) {
                        // Restore Remote URL (Global Asset)
                        s.fileUrl = sData.fileUrl;
                        s.audioElement.crossOrigin = "anonymous";
                        s.audioElement.onerror = (e) => {
                            console.error("Failed to load remote asset", s.fileUrl, e);
                            s.error = "missing";
                            syncSourceList();
                        };
                        s.audioElement.onloadeddata = () => {
                            s.error = undefined;
                            syncSourceList();
                        };
                        const separator = (s.fileUrl && s.fileUrl.includes('?')) ? '&' : '?';
                        if (s.fileUrl) s.audioElement.src = s.fileUrl + `${separator}t=${Date.now()}`;
                        s.audioElement.load();
                    }
                }

                // Re-init audio - this should now always work since we called initGlobalAudio
                if (audioCtxRef.current && mainSceneGainRef.current && reverbNodeRef.current) {
                    s.initAudio(audioCtxRef.current, mainSceneGainRef.current, reverbNodeRef.current);
                } else {
                    console.error("Audio context not ready for", s.name);
                }

                if (sceneRef.current) {
                    sceneRef.current.add(s.mesh);
                    sceneRef.current.add(s.targetMesh);
                    sceneRef.current.add(s.trajectoryLine);
                }
                sourcesRef.current.push(s);
            });
        }

        if (data.editorState) {
            setEditorState(data.editorState);
        }

        syncSourceList();
        // Reset save status after load
        setSaveStatus('saved');
    };




    // ... (in component)

    // --- AI "Wiring" / Logic Maps ---

    // Mock Sound Library - In a real app, this would query a real asset database/CDN
    // Use external asset library
    const mapSemanticToAsset = (tag: string): string => {
        return findBestAssetMatch(tag);
    };

    // --- Thinking Mode State ---
    const [thinkingSteps, setThinkingSteps] = useState<any[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [showThinkingPanel, setShowThinkingPanel] = useState(false);

    // --- AI Director (Thinking Mode) ---
    const handleAiGenerate = async () => {
        console.log("handleAiGenerate TRIGGERED with prompt:", promptInput);
        if (!promptInput) {
            console.warn("Prompt input is empty");
            return;
        }

        // 1. Force Reset State
        setThinkingSteps([]);
        setIsThinking(true);
        setShowThinkingPanel(true);
        setAiStatus("Connecting...");

        // Safety Timeout to prevent permanent "hanging" state
        const safetyTimeout = setTimeout(() => {
            if (thinkingSteps.length === 0) {
                setThinkingSteps([{ id: 'timeout', text: 'Connection Timed Out. High traffic, please try again.', type: 'action', timestamp: Date.now() }]);
                setAiStatus("Timeout");
                setIsThinking(false);
            }
        }, 15000);

        try {
            // Add a synthetic thinking step so UI isn't empty
            setThinkingSteps([{ id: 'think', text: 'Analyzing your request...', type: 'analysis', timestamp: Date.now() }]);

            // Blocking Call
            const data = await generateSpatialSceneAction(promptInput, geminiConfig);
            clearTimeout(safetyTimeout);

            if (data.type === 'result') {
                console.log("Applying AI Scene:", data.data);
                if (data.data.sources) {
                    data.data.sources.forEach((sData: any) => {
                        const assetUrl = mapSemanticToAsset(sData.semanticTag || sData.name);
                        addSource('generated', sData.position.x, sData.position.y, sData.position.z, sData.name, assetUrl);

                        const addedSource = sourcesRef.current[sourcesRef.current.length - 1];
                        if (addedSource && sData.trajectory) {
                            if (sData.trajectory === 'linear_forward') {
                                addedSource.automationType = 'linear';
                                addedSource.automationParams = { targetPos: { x: sData.position.x, y: 0, z: 5 } };
                                addedSource.updateAutomation();
                            } else if (sData.trajectory === 'orbit') {
                                addedSource.automationType = 'orbit';
                                addedSource.automationParams = { radius: 3, speed: 0.5 };
                                addedSource.updateAutomation();
                            }
                        }
                    });
                }
                setAiStatus("Complete");
                setThinkingSteps(prev => [...prev, { id: 'done', text: 'Scene generated successfully.', type: 'action', timestamp: Date.now() }]);
            } else {
                throw new Error(data.message || "Unknown error");
            }

        } catch (e: any) {
            console.error("AI Generation Failed:", e);
            setAiStatus("Generation Failed");
            setThinkingSteps(prev => [...prev, { id: 'err', text: `Generation Failed: ${e.message}. Try a simpler prompt.`, type: 'action', timestamp: Date.now() }]);
        } finally {
            setIsThinking(false);
        }
    };

    // --- Auto-Foley (Video to Audio) ---
    const [showAutoFoleyModal, setShowAutoFoleyModal] = useState(false);

    const handleAutoFoley = async (file: File) => {
        console.log("Starting Auto-Foley for:", file.name);

        // Close modal and show thinking panel
        // Close modal and show thinking panel
        setShowAutoFoleyModal(false);
        setThinkingSteps([]);
        setIsThinking(true);
        setShowThinkingPanel(true);
        setAiStatus("Watching Video...");



        setAiStatus("Watching Video...");

        try {
            // Upload to Supabase Storage (Client-Side) to bypass Vercel 4.5MB Payload Limit
            setAiStatus("Uploading Video...");
            const fileExt = file.name.split('.').pop();
            const fileName = `temp-videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Create a dedicated real client for storage upload only
            // This ensures we use the real storage bucket while keeping the app in "Demo Mode" (Mock Auth/DB)
            const { createBrowserClient } = await import('@supabase/ssr');
            const realSupabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { error: uploadError } = await realSupabase.storage
                .from('Videos') // Updated to user's bucket
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload failed", uploadError);
                throw new Error("Upload Failed. Check internet connection & file size.");
            }

            const { data: { publicUrl } } = realSupabase.storage
                .from('Videos')
                .getPublicUrl(fileName);

            console.log("Video uploaded to:", publicUrl);

            // Streaming Call to API Route
            const response = await fetch('/api/analyze-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: publicUrl, config: geminiConfig })
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let finalData = null;

            if (reader) {
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const msg = JSON.parse(line);
                            if (msg.type === 'log') {
                                console.log("Stream:", msg.message);
                                setAiStatus(msg.message); // Update UI Status
                                setThinkingSteps(prev => [...prev, {
                                    id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                                    text: msg.message,
                                    type: 'analysis',
                                    timestamp: Date.now()
                                }]);
                            } else if (msg.type === 'result') {
                                finalData = msg;
                            } else if (msg.type === 'error') {
                                throw new Error(msg.message);
                            } else if (msg.data) {
                                // Fallback for result if structure differs
                                finalData = msg;
                            }
                        } catch (e) {
                            console.warn("Stream parse error", e);
                        }
                    }
                }
            }

            if (!finalData) throw new Error("Analysis Error. The AI service is busy, please try again.");
            const data = finalData;

            if (data.type === 'result') {
                console.log("Applying Filter Scene:", data.data);
                if (data.data.sources) {
                    const newSources = data.data.sources;
                    let maxTime = totalDuration;
                    newSources.forEach((sData: any) => {
                        const assetUrl = mapSemanticToAsset(sData.semanticTag || sData.name);
                        addSource('generated', sData.position.x, sData.position.y, sData.position.z, sData.name, assetUrl);

                        const addedSource = sourcesRef.current[sourcesRef.current.length - 1];
                        if (addedSource) {
                            // Map Timeline Data
                            if (typeof sData.timelineStart === 'number') {
                                addedSource.timelineStart = sData.timelineStart;
                            }
                            // Default duration if missing
                            addedSource.timelineDuration = typeof sData.timelineDuration === 'number' ? sData.timelineDuration : 5;

                            // Track Max Time
                            maxTime = Math.max(maxTime, addedSource.timelineStart + (addedSource.timelineDuration || 5));

                            if (sData.trajectory) {
                                if (sData.trajectory === 'linear_forward') {
                                    addedSource.automationType = 'linear';
                                    addedSource.automationParams = { targetPos: { x: sData.position.x, y: 0, z: 5 } };
                                    addedSource.updateAutomation();
                                } else if (sData.trajectory === 'orbit') {
                                    addedSource.automationType = 'orbit';
                                    addedSource.automationParams = { radius: 3, speed: 0.5 };
                                    addedSource.updateAutomation();
                                }
                            }
                        }
                    });

                    // Update Total Duration to fit new content + buffer
                    if (maxTime > totalDuration) {
                        setTotalDuration(maxTime + 5);
                    }

                    // Sync list once after all updates
                    syncSourceList();
                }
                setAiStatus("Complete");
                setThinkingSteps(prev => [...prev, { id: 'done', text: 'Auto-Foley Complete.', type: 'action', timestamp: Date.now() }]);
            } else {
                throw new Error(data.message || "Unknown error");
            }

        } catch (e: any) {
            console.error("Auto-Foley Error", e);
            setAiStatus("Analysis Failed");
            setThinkingSteps(prev => [...prev, { id: 'err', text: `Analysis Failed: ${e.message}. Please try a different video.`, type: 'action', timestamp: Date.now() }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="relative w-screen h-screen dark:bg-black text-gray-900 dark:text-gray-200 overflow-hidden">
            {/* Canvas */}
            <div ref={containerRef} className="w-full h-full block" />

            {/* Tooltip */}
            <Tooltip {...tooltip} />

            {/* Axes Legend */}
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/80 backdrop-blur p-2 rounded border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-0.5 bg-red-500"></div> X: Left/Right</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-0.5 bg-green-500"></div> Y: Up/Down</div>
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500"></div> Z: Front/Back</div>
            </div>

            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                {/* Save Status Indicator */}
                {/* Debug Logging */}
                {/* <div className="hidden">Debug Mode Active</div> */}

                {saveStatus !== 'idle' && (
                    <div className={`text-[10px] font-medium px-2 py-1 rounded bg-black/50 backdrop-blur border 
                        ${saveStatus === 'saving' ? 'text-yellow-400 border-yellow-500/50' : ''}
                        ${saveStatus === 'saved' ? 'text-green-400 border-green-500/50' : ''}
                        ${saveStatus === 'unsaved' ? 'text-gray-400 border-gray-500/50' : ''}
                        ${saveStatus === 'error' ? 'text-red-400 border-red-500/50' : ''}
                    `}>
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'saved' && 'Saved'}
                        {saveStatus === 'unsaved' && 'Unsaved Changes'}
                        {saveStatus === 'error' && 'Save Error'}
                    </div>
                )}

                <AuthButton />
                <div className="bg-gray-100 dark:bg-gray-800 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded text-[10px] font-bold cursor-default">
                    DEMO UNLIMITED
                </div>
            </div>

            {/* Sidebar */}
            <EditorSidebar
                sources={sourcesList}
                activeSourceId={activeSourceId}
                onSelectSource={selectSource}
                onCreateSource={createSource}
                editorState={editorState}
                onUpdateSource={updateActiveSource}
                onFileUpload={handleFileUpload}
                onTogglePlay={togglePlay}
                onToggleSourcePlay={toggleSourcePlayback}
                onStopMotion={stopMotion}
                onAiGenerate={handleAiGenerate}
                onOpenAutoFoley={() => setShowAutoFoleyModal(true)}
                promptInput={promptInput}
                setPromptInput={setPromptInput}
                aiStatus={aiStatus}
                isRecording={isRecording}
                isPro={isPro}
                onToggleRecording={isRecording ? stopRecording : startExportFlow}
                onSave={saveProject}
                onLoad={loadProject}
                onReverbChange={(val) => {
                    if (reverbGainRef.current) reverbGainRef.current.gain.value = val;
                    setReverbGlobal(val);
                }}
                onDeleteSource={deleteSource}
                onOpenLibrary={() => setShowLibrary(true)}
                // Storage Props (Global)
                usedBytes={accountUsage.usedBytes}
                totalBytes={limits.maxTotalStorageMB * 1024 * 1024}
                fileCount={accountUsage.fileCount}
                maxFiles={limits.maxFilesPerProject ?? 100} // Renaming to maxFilesPerAccount conceptually
                onOpenSettings={() => setShowGeminiSettings(true)}
                reverbGain={reverbGlobal}
            />

            {/* Timeline */}
            <div className="absolute bottom-0 left-0 right-0 z-30">
                <Timeline
                    sources={sourcesList}
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                    isPlaying={isPlaying}
                    onSeek={handleSeek}
                    onTogglePlay={togglePlay}
                    onStop={() => { setIsPlaying(false); setCurrentTime(0); sourcesRef.current.forEach(s => s.stop()); }}
                    onUpdateSource={handleUpdateSourceTimeline}
                />
            </div>



            {/* 5. Render MediaLibraryModal (Global) */}
            <MediaLibraryModal
                isOpen={showLibrary}
                onClose={() => setShowLibrary(false)}
                userId={currentUserId || ''}
                onSelectFile={handleSelectLibraryFile}
                onUploadNew={handleLibraryUploadNew}
                onStorageUpdate={fetchAccountUsage}
            />

            {/* 6. Thinking Panel (Gemini 3) */}
            <ThinkingPanel
                isVisible={showThinkingPanel}
                steps={thinkingSteps}
                isThinking={isThinking}
                onClose={() => {
                    setShowThinkingPanel(false);
                    setIsThinking(false);
                }}
            // Ensure keys are unique by combining ID with index if needed, but better to fix at source.
            // For now, let's rely on the ThinkingPanel to render correct keys.
            // The warning was likely "Each child in a list should have a unique 'key' prop" inside ThinkingPanel.
            // We checked ThinkingPanel and it uses step.id.
            // So step.id must be duplicated.
            // We'll patch this by regenerating IDs on the client side if they clash, or just appending timestamp.
            />

            {/* 7. Auto Foley Modal */}
            <AutoFoleyModal
                isOpen={showAutoFoleyModal}
                onClose={() => setShowAutoFoleyModal(false)}
                onProcessVideo={handleAutoFoley}
                isProcessing={isThinking && showAutoFoleyModal} // Actually we close modal on start, so this might not be seen inside modal
                thinkingSteps={thinkingSteps}
            />

            {/* 8. Export Settings Modal */}
            <ExportSettingsModal
                isOpen={showExportSettings}
                onClose={() => setShowExportSettings(false)}
                onExport={runExport}
            />

            {/* 9. Gemini Settings Modal */}
            <GeminiSettingsModal
                isOpen={showGeminiSettings}
                onClose={() => setShowGeminiSettings(false)}
                initialConfig={geminiConfig}
                onSave={handleSaveGeminiConfig}
            />
        </div>
    );
}

