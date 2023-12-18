import supertest, { SuperTest, Test } from 'supertest';
import { startDb, stopDB } from '../fakeDb';
import { server } from '../../src/server';
import { User } from '../../src/models/user';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { getJWTSecret } from '../../src/utils/jwt';
import jwt from 'jsonwebtoken';
import logger from '../../src/utils/logger';

describe('User Controller', () => {
    let app: SuperTest<Test>;
    let authToken: string;

    beforeAll(async () => {
        app = supertest(server);
        await startDb(); // Assuming this function initializes your fake database
        authToken = jwt.sign(
            { _id: new Types.ObjectId().toHexString() },
            getJWTSecret(),
            {
                expiresIn: '1h',
            }
        );
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });

    it('should register a new user and return a valid auth token', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        };

        const response = await app
            .post('/user/')
            .send(userData)
            .set('x-auth-token', authToken);

        expect(response.status).toBe(201);
        expect(response.headers['x-auth-token']).toBeTruthy();

        const userInDb = await User.findOne({ email: userData.email });
        expect(userInDb).toBeTruthy();
        expect(userInDb!.name).toBe(userData.name);
        expect(userInDb!.email).toBe(userData.email);
        // Check if the stored password is encrypted
        const isPasswordValid = await bcrypt.compare(
            userData.password,
            userInDb!.password
        );
        expect(isPasswordValid).toBeTruthy();
    });

    it('should return 400 if user is already registered', async () => {
        const existingUser = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'existingPassword',
        };

        await User.create(existingUser);

        const response = await app
            .post('/user/')
            .send(existingUser)
            .set('x-auth-token', authToken);

        expect(response.status).toBe(400);
        expect(response.text).toBe('User already registered.');
    });

    it('should return 400 if request body is invalid', async () => {
        const invalidUserData = {
            email: 'invalid@example.com',
        };

        const response = await app
            .post('/user/')
            .send(invalidUserData)
            .set('x-auth-token', authToken);
        logger.info(response);
        expect(response.status).toBe(400);
        expect(response.body).toBeTruthy();
    });
});
