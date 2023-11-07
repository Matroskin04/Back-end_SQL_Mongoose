import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPrimaryColumnIdAndCreateIndexForBlogIdIconOfBlogEntity1699338021538 implements MigrationInterface {
    name = 'AddedPrimaryColumnIdAndCreateIndexForBlogIdIconOfBlogEntity1699338021538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "PK_4c373c2a589bfe6f94b532d4c53"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "PK_ad62438876472910b337a3be545" PRIMARY KEY ("blogId", "id")`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "PK_ad62438876472910b337a3be545"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "PK_4f9a6477e961fe59d5d93e7f65b" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE INDEX "blogId-index" ON "icon_of_blog" ("blogId") `);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53"`);
        await queryRunner.query(`DROP INDEX "public"."blogId-index"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "PK_4f9a6477e961fe59d5d93e7f65b"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "PK_ad62438876472910b337a3be545" PRIMARY KEY ("blogId", "id")`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "FK_4c373c2a589bfe6f94b532d4c53" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP CONSTRAINT "PK_ad62438876472910b337a3be545"`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" ADD CONSTRAINT "PK_4c373c2a589bfe6f94b532d4c53" PRIMARY KEY ("blogId")`);
        await queryRunner.query(`ALTER TABLE "icon_of_blog" DROP COLUMN "id"`);
    }

}
