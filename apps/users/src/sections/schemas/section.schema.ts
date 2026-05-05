import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: 0 })
  order: number;

  // ✅ THIS IS THE FIX (hierarchical structure)
  @Prop({ type: Types.ObjectId, ref: 'Section', default: null })
  parentSectionId: Types.ObjectId | null;
}

export const SectionSchema = SchemaFactory.createForClass(Section);