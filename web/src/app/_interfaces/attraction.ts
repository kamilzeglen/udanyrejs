import {City} from './city';
import {User} from './user';
import {ImageFile} from './file';
import {FileUpload} from './file-upload';

export interface Attraction {
  id: string
  name: string;
  description: string;
  city: City
  cityId: string
  imageFile: ImageFile | FileUpload;
  imageFileId: string;
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
