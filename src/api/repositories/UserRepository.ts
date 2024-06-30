import knex, { Knex } from 'knex';
import { EntityRepository, Repository } from 'typeorm';

import knexConfig from '../../../src/knexfile';
import { User } from '../models/User';

const environment = process.env.NODE_ENV || 'development';
const DB: Knex = knex(knexConfig[environment]);
@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    public async findOneByUsername(username: string): Promise<User | undefined> {
        const user = await DB('users')
            .where({ username })
            .first();

        return user;
    }
}
