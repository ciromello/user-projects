import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from './schemas/section.schema';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name)
    private readonly sectionModel: Model<SectionDocument>,
  ) {}

  // =========================
  // CREATE SECTION
  // =========================
  async create(data: any) {
    return new this.sectionModel(data).save();
  }

  // =========================
  // GET FLAT SECTIONS
  // =========================
  async findAll(documentId: string) {
    return this.sectionModel
      .find({ documentId })
      .sort({ order: 1 })
      .exec();
  }

  // =========================
  // GET SINGLE SECTION
  // =========================
  async findOne(id: string) {
    return this.sectionModel.findById(id).exec();
  }

  // =========================
  // STRUCTURED TREE VIEW
  // =========================
  async getStructure(documentId: string) {
    const sections = await this.sectionModel
      .find({ documentId })
      .sort({ order: 1 })
      .lean();

    const map = new Map<string, any>();
    const tree: any[] = [];

    sections.forEach((section) => {
      map.set(section._id.toString(), {
        _id: section._id,
        documentId: section.documentId,
        title: section.title,
        content: section.content,
        order: section.order,
        parentSectionId: section.parentSectionId
          ? section.parentSectionId.toString()
          : null,
        children: [],
      });
    });

    map.forEach((node) => {
      if (node.parentSectionId) {
        const parent = map.get(node.parentSectionId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => a.order - b.order);
      nodes.forEach((n) => {
        if (n.children.length > 0) sortTree(n.children);
      });
    };

    sortTree(tree);

    return {
      documentId,
      structure: tree,
    };
  }

  // =========================
  // MOVE / DRAG & DROP
  // =========================
  async moveSection(
    sectionId: string,
    body: { newOrder: number; newParentSectionId?: string | null },
  ) {
    const section = await this.sectionModel.findById(sectionId);
    if (!section) throw new Error('Section not found');

    const oldParentId = section.parentSectionId?.toString() || null;
    const newParentId = body.newParentSectionId ?? null;

    const oldOrder = section.order;
    const newOrder = body.newOrder;

    // 1. Update moved section
    section.parentSectionId = newParentId as any;
    section.order = newOrder;
    await section.save();

    // 2. Fix old siblings
    await this.sectionModel.updateMany(
      {
        documentId: section.documentId,
        parentSectionId: oldParentId,
        order: { $gt: oldOrder },
        _id: { $ne: sectionId },
      },
      { $inc: { order: -1 } },
    );

    // 3. Fix new siblings
    await this.sectionModel.updateMany(
      {
        documentId: section.documentId,
        parentSectionId: newParentId,
        order: { $gte: newOrder },
        _id: { $ne: sectionId },
      },
      { $inc: { order: 1 } },
    );

    // 4. Normalize ordering (safety step)
    const siblings = await this.sectionModel
      .find({
        documentId: section.documentId,
        parentSectionId: newParentId,
      })
      .sort({ order: 1 });

    for (let i = 0; i < siblings.length; i++) {
      siblings[i].order = i + 1;
      await siblings[i].save();
    }

    return {
      message: 'Section moved successfully',
      section,
    };
  }
}