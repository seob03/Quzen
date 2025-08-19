const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI_KEY || 'mongodb://localhost:27017/quzen';
const DB_NAME = 'quzen';
const COLLECTION_NAME = 'trainData';

async function seedDatabase() {
  let client;
  
  try {
    console.log('🔌 MongoDB에 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // 기존 데이터 삭제
    console.log('🗑️ 기존 trainData 삭제 중...');
    await collection.deleteMany({});
    
    // trainData.json 파일 읽기
    console.log('📖 trainData.json 파일 읽는 중...');
    const trainDataPath = path.join(__dirname, '..', 'trainData.json');
    const trainData = JSON.parse(fs.readFileSync(trainDataPath, 'utf8'));
    
    // 데이터 삽입
    console.log(`📝 ${trainData.length}개의 문서 삽입 중...`);
    const result = await collection.insertMany(trainData);
    
    console.log(`✅ 성공적으로 ${result.insertedCount}개의 문서가 삽입되었습니다!`);
    
    // 삽입된 데이터 확인
    const count = await collection.countDocuments();
    console.log(`📊 현재 trainData 컬렉션에 ${count}개의 문서가 있습니다.`);
    
    // 과목별 통계
    const subjects = await collection.distinct('subject');
    console.log('📚 사용 가능한 과목들:');
    for (const subject of subjects) {
      const subjectCount = await collection.countDocuments({ subject });
      console.log(`  - ${subject}: ${subjectCount}개 문서`);
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 시드 중 오류 발생:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB 연결 종료');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 데이터베이스 시드 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };

