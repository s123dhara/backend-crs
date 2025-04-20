import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request, Response } from 'express';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post('/add')
  async create(@Body() createRoleDto: CreateRoleDto, @Req() req: Request, @Res() res: Response) {

    const { status, role } = await this.rolesService.create(createRoleDto);

    res.status(201).json({ status, role });
  }

  @Get('/')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('/view/:id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const { status, role } = await this.rolesService.findOne(id);

    return res.status(201).json({ status, role });
  }

  @Patch('/edit/:id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete('/delete/:id')
  async remove(@Param('id') id: string) {
    return await this.rolesService.remove(id);
  }
}
