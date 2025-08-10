import express from 'express';
import { CreatePostSchema, UpdatePostSchema } from '../schemas/post.schema.mjs';
import { validateObjectId } from '../middlewares/validateObjectId.mjs';
import { validateBody } from '../middlewares/validateBody.mjs';
import { postController } from '../controllers/postContoller.mjs';

const postRouter = express.Router();

//게시글 목록 (GET /api/posts)
postRouter.get('/', postController.getList);

//게시글 작성 (POST /api/posts)
postRouter.post('/', validateBody(CreatePostSchema), postController.create);

// 게시글 상세 조회 (GET /api/posts/:id)
postRouter.get('/:id', validateObjectId, postController.getById);

// 게시글 수정 (PUT /api/posts/:id)
postRouter.put('/:id', validateObjectId, validateBody(UpdatePostSchema), postController.update);

// 게시글 삭제 (DELETE /api/posts/:id)
postRouter.delete('/:id', validateObjectId, postController.delete);

export default postRouter;