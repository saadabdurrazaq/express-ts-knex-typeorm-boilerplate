import knex, { Knex } from 'knex';
import { EntityRepository, Repository } from 'typeorm';

import { PaginatedResponse } from '../../../src/common/pagination';
import { UserWithPets } from '../../../src/interfaces/UserWithPets';
import knexConfig from '../../../src/knexfile';
import { Pet } from '../models/Pet';

const environment = process.env.NODE_ENV || 'development';
const DB: Knex = knex(knexConfig[environment]);
@EntityRepository(Pet)
export class PetRepository extends Repository<Pet> {

    /**
     * Find by user_id is used for our data-loader to get all needed pets in one query.
     */
    public findByUserIds(ids: string[]): Promise<Pet[]> {
        return this.createQueryBuilder()
            .select()
            .where(`pet.user_id IN (${ids.map(id => `'${id}'`).join(', ')})`)
            .getMany();
    }

    public async getUsersAndPetsUsingKnex(page: number): Promise<PaginatedResponse<UserWithPets>> {
        try {
            const usersResult = await DB('users')
                .select(
                    'users.id as user_id',
                    'users.username as username'
                )
                .groupBy('users.id')
                .paginate({
                    perPage: 10,
                    currentPage: page,
                    isLengthAware: true,
                });

            const userIds = usersResult.data.map((user: any) => user.user_id);

            const petsResult = await DB('pets')
                .select(
                    'pets.id as pet_id',
                    'pets.name as pet_name',
                    'pets.user_id'
                )
                .whereIn('user_id', userIds)
                .groupBy('pets.id');

            const usersWithPets = usersResult.data.map((user: any) => {
                return {
                    ...user,
                    pets: petsResult.filter((pet: any) => pet.user_id === user.user_id),
                };
            });

            const result = {
                total: usersResult.pagination.total,
                perPage: usersResult.pagination.perPage,
                currentPage: usersResult.pagination.currentPage,
                lastPage: usersResult.pagination.lastPage,
                from: usersResult.pagination.from,
                to: usersResult.pagination.to,
                data: usersWithPets,
            };

            return result;
        } catch (error) {
            console.error('Error fetching users and pets:', error);
            throw error;
        }
    }
}
