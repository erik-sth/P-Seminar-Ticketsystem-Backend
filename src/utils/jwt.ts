export function getJWTSecret() {
    if (process.env.NODE_ENV === 'test') return 'TestingJWT';
    return process.env.JWT;
}
