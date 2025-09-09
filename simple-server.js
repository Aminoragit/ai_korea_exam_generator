const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

const PORT = 3000;

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // 서버 종료 API 엔드포인트
  if (parsedUrl.pathname === '/api/shutdown' && req.method === 'POST') {
    console.log('\n웹 인터페이스에서 서버 종료 요청을 받았습니다...');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server is shutting down...' }));
    
    // 잠시 후 서버 종료 (응답을 보낸 후)
    setTimeout(() => {
      console.log('서버를 종료합니다.');
      server.close();
      process.exit(0);
    }, 1000);
    return;
  }
  
  let filePath = path.join(__dirname, 'dist', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  
  // 보안: 상위 디렉토리 접근 방지
  if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 파일이 없으면 index.html로 리다이렉트 (SPA 라우팅 지원)
        fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`AI 시험지 생성기가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('브라우저가 자동으로 열립니다...');
  
  // 기본 브라우저에서 앱 열기
  const url = `http://localhost:${PORT}`;
  
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', url]);
  } else if (process.platform === 'darwin') {
    spawn('open', [url]);
  } else {
    spawn('xdg-open', [url]);
  }
});

// 프로세스 종료 시 정리
process.on('SIGTERM', () => {
  console.log('\n서버를 종료합니다...');
  server.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  server.close();
  process.exit(0);
});