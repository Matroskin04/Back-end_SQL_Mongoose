import { DataSource, Repository } from 'typeorm';
import { Users } from '../../../../features/users/domain/users.entity';

export async function startTransaction(
  dataSource: DataSource,
  entities: Array<any>,
) {
  const repositories: { [key: string]: Repository<any> } = {};
  // create a new query runner
  const queryRunner = dataSource.createQueryRunner();

  // establish real database connection using our new query runner
  await queryRunner.connect();

  //get repositories:
  for (const entity of entities) {
    repositories[`${entity}`] = await queryRunner.manager.getRepository(entity);
  }

  // lets now open a new transaction:
  await queryRunner.startTransaction();

  return {
    queryRunner,
    repositories,
  };
}
