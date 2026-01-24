
import fs from 'fs';
import path from 'path';

async function checkAssets() {
    const libraryPath = path.join(process.cwd(), 'src/lib/assetLibrary.ts');
    const content = fs.readFileSync(libraryPath, 'utf8');

    // Extract URLs using regex
    const urlRegex = /https:\/\/[^"']+/g;
    const urls = content.match(urlRegex) || [];

    console.log(`Found ${urls.length} assets to verify...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const url of urls) {
        try {
            const start = Date.now();
            const res = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const duration = Date.now() - start;

            const contentType = res.headers.get('content-type');
            const contentLength = res.headers.get('content-length');
            const sizeMb = contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) + 'MB' : 'Unknown size';

            if (res.ok) {
                console.log(`✅ [${res.status}] ${url} (${sizeMb}, ${contentType}) - ${duration}ms`);
                successCount++;
            } else {
                console.error(`❌ [${res.status}] ${url}`);
                failCount++;
            }
        } catch (error: any) {
            console.error(`❌ [ERROR] ${url}: ${error.message}`);
            failCount++;
        }
    }

    console.log(`\nSummary: ${successCount} Valid, ${failCount} Failed`);
}

checkAssets();
