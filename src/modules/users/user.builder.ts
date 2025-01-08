import { User } from '@prisma/client';

export class UserBuilder {
  private entity: Partial<User> = {};

  static builder() {
    return new UserBuilder();
  }

  setFirstName(name: string) {
    this.entity.firstName = name;
    return this;
  }

  setLastName(lastName: string) {
    this.entity.lastName = lastName;
    return this;
  }

  setPhoneNumber(phoneNumber: string) {
    this.entity.phoneNumber = phoneNumber;
    return this;
  }

  setCreatedBy(createdBy?: number) {
    this.entity.createdBy = createdBy;
    return this;
  }

  setUpdatedBy(updatedBy?: number) {
    this.entity.updatedBy = updatedBy;
    return this;
  }

  build(): User {
    return this.entity as User;
  }
}
