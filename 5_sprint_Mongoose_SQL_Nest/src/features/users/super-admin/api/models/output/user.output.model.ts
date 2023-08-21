import { UserViewType } from '../../../infrastructure/query.repository/users-sa.types.query.repository';

export type UserOutputModel = UserViewType;

export type ViewAllUsersModels = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};
