import { Types, isValidObjectId } from 'mongoose';
import { Project, validateSchema } from '../models/project';
import {
    Project as ProjectType,
    ProjectQuery,
    ProjectRequest,
} from '../types/project.types';
import { Request, Response } from 'express';
import { AuthUser } from '../types/user.types';
import logger from '../utils/logger';

class ProjectController {
    static isValidProjectId(req: Request, res: Response, next: () => void) {
        if (!req.params.projectId || !isValidObjectId(req.params.projectId))
            return res.status(404).send('No valid Project Id');
        next();
    }

    static async handleProjectById(
        req: Request,
        res: Response,
        callback: (project: ProjectType) => Promise<void>
    ) {
        try {
            this.isValidProjectId(req, res, async () => {
                const project = await Project.findById(req.params.projectId);
                if (!project) {
                    res.status(404).send('Project not found');
                } else {
                    await callback(project);
                }
            });
        } catch (error) {
            console.error('Error handling project:', error);
            res.status(500).send('Internal server error');
        }
    }
    static async getProjects(req: AuthUser, res: Response) {
        const userId = req.user._id;
        const query = {
            $or: [{ leader: userId }, { userWithAccess: userId }],
        };
        const projects = await Project.find(query);

        res.json({ results: projects });
    }
    static returnProject(req: ProjectRequest, res: Response) {
        res.json({ results: req.project });
    }
    static async updateProject(req: ProjectRequest, res: Response) {
        try {
            // Validate request body
            req.body.userWithAccess = [];
            const error = validateSchema(req.body);
            if (error) {
                res.status(400).send(error.message);
            } else {
                req.project.name = req.body.name;
                req.project.date = req.body.date;

                await req.project.save();
                res.status(200).json(req.project);
            }
        } catch (error) {
            console.error('Error updating project:', error);
            res.status(500).send('Internal server error');
        }
    }
    static async createProject(req: Request, res: Response) {
        try {
            req.body.userWithAccess = [];
            const error = validateSchema(req.body);
            if (error) {
                logger.error(error.message);
                return res.status(400).send(error.message);
            }

            // Create a new project
            const newProject = new Project(req.body);
            newProject.leader = req.user._id;
            newProject.userWithAccess = [];
            await newProject.save();

            res.status(201).json(newProject);
        } catch (error) {
            console.error('Error creating project:', error);
            res.status(500).send('Internal server error');
        }
    }
    static async getProject(
        query: ProjectQuery
    ): Promise<ProjectType[] | null> {
        return Project.find(query).exec();
    }

    static async addAccessToProject(req: ProjectRequest, res: Response) {
        try {
            const userId = new Types.ObjectId(req.params.userId);
            if (!req.project.userWithAccess.includes(userId)) {
                req.project.userWithAccess.push(userId);
            }
            await req.project.save();
            res.status(200).send('Access added successfully');
        } catch (error) {
            console.error('Error adding access:', error);
            res.status(500).send('Internal server error');
        }
    }
    static async removeAccessToProject(req: ProjectRequest, res: Response) {
        try {
            const userId = new Types.ObjectId(req.params.userId); // Convert to ObjectId
            req.project.userWithAccess = req.project.userWithAccess.filter(
                (user) => !user.equals(userId)
            );
            await req.project.save();
            res.status(200).send('Access removed successfully');
        } catch (error) {
            console.error('Error removing access:', error);
            res.status(500).send('Internal server error');
        }
    }
    static async deleteProject(req: ProjectRequest, res: Response) {
        req.project.isDeleted = true;
        await req.project.save();
        res.send('Deleted!');
    }

    static async restoreProject(req: Request, res: Response) {
        try {
            this.handleProjectById(req, res, async (project) => {
                await project.updateOne({ isDeleted: false });
                res.status(200).send('Restored.');
            });
        } catch (error) {
            console.error('Error restoring project:', error);
            res.status(500).send('Internal server error');
        }
    }
    static getDeletedProjects(req: Request, res: Response) {
        const deletedProjects = Project.find({ isDeleted: true });
        return res.json({ results: deletedProjects });
    }
}

export { ProjectController };
