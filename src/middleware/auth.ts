import { Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { getJWTSecret } from '../utils/jwt';
import { AuthenticatedRequest, UserTokenData } from '../types/user.types';
import logger from '../utils/logger';

const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers?.['x-auth-token'] as string;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the token and check for expiration
        const decoded = jwt.verify(token, getJWTSecret()) as UserTokenData;
        req.user = decoded;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            logger.debug(token, error);
            // If the token is expired, return an error response
            return res.status(401).json({ message: 'Token expired' });
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
};

export { auth };
