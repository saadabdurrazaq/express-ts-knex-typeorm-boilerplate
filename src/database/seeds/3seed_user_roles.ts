import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("user_has_roles").del();

    // Inserts seed entries
    await knex("user_has_roles").insert([
        { id: 1, role_id: 1, user_id: 1 },
        { id: 2, role_id: 2, user_id: 2 }
    ]);
};
