import {Itinerary} from './itinerary';
import {ImageFile} from './file';
import {FileUpload} from './file-upload';
import {User} from './user';
import {Attraction} from './attraction';

export interface City {
  id: string
  name: string;
  description: string;
  country: string;
  attractions: Attraction[];
  itineraries: Itinerary[]
  imageFile: ImageFile | FileUpload;
  imageFileId: string;
  createdBy: User
  createdById: string
  updatedBy: User
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
