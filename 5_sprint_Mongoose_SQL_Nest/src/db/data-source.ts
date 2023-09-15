import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'It-Incubator',
  password: 'sa',
  database: 'backend_course_type_orm',
  synchronize: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
