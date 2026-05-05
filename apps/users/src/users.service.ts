import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './documents/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(data: any) {
  const result = await this.userModel.create(data);

  console.log('🔥 SAVED:', result);
  console.log('🔥 DB NAME:', this.userModel.db.name);
  console.log('🔥 COLLECTION:', this.userModel.collection.name);

  return result;
}

  async findAll() {
    return this.userModel.find().exec();
  }
}