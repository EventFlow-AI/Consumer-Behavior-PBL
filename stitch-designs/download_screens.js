const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'stitch-designs', 'rahat-setu-app');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'list_screens',
      arguments: { projectId: '17892163389901824067' }
    }
  });

  const req = https.request('https://stitch.googleapis.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': 'AQ.Ab8RN6KlUMYEoLWQFf1kjNPk1e6RARoKUI3A14x0cR6BFPIG1Q'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const resp = JSON.parse(data);
      const text = resp.result.content[0].text;
      const screensObj = JSON.parse(text);
      for (const s of screensObj.screens) {
        const screenId = s.name.split('/').pop();
        const safeTitle = s.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
        console.log('Downloading:', s.title);
        if (s.htmlCode && s.htmlCode.downloadUrl) {
          const ext = s.htmlCode.mimeType === 'image/svg+xml' ? 'svg' : 'html';
          const filePath = path.join(outDir, screenId + '_' + safeTitle + '.' + ext);
          await download(s.htmlCode.downloadUrl, filePath);
        }
        if (s.screenshot && s.screenshot.downloadUrl) {
          const shotPath = path.join(outDir, screenId + '_' + safeTitle + '.png');
          await download(s.screenshot.downloadUrl, shotPath);
        }
      }
      console.log('Done downloading all screens of project 17892163389901824067!');
    });
  });
  req.write(payload);
  req.end();
}
main();
