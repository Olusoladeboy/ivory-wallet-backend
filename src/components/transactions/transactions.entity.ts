import {
    Entity, PrimaryGeneratedColumn,
    Column, BaseEntity, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToOne, JoinColumn
} from "typeorm"
import { UserEnitity } from "../user/user.entity";

@Entity({ name: 'transactions' })
export class TransactionsEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "integer",
    })
    amount: number

    @Column({ enum: ['deposit', 'transfer', 'withdrawal'] })
    type: string;

    @Column({ nullable: true })
    bank: string;

    @Column({ nullable: true })
    accountNumber: string;

    @Column({ enum: ['successful', 'pending', 'failed'] })
    status: string;

    @Column({ nullable: true })
    userToId: string;

    @Column()
    reference: string

    // @OneToOne(() => UserEnitity, { cascade: true })
    // @JoinColumn({ name: 'userToId' })
    // userTo: UserEnitity;

    @Column()
    userId: number

    // @OneToOne(() => UserEnitity, { cascade: true })
    // @JoinColumn({ name: 'userId' })
    // user: UserEnitity;


    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

}
