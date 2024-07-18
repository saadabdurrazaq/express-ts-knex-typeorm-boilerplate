import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('permissions', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('permissions');
}

