import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApplicantProfile } from './applicantProfile.entity'; // adjust path if needed

@Entity('experience')
export class ExperienceProfile {
    @PrimaryGeneratedColumn('uuid')
    experience_id: string;

    @ManyToOne(() => ApplicantProfile, (profile) => profile.profile_id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'profile_id' })
    profile: ApplicantProfile

    @Column({ length: 200 })
    company: string;

    @Column({ length: 200 })
    title: string;

    @Column({ length: 200, nullable: true })
    location: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ default: false })
    is_current: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
