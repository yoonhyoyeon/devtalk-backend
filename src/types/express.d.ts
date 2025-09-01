import { z } from 'zod';
import { GetPostsQuerySchema } from '../schemas/post.schema.mts';

declare global {
    namespace Express {
        interface Request {
            validatedQuery: any;
            userId?: string;
        }
    }
}