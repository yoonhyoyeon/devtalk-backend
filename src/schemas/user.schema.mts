import { z } from 'zod';

export const SignupSchema = z.object({
    email: z.string()
        .email('유효한 이메일을 입력해주세요.'),
    password: z.string()
        .min(8, '비밀번호는 8자 이상이어야 합니다.')
        .regex(/[0-9]/, '숫자를 포함해야 합니다.')
        .regex(/[a-zA-Z]/, '영문을 포함해야 합니다.'),
    name: z.string()
        .min(2, '이름은 2자 이상이어야 합니다.')
        .max(10, '이름은 10자 이하여야 합니다.')
});

export const LoginSchema = z.object({
    email: z.string()
        .email('유효한 이메일을 입력해주세요.'),
    password: z.string()
})