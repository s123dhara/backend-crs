import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { Model } from 'mongoose';
import { stat } from 'fs';

@Injectable()
export class RolesService {

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) { }

  async create(createRoleDto: CreateRoleDto) {

    const role = await this.roleModel.create(createRoleDto);

    return { status: true, role };
  }

  async findAll() {
    const roles = await this.roleModel.find();
    return { status: true, roles };
  }

  async findOne(id: string) {

    const role = await this.roleModel.findById(id);
    return { status: true, role };

  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, {
      new: true, // return the updated document
      runValidators: true, // ensure validation rules are applied
    });

    await role?.save();

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return { status: true, role };
  }

  async remove(id: string) {
    const result = await this.roleModel.deleteOne({ _id: id });
    if (result) {
      return { status: true };
    } else {
      return { status: false };
    }
  }
}
