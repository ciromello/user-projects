import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users.module';
import { DocumentsModule } from './documents/documents.module';
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection (Atlas or local)
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // Feature modules
    UsersModule,
    DocumentsModule,
    SectionsModule,
  ],
})
export class AppModule {}