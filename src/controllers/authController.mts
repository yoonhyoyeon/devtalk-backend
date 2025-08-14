import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import User from '../models/user.mjs';

const signToken = (userId: string) => {
    const jwt_secret = process.env.JWT_SECRET;
    const jwt_expires_in = process.env.JWT_EXPIRES_IN
    if(!jwt_secret) {
        throw new Error('JWT_SECRET is not defined')
    }
    return jwt.sign(
        { sub: userId },
        jwt_secret,
        { expiresIn: jwt_expires_in || '7d' } as SignOptions
    );
}