import knex, { Knex } from 'knex';
import { EntityRepository, Repository } from 'typeorm';

import { UserWithPets } from '../../../src/interfaces/UserWithPets';
import knexConfig from '../../../src/knexfile';
import { User } from '../models/User';

const environment = process.env.NODE_ENV || 'development';
const DB: Knex = knex(knexConfig[environment]);
@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    public async findOneByUsername(username: string): Promise<User | undefined> {
        const user = await DB('users')
            .where({ username })
            .first();

        return user;
    }

    public async queryUsersAndPetsUsingKnex(): Promise<UserWithPets[]> {
        const usersResult = await DB('users')
            .select(
                'users.id as user_id',
                'users.username as username'
            )
            .groupBy('users.id');

        const userIds = usersResult.map((user: any) => user.user_id);

        const petsResult = await DB('pets')
            .select(
                'pets.id as pet_id',
                'pets.name as pet_name',
                'pets.user_id'
            )
            .whereIn('user_id', userIds)
            .groupBy('pets.id');

        const usersWithPets = usersResult.map((user: any) => {
            return {
                ...user,
                pets: petsResult.filter((pet: any) => pet.user_id === user.user_id),
            };
        });

        return usersWithPets;
    }

}
