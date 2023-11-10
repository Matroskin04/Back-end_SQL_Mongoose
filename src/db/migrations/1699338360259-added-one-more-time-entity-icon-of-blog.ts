import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOneMoreTimeEntityIconOfBlog1699338360259 implements MigrationInterface {
    name = 'AddedOneMoreTimeEntityIconOfBlog1699338360259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "icon_of_blog" ("url" character varying NOT NULL, "width" smallint NOT NULL, "height" smallint NOT NULL, "fileSize" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blogId" uuid NOT NULL, CONSTRAINT "PK_4f9a6477e961fe59d5d93e7f65b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "blogId-index" ON "icon_of_blog" ("blogId") `);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53"`);
        await queryRunner.query(`DROP INDEX "public"."blogId-index"`);
        await queryRunner.query(`DROP TABLE "icon_of_blog"`);
    }

}
