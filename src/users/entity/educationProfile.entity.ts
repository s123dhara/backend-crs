import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { ApplicantProfile } from './applicantProfile.entity'

@Entity('education')
export class EducationProfile {
    @PrimaryGeneratedColumn('uuid')
    education_id: string;

    @ManyToOne(() => ApplicantProfile, (profile) => profile.profile_id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profile_id' })
    profile: ApplicantProfile;

    @Column({ type: 'varchar', length: 200 })
    institution: string;

    @Column({ type: 'varchar', length: 200 })
    degree: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    field_of_study: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ type: 'varchar', length: 50, nullable: true })
    grade: string;

    @Column({ type: 'text', nullable: true })
    activities: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'boolean', default: false })
    is_current: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
