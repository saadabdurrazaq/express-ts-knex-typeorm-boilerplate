import knex, { Knex } from 'knex';
import { Service } from 'typedi';

import knexConfig from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const DB: Knex = knex(knexConfig[environment]);

@Service()
export class TokenStore {
    private tableName = 'blacklist_tokens';

    public async addToBlacklist(token: string): Promise<void> {
        await DB(this.tableName).insert({ token });
    }

    public async isBlacklisted(token: string): Promise<boolean> {
        const result = await DB(this.tableName)
            .where({ token })
            .count('* as count');

        if (typeof result[0].count === 'string') {
            return Number(result[0].count) > 0;
        } else {
            console.log('result', result[0].count > 0);
            return result[0].count > 0;
        }
    }
}
