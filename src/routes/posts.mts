import express from 'express';
import { CreatePostSchema, UpdatePostSchema, GetPostsQuerySchema } from '../schemas/post.schema.mjs';
import { validateObjectId } from '../middlewares/validateObjectId.mjs';
import { validate } from '../middlewares/validate.mjs';
import { postController } from '../controllers/postContoller.mjs';
import { auth } from '../middlewares/auth.mjs';

const postRouter = express.Router();

/* 인증 필요 */

//게시글 목록 (GET /api/posts)
postRouter.get('/', validate('query', GetPostsQuerySchema), postController.getList);
// 게시글 상세 조회 (GET /api/posts/:id)
postRouter.get('/:id', validateObjectId, postController.getById);

/* 인증 불필요 */

//게시글 작성 (POST /api/posts)
postRouter.post('/', auth, validate('body', CreatePostSchema), postController.create);
// 게시글 수정 (PUT /api/posts/:id)
postRouter.put('/:id', auth, validateObjectId, validate('body', UpdatePostSchema), postController.update);
// 게시글 삭제 (DELETE /api/posts/:id)
postRouter.delete('/:id', auth, validateObjectId, postController.delete);

export default postRouter;