const express = require('express');
const connectDB = require('./db.js');

const app = express();
app.use(express.json());

connectDB().then((db) => {
  const server = app.listen(8080, () => {
    console.log('서버 실행중 http://localhost:8080');
  });

  app.get('/', (req, res) => {
    res.send('Quzen AI 테스트');
  });

  app.get('/news', async (req, res) => {
    try {
      await db.collection('test').insertOne({ title: '큐젠 docker DB 테스트' });
      res.send('완료~');
    } catch (error) {
      res.status(500).send('DB 오류났다요~');
    }
  });

  function gracefulShutdown() {
    server.close(() => {
      console.log('HTTP server closed');
      if (db.close) {
        db.close().then(() => console.log('MongoDB 연결 종료')).catch(console.error);
      }
    });
  }
  // 외부 자원 정리
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}).catch((err) => {
  console.error('DB 연결 실패:', err);
});

