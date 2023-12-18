import Joi from 'joi';
import mongoose, { Schema, Model, Types } from 'mongoose';
import { Project } from '../types/project.types';

// Project schema
const projectSchema = new Schema<Project>({
    name: { type: String, minlength: 3, maxlength: 50, required: true },
    date: { type: Date, required: true },
    leader: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    userWithAccess: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    isDeleted: { type: Boolean, default: false },
});

// Project Model
const ProjectModel: Model<Project> = mongoose.model('project', projectSchema);

function hasDuplicateIds<T>(ids: T[]): boolean {
    const uniqueIds = new Set(ids);
    return uniqueIds.size !== ids.length;
}

function validateSchema(project: Partial<Project>) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label('Name'),
        date: Joi.date().required(),
        userWithAccess: Joi.array().items(
            Joi.string().custom((value, helpers) => {
                if (!Types.ObjectId.isValid(value)) {
                    return helpers.error('any.invalid');
                }
                return value;
            })
        ),
    });

    const { error } = schema.validate({
        name: project.name,
        date: project.date,
        userWithAccess: project.userWithAccess,
    });

    if (!error) {
        // Check for duplicate IDs in the userWithAccess array
        if (hasDuplicateIds<Types.ObjectId>(project.userWithAccess)) {
            return { message: 'No duplicates.' };
        }
    }

    return error;
}
export { ProjectModel as Project, validateSchema };
