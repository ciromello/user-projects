import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Section,
  SectionDocument,
} from './schemas/section.schema';

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
  async findByDocument(documentId: string) {
    return this.sectionModel
      .find({ documentId })
      .sort({ order: 1 })
      .lean()
      .exec();
  }

  // =========================
  // GET SINGLE SECTION
  // =========================
  async findOne(id: string) {
    return this.sectionModel.findById(id).exec();
  }

  // =========================
  // UPDATE TITLE
  // =========================
  async updateTitle(id: string, title: string) {
    return this.sectionModel.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );
  }

  // =========================
  // DELETE SECTION RECURSIVELY
  // =========================
  async deleteSection(id: string) {
    // find children
    const children = await this.sectionModel.find({
      parentSectionId: id,
    });

    // recursively delete children
    for (const child of children) {
      await this.deleteSection(
        child._id.toString(),
      );
    }

    // delete current section
    return this.sectionModel.findByIdAndDelete(id);
  }

  // =========================
  // MOVE SECTION
  // =========================
  async moveSection(
    sectionId: string,
    body: any,
  ) {
    const {
      newParentSectionId,
      newOrder,
    } = body;

    const section =
      await this.sectionModel.findById(
        sectionId,
      );

    if (!section) {
      throw new Error('Section not found');
    }

    const oldParent =
      section.parentSectionId;

    const oldOrder = section.order;

    // =========================
    // PREVENT SELF-PARENTING
    // =========================
    if (sectionId === newParentSectionId) {
      throw new Error(
        'Cannot parent a section to itself',
      );
    }

    // =========================
    // PREVENT CIRCULAR PARENTING
    // =========================
    const isDescendant = async (
      parentId: string,
      childId: string,
    ): Promise<boolean> => {
      if (!parentId) return false;

      const parent =
        await this.sectionModel.findById(
          parentId,
        );

      if (!parent) return false;

      if (
        parent.parentSectionId?.toString() ===
        childId
      ) {
        return true;
      }

      return isDescendant(
        parent.parentSectionId?.toString() ||
          '',
        childId,
      );
    };

    if (
      await isDescendant(
        newParentSectionId,
        sectionId,
      )
    ) {
      throw new Error(
        'Cannot move into own descendant',
      );
    }

    // =========================
    // FIX OLD PARENT GAP
    // =========================
    await this.sectionModel.updateMany(
      {
        documentId: section.documentId,
        parentSectionId: oldParent,
        order: { $gt: oldOrder },
      },
      {
        $inc: { order: -1 },
      },
    );

    // =========================
    // SHIFT NEW SIBLINGS
    // =========================
    await this.sectionModel.updateMany(
      {
        documentId: section.documentId,
        parentSectionId:
          newParentSectionId,
        order: { $gte: newOrder },
      },
      {
        $inc: { order: 1 },
      },
    );

    // =========================
    // UPDATE MOVED SECTION
    // =========================
    section.parentSectionId =
      newParentSectionId;

    section.order = newOrder;

    return section.save();
  }

  // =========================
  // REORDER
  // =========================
  async reorder(
    documentId: string,
    sectionId: string,
    newOrder: number,
  ) {
    return this.sectionModel.findOneAndUpdate(
      {
        _id: sectionId,
        documentId,
      },
      {
        order: newOrder,
      },
      {
        new: true,
      },
    );
  }

  // =========================
  // TREE STRUCTURE
  // =========================
  async getStructure(documentId: string) {
    const sections =
      await this.sectionModel
        .find({ documentId })
        .sort({ order: 1 })
        .lean();

    const map = new Map<string, any>();

    const tree: any[] = [];

    // =========================
    // NORMALIZE
    // =========================
    sections.forEach((section) => {
      map.set(section._id.toString(), {
        ...section,
        _id: section._id.toString(),

        parentSectionId:
          section.parentSectionId
            ? section.parentSectionId.toString()
            : null,

        children: [],
      });
    });

    // =========================
    // BUILD TREE
    // =========================
    map.forEach((node) => {
      if (node.parentSectionId) {
        const parent = map.get(
          node.parentSectionId,
        );

        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    // =========================
    // SORT TREE
    // =========================
    const sortTree = (nodes: any[]) => {
      nodes.sort(
        (a, b) => a.order - b.order,
      );

      nodes.forEach((n) => {
        if (n.children?.length) {
          sortTree(n.children);
        }
      });
    };

    sortTree(tree);

    return {
      documentId,
      structure: tree,
    };
  }
}