import { Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { ProjectController } from '../controller/project';
import { AuthUserWithAccess } from '../types/user.types';
import { ProjectQuery } from '../types/project.types';

async function userWithAccess(
    req: AuthUserWithAccess,
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
    }
    //get Projects with access
    const result = await ProjectController.getProject(projectQuery);
    if (result) {
        req.projectsWithAccess = result;
        next();
    } else {
        res.status(404).send('Project not found.');
    }
}

export { userWithAccess };
