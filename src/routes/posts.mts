import express from 'express';
import type { Request, Response } from 'express';
import Post from '../models/post.mjs';

const postRouter = express.Router();

postRouter.get('/', async(req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch(error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

postRouter.post('/', async (req: Request, res: Response) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch(error) {
        res.status(400).json({ message: '잘못된 요청'});
    }
});

export default postRouter;