// auth.test.ts
import supertest, { SuperTest, Test } from 'supertest';
import { startDb, stopDB } from '../fakeDb';
import { server } from '../../src/server'; // Import both app and server
import endpoints from './endpoints';
import { User } from '../../src/models/user';
import { Project } from '../../src/models/project';
import { Types } from 'mongoose';

describe('Authenticated tests', () => {
    let api: SuperTest<Test>;

    beforeAll(async () => {
        api = supertest(server);
        await startDb();
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });

    const user = new User({
        name: 'user1',
        email: 'test@gmail.com',
        isAdmin: false,
        _id: 'id1',
    });

    const token = user.generateAuthToken();
    const project = new Project({
        _id: '64eb59a48e26d74d56c67c81',
        name: 'Test',
        date: Date.now(),
        leader: new Types.ObjectId(),
    });
    project.save();
    endpoints.forEach(({ path, method, isAdmin, isLeader }) => {
        it(`should return 401 Unauthorized for ${method.toUpperCase()} ${path} when no token is provided`, async () => {
            const response = await api[method](path).set({
                'x-auth-token': '',
            });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized' });
        });

        if (isAdmin) {
            it(`should return 403, admin rights needed at endpoint ${path}`, async () => {
                const response = await api[method](path).set(
                    'x-auth-token',
                    token
                );

                expect(response.status).toBe(403);
            });
        }
        if (isLeader) {
            it(`should return 403, leader rights needed at endpoint ${path}`, async () => {
                const response = await api[method](path).set(
                    'x-auth-token',
                    token
                );

                expect(response.status).toBe(403);
            });
        }
    });
});
