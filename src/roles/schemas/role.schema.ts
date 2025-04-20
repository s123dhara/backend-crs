import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ type: [String], default: [] })
    permissions: string[];

    @Prop()
    description: string;

    // @Prop()
    // created_at: Date;

    // @Prop()
    // updated_at: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Optional: Set timestamps to auto-manage created_at and updated_at
// RoleSchema.set('timestamps', {
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
// });
