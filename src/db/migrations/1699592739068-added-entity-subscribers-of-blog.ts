import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEntitySubscribersOfBlog1699592739068 implements MigrationInterface {
    name = 'AddedEntitySubscribersOfBlog1699592739068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscribers_of_blog" ("blogId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_1ae0d5da4b41627fb22018907f7" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_d36d94a7b427c095f7509101d7c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_d36d94a7b427c095f7509101d7c"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`DROP TABLE "subscribers_of_blog"`);
    }

}
