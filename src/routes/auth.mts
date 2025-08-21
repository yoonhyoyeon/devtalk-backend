import express from 'express';
import { authController } from '../controllers/authController.mjs';
import { validate } from '../middlewares/validate.mjs';
import { LoginSchema, SignupSchema } from '../schemas/user.schema.mjs';

const Router = express.Router();

// 회원가입 (POST /api/auth/signup)
Router.post('/signup', validate('body', SignupSchema), authController.signup);

// 로그인 (POST /api/auth/login)
Router.post('/login', validate('body', LoginSchema), authController.login);

Router.post('/refresh', authController.refresh);

export default Router;
