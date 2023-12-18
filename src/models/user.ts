import Joi from 'joi';
import mongoose, { Schema, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { AuthRequest, User } from '../types/user.types';
import { getJWTSecret } from '../utils/jwt';

// User schema
const userSchema = new Schema<User>(
    {
        name: { type: String, minlength: 3, maxlength: 50, required: true },
        email: {
            type: String,
            minlength: 5,
            maxlength: 255,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            minlength: 8,
            maxlength: 1024,
            required: true,
        },
        emailConfirmed: { type: Boolean, default: false },
        loginAttemptsFailed: { type: Number, default: 0 },
        isAdmin: { type: Boolean, default: false },
    },
    {
        versionKey: false,
        toJSON: {
            transform: function (_doc, ret) {
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);

// Generate auth token method
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            isAdmin: this.isAdmin,
        },

        getJWTSecret(),
        { expiresIn: '7d', algorithm: 'HS256' }
    );
    return token;
};

// User model
const UserModel: Model<User> = mongoose.model('user', userSchema);

function validateSchema(user: Partial<User>) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label('Name'),
        email: Joi.string()
            .min(5)
            .max(255)
            .email()
            .required()
            .label('Email')
            .lowercase(),
        password: Joi.string().min(8).max(1024).required().label('Password'),
        emailConfirmed: Joi.bool().label('Email Confirmed'),
    });
    const { error } = schema.validate({
        name: user.name,
        email: user.email,
        password: user.password,
        emailConfirmed: user.emailConfirmed,
    });
    return { error };
}
function validateAuth(req: AuthRequest) {
    const schema = Joi.object({
        email: Joi.string().email().required().max(255).label('Email'),
        password: Joi.string().min(5).max(255).required().label('Password'),
    });

    const { error } = schema.validate({
        email: req.email,
        password: req.password,
    });

    return { error, validateAuth };
}
export { UserModel as User, validateSchema, validateAuth };
