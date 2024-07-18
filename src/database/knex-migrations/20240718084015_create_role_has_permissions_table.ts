import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('role_has_permissions', (table) => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().notNullable();
        table.integer('permission_id').unsigned().notNullable();

        table
            .foreign('role_id')
            .references('id')
            .inTable('roles')
            .onDelete('CASCADE');

        table
            .foreign('permission_id')
            .references('id')
            .inTable('permissions')
            .onDelete('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('role_has_permissions');
}

