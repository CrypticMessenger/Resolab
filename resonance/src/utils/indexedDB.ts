
const DB_NAME = "ResonanceAudioDB";
const STORE_NAME = "audio_files";
const DB_VERSION = 1;

export interface AudioFileRecord {
    id: string;
    name: string;
    blob: Blob;
    size: number;
    type: string;
    created_at: number;
}

/**
 * Opens the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!typeof window) {
            reject(new Error("IndexedDB not supported server-side"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("created_at", "created_at", { unique: false });
            }
        };
    });
}

/**
 * Saves a file to IndexedDB.
 */
export async function saveAudioFile(file: File): Promise<AudioFileRecord> {
    const db = await openDB();
    const id = crypto.randomUUID();
    const record: AudioFileRecord = {
        id,
        name: file.name,
        blob: file,
        size: file.size,
        type: file.type,
        created_at: Date.now()
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(record);

        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Retrieves all files from IndexedDB.
 */
export async function listAudioFiles(): Promise<AudioFileRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by created_at desc
            const results = (request.result as AudioFileRecord[]);
            results.sort((a, b) => b.created_at - a.created_at);
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Deletes a file by ID.
 */
export async function deleteAudioFile(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Gets a blob URL for a specific file record.
 * Important: Revoke this URL when done if possible, though for this app we keep them alive.
 */
export function getFileUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
}

/**
 * Gets a single file by ID.
 */
export async function getAudioFile(id: string): Promise<AudioFileRecord | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
