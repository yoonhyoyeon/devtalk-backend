export const ERROR_TYPES = {
    // 유효성 검사
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_OBJECT_ID: 'INVALID_OBJECT_ID',

    // 리소스 관련
    NOT_FOUND: 'NOT_FOUND',

    // 서버 에러
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

export type ErrorType = keyof typeof ERROR_TYPES;