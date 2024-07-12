import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';
@Entity('user') // 指定数据库中的表名
@Unique(['userNo']) // 确保username是唯一的
export class User {
  @PrimaryGeneratedColumn('uuid') // 主键，使用UUID
  id: string;

  @Column({ length: 50 }) // 用户编号，最大长度50
  userNo: string;

  @Column({ length: 50 }) // 用户名，最大长度50
  name: string;

  @Column({ length: 100 }) // 密码，假设我们使用哈希值存储，最大长度100
  password: string;

  @Column({ nullable: true }) // 邮箱，可以为空
  email: string;

  @Column({ nullable: true }) // 手机号，可以为空
  phone: string;

  @Column({ default: false }) // 是否为管理员，默认为false
  isAdmin: boolean;

  @JoinTable()
  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];

  @CreateDateColumn() // 创建时间，自动填充
  createdAt: Date;

  @UpdateDateColumn() // 更新时间
  updatedAt: Date;
}
