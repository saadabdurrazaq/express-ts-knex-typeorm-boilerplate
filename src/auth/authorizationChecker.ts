import jwt from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import config from '../config/config';
import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

const JWT_SECRET = config.jwt.secret;

// export function authorizationChecker(connection: Connection): (action: Action, roles: any[]) => Promise<boolean> | boolean {
//     const log = new Logger(__filename);
//     const authService = Container.get<AuthService>(AuthService);

//     return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {
//         // here you can use request/response objects from action
//         // also if decorator defines roles it needs to access the action
//         // you can use them to provide granular access check
//         // checker must return either boolean (true or false)
//         // either promise that resolves a boolean value
//         const credentials = authService.parseBasicAuthFromRequest(action.request);

//         if (credentials === undefined) {
//             log.warn('No credentials given');
//             return false;
//         }

//         action.request.user = await authService.validateUser(credentials.username, credentials.password);
//         if (action.request.user === undefined) {
//             log.warn('Invalid credentials given');
//             return false;
//         }

//         log.info('Successfully checked credentials');
//         return true;
//     };
// }

export function authorizationChecker(connection: Connection): (action: Action, rolesOrPermissions: string[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, rolesOrPermissions: string[]): Promise<boolean> {
        const token = authService.parseJwtFromRequest(action.request);

        if (!token) {
            log.warn('No JWT token given');
            return false;
        }

        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            action.request.user = decoded;

            // If no roles or permissions are specified, allow access
            if (rolesOrPermissions.length === 0) {
                return true;
            }

            log.info('decoded', decoded)

            // Get user roles and permissions from the decoded token
            const userRoles = decoded.roles || [];
            const userPermissions = decoded.permissions || [];

            // Check if the user has any of the required roles or permissions
            const userAuthorities = [...userRoles, ...userPermissions];
            const hasAccess = rolesOrPermissions.some(roleOrPermission => userAuthorities.includes(roleOrPermission));

            if (hasAccess) {
                log.info('User has required role or permission');
            } else {
                log.warn('User does not have required role or permission');
            }

            return hasAccess;
        } catch (error) {
            log.warn('Invalid JWT token');
            return false;
        }
    };
}
