import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEntitySubscribersOfTgBot1699598597191 implements MigrationInterface {
    name = 'AddedEntitySubscribersOfTgBot1699598597191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscribers_of_tg_bot" ("telegramId" SERIAL NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_c934f0b9258b3998bbb49f374ae" PRIMARY KEY ("telegramId"))`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "subscribers_of_blog_blogId_seq" OWNED BY "subscribers_of_blog"."blogId"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" SET DEFAULT nextval('"subscribers_of_blog_blogId_seq"')`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD CONSTRAINT "FK_07e28d842172a119508347cfa77" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP CONSTRAINT "FK_07e28d842172a119508347cfa77"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ALTER COLUMN "blogId" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "subscribers_of_blog_blogId_seq"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD CONSTRAINT "FK_1ae0d5da4b41627fb22018907f7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "subscribers_of_tg_bot"`);
    }

}
