import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { ApplicantProfile } from './applicantProfile.entity';
@Entity('documents')
export class DocumentProfile {
  @PrimaryGeneratedColumn('uuid')
  document_id: string;

  @ManyToOne(() => ApplicantProfile, (profile) => profile.profile_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: ApplicantProfile;

  @Column({ type: 'varchar', length: 50 })
  document_type: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'integer', nullable: true })
  file_size: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  uploaded_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
