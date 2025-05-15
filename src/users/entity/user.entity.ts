import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class postgresTestUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;
}

