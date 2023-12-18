import { UserTokenData } from './user.types';

declare module 'express' {
    interface Request {
        user?: UserTokenData;
    }
}
