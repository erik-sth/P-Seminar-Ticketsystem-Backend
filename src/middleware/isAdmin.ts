import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/user.types';

const isAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user.isAdmin) next();
    return res.status(403).send('Admin rights needed.');
};

export { isAdmin };
