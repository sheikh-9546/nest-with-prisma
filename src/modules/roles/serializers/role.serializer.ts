import { Expose } from 'class-transformer';

export class RoleSerializer {
    @Expose() id: Number;
    @Expose() roleName: string;
}
