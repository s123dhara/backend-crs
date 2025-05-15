import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { ApplicantProfile } from './applicantProfile.entity';
@Entity('skills')
export class SkillProfile {
    @PrimaryGeneratedColumn('uuid')
    skill_id: string

    @ManyToOne(() => ApplicantProfile, (profile) => profile.profile_id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'profile_id' })
    profile: ApplicantProfile

    @Column({ length: 200 })
    name: string

    @Column({ length: 100 })
    proficiency_level: string

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}