import {User} from './user';

export interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}

export interface PdfFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
