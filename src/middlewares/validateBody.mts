import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ERROR_TYPES } from '../constants/errorTypes.mjs';

export const validateBody = (schema: z.ZodType) => {
    return (req:Request, res:Response, next:NextFunction) => {
        // 1. 요청 데이터 검증
        const result = schema.safeParse(req.body);

        // 2. 검증 실패시
        /*
        result = 
        {
            success: false,
            error: ZodError: [
                {
                "origin": "string",
                "code": "too_small",
                "minimum": 1,
                "inclusive": true,
                "path": [
                    "title"
                ],
                "message": "제목은 필수입니다."
                }
            ]
                at new ZodError (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/core/core.js:30:39)
                at Module.<anonymous> (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/core/parse.js:40:20)
                at inst.safeParse (file:///Users/yoonhyoyeon/Desktop/backend/node_modules/zod/v4/classic/schemas.js:30:46)
                at <anonymous> (/Users/yoonhyoyeon/Desktop/backend/src/routes/posts.mts:22:35)
                at Layer.handleRequest (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/layer.js:152:17)
                at next (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/route.js:157:13)
                at Route.dispatch (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/route.js:117:3)
                at handle (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/index.js:435:11)
                at Layer.handleRequest (/Users/yoonhyoyeon/Desktop/backend/node_modules/router/lib/layer.js:152:17)
                at /Users/yoonhyoyeon/Desktop/backend/node_modules/router/index.js:295:15
        }
        */
        if(!result.success) {
            return res.status(422).json({
                message: '입력값이 올바르지 않습니다.',
                errors: result.error.issues,
                type: ERROR_TYPES.VALIDATION_ERROR
            });
        }

        // 3. 검증 성공시
        /*
        result =
        {
            success: true,
            data: { title: '제목1', content: '본문1', category: '자유' }
        }
        */
        req.body = result.data;
        return next();
    }
}