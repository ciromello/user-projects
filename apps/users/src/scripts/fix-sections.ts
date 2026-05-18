import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Section } from '../sections/schemas/section.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const sectionModel = app.get(getModelToken(Section.name));

  await sectionModel.updateMany(
    { documentId: '69fa2e0f20727c52cf51120a' },
    { $set: { parentSectionId: null } },
  );

  console.log('✅ Sections reset to flat structure');

  await app.close();
}

bootstrap();