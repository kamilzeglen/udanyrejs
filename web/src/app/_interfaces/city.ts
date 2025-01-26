import {Itinerary} from './itinerary';
import {ImageFile} from './file';
import {User} from './user';

export interface City {
  id: string
  name: string;
  description: string;
  country: string;
  itineraries: Itinerary[]
  imageFile: ImageFile;
  imageFileId: string;
  createdBy: User
  createdById: string
  updatedBy: User
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
