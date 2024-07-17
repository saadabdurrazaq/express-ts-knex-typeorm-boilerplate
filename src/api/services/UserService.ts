import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
// import PDFKit from 'pdfkit';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

// import uuid from 'uuid';
import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { events } from '../subscribers/events';

@Service()
export class UserService {

    constructor(
        @OrmRepository() private userRepository: UserRepository,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public find(): Promise<User[]> {
        this.log.info('Find all users');
        return this.userRepository.find({ relations: ['pets'] });
    }

    public findOne(id: number): Promise<User | undefined> {
        this.log.info('Find one user');
        return this.userRepository.findOne({ id });
    }

    public async findByUsername(username: string): Promise<User | undefined> {
        this.log.info(`Find user by username: ${username}`);
        return this.userRepository.findOneByUsername(username);
    }

    public async generatePdf(userId: number): Promise<Buffer> {
        try {
            const user = await this.userRepository.findOne(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }

            const templatePath = path.resolve(__dirname, '..', 'exports', 'pdfs', 'template.html');
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template file not found at path: ${templatePath}`);
            }

            let html = fs.readFileSync(templatePath, 'utf-8');
            html = html.replace(/{{username}}/g, user.username);

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000 // 60 seconds
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4' });
            await browser.close();

            return pdfBuffer;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Error generating PDF');
        }
    }

    public async create(user: User): Promise<User> {
        this.log.info('Create a new user => ', user.toString());
        // user.id = uuid.v1();
        const newUser = await this.userRepository.save(user);
        this.eventDispatcher.dispatch(events.user.created, newUser);
        return newUser;
    }

    public update(id: number, user: User): Promise<User> {
        this.log.info('Update a user');
        user.id = id;
        return this.userRepository.save(user);
    }

    public async delete(id: number): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(id);
        return;
    }

}
