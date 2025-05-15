import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
    @Prop({ type: String, required: true })
    job_id: string; // UUID

    @Prop({ type: String, required: true })
    applicant_id: string; // UUID

    // @Prop({ type: String, required: true })
    // resume_id: string; // UUID

    // @Prop()
    // cover_letter: string;

    @Prop({
        type: String,
        enum: ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'ASSESSMENT', 'OFFERED', 'HIRED', 'REJECTED'],
        default: 'APPLIED',
    })

    application_status: string;

    @Prop({
        type: [
            {
                status: String,
                changed_by: String,
                changed_at: Date,
                notes: String,
            },
        ],
        default: [],
    })
    
    status_history: {
        status: string;
        changed_by: string;
        changed_at: Date;
        notes: string;
    }[];

    @Prop({
        type: [
            {
                assessment_id: String,
                score: Number,
                completed_at: Date,
            },
        ],
        default: [],
    })
    assessment_scores: {
        assessment_id: string;
        score: number;
        completed_at: Date;
    }[];

    @Prop({
        type: [
            {
                interview_id: String,
                overall_rating: Number,
                feedback: String,
                interviewer_id: String,
                interview_date: Date,
            },
        ],
        default: [],
    })
    interview_feedback: {
        interview_id: string;
        overall_rating: number;
        feedback: string;
        interviewer_id: string;
        interview_date: Date;
    }[];

    @Prop()
    rejection_reason?: string;

    // @Prop()
    // source?: string;

    // @Prop()
    // referrer_id?: string;

    // @Prop({ default: false })
    // is_favorite: boolean;

    @Prop()
    recruiter_notes?: string;

    // @Prop({ type: Map, of: String, default: {} })
    // custom_fields: Record<string, any>;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
