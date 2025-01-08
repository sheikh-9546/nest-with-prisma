import { OrderBy } from '@api/database/prisma.constants';
import { Prisma } from '@prisma/client';

export type Order = Record<string, OrderBy>;
export type Columns = Record<string, string>;

export type UserMutationInput =
  | Prisma.UserUncheckedCreateInput
  | Prisma.UserUncheckedUpdateInput;

export type PaginationArgs<T> = {
  page?: number;
  perPage?: number;
  startAt?: number;
  deleted?: boolean;
} & Prisma.Args<T, 'findMany'> &
  Prisma.Args<T, 'findMany'>['orderBy'];

export type PaginationResult<T> = {
  records: T[];
  meta: PaginationMeta;
};

export type PaginationMeta = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  orderBy: Order;
};

export type CursorPaginateArgs<T> = {
  cursor?: string;
  take?: number;
  where?: Partial<Record<keyof T, any>>;
  sortBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
};

export type CursorPaginateResultMeta<T, R = T[]> = {
  records: R;
  meta: {
    nextCursor: string | null;
    take: number;
  };
};

export type OffsetPaginateArgs<T> = {
  page?: number;
  perPage?: number;
  where?: Partial<Record<keyof T, any>>;
  sortBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
};

export type OffsetPaginateResultMeta<T> = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  sortBy: Order;
} & Prisma.Args<T, 'findMany'> &
  Prisma.Args<T, 'findMany'>['orderBy'];

export type PrismaSelect<T> = {
  [K in keyof T]?: boolean | PrismaSelect<any>;
};
