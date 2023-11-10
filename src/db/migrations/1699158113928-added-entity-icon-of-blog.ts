import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEntityIconOfBlog1699158113928 implements MigrationInterface {
    name = 'AddedEntityIconOfBlog1699158113928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "icon_of_blog" ("url" character varying NOT NULL, "width" smallint NOT NULL, "height" smallint NOT NULL, "fileSize" integer NOT NULL, "blogId" uuid NOT NULL, CONSTRAINT "PK_4c373c2a589bfe6f94b532d4c53" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53"`);
        await queryRunner.query(`DROP TABLE "icon_of_blog"`);
    }

}
