import { Request, Response } from 'express';
// import { DownloadCSV } from '../utils/DownloadCSV';
import { Parser } from 'json2csv';
// import fs from 'fs';
import multer from 'multer';
import path from 'path';
// import { Type } from 'class-transformer';
import {
    Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put, Req, Res, UseBefore
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import sharp from 'sharp';

import { UserNotFoundError } from '../errors/UserNotFoundError';
import { JwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware';
import { User } from '../models/User';
import { UserService } from '../services/UserService';
import { BaseUser, CreateUserBody, UserResponse } from '../validators/UserValidator';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @Authorized()
@JsonController('/users')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get()
    @ResponseSchema(UserResponse, { isArray: true })
    public find(): Promise<User[]> {
        return this.userService.find();
    }

    @Get('/me')
    @ResponseSchema(UserResponse, { isArray: true })
    public findMe(@Req() req: any): Promise<User[]> {
        return req.user;
    }

    @Get('/:id')
    @OnUndefined(UserNotFoundError)
    @ResponseSchema(UserResponse)
    public one(@Param('id') id: number): Promise<User | undefined> {
        return this.userService.findOne(id);
    }

    @Post('/register')
    // @UseBefore(upload.none())
    @UseBefore(upload.single('photo'))
    @ResponseSchema(UserResponse)
    public async create(@Body() body: CreateUserBody, @Req() req: Request, @Res() res: Response): Promise<User> {
        console.log('Received body:', body);
        const user = new User();
        user.email = body.email;
        user.name = body.name;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.password = body.password;
        user.username = body.username;

        if ((req as any).file) {
            const file = (req as any).file as multer.File;
            try {
                const avatarName = `${Date.now()}-${file.originalname}`;
                const avatarPath = path.join(__dirname, '..', 'uploads', 'images', avatarName);

                await sharp(file.buffer).resize(200, 200).toFile(avatarPath);

                user.photo = avatarName;
            } catch (error) {
                console.error('Error uploading avatar:', error);
                throw new Error('Failed to upload avatar');
            }
        }

        try {
            const newUser = await this.userService.create(user);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    @Get('/download-pdf/users')
    @UseBefore(JwtAuthMiddleware)
    public async downloadPdf(@Res() response: Response): Promise<void> {
        try {
            const pdfBuffer = await this.userService.generatePdf();
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', 'attachment; filename=user_report.pdf');
            response.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating or sending PDF:', error);
            response.status(500).send('Error generating PDF');
        }
    }

    @Get('/download-csv/users')
    @UseBefore(JwtAuthMiddleware)
    public async downloadCSV(@Res() response: Response): Promise<void> {
        try {
          const fields = [
            { label: 'Id', value: 'user_id' },
            { label: 'Username', value: 'username' }
          ];

          const data = await this.userService.findAll();
          const json2csv = new Parser({ fields });
          const csv = json2csv.parse(data);

          response.setHeader('Content-Type', 'text/csv');
          response.setHeader('Content-Disposition', 'attachment; filename=users.csv');
          response.send(csv);
        } catch (error) {
          console.error('Error generating or sending CSV:', error);
          response.status(500).send('Error generating CSV');
        }
    }

    @Put('/:id')
    @ResponseSchema(UserResponse)
    public update(@Param('id') id: number, @Body() body: BaseUser): Promise<User> {
        const user = new User();
        user.email = body.email;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.username = body.username;

        return this.userService.update(id, user);
    }

    @Delete('/:id')
    public delete(@Param('id') id: number): Promise<void> {
        return this.userService.delete(id);
    }

}
