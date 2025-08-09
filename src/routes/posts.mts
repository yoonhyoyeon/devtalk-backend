import express from 'express';
import type { Request, Response } from 'express';
import Post from '../models/post.mjs';
import { PostSchema } from '../schemas/post.schema.js';

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
        // 1. 요청 데이터 검증
        const result = PostSchema.safeParse(req.body);
        console.log(result);

        // 2. 검증 실패시
        /*
        result = 
        {
            success: false,
            error: ZodError: [
                {
                "origin": "string",
                "code": "too_small",
                "minimum": 1,
                "inclusive": true,
                "path": [
                    "title"
                ],
                "message": "제목은 필수입니다."
                }
            ]
                at new ZodError (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/core/core.js:30:39)
                at Module.<anonymous> (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/core/parse.js:40:20)
                at inst.safeParse (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/classic/schemas.js:30:46)
                at <anonymous> (/Users/yoonhyoyeon/Desktop/backend/src/routes/posts.mts:22:35)
                at Layer.handleRequest (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/layer.js:152:17)
                at next (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/route.js:157:13)
                at Route.dispatch (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/route.js:117:3)
                at handle (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/index.js:435:11)
                at Layer.handleRequest (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/layer.js:152:17)
                at /Users/yoonhyoyeon/Desktop/backend/node_modules/router/index.js:295:15
        }
        */
        if(!result.success) {
            return res.status(422).json({
                message: '입력값이 올바르지 않습니다.',
                errors: result.error.issues
            })
        }

        // 3. 검증 성공시
        /*
        result =
        {
            success: true,
            data: { title: '제목1', content: '본문1', category: '자유' }
        }
        */
        const post = new Post(result.data);
        await post.save();
        // const post = await Post.create(result.data); 위 두줄은 이 한줄과 같음.
        return res.status(201).json(post);
    } catch(error) {
        return res.status(500).json({ message: '서버 에러'});
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