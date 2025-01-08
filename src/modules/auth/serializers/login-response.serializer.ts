import { Expose } from 'class-transformer';

export class LoginResponseSerializer {

    @Expose()
    id: string;

    @Expose() firstName: string;

    @Expose() lastName: string;

    @Expose() email: string;

    @Expose()
    access_token: string;
}
