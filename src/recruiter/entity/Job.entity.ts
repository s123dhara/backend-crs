import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CompanyProfile } from './company-profile.entity';

@Entity('jobs')
export class JobEntity {
    @PrimaryGeneratedColumn('uuid')
    job_id: string;

    @Column('uuid')
    company_id: string;

    @ManyToOne(() => CompanyProfile, (company) => company.company_id)
    @JoinColumn({ name: 'company_id' })
    company: CompanyProfile;

    // @Column({ type: 'uuid', nullable: true })
    // agency_id: string | null;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    responsibilities: string;

    @Column({ type: 'text', nullable: true })
    requirements: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    location: string;

    @Column({ type: 'boolean', default: false })
    is_remote: boolean;

    @Column({ type: 'varchar', length: 50 })
    job_type: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    experience_level: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    education_level: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_min: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary_max: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    salary_currency: string;

    @Column({ type: 'boolean', default: false })
    is_salary_visible: boolean;

    @Column({ type: 'date', nullable: true })
    application_deadline: Date;

    @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
    status: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    application_url: string;

    @Column({ type: 'boolean', default: false })
    is_featured: boolean;

    @Column({ type: 'int', default: 0 })
    views_count: number;

    @Column({ type: 'int', default: 0 })
    applications_count: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    publish_date: Date;
}
