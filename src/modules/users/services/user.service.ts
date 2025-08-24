import {
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@api/database/prisma.service";
import { Prisma, User, SocialProvider } from "@prisma/client";
import { UserSerializer } from "../serializers/user.serializer";
import { SerializerUtil } from "@api/core/common/serializer.util";
import { ErrorHandler } from "@api/core/error-handler";
import {
  PaginationResult,
  PaginationUtil,
} from "@api/core/common/utils/pagination.util";
import * as bcrypt from "bcryptjs";
import { Status } from "@api/enums/status.enum";
import { UserDetailsSerializer } from "../serializers/user.details.serializer";
import { EmailService } from "@api/modules/mailer/email.service";
import { Messages } from "@api/constants/messages";
import { UserValidationService } from "./user.validation.service";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly userValidationService: UserValidationService
  ) {}

  // Logger for logging messages
  private logger = new Logger("User service");

  // Method to fetch a user based on unique input fields like id or email

  async getUserDetails(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<any | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new ConflictException(Messages.User.Error.USER_NOT_FOUND);
    }
    const serializedUser = SerializerUtil.serialize(
      user,
      UserDetailsSerializer
    );
    return {
      ...serializedUser,
      role: user.userRoles?.[0]?.role?.roleName,
    };
  }

  // Method to fetch all users from the database
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    sort_column: string,
    sort_direction: string
  ): Promise<PaginationResult<any>> {
    const { skip, take } = PaginationUtil.getPaginationParams(page, limit);
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          [sort_column]: sort_direction,
        },
      }),
      this.prisma.user.count(),
    ]);

    const serializedUsers = users.map((user) =>
      SerializerUtil.serialize(user, UserSerializer)
    );

    return PaginationUtil.paginate(serializedUsers, totalCount, page, take);
  }

  // Method to check if an email is already in use
  async findUserByEmail(email: string): Promise<Pick<User,'id' | 'email'> | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Method to check if an phone number is already in use
  async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  // Method to create a new user after checking if the email is already in use
  async createUser(
    data: Prisma.UserCreateInput & { roleId: number }
  ): Promise<any> {
    const { email, password, roleId, firstName, lastName, phoneNumber } = data;

    // Perform role and email checks in parallel to avoid sequential waits
    const [roleExists, emailExists, phoneNumberExists] = await Promise.all([
      this.userValidationService.isRoleChecked(roleId),
      this.userValidationService.isEmailInUse(email),
      this.userValidationService.isPhoneInUse(phoneNumber),
    ]);

    //Check if the role exists
    if (!roleExists) {
      throw new ConflictException(
        Messages.Role.Error.IS_ROLE_NOT_FOUND(roleId)
      );
    }

    // Check if the email is already in use
    if (emailExists) {
      throw new ConflictException(
        Messages.User.Error.EMAIL_ALREADY_EXISTS(email)
      );
    }

    // Check if the phone is already in use
    if (phoneNumberExists) {
      throw new ConflictException(
        Messages.User.Error.PHONE_NUMBER_ALREADY_EXISTS(phoneNumber)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    });
    // assign the role to the user
    await this.createUserRole(newUser.id, roleId);

    //Send confirmation email
    // await this.emailService.sendEmail({
    //   to: 'abc@gmail.com',
    //   templateId: 1,
    //   params: {
    //     name: 'John Doe',
    //     subject: 'test',
    //   },
    // });
    return SerializerUtil.serialize(newUser, UserSerializer);
  }

  // Assign the role to the user
  async createUserRole(userId: number, roleId: number): Promise<any> {
    return await this.prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleId,
      },
    });
  }

  // Method to update user details based on unique input fields and update data
  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<any> {
    const updateUser = await this.prisma.user.update({
      where: params.where,
      data: params.data,
    });
    return SerializerUtil.serialize(updateUser, UserSerializer);
  }

  // update user stats
  async updateUserStatus(userId: number, status: Status) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  // Method to delete a user based on unique input fields
  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    this.logger.log("deleteUser");
    const user = await this.prisma.user.findUnique({ where });
    if (!user) {
      ErrorHandler.userNotFoundError(
        Messages.User.Error.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    const deleteUser = await this.prisma.user.delete({ where });
    return deleteUser;
  }

  // user chnage password
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ConflictException(Messages.User.Error.USER_NOT_FOUND);
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new ConflictException(
        Messages.User.Error.CURRENT_PASSWORDS_DO_NOT_MATCH
      );
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: Messages.User.Success.PASSWORD_RESET_SUCCESS };
  }

  // upload user profile image
  async updateUserProfileImage(userId: number, imagePath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profilePic: imagePath },
    });
  }

  private async findUserBySocialLogin(provider: SocialProvider, socialId: string) {
    return this.prisma.user.findFirst({
      where: {
        socialLogins: {
          some: { provider, socialId },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        socialLogins: true,
      },
    });
  }

  private async findUserByEmailWithRelations(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
        socialLogins: true,
      },
    });
  }

  private async createSocialUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    provider: SocialProvider;
    socialId: string;
    displayName?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    return this.prisma.$transaction(async (prisma) => {
      return prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          profilePic: data.profilePic || '',
          phoneNumber: '',
          status: Status.ACTIVE,
          password: '',
          userRoles: {
            create: {
              roleId: 2, // Default user role ID
            },
          },
          socialLogins: {
            create: {
              provider: data.provider,
              socialId: data.socialId,
              socialEmail: data.email,
              displayName: data.displayName,
              firstName: data.firstName,
              lastName: data.lastName,
              avatarUrl: data.profilePic,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              tokenExpiry: data.accessToken ? new Date(Date.now() + 3600000) : null,
              isVerified: true,
            },
          },
        },
        include: {
          userRoles: {
            include: { role: true },
          },
          socialLogins: true,
        },
      });
    });
  }

  private async addSocialLoginToUser(
    userId: number, 
    provider: SocialProvider, 
    socialId: string,
    socialData?: {
      email?: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      accessToken?: string;
      refreshToken?: string;
    }
  ) {
    return this.prisma.socialLogin.create({
      data: {
        userId,
        provider,
        socialId,
        socialEmail: socialData?.email,
        displayName: socialData?.displayName,
        firstName: socialData?.firstName,
        lastName: socialData?.lastName,
        avatarUrl: socialData?.avatarUrl,
        accessToken: socialData?.accessToken,
        refreshToken: socialData?.refreshToken,
        tokenExpiry: socialData?.accessToken ? new Date(Date.now() + 3600000) : null,
        isVerified: true,
      },
    });
  }

  async findOrCreateSocialUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    provider: SocialProvider;
    socialId: string;
    displayName?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    // Try to find user by social login first
    let user = await this.findUserBySocialLogin(data.provider, data.socialId);

    if (user) {
      // Update existing social login data
      await this.updateSocialLoginData(user.id, data.provider, data.socialId, {
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.profilePic,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return user;
    }

    // If not found, try to find by email
    user = await this.findUserByEmailWithRelations(data.email);

    if (!user) {
      // If still not found, create new user
      user = await this.createSocialUser(data);
    } else {
      // If found by email, add social login
      await this.addSocialLoginToUser(user.id, data.provider, data.socialId, {
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.profilePic,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }

    return user;
  }

  private async updateSocialLoginData(
    userId: number,
    provider: SocialProvider,
    socialId: string,
    socialData: {
      email?: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      accessToken?: string;
      refreshToken?: string;
    }
  ) {
    return this.prisma.socialLogin.updateMany({
      where: {
        userId,
        provider,
        socialId,
      },
      data: {
        socialEmail: socialData.email,
        displayName: socialData.displayName,
        firstName: socialData.firstName,
        lastName: socialData.lastName,
        avatarUrl: socialData.avatarUrl,
        accessToken: socialData.accessToken,
        refreshToken: socialData.refreshToken,
        tokenExpiry: socialData.accessToken ? new Date(Date.now() + 3600000) : null,
        updatedAt: new Date(),
      },
    });
  }
}
