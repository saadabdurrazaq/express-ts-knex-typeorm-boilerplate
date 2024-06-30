import dotenv from 'dotenv';

dotenv.config();

interface Config {
    jwt: {
        secret: string;
        expiresIn: string;
    };
}

const config: Config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
};

export default config;
