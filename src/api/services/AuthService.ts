import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import { TokenStore } from '../../auth/TokenStore';
import config from '../../config/config';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { UserService } from './UserService';

const JWT_SECRET = config.jwt.secret;

@Service()
export class AuthService {

    constructor(
        private userService: UserService,
        private tokenStore: TokenStore,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async validateUser(username: string, password: string): Promise<{ user: User | null, token?: string }> {
        this.log.info(`Validating user: ${username}, ${password}`);
        const user = await this.userService.findByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = this.createToken(user);
            return { user, token };
        }
        return { user: undefined };
    }

    public createToken(user: User): string {
        return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
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
