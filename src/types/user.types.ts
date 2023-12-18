import { Request } from 'express';
import { Document } from 'mongoose';
import { Project } from './project.types';
import { Types } from 'mongoose';

export interface User extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    emailConfirmed: boolean;
    isAdmin: boolean;
    generateAuthToken(): string;
    loginAttemptsFailed: number;
}

export type UserTokenData = Pick<User, '_id' | 'name' | 'email' | 'isAdmin'>;

export interface AuthRequest extends Request {
    email: string;
    password: string;
}

export interface AuthUser extends Request {
    user?: UserTokenData;
}

export interface AuthUserWithAccess extends AuthUser {
    projectsWithAccess?: Promise<Project[] | null> | Project[] | null;
}
