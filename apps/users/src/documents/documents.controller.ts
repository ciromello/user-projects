import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';

import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.documentsService.create(body);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.documentsService.findOne(id);
  }

  // =========================
  // UPDATE TITLE
  // =========================
  @Patch(':id/title')
  updateTitle(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.documentsService.updateTitle(
      id,
      title,
    );
  }
}