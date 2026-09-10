import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleService } from '@modules/role/role.service';
import { Roles } from '../../interfaces/roles';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const userRole = await this.roleService.findByKey(Roles.USER);

    const user: User = new User();
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.role = userRole;
    return this.userRepository.save(user);
  }

  findAllUser(): Promise<User[]> {
    return this.userRepository.createQueryBuilder('user').getMany();
  }

  findOneByID(id: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  async setRefreshToken(
    userId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshTokenHash, refreshTokenExpiresAt })
      .where('id = :userId', { userId })
      .execute();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshTokenHash: null, refreshTokenExpiresAt: null })
      .where('id = :userId', { userId })
      .execute();
  }
}
