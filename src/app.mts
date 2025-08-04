import express from 'express';
import type { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import postRouter from './routes/posts.mjs';


dotenv.config();

const app:Express = express();
app.use(express.json());

// DB 연결
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 게시글 라우터 연결
app.use('/api/posts', postRouter);

// 테스트 라우터
app.get('/', (req:Request, res:Response) => {
  console.log('✅ / 라우터 도착함');
  res.send('백엔드 서버 잘 돌아감');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 서버 실행됨: http://localhost:${port}`);
});

