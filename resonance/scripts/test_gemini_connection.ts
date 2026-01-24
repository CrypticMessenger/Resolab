
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Load env explicitly
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API KEY found in .env.local");
    process.exit(1);
}

console.log(`✅ Found API Key: ${apiKey.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
    console.log(`\nTesting Model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello! Are you alive? Respond with 'Yes'.");
        const response = result.response;
        console.log(`✅ Success! Response: ${response.text().trim()}`);
    } catch (error: any) {
        console.error(`❌ Failed: ${error.message}`);
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-2.5-flash");
    await testModel("gemini-3-flash-preview");
}

run();
