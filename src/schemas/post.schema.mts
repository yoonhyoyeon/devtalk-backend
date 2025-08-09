import { z } from 'zod';

export const CreatePostSchema = z.object({
    title: z.string()
    .trim()
    .min(1, '제목은 필수입니다.')
    .max(100, '제목은 100자 이내여야 합니다.'),

    content: z.string()
    .trim()
    .min(1, '내용은 필수입니다.'),

    category: z.enum(['자유', '질문', '스터디', '취업'], '올바른 카테고리를 선택해주세요.')
    //views, createdAt, updateAt은? 서버에서 자동으로 관리되고 클라이언트 요청 시 이 값을 보내지 않기 때문에 zod로 유효성 검사를 할 필요가 없음.
});

export const UpdatePostSchema = z.object({
    title: z.string()
    .trim()
    .min(1, '제목은 1자 이상이어야 합니다.')
    .max(100, '제목은 100자 이내여야 합니다.')
    .optional(),
    content: z.string()
    .trim()
    .min(1, '본문은 1자 이상이어야 합니다.')
    .optional(),
    category: z.enum(['자유', '질문', '스터디', '취업'], '올바른 카테고리를 선택해주세요.').optional()
})