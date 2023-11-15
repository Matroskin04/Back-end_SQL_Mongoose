import {
  BaseEntity,
  DataSource,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { Users } from '../../../../features/users/domain/users.entity';

export async function startTransaction(
  dataSource: DataSource,
  entities: Array<any>,
) {
  const repositories: { [key: string]: Repository<any> } = {};
  // create a new query runner
  const queryRunner = dataSource.createQueryRunner();
  const repo = queryRunner.manager.getRepository<ObjectLiteral>(Users);

  // establish real database connection using our new query runner
  await queryRunner.connect();

  //get repositories:
  for (const entity of entities) {
    repositories[entity.name] = await queryRunner.manager.getRepository(entity);
  }

  // lets now open a new transaction:
  await queryRunner.startTransaction();

  return {
    queryRunner,
    repositories,
  };
}
