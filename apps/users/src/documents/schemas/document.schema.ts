import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DocumentDocument = Document & MongooseDocument;

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['thesis', 'research', 'book', 'programming'] })
  type: string;

  @Prop({ required: true })
  owner: string; // later this will reference User

  @Prop({ type: [String], default: [] })
  collaborators: string[];
}

export const DocumentSchema = SchemaFactory.createForClass(Document);