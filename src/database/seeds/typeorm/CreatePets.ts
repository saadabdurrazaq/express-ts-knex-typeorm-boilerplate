import { Connection } from 'typeorm';
import { Factory, Seed, times } from 'typeorm-seeding';

import { Pet } from '../../../api/models/Pet';
import { User } from '../../../api/models/User';

export class CreatePets implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        const em = connection.createEntityManager();
        await times(10, async (n) => {
            const pet = await factory(Pet)().seed();
            const user = await factory(User)().make();
            user.pets = [pet];
            return await em.save(user);
        });
    }

}
