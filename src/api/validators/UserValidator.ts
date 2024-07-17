import { Type } from 'class-transformer';
import {
    IsEmail, IsNotEmpty, IsUUID, ValidateNested
} from 'routing-controllers/node_modules/class-validator';

import { PetResponse } from '../controllers/PetController';

export class BaseUser {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsNotEmpty()
    public username: string;
}

export class UserResponse extends BaseUser {
    @IsUUID()
    public id: string;

    @ValidateNested({ each: true })
    @Type(() => PetResponse)
    public pets: PetResponse[];
}

export class CreateUserBody extends BaseUser {
    @IsNotEmpty()
    public password: string;
}
