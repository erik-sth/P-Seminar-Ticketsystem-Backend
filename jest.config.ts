import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/test/**/*.test.(ts|js)'],
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    maxWorkers: 1, //because of port problems when running in parrallel
};

export default config;
