export interface UserWithPets {
    user_id: number;
    user_first_name: string;
    pets: Array<{
        pet_id: string;
        pet_name: string;
        user_id: string;
    }>;
}
