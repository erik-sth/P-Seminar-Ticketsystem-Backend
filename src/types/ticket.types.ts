import { Types, Document } from 'mongoose';

export interface Ticket extends Document {
    firstName: string;
    lastName: string;
    isCheckedIn: boolean;
    projectId: Types.ObjectId;
}
