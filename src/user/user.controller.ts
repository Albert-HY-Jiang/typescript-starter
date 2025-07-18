import { Controller, Post, Query, Get, Param, Delete} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Query('name') name: string) {
    return this.userService.create(name);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
  
  @Post('merge')
  mergeAll(@Query('userId') id: number) {
    return this.userService.mergeAll(+id);
  }    
}