import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';
import mongoose from 'mongoose';

export const auth = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const jwt_secret = process.env.JWT_SECRET;

        if(!jwt_secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const authHeader = req.headers.authorization;
        if( !authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: '인증 토큰이 필요합니다',
                type: ERROR_TYPES.UNAUTHORIZED,
            });
        }
        const token = authHeader.split(' ')[1];
        if(!token) {
            return res.status(401).json({
                message: '유효하지 않은 토큰입니다',
                type: ERROR_TYPES.UNAUTHORIZED
            });
        }

        const decoded = jwt.verify(token, jwt_secret) as { sub: string };
        
        if(!mongoose.Types.ObjectId.isValid(decoded.sub)) {
            return res.status(401).json({
                message: '유효하지 않은 토큰입니다',
                type: ERROR_TYPES.UNAUTHORIZED
            })
        }

        req.userId = decoded.sub;

        next();
    } catch(error) {
        if(error instanceof Error && error.message === 'JWT_SECRET is not defined') {
            return res.status(500).json({
                message: '서버 설정 오류',
                type: ERROR_TYPES.INTERNAL_SERVER_ERROR
            });
        }
        if(error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: '만료된 토큰입니다',
                type: ERROR_TYPES.UNAUTHORIZED
            });
        }
        if(error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: '유효하지 않은 토큰입니다',
                type: ERROR_TYPES.UNAUTHORIZED
            });
        }
        return res.status(500).json({
            message: '서버 에러',
            type: ERROR_TYPES.INTERNAL_SERVER_ERROR
        })
    }
}