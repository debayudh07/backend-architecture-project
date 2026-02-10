
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true })
    type: string; // e.g., 'user.created', 'user.login'

    @Prop({ type: Object })
    payload: any;

    @Prop({ default: 'pending', enum: ['pending', 'processing', 'completed', 'failed'] })
    status: string;

    @Prop()
    result?: string;

    @Prop()
    error?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
