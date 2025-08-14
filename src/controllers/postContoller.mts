import Post from '../models/post.mjs';
import type { Request, Response } from 'express';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';

export const postController = {
    // 게시글 목록 조회
    getList: async(req: Request, res: Response) => {
        try {
            const { page, limit, sortBy, order, search } = req.validatedQuery;

            const posts = await Post.find(search)
            .select('title category views createdAt') // 본문 제외
            .sort({ [sortBy] : order }) // 정렬 (-1: 내림차순(desc), 1: 오름차순(asc))
            .skip((page-1) * limit) // 건너뛸 문서 수
            .limit(limit);

            const total = await Post.countDocuments(search); // 컬렉션의 전체 문서 수 반환

            return res.status(200).json({ 
                data: posts,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    sortBy,
                    order: order === 1 ? 'asc' : 'desc'
                }
            });
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    },

    // 게시글 생성
    create: async (req: Request, res: Response) => {
        try {
            const post = new Post(req.body);
            await post.save();
            // const post = await Post.create(result.data); 위 두줄은 이 한줄과 같음.
            return res.status(201).json(post);
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    },

    // 게시글 상세 조회
    getById: async (req:Request, res:Response) => {
        try {
            const post = await Post.findById(req.params.id);
            if(!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            }
            return res.status(200).json(post);
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    },

    // 게시글 수정
    update: async (req:Request, res:Response) => {
        try {
            const post = await Post.findByIdAndUpdate(
                req.params.id, 
                { ...req.body, updatedAt: new Date()}, 
                { new: true } // 업데이트된 문서 반환
            );
            if(!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            }
            return res.status(200).json(post);
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR });
        }
    },

    // 게시글 삭제
    delete: async (req:Request, res:Response) => {
        try {
            const post = await Post.findByIdAndDelete(req.params.id);
            if(!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            }
            return res.status(204).send(); // 성공했지만 반환할 내용 없음
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    }
}