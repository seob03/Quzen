const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://admin:quzen1234@quzenai.extqaa0.mongodb.net/?retryWrites=true&w=majority&appName=QuzenAI';

let db;
let client;

async function connectDB() {
  if (db) return db;  // 이미 연결되어 있으면 재사용

  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db('quzenDB');
    console.log('MongoDB 연결 성공');
    return db;
  } catch (err) {
    console.error('DB 연결 실패:', err);
    throw err;
  }
}

module.exports = connectDB;
