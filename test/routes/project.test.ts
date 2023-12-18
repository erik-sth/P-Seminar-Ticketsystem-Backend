import supertest, { SuperTest, Test } from 'supertest';
import { Types } from 'mongoose';
import { server } from '../../src/server';
import { getJWTSecret } from '../../src/utils/jwt';
import jwt from 'jsonwebtoken';
import { startDb, stopDB } from '../fakeDb';
import { Project } from '../../src/models/project';

describe('Project Routes', () => {
    let app: SuperTest<Test>;
    let authToken: string;
    const userId = new Types.ObjectId().toHexString();

    beforeAll(async () => {
        app = supertest(server);
        await startDb(); // Assuming this function initializes your fake database
        authToken = jwt.sign({ _id: userId }, getJWTSecret(), {
            expiresIn: '1h',
        });
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });

    it('should get projects', async () => {
        const response = await app
            .get('/project')
            .set('x-auth-token', authToken);
        expect(response.status).toBe(200);
        expect(response.body.results).toBeDefined();
    });

    it('should create a new project', async () => {
        const newProject = {
            name: 'New Project',
            date: Date.now(),
        };

        const response = await app
            .post('/project')
            .send(newProject)
            .set('x-auth-token', authToken);

        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();
        expect(response.body.name).toBe(newProject.name);
    });

    it('should update an existing project', async () => {
        const existingProject = {
            name: 'Existing Project',
            date: Date.now(),
        };

        const createdProject = await app
            .post('/project')
            .send(existingProject)
            .set('x-auth-token', authToken);

        const updatedProjectData = {
            name: 'Updated Project',
            date: Date.now(),
        };

        const response = await app
            .patch(`/project/${createdProject.body._id}`)
            .send(updatedProjectData)
            .set('x-auth-token', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.name).toBe(updatedProjectData.name);
    });

    it('should delete a project', async () => {
        const newProject = {
            name: 'Project to Delete',
            date: Date.now(),
        };

        const createdProject = await app
            .post('/project')
            .send(newProject)
            .set('x-auth-token', authToken);
        const response = await app
            .delete(`/project/${createdProject.body._id}`)
            .set('x-auth-token', authToken);

        expect(response.status).toBe(200);
        expect(response.text).toBe('Deleted!');
    });
    it('should add access to a project', async () => {
        const projectData = {
            name: 'Test Project',
            date: Date.now(),
            leader: userId,
        };

        const project = await Project.create(projectData);
        const secondUserId = new Types.ObjectId();
        const response = await app
            .patch(`/project/addAccess/${project._id}/${secondUserId}`) // Replace with a valid user ID
            .set('x-auth-token', authToken);

        expect(response.status).toBe(200);
        expect(response.text).toBe('Access added successfully');

        // Check if the access was added to the project in the database
        const updatedProject = await Project.findById(project._id);
        expect(updatedProject.userWithAccess[0]).toEqual(secondUserId);
    });
    it('should remove access from a project', async () => {
        const secondUserId = new Types.ObjectId();
        const projectData = {
            name: 'Test Project',
            date: Date.now(),
            leader: userId,
            userWithAccess: [secondUserId],
        };

        const project = await Project.create(projectData);

        const response = await app
            .patch(`/project/removeAccess/${project._id}/${secondUserId}`) // Replace with a valid user ID
            .set('x-auth-token', authToken);

        expect(response.status).toBe(200);
        expect(response.text).toBe('Access removed successfully');

        // Check if the access was removed from the project in the database
        const updatedProject = await Project.findById(project._id);
        expect(updatedProject.userWithAccess[0]).not.toEqual(secondUserId);
    });
});
