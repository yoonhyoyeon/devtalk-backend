import mongoose from 'mongoose';
import type { Types } from 'mongoose';

interface IPost {
    title: string;
    content: string;
    category: '자유' | '질문' | '스터디' | '취업';
    author: mongoose.Types.ObjectId;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

// 게시글 스키마 정의
const postSchema = new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['자유', '질문', '스터디', '취업']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 모델 생성
const Post = mongoose.model('Post', postSchema);

export default Post;