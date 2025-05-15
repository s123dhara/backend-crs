import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('companies-profile')
export class CompanyProfile {
    @PrimaryGeneratedColumn('uuid')
    company_id: string;

    @Column({ length: 200, nullable : false })
    name: string;

    @Column({ type: 'varchar', length : 30, unique: true })
    user_id: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ length: 100, nullable: true })
    industry?: string;

    @Column({ length: 200, nullable: true })
    website?: string;

    @Column({ length: 500, nullable: true })
    logo_url?: string;

    @Column({ length: 50, nullable: true })
    employee_count_range?: string;

    @Column({ length: 200, nullable: true })
    headquarters?: string;

    @Column({ type: 'int', nullable: true })
    founded_year?: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
