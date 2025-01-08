import { Expose, Transform } from 'class-transformer';

export class UserDetailsSerializer {
    @Expose() firstName: string;
    @Expose() lastName: string;
    @Expose() phoneNumber: string;
    @Expose()
    get full_name(): string {
        return `${this.firstName} ${this.lastName}`;
    }
    @Expose() email: string;
    @Expose() status: string;

    @Expose()
    role: string;
}
