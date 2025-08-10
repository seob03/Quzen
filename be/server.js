require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const connectDB = require('./db.js');

const app = express();
app.use(express.json());

let server;
let dbInstance;

connectDB().then((db) => {
  dbInstance = db; // 종료 시 사용하기 위해 저장
  server = app.listen(process.env.PORT || 8080, () => {
    console.log('API 서버 실행중 http://localhost:8080');
  });

  // API 라우트들 (DB 연결 후에 정의)
  app.get('/test', (req, res) => {
    db.collection('test').insertOne({ title: '이거 되면 인정이요 @@@@@@@@' })
      .then(() => {
        res.json({ message: 'DB 저장 완료!' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'DB 저장 실패' });
      });
  });

  app.get('/api/news', async (req, res) => {
    try {
      await db.collection('test').insertOne({ title: '큐젠 docker DB 테스트' });
      res.json({ message: '완료~' });
    } catch (error) {
      res.status(500).json({ error: 'DB 오류났다요~' });
    }
  });

  // API 서버이므로 다른 라우트는 404 (정규식 사용)
  app.get(/.*/, (req, res) => {
    res.status(404).json({ error: 'API 엔드포인트를 찾을 수 없습니다' });
  });

}).catch((err) => {
  console.error('DB 연결 실패:', err);
});
