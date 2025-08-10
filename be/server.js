const express = require('express');
const connectDB = require('./db.js');

const app = express();

app.use(express.json());

connectDB().then((db) => {
  // DB 객체가 필요하면 req에 붙이거나, 여기서만 사용 가능
  app.listen(8080, () => {
    console.log('서버 실행중 http://localhost:8080');
  });

  app.get('/news', () => {
    db.collection('test').insertOne({ title: '큐젠 docker DB 테스트' })
  })
})
  .catch((err) => {
    console.error('DB 연결 실패:', err);
  });

app.get('/', (req, res) => {
  res.send('Quzen AI 테스트');
});


// docker-compose down 시 서버 종료 처리
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
