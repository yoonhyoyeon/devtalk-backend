import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ERROR_TYPES } from '../constants/errorTypes.mjs'

type TargetType = 'query' | 'body';

export const validate = (target:TargetType, schema:z.ZodType) => {
    return (req:Request, res:Response, next:NextFunction) => {
        const result = schema.safeParse(req[target]);

        if(!result.success) {
            return res.status(422).json({
                message: `${target}값이 올바르지 않습니다.`,
                errors: result.error.issues,
                type: ERROR_TYPES.VALIDATION_ERROR,
            })
        }

        if(target === 'query') req.validatedQuery = result.data;
        else req[target] = result.data;
        next();
    }
}