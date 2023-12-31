import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  HttpException,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDTO, LoginUserDTO } from "./users.dto";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    if (
      await this.usersService.findUserByScreenName(createUserDTO.screenName)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: `Screen name '${createUserDTO.screenName}' is already taken. `,
        },
        409
      );
    }

    try {
      await this.usersService.register(createUserDTO);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Internal server error",
        },
        500
      );
    }

    return;
  }

  @Post("login")
  async login(@Body() loginUserDTO: LoginUserDTO): Promise<User> {
    let user: User;

    try {
      user = await this.usersService.loginUser(
        loginUserDTO.screenName,
        loginUserDTO.password
      );
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Internal server error.",
        },
        500
      );
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: "User Not Fount.",
        },
        404
      );
    }

    return user;
  }
}
