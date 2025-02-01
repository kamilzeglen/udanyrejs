import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@modules/role/role.entity';
import { Repository } from 'typeorm';
import { Roles } from '../../interfaces/roles';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: string) {
    return this.roleRepository.findOne({ where: { id } });
  }

  async findByKey(key: Roles): Promise<Role> {
    return this.roleRepository.findOne({ where: { key } });
  }
}
