import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user_has_roles', (table) => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();

        table
            .foreign('role_id')
            .references('id')
            .inTable('roles')
            .onDelete('CASCADE');

        table
            .foreign('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user_has_roles');
}

