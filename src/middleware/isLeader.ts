import { Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { Project } from '../models/project';
import { ProjectRequest } from '../types/project.types';

const isLeader = async (
    req: ProjectRequest,
    res: Response,
    next: NextFunction
) => {
    //Validate
    if (!req.params.projectId || !isValidObjectId(req.params.projectId))
        return res.status(400).send('No or valid ProjectId provided.');

    //Project doesnt exist
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).send('Project doesnt exist.');

    //Not leader rights and is not admin
    if (project.leader != req.user._id && !req.user.isAdmin)
        return res.status(403).send('You need leader rigths.');

    req.project = project;
    next();
};

export { isLeader };
