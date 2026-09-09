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
    return this.roleRepository.createQueryBuilder('role').getMany();
  }

  findOne(id: string) {
    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .getOne();
  }

  async findByKey(key: Roles): Promise<Role> {
    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.key = :key', { key })
      .getOne();
  }
}
