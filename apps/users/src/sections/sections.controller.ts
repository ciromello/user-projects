import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  // CREATE
  @Post()
  create(@Body() body: any) {
    return this.sectionsService.create(body);
  }

  // GET FLAT (for debugging)
  @Get(':documentId')
  findByDocument(@Param('documentId') documentId: string) {
    return this.sectionsService.findByDocument(documentId);
  }

  // 🔥 TREE STRUCTURE (IMPORTANT)
  @Get('/document/:id/structure')
  getStructure(@Param('id') documentId: string) {
    return this.sectionsService.getStructure(documentId);
  }

  // MOVE (drag & drop)
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

  @Patch(':id/move')
  moveSection(
    @Param('id') id: string,
    @Body() body: { newOrder: number; newParentSectionId?: string | null },
  ) {
    return this.sectionsService.moveSection(id, body);
  }
}