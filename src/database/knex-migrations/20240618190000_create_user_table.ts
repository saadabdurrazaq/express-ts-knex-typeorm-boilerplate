import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').unique().notNullable();
        table.string('name').notNullable();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.text('email').nullable();
        table.text('photo').nullable();
        table.string('phone', 50).nullable();
        table.timestamp('email_verified_at').nullable();
        table.string('password').notNullable();
        table.text('address').nullable();
        table.string('province', 255).nullable();
        table.string('zip_code', 20).nullable();
        table.boolean('is_active').defaultTo(false);
        table.string('remember_token', 100).nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}
