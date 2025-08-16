import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import User from '../models/user.mjs';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';

const signToken = (userId: string) => {
    const jwt_secret = process.env.JWT_SECRET;
    const jwt_expires_in = process.env.JWT_EXPIRES_IN;
    if(!jwt_secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
        { sub: userId },
        jwt_secret,
        { expiresIn: jwt_expires_in || '7d' } as SignOptions
    );
};

export const authController = {
    signup: async (req:Request, res:Response) => {
        try {
            const { email, password, name } = req.body;

            // 이메일 중복 체크
            const exists = await User.findOne({ email });
            if(exists) {
                return res.status(409).json({
                    message: '이미 사용 중인 이메일입니다.',
                    type: ERROR_TYPES.VALIDATION_ERROR
                });
            }

            // 비밀번호 해싱
            const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);

            // 사용자 생성
            const user = await User.create({ email, password: hash, name });

            // 토큰 생성 및 응답
            const token = signToken(user._id.toString());

            return res.status(201).json({
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    token
                }
            });
        } catch(error) {
            return res.status(500).json({
                message: '서버 에러',
                type: ERROR_TYPES.INTERNAL_SERVER_ERROR
            });
        }
    },
    login: async (req:Request, res:Response) => {

    }
}