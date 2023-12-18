import supertest, { SuperTest, Test } from 'supertest';
import { server } from '../../src/server';
import { startDb, stopDB } from '../fakeDb';
import bcrypt from 'bcrypt';
import { User } from '../../src/models/user';
import logger from '../../src/utils/logger';

export async function seedDatabaseForAuthRoute() {
    // Insert users with different scenarios
    const users = [
        {
            name: 'Test User',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            emailConfirmed: true,
            loginAttemptsFailed: 0,
        },
        {
            name: 'Compromised User',
            email: 'compromised@example.com',
            password: await bcrypt.hash('invalidpassword', 10),
            emailConfirmed: true,
            loginAttemptsFailed: 10, // Simulate a compromised account
        },
        // Add more users as needed for different scenarios
    ];

    // Insert users into the database
    try {
        await User.insertMany(users);
        logger.info('Database seeded successfully.');
    } catch (error) {
        logger.error('Error seeding database:', error);
    }
}

describe('Authentication Controller', () => {
    let app: SuperTest<Test>;

    beforeAll(async () => {
        app = supertest(server);
        await startDb();
        await seedDatabaseForAuthRoute();
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });
    it('should return a token when valid credentials are provided', async () => {
        const response = await app.post('/auth').send({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('x-auth-token');
    });

    it('should return an error when invalid credentials are provided', async () => {
        const response = await app.post('/auth').send({
            email: 'invalid@example.com',
            password: 'invalidpassword',
        });

        expect(response.status).toBe(404); // Assuming you return 404 for invalid credentials
        expect(response.body).not.toHaveProperty('x-auth-token');
    });

    it('should return an error when account is compromised', async () => {
        // You might need to set up a user with a loginAttemptsFailed count >= 10 for this test
        const response = await app.post('/auth').send({
            email: 'compromised@example.com',
            password: 'invalidpassword',
        });

        expect(response.status).toBe(418);
        expect(response.body).not.toHaveProperty('x-auth-token');
    });

    // Add more test cases as needed
});
