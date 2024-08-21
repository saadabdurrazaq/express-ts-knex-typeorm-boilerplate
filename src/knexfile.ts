import { Knex } from 'knex';
import { attachPaginate } from 'knex-paginate';

attachPaginate();

const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'express',
        },
        migrations: {
            directory: __dirname + '/database/knex-migrations',
        },
        seeds: {
            directory: __dirname + '/database/seeds/seed-group', // /seed-group
        },
    },

    production: {
        client: 'mysql2',
        connection: {
            host: 'your-production-host',
            user: 'your-production-user',
            password: 'your-production-password',
            database: 'your-production-database',
        },
        migrations: {
            directory: './migrations',
        },
    },
};

export default knexConfig;
