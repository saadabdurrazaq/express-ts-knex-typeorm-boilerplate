import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("roles").del();

    // Inserts seed entries
    await knex("roles").insert([
        { id: 1, name: "Admin" },
        { id: 2, name: "Manager" },
        { id: 3, name: "User" }
    ]);
};
