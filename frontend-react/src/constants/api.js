export const API_ENDPOINTS = {
    AUTH: {
        CHECK: '/api/auth/check',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        GUEST: '/api/auth/guest',
        LOGOUT: '/api/auth/logout',
        OTP_GENERATE: '/api/auth/otp/generate',
        VERIFY_OTP: '/api/auth/verify-otp',
        RESEND_OTP: '/api/auth/resend-otp',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        VERIFY_RESET_OTP: '/api/auth/verify-reset-otp',
        RESET_PASSWORD: '/api/auth/reset-password'
    },
    MOODS: {
        BASE: '/api/moods',
        LIST: '/api/moods?limit=90'
    },
    JOURNAL: {
        BASE: '/api/journal',
        LIST: '/api/journal?limit=50',
        ANALYTICS: '/api/journal?limit=90'
    },
    ASSESSMENT: {
        BASE: '/api/assessment'
    },
    AI: {
        CHAT: '/api/ai/chat'
    }
};
