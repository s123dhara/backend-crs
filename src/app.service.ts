import { Injectable } from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { postgresTestUser } from './users/entity/user.entity';

@Injectable()
export class AppService {

  constructor(@InjectRepository(postgresTestUser)
  private userRepository: Repository<postgresTestUser>) { }

  getHello(): string {
    return 'Hello World!';
  }

  async create2(data: any): Promise<any> {
    try {
      console.log('data comes = ', data)
      const user = this.userRepository.create(data);
      return await this.userRepository.save(user);

      // return { data };
    } catch (error) {
      console.log('service side error ', error)
      throw error; // propagate error to controller
    }
  }
}
