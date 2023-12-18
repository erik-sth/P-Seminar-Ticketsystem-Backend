import { Response, NextFunction, Request } from 'express';
import { isValidObjectId } from 'mongoose';
import { Project } from '../models/project';

const isLeader = async (req: Request, res: Response, next: NextFunction) => {
    //Validate
    if (!req.params.projectId || !isValidObjectId(req.params.projectId))
        return res.status(400).send('No or valid ProjectId provided.');

    //Project doesnt exist
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).send('Project doesnt exist.');

    //Not leader rights
    if (project.leader != req.user._id)
        return res.status(403).send('You need leader rigths.');

    next();
};

export { isLeader };
