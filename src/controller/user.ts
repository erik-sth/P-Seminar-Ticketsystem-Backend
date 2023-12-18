import _ from 'lodash';
import bcrypt from 'bcrypt';
import { User, validateSchema } from '../models/user';
import { Request, Response } from 'express';
import { AuthUser } from '../types/user.types';
import logger from '../utils/logger';

class UserController {
    async getMe(req: AuthUser, res: Response) {
        const user = await User.findById(req.user._id);
        res.send(user);
    }

    async registerUser(req: Request, res: Response) {
        try {
            // Validate the request body using Joi schema
            const { error } = validateSchema(req.body);

            if (error) {
                return res.status(400).send(error.message);
            }

            req.body.email = req.body.email.toLowerCase();
            let user = await User.findOne({ email: req.body.email });

            if (user) {
                // User already registered
                logger.warn(
                    `User with email ${req.body.email} is already registered.`
                );
                return res.status(400).send('User already registered.');
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Create a new user
            user = new User(_.pick(req.body, ['name', 'email']));
            user.password = hashedPassword;
            await user.save();

            const token = user.generateAuthToken();
            // Return user details and authentication token in the response
            res.header('x-auth-token', token)
                .header('access-control-expose-headers', 'x-auth-token')
                .status(201)
                .send(_.pick(user, ['_id', 'name', 'email']));
        } catch (error) {
            // Handle unexpected errors
            logger.error(`Error in registerUser: ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default new UserController();
