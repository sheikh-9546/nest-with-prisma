import { Expose } from 'class-transformer';

export class UserSerializer {
    @Expose() firstName: string;

    @Expose() lastName: string;

    @Expose() email: string;

    @Expose()
    get full_name(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
