import { IsNotEmpty } from 'class-validator';
import { Body, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers'; // , UseBefore
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { JwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware';
import { AuthService } from '../services/AuthService';
import { UserResponse } from '../validators/UserValidator';

class LoginBody {
    @IsNotEmpty()
    public username: string;

    @IsNotEmpty()
    public password: string;
}

@JsonController('/auth')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class AuthController {

    constructor(
        // private userService: UserService,
        private authService: AuthService,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    @Post('/login')
    @ResponseSchema(UserResponse)
    public async login(@Body() body: LoginBody, @Res() res: any): Promise<any> {
        this.log.info(`Received login request with body: ${JSON.stringify(body)}`);

        const { user, token } = await this.authService.validateUser(body.username, body.password);

        if (!user) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        res.status(200).send({
            status: 200,
            message: 'Login success',
            access_token: token,
            token_type: 'Bearer',
            user: {
                username: user.username,
            },
        });
    }

    @Post('/logout')
    @UseBefore(JwtAuthMiddleware)
    public async logout(@Req() req: any, @Res() res: any): Promise<void> {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = req.headers.authorization.split(' ')[1];
        await this.authService.invalidateToken(token);
        console.log('req.headers.authorization', req.headers.authorization);
        res.status(200).send({ message: 'Logged out successfully' });
    }
}
