import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class BulkIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  ids: string[];
}
