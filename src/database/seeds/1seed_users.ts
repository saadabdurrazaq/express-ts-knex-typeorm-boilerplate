import bcrypt from 'bcryptjs';
import { Knex } from 'knex';

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();

    // Inserts seed entries
    const users = [
        {
            username: 'john_doe',
            name: 'John Doe',
            photo: undefined,
            phone: '123-456-7890',
            email_verified_at: undefined,
            password: 'password123',
            address: '123 Main St',
            province: 'CA',
            zip_code: '12345',
            is_active: true,
            remember_token: undefined,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: undefined,
        },
        {
            username: 'jane_doe',
            name: 'Jane Doe',
            photo: undefined,
            phone: '987-654-3210',
            email_verified_at: undefined,
            password: 'password456',
            address: '456 Elm St',
            province: 'NY',
            zip_code: '67890',
            is_active: true,
            remember_token: undefined,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: undefined,
        },
    ];

    // Hash passwords and insert seed entries
    const hashedUsers = await Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            delete user.password;
            return { ...user, password: hashedPassword };
        })
    );

    await knex('users').insert(hashedUsers);
}
