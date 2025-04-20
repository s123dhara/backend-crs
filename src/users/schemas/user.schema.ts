// users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password_hash: string;

    @Prop({ required: true })
    // @Prop()
    salt: string;

    @Prop({ enum: ['APPLICANT', 'ADMIN', 'AGENCY', 'RECRUITER'], default: 'APPLICANT' })
    role: string;

    @Prop({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'], default: 'PENDING_VERIFICATION' })
    status: string;

    @Prop()
    verification_token: string;

    @Prop()
    verification_expiry: Date;

    @Prop()
    reset_token: string;

    @Prop()
    reset_token_expiry: Date;

    @Prop({ default: 0 })
    failed_login_attempts: number;

    @Prop()
    last_login: Date;

    @Prop({ default: false })
    two_fa_enabled: boolean

    @Prop({ type: [String], enum: ['EMAIL', 'TOTP'], default: [] })
    two_fa_methods: string[];

    @Prop()
    two_fa_secret: string // TOTP secret (Base32)

    @Prop({ default: false })
    two_fa_verified: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
