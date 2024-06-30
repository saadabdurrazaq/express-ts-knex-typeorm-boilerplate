import { Knex } from 'knex';

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('pets').del();

    // Inserts seed entries
    await knex('pets').insert([
        {
            name: 'Buddy',
            age: 3,
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: undefined,
        },
        {
            name: 'Mittens',
            age: 2,
            user_id: 2,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: undefined,
        },
    ]);
}
