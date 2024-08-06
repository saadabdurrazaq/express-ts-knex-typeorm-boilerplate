import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import {
    BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';

// import { Permission } from './Permission';
import { Pet } from './Pet';
import { Role } from './Role';

@Entity('users')
export class User {

    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: User, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    @PrimaryGeneratedColumn()
    public id: number;

    @IsNotEmpty()
    @Column()
    public name: string;

    @IsNotEmpty()
    @Column({ name: 'first_name' })
    public firstName: string;

    @IsNotEmpty()
    @Column({ name: 'last_name' })
    public lastName: string;

    @IsNotEmpty()
    @Column()
    public email: string;

    @IsNotEmpty()
    @Column()
    @Exclude()
    public password: string;

    @IsNotEmpty()
    @Column()
    public username: string;

    @Column()
    public photo: string;

    @OneToMany(type => Pet, pet => pet.user)
    public pets: Pet[];

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_has_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        }
    })
    public roles: Role[];

    public toString(): string {
        return `${this.firstName} ${this.lastName} (${this.email})`;
    }

    @BeforeInsert()
    public async hashPassword(): Promise<void> {
        this.password = await User.hashPassword(this.password);
    }

}
