import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class BulkTermIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  termIds: string[];
}
