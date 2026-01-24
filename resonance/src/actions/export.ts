'use server';

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

export interface ExportResult {
    success: boolean;
    downloadUrl?: string; // URL to the generated file in local public dir
    error?: string;
}

export async function exportProjectToIAMF(projectData: any): Promise<ExportResult> {
    const exportId = `export_${Date.now()}`;
    const tempJsonPath = path.join(process.cwd(), 'tmp', `${exportId}.json`);
    const outputFileName = `${exportId}.iamf`;

    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
        await mkdirAsync(tmpDir, { recursive: true });
    }

    // Ensure public/exports directory exists for download
    const publicExportsDir = path.join(process.cwd(), 'public', 'exports');
    if (!fs.existsSync(publicExportsDir)) {
        await mkdirAsync(publicExportsDir, { recursive: true });
    }
    const outputIamfPath = path.join(publicExportsDir, outputFileName);

    try {
        console.log(`[IAMF Export] Starting export for ID: ${exportId}`);

        // 1. Write Project Data to Temp JSON
        await writeFileAsync(tempJsonPath, JSON.stringify(projectData, null, 2));
        console.log(`[IAMF Export] Written JSON input to: ${tempJsonPath}`);

        // 2. Spawn Python Script
        const scriptPath = path.join(process.cwd(), 'scripts', 'export_iamf.py');
        const pythonCmd = `python3 "${scriptPath}" "${tempJsonPath}" "${outputIamfPath}"`;

        console.log(`[IAMF Export] Executing: ${pythonCmd}`);
        const { stdout, stderr } = await execAsync(pythonCmd);

        if (stdout) console.log(`[Python Stdout]: ${stdout}`);
        if (stderr) console.error(`[Python Stderr]: ${stderr}`);

        // 3. Verify Output Exists
        if (fs.existsSync(outputIamfPath)) {
            console.log(`[IAMF Export] Success! File at: ${outputIamfPath}`);
            return {
                success: true,
                downloadUrl: `/exports/${outputFileName}`
            };
        } else {
            throw new Error('Python script executed but output file was not found.');
        }

    } catch (error: any) {
        console.error('[IAMF Export] Error:', error);
        return {
            success: false,
            error: error.message || 'Export failed during processing.'
        };
    } finally {
        // Cleanup temp JSON input
        try {
            if (fs.existsSync(tempJsonPath)) {
                fs.unlinkSync(tempJsonPath);
            }
        } catch (e) {
            console.warn('Failed to cleanup temp json:', e);
        }
    }
}
