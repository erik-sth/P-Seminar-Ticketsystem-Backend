import { Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { ProjectController } from '../controller/project';
import { ProjectQuery, ProjectRequest } from '../types/project.types';

async function userWithAccess(
    req: ProjectRequest,
    res: Response,
    next: NextFunction
) {
    //default query
    const projectQuery: ProjectQuery = {
        userWithAccess: req.user?._id,
        isDeleted: false,
    };
    //validate
    if (req.params.projectId && isValidObjectId(req.params.projectId)) {
        projectQuery._id = req.params.projectId;
    } else res.status(403).send('No access.');
    //get Projects with access
    const result = await ProjectController.getProject(projectQuery);
    if (result) {
        req.project = result[0];
        next();
    } else {
        res.status(404).send('Project not found.');
    }
}

export { userWithAccess };
