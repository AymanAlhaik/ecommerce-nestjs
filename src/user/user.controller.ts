import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from './decorators/roles.decorator';
import { AuthGuard } from './guards/auth.guard';


@Controller('users')
@Roles(['admin'])
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  /**
   * @docs Admin Can Create a User
   * @route POST ~/users
   * @param createUserDto {username, password, email}
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * @docs Admin Can Get All Users
   * @route GET ~/users
   * @canAcess [Admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  /**
   * @docs Admin Can Get One User
   * @param id (id of wanted user)
   * @route GET ~/users/:id
   * @canAcess [Admin]
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * @docs Admin Can Update One User
   * @param id (id of user being updated)
   * @param updateUserDto {all props as optional}
   * @route PATCH ~/users/:id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * @docs Admin Can Delete a User
   * @param id (id of user being updated)
   * @route DELETE ~/users/:id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
