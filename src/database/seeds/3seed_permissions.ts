import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("permissions").del();

    // Inserts seed entries
    await knex("permissions").insert([
        { id: 1, name: "GET_ALL_USERS" },
        { id: 2, name: "CREATE_USER" },
        { id: 3, name: "EDIT_USER" },
        { id: 4, name: "DELETE_USER" },
    ]);
};
