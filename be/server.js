const express = require('express');
const app = express();

const server = app.listen(8080, () => {
  console.log('서버 실행중 http://localhost:8080');
});

app.get('/', (req, res) => {
  res.send('Quzen AI 테스트'); 
});

// docker compose down 할 때 10초 걸리는 문제 해결 방법
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('HTTP server closed')
  })
})
process.on('SIGINT', () => {
  server.close(() => {
    console.log('HTTP server closed')
  })
}) 