import knex, { Knex } from 'knex';

import knexConfig from '../../../knexfile';
import { seed as users } from '../1seed_users';
import { seed as seedPets } from '../2seed_pets';
import { seed as permissions } from '../3seed_permissions';
import { seed as roles } from '../4seed_roles';
import { seed as rolePermissions } from '../5seed_roles_permissions';
import { seed as userRoles } from '../6seed_user_roles';

const knexInstance = knex(knexConfig[process.env.NODE_ENV || 'development']);

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
    try {
        if (process.env.NODE_ENV === 'production') {
            await knex.transaction(async (trx) => {
                await users(trx);
                await seedPets(trx);
                await permissions(trx);
                await roles(trx);
                await rolePermissions(trx);
                await userRoles(trx);
            });
        } else {
            await knex.transaction(async (trx) => {
                await users(trx);
                await seedPets(trx);
                await permissions(trx);
                await roles(trx);
                await rolePermissions(trx);
                await userRoles(trx);
            });
        }
    } catch (err) {
        console.error('Database seeding failed:', err);
        throw err;
    }
};

seed(knexInstance)
    .then(() => {
        console.log('Database seeding completed.');
    })
    .catch((err) => {
        console.error('Database seeding failed:', err);
    });
