import PDFKit from 'pdfkit';
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
        const user = await this.userRepository.findOne(userId );
        const doc = new PDFKit();
        doc.text(`User Report for ${user.username}`);
        // Add more content to your PDF here
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const buffers: Uint8Array[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            doc.end();
        });
        return pdfBuffer;
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
