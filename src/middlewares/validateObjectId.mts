import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';

export const validateObjectId = (req:Request, res:Response, next:NextFunction) => {
    if(!(req.params.id && mongoose.Types.ObjectId.isValid(req.params.id))) {
        return res.status(400).json({
            message: '잘못된 형식의 게시글 Id입니다.',
            type: ERROR_TYPES.INVALID_OBJECT_ID
        });
    }
    return next();
}
