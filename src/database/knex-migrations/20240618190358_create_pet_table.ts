import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('pets', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.bigInteger('age').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
        table
            .foreign('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('pets');
}
