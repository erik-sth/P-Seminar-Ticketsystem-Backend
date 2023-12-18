import supertest, { SuperTest, Test } from 'supertest';
import { server } from '../../src/server';
import { startDb, stopDB } from '../fakeDb';
import { getJWTSecret } from '../../src/utils/jwt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

describe('Authentication Middleware', () => {
    let app: SuperTest<Test>;
    beforeAll(async () => {
        app = supertest(server);
        await startDb();
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });

    it('should pass authentication and set req.user if valid token is provided', async () => {
        // Mock a valid token with a valid ObjectId
        const validToken = jwt.sign(
            { _id: new Types.ObjectId().toHexString() },
            getJWTSecret(),
            {
                expiresIn: '1h',
            }
        );

        const response = await app
            .get('/project')
            .set('x-auth-token', validToken);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({}));
    });

    it('should return 401 if no token is provided', async () => {
        const response = await app.get('/project'); // Check the route, it should match your actual route

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return 401 if token is expired', async () => {
        // Mock an expired token
        const expiredToken = jwt.sign({ _id: 'mockedUserId' }, getJWTSecret(), {
            expiresIn: '-1s',
        });

        const response = await app
            .get('/project')
            .set('x-auth-token', expiredToken);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Token expired' });
    });

    it('should return 401 if an invalid token is provided', async () => {
        // Mock an invalid token
        const invalidToken = 'invalid-token';

        const response = await app
            .get('/project')
            .set('x-auth-token', invalidToken);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized' });
    });
});
