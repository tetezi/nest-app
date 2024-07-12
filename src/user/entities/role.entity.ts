import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity'; // 假设你的用户实体文件为user.entity.ts

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid') // 主键，使用UUID
  id: string;

  @Column({ length: 50, unique: true }) // 角色名称，最大长度50且唯一
  name: string;

  @Column({ length: 255, nullable: true }) // 角色描述，最大长度255
  description: string;

  @CreateDateColumn() // 创建时间
  createdAt: Date;

  @UpdateDateColumn() // 更新时间
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.roles) // 多对多关系
  users: User[];
}
