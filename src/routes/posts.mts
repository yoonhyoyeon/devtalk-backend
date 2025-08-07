import express from 'express';
import type { Request, Response } from 'express';
import Post from '../models/post.mjs';

const postRouter = express.Router();

//게시글 목록 (GET /api/posts)
postRouter.get('/', async(req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch(error) {
        return res.status(500).json({ message: '서버 에러' });
    }
});

//게시글 작성 (POST /api/posts)
postRouter.post('/', async (req: Request, res: Response) => {
    try {
        const post = new Post(req.body);
        await post.save();
        // const post = await Post.create(req.body); 이렇게도 변경가능.
        return res.status(201).json(post);
    } catch(error) {
        return res.status(400).json({ message: '잘못된 요청'});
    }
});

// 게시글 상세 조회 (GET /api/posts/:id)
postRouter.get('/:id', async (req:Request, res:Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
        }
        res.status(200).json(post);
    } catch(error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 게시글 수정 (PUT /api/posts/:id)
postRouter.put('/:id', async (req:Request, res:Response) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            { ...req.body, updatedAt: new Date()}, 
            { new: true } // 업데이트된 문서 반환
        );
        if(!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
        }
        return res.status(200).json(post);
    } catch(error) {
        return res.status(500).json({ message: '서버 에러' });
    }
});

// 게시글 삭제 (DELETE /api/posts/:id)
postRouter.delete('/:id', async (req:Request, res:Response) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if(!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
        }
        return res.status(204).send(); // 성공했지만 반환할 내용 없음
    } catch(error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

export default postRouter;