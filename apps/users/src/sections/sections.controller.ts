import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  // =========================
  // CREATE SECTION
  // =========================
  @Post()
  create(@Body() body: any) {
    return this.sectionsService.create(body);
  }

  // =========================
  // GET SECTIONS BY DOCUMENT
  // =========================
  @Get(':documentId')
  findByDocument(@Param('documentId') documentId: string) {
    return this.sectionsService.findAll(documentId);
  }

  // =========================
  // STRUCTURE (TREE VIEW)
  // =========================
  @Get('document/:id/structure')
  getStructure(@Param('id') documentId: string) {
    return this.sectionsService.getStructure(documentId);
  }

  // =========================
  // MOVE SECTION (DRAG & DROP)
  // =========================
  @Patch(':id/move')
  moveSection(
    @Param('id') id: string,
    @Body()
    body: { newOrder: number; newParentSectionId?: string | null },
  ) {
    return this.sectionsService.moveSection(id, body);
  }
}