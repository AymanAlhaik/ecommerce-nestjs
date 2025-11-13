import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from './decorators/roles.decorator';
import { AuthGuard } from './guards/auth.guard';
import { UserPayload } from './decorators/userPayload.decorator';

@Controller('users')
export class UserController {
  //FOR ADMIN
  constructor(private readonly userService: UserService) {}

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
  findAll(@Query() query: any) {
    return this.userService.findAll(query);
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

//FOR USER
@Controller('user-me')
export class UserMeController {
  constructor(private readonly userService: UserService) {}

  /**
   * @docs User Can Get his data
   * @route GET ~/user-me
   * @param currentUser current logged-in user
   * @canAcess [Admin, User]
   */
  @Get()
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  getMe(@UserPayload() currentUser: any) {
    return this.userService.getMe(currentUser);
  }

  /**
   * @docs User Can Update his data
   * @param updateUserDto {all props as optional}
   * @param userPayload current logged-in user
   * @route PATCH ~/user-me
   * @canAcess [Admin]
   */
  @Patch('')
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  update(
    @UserPayload() userPayload: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMe(userPayload, updateUserDto);
  }

  /**
   * @docs Admin Can Delete a User
   * @param userPayload current logged-in user
   * @route DELETE ~/user-me
   * @canAcess [Admin]
   */
  @Delete('')
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  remove(@UserPayload() userPayload: any) {
    return this.userService.deleteMe(userPayload);
  }
}
