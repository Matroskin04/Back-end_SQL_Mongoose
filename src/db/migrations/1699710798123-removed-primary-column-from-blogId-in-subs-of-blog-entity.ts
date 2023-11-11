import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedPrimaryColumnFromBlogIdInSubsOfBlogEntity1699710798123 implements MigrationInterface {
    name = 'RemovedPrimaryColumnFromBlogIdInSubsOfBlogEntity1699710798123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "PK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "PK_4326b1ab12a53b0b2f857bdf28a" PRIMARY KEY ("blogId", "id")`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "PK_4326b1ab12a53b0b2f857bdf28a"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "PK_6d3f2ffedf2d2a1384b05933f4e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "PK_6d3f2ffedf2d2a1384b05933f4e"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "PK_4326b1ab12a53b0b2f857bdf28a" PRIMARY KEY ("blogId", "id")`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "PK_4326b1ab12a53b0b2f857bdf28a"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "PK_1ae0d5da4b41627fb22018907f7" PRIMARY KEY ("blogId")`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP COLUMN "id"`);
    }

}
