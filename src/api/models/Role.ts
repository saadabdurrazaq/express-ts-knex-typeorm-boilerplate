import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './Permission';
import { User } from './User';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
      name: 'role_has_permissions',
      joinColumn: {
        name: 'role_id',
        referencedColumnName: 'id'
      },
      inverseJoinColumn: {
        name: 'permission_id',
        referencedColumnName: 'id'
      }
    })
    permissions: Permission[];

    @ManyToMany(() => User, user => user.roles)
    users: User[];
}
