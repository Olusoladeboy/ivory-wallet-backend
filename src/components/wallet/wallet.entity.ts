import {
    Entity, PrimaryGeneratedColumn,
    Column, BaseEntity, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToOne, JoinColumn
} from "typeorm"
import { UserEnitity } from "../user/user.entity";

@Entity({ name: 'wallet' })
export class WalletEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "integer",
    })
    balance: number

    @Column({ unique: true })
    userId: number

    @OneToOne(() => UserEnitity, { cascade: true })
    @JoinColumn({ name: 'userId' })
    user: UserEnitity;


    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

}
