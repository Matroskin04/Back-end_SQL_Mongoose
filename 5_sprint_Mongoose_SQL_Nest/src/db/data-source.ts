import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'It-Incubator',
  password: 'sa',
  database: 'BackEnd_course_TypeORM',
  synchronize: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
