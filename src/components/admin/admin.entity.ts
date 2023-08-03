import {
    Entity, PrimaryGeneratedColumn,
    Column, BaseEntity, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToOne, JoinColumn
} from "typeorm"
import bcryptjs from 'bcryptjs';

@Entity({ name: 'admin' })
export class AdminEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ unique: true })
    email: string

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    invitedById: number

    @OneToOne(() => AdminEntity, { cascade: true })
    @JoinColumn({ name: 'invitedById' })
    invitedBy: AdminEntity;

    // @BeforeInsert()
    // async hashPassword() {
    //     this.password = await bcryptjs.hash(this.password, 10);
    // }

    async comparePassword(password: string): Promise<boolean> {
        console.log(this.password)

        return await bcryptjs.compare(password, this.password);
    }

    @UpdateDateColumn({
        nullable: true,
        type: 'timestamp'
    })
    lastLoginAt: Date;


    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

}
