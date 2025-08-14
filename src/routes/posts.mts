import express from 'express';
import { CreatePostSchema, UpdatePostSchema, GetPostsQuerySchema } from '../schemas/post.schema.mjs';
import { validateObjectId } from '../middlewares/validateObjectId.mjs';
import { validate } from '../middlewares/validate.mjs';
import { postController } from '../controllers/postContoller.mjs';

const postRouter = express.Router();

//게시글 목록 (GET /api/posts)
postRouter.get('/', validate('query', GetPostsQuerySchema), postController.getList);

//게시글 작성 (POST /api/posts)
postRouter.post('/', validate('body', CreatePostSchema), postController.create);

// 게시글 상세 조회 (GET /api/posts/:id)
postRouter.get('/:id', validateObjectId, postController.getById);

// 게시글 수정 (PUT /api/posts/:id)
postRouter.put('/:id', validateObjectId, validate('body', UpdatePostSchema), postController.update);

// 게시글 삭제 (DELETE /api/posts/:id)
postRouter.delete('/:id', validateObjectId, postController.delete);

export default postRouter;