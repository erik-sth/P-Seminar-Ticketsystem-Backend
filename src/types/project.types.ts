import { Request } from 'express';
import { Types, Document } from 'mongoose';

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

export interface ProjectRequest extends Request {
    project?: Project;
}
