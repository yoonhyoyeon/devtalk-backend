import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import User from '../models/user.mjs';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';
import { parseTimeToMs } from '../utils/parseToMs.mjs';

type TokenType = 'access' | 'refresh';

const signToken = (userId:string, type:TokenType) => {
    const jwt_secret = process.env.JWT_SECRET;
    const jwt_expires_in_refresh = process.env.JWT_EXPIRES_IN_REFRESH;
    const jwt_expires_in_access = process.env.JWT_EXPIRES_IN_ACCESS

    if(!jwt_secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    const config = {
        access: {
            expiresIn: jwt_expires_in_access || '1h'
        },
        refresh: {
            expiresIn: jwt_expires_in_refresh || '7d'
        }
    };

    return jwt.sign(
        { sub: userId },
        jwt_secret,
        { ...config[type] } as SignOptions
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
            const refreshToken = signToken(user._id.toString(), 'refresh');
            const accessToken = signToken(user._id.toString(), 'access');

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseTimeToMs(process.env.JWT_EXPIRES_IN_REFRESH || '7d')
            })

            return res.status(201).json({
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    accessToken
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
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if(!user) {
                return res.status(401).json({
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                    type: ERROR_TYPES.VALIDATION_ERROR
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if(!isValidPassword) {
                return res.status(401).json({
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                    type: ERROR_TYPES.VALIDATION_ERROR
                });
            }

            const accessToken = signToken(user._id.toString(), 'access');
            const refreshToken = signToken(user._id.toString(), 'refresh');

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, //js로 쿠키 접근 X (document.cookie 읽기/수정 불가)
                secure: process.env.NODE_ENV === 'production', //https 프로토콜에서만 쿠키 전송
                sameSite: 'strict', //오직 같은 도메인에서만 쿠키 전송
                maxAge: parseTimeToMs(process.env.JWT_EXPIRES_IN_REFRESH || '7d')
            });

            return res.status(200).json({
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    accessToken
                }
            });
        } catch(error) {
            return res.status(500).json({
                message: '서버 에러',
                type: ERROR_TYPES.INTERNAL_SERVER_ERROR
            })
        }
    },
    refresh: async (req:Request, res:Response) => {
        try {
            const jwt_secret = process.env.JWT_SECRET;

            if(!jwt_secret) {
                throw new Error('JWT_SECRET is not defined');
            }
            
            const { refreshToken } = req.cookies;

            if(!refreshToken) {
                return res.status(401).json({
                    message: 'Refresh Token이 없습니다.',
                    type: ERROR_TYPES.UNAUTHORIZED
                });
            }
            const decoded = jwt.verify(refreshToken, jwt_secret);
            //decoded <- { sub: '68a6b48e7f00eb8246c63344', iat: 1755763870, exp: 1756368670 }
            
            const accessToken = signToken(decoded.sub as string, 'access');

            return res.status(200).json({
                data: { 
                    accessToken 
                }
            });
        } catch(error) {
            if(error instanceof Error && error.message === 'JWT_SECRET is not defined') {
                return res.status(500).json({
                    message: '서버 설정 오류',
                    type: ERROR_TYPES.INTERNAL_SERVER_ERROR
                });
            }
            if(error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    message: 'Refresh Token이 만료되었습니다',
                    type: ERROR_TYPES.EXPIRED_TOKEN
                });
            }
            if(error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    message: '유효하지 않은 Refresh Token입니다',
                    type: ERROR_TYPES.INVALID_TOKEN
                });
            }
            return res.status(500).json({
                message: '서버 에러',
                type: ERROR_TYPES.INTERNAL_SERVER_ERROR
            });
        }
    },
    logout: async (req:Request, res:Response) => {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return res.sendStatus(204);
        } catch(error) {
            return res.status(500).json({
                message: '서버 에러',
                type: ERROR_TYPES.INTERNAL_SERVER_ERROR
            });
        }
    }
}