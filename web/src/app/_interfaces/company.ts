import {Offer} from './offer';
import {Ship} from './ship';
import {ImageFile} from './file';
import {FileUpload} from './file-upload';
import {User} from './user';

export interface Company {
  id: string;
  name: string;
  key: string;
  description: string;
  offers: Offer[]
  ships: Ship[]
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
