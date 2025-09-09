const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

// 정적 파일 제공 (빌드된 React 앱)
app.use(express.static(path.join(__dirname, 'dist')));

// 모든 경로에 대해 index.html 제공 (SPA 라우팅 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI 시험지 생성기가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('브라우저가 자동으로 열립니다...');
  
  // 기본 브라우저에서 앱 열기
  const url = `http://localhost:${PORT}`;
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  
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
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  process.exit(0);
});