import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedEntitySubscribersOfBlogAndSubsOfTgBot1699600729338 implements MigrationInterface {
    name = 'CreatedEntitySubscribersOfBlogAndSubsOfTgBot1699600729338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscribers_of_tg_bot" ("telegramId" character varying, "codeConfirmation" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_07e28d842172a119508347cfa77" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD CONSTRAINT "FK_07e28d842172a119508347cfa77" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP CONSTRAINT "FK_07e28d842172a119508347cfa77"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "subscribers_of_tg_bot"`);
    }

}
