import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { RolesService } from "@api/modules/roles/services/role.service";
import { UserService } from "./user.service";

@Injectable()
export class UserValidationService {
  constructor(
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async isRoleChecked(roleId: number): Promise<boolean> {
    return Boolean(await this.rolesService.findRoleById(roleId));
  }

  async isEmailInUse(email: string): Promise<boolean> {
    return Boolean(await this.userService.findUserByEmail(email));
  }

  async isPhoneInUse(countryCode: string, phoneNumber: string): Promise<boolean> {
    return Boolean(await this.userService.findUserByPhoneNumber(countryCode, phoneNumber));
  }
}
