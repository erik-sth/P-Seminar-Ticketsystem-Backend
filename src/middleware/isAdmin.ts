import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/user.types';

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user.isAdmin) next();
    return res.status(403).send('Admin rights needed.');
};

export { isAdmin };
