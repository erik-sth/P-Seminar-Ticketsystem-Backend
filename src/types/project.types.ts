import { Types, Document } from 'mongoose';
import { AuthenticatedRequest } from './user.types';

export interface Project extends Document {
    name: string;
    date: Date;
    leader: Types.ObjectId;
    userWithAccess: Types.ObjectId[];
    isDeleted: boolean;
}
export interface ProjectQuery {
    userWithAccess: Types.ObjectId;
    isDeleted: boolean;
    _id?: string;
}

export interface ProjectRequest extends AuthenticatedRequest {
    project?: Project;
}
