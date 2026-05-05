import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document } from './schemas/document.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name)
    private documentModel: Model<Document>,
  ) {}

  async create(data: any) {
    return new this.documentModel(data).save();
  }

  async findAll() {
    return this.documentModel.find().exec();
  }

  async findOne(id: string) {
    return this.documentModel.findById(id).exec();
  }
}