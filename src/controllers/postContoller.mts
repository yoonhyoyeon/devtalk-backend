import Post from '../models/post.mjs';
import User from '../models/user.mjs';
import type { Request, Response } from 'express';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';
import { Error as MongooseError } from 'mongoose';

export const postController = {
    // 게시글 목록 조회
    getList: async(req: Request, res: Response) => {
        try {
            const { page, limit, sortBy, order, search, category } = req.validatedQuery;

            const query = {
                ...search,
                ...category
            }
            
            const posts = await Post.find(query)
            .select('title category views author createdAt updatedAt') // 본문 제외
            .populate('author', 'name')
            .sort({ [sortBy] : order }) // 정렬 (-1: 내림차순(desc), 1: 오름차순(asc))
            .skip((page-1) * limit) // 건너뛸 문서 수
            .limit(limit);

            const total = await Post.countDocuments(query); // 컬렉션의 전체 문서 수 반환

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
            const userId = req.userId;
            const userExists = await User.exists({ _id: userId }); 
            if(!userExists) {
                return res.status(404).json({
                    message: '존재하지 않는 사용자입니다',
                    type: ERROR_TYPES.NOT_FOUND
                })
            }
            
            const post = new Post({
                author: userId,
                ...req.body
            });
            await post.save();
            // const post = await Post.create(result.data); 위 두줄은 이 한줄과 같음.

            return res.status(201).json({
                data: post
            });
        } catch(error) {
            if(error instanceof MongooseError.ValidationError) {
                return res.status(400).json({
                    message: '입력값이 유효하지 않습니다',
                    type: ERROR_TYPES.VALIDATION_ERROR,
                    errors: error.errors
                });
            }
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    },

    // 게시글 상세 조회
    getById: async (req:Request, res:Response) => {
        try {
            const post = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    $inc: { views: 1 } // $inc 연산자: 지정된 필드의 값을 주어진 수만큼 증가
                },
                {
                    new: true, // 업데이트 후의 문서 반환
                    runValidators: true // 업데이트 후 스키마 유효성 검사 실행 여부
                }
            ).populate('author', 'name email');
            if(!post) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            }
            return res.status(200).json({
                data: post
            });
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    },

    // 게시글 수정
    update: async (req:Request, res:Response) => {
        try {
            // const userId = req.userId;
            // const post = await Post.findById(req.params.id);
            // if(!post) {
            //     return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            // }
            // if(post.author.toString() !== userId) {
            //     return res.status(403).json({ message: '권한이 없습니다', type: ERROR_TYPES.UNAUTHORIZED });
            // }
            
            // const updatedPost = await Post.findByIdAndUpdate(
            //     req.params.id, 
            //     { 
            //         ...req.body, 
            //         updatedAt: new Date()
            //     }, 
            //     { 
            //         new: true,
            //         runValidators: true
            //     } // 업데이트된 문서 반환
            // ); 
            
            /* exists()는 매우 가벼운 쿼리이므로 위 코드보다 아래 코드가 더 좋음 */

            const userId = req.userId;
            const postId = req.params.id;
            const exists = await Post.exists({ _id: postId });
            if(!exists) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            }

            const updatedPost = await Post.findOneAndUpdate(
                {
                    _id: postId,
                    author: userId
                }, 
                {
                    ...req.body,
                    updatedAt: new Date()
                },
                {
                    new: true,
                    runValidators: true
                }
            );
            if(!updatedPost) {
                return res.status(403).json({ message: '권한이 없습니다', type: ERROR_TYPES.FORBIDDEN });
            }

            return res.status(200).json({
                data: updatedPost
            });
        } catch(error) {
            if(error instanceof MongooseError.ValidationError) {
                return res.status(400).json({
                    message: '입력값이 유효하지 않습니다',
                    type: ERROR_TYPES.VALIDATION_ERROR,
                    errors: error.errors
                });
            }
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR });
        }
    },

    // 게시글 삭제
    delete: async (req:Request, res:Response) => {
        try {
            
            // const post = await Post.findByIdAndDelete(req.params.id);
            // if(!post) {
            //     return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND });
            // }
            const postId = req.params.id;
            const userId = req.userId;

            const exists = await Post.exists({ _id: postId });
            if(!exists) {
                return res.status(404).json({ message: '게시글을 찾을 수 없습니다', type: ERROR_TYPES.NOT_FOUND});
            }

            const post = await Post.findOneAndDelete(
                {
                    _id: postId,
                    author: userId
                }
            );
            if(!post) {
                return res.status(403).json({ message: '권한이 없습니다', type: ERROR_TYPES.FORBIDDEN });
            }

            return res.status(204).send(); // 성공했지만 반환할 내용 없음
        } catch(error) {
            return res.status(500).json({ message: '서버 에러', type: ERROR_TYPES.INTERNAL_SERVER_ERROR});
        }
    }
}