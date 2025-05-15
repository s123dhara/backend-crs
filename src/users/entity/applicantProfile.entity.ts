import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('applicant_profiles')
export class ApplicantProfile {
    @PrimaryColumn('uuid')
    profile_id: string;

    @Column({ type: 'varchar', length : 30, unique: true })
    user_id: string;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth?: string;

    @Column({ length: 20, nullable: true })
    gender?: string;

    @Column({ length: 100 })
    contact_email: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ length: 100, nullable: true })
    city?: string;

    @Column({ length: 100, nullable: true })
    state?: string;

    @Column({ length: 100, nullable: true })
    country?: string;

    @Column({ length: 20, nullable: true })
    postal_code?: string;

    @Column({ length: 200, nullable: true })
    headline?: string;

    @Column({ type: 'text', nullable: true })
    summary?: string;

    @Column({ default: false })
    is_profile_complete: boolean;

    @Column({ default: false })
    is_public: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
