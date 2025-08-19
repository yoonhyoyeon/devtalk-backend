import express from 'express';
import { authController } from '../controllers/authController.mjs';
import { validate } from '../middlewares/validate.mjs';
import { SignupSchema } from '../schemas/user.schema.mjs';

const Router = express.Router();

// 회원가입 (POST /api/auth/signup)
Router.get('/signup', validate('body', SignupSchema), authController.signup);

// 로그인 (POST /api/auth/login)

