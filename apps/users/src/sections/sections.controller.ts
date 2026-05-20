import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}

  // =========================
  // CREATE
  // =========================
  @Post()
  create(@Body() body: any) {
    return this.sectionsService.create(body);
  }

  // =========================
  // GET FLAT (debugging)
  // =========================
  @Get(':documentId')
  findByDocument(
    @Param('documentId') documentId: string,
  ) {
    return this.sectionsService.findByDocument(
      documentId,
    );
  }

  // =========================
  // TREE STRUCTURE
  // =========================
  @Get('/document/:id/structure')
  getStructure(
    @Param('id') documentId: string,
  ) {
    return this.sectionsService.getStructure(
      documentId,
    );
  }

  // =========================
  // UPDATE TITLE
  // =========================
  @Patch(':id')
  updateTitle(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.sectionsService.updateTitle(
      id,
      body.title,
    );
  }

  // =========================
  // UPDATE CONTENT
  // =========================
  @Patch(':id/content')
  updateContent(
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.sectionsService.updateContent(
      id,
      content,
    );
  }

  // =========================
  // MOVE SECTION
  // =========================
  @Patch(':id/move')
  moveSection(
    @Param('id') id: string,
    @Body()
    body: {
      newOrder: number;
      newParentSectionId?: string | null;
    },
  ) {
    return this.sectionsService.moveSection(
      id,
      body,
    );
  }

  // =========================
  // DELETE SECTION
  // =========================
  @Delete(':id')
  deleteSection(@Param('id') id: string) {
    return this.sectionsService.deleteSection(id);
  }
}