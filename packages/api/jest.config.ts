import type { Config } from 'jest'; const config:Config={ testEnvironment:'node', roots:['<rootDir>/tests'], transform:{'^.+\\.tsx?$':['ts-jest',{}]} }; export default config;
