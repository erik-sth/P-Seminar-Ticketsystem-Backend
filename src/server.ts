import express, { Express } from 'express';
import { configureCors } from './startup/cors';
import base from './routes/base';
import user from './routes/user';
import auth from './routes/auth';
import project from './routes/project';
import addRateLimiter from './startup/limitRate';
import * as dotenv from 'dotenv';
dotenv.config();
import logger from './utils/logger';
import connectToDatabase from './startup/db';
import bodyParser from 'body-parser';
import { testingConfig } from './startup/testing';

const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// startup
configureCors(app);
addRateLimiter(app);
if (process.env.NODE_ENV == 'test') testingConfig();
else connectToDatabase();

app.use('/', base);
app.use('/user', user);
app.use('/auth', auth);
app.use('/project', project);

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = app.listen(port, '0.0.0.0', () => {
    logger.info('Server started on port: ' + port);
});

export { server };
