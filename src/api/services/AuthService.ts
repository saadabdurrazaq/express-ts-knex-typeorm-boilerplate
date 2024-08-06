import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { TokenStore } from '../../auth/TokenStore';
import config from '../../config/config';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';

// import { UserService } from './UserService';

const JWT_SECRET = config.jwt.secret;

@Service()
export class AuthService {

    constructor(
        // private userService: UserService,
        private tokenStore: TokenStore,
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) { }

    public async validateUser(username: string, password: string): Promise<{ user: User | null, token?: string }> {
        this.log.info(`Validating user: ${username}, ${password}`);

        // const user = await this.userService.findByUsername(username);
        const user = await this.userRepository.findOne({
            where: { username },
            relations: ['roles', 'roles.permissions']
        });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = this.createToken(user);
            return { user, token };
        }

        return { user: undefined };
    }

    public createToken(user: User): string {
        this.log.info(`User objectfd: ${JSON.stringify(user.roles, null, 2)}`);

        const roleNames = user.roles.map(role => role.name);

        const permissions = user.roles
            .map(role => role.permissions.map(permission => permission.name))
            .reduce((acc, curr) => acc.concat(curr), []);

        const payload = {
            id: user.id,
            username: user.username,
            // roles: user.roles.map(role => role.name),
            // permissions: [
            //     ...user.permissions.map(permission => permission.name),
            //     ...user.roles.flatMap(role => role.permissions.map(permission => permission.name))
            // ]
            roles: roleNames,
            permissions: permissions
        };

        // return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    }

    public async invalidateToken(token: string): Promise<void> {
        await this.tokenStore.addToBlacklist(token);
    }

    public async isTokenInvalidated(token: string): Promise<boolean> {
        return await this.tokenStore.isBlacklisted(token);
    }

    public async verifyToken(token: string): Promise<any> {
        if (await this.isTokenInvalidated(token)) {
            throw new Error('Token is invalid');
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        return decoded;
    }
}
