import jwt from 'jsonwebtoken';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Container } from 'typedi';

import config from '../../config/config';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { AuthService } from '../services/AuthService';

const JWT_SECRET = config.jwt.secret;

@Middleware({ type: 'before' })
export class JwtAuthMiddleware implements ExpressMiddlewareInterface {

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async use(req: any, res: any, next: (err?: any) => any): Promise<void> {
        const authService = Container.get(AuthService);
        const authHeader = req.headers.authorization;

        this.log.info('Request Headers: ', req.headers);

        if (req.path === '/api/auth/login' || req.path === '/api/auth/logout') {
            return next();
        }

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            if (!token) {
                this.log.error('No token found in authorization header.');
                return res.status(401).send({ message: 'Invalid token' });
            }

            try {
                const isTokenInvalidated = await authService.isTokenInvalidated(token);
                this.log.info(`Token invalidation check for ${token}: ${isTokenInvalidated}`);

                if (isTokenInvalidated) {
                    this.log.warn(`Token ${token} is blacklisted.`);
                    return res.status(401).json({ message: 'Your token is expired. Please login to access this resource!' });
                }

                jwt.verify(token, JWT_SECRET, (err, user) => {
                    if (err) {
                        this.log.error('Error verifying token:', err);
                        return res.status(403).send({ message: 'Token is not valid' });
                    }

                    this.log.info('Token is valid, setting user to request object.');
                    req.user = user;
                    next();
                });
            } catch (error) {
                this.log.error('Error checking token invalidation:', error);
                return res.status(500).send({ message: 'Internal server error' });
            }
        } else {
            this.log.error('Authorization header not found.');
            return res.status(401).send({ message: 'Unauthenticated' });
        }
    }
}
