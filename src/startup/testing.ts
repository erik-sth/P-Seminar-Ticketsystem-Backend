export function testingConfig() {
    process.env.JWT = 'JWTForTesting';
    process.env.PORT = '0'; //Express searches for available port
}
