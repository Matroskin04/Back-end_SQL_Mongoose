import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedWallpaperOfBlogEntity1699281261187 implements MigrationInterface {
    name = 'CreatedWallpaperOfBlogEntity1699281261187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallpaper_of_blog" ("url" character varying NOT NULL, "width" smallint NOT NULL, "height" smallint NOT NULL, "fileSize" integer NOT NULL, "blogId" uuid NOT NULL, CONSTRAINT "PK_250a2d5f9fd4bcafe5bb69972ae" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`ALTER TABLE "wallpaper_of_blog" ADD CONSTRAINT "FK_250a2d5f9fd4bcafe5bb69972ae" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallpaper_of_blog" DROP CONSTRAINT "FK_250a2d5f9fd4bcafe5bb69972ae"`);
        await queryRunner.query(`DROP TABLE "wallpaper_of_blog"`);
    }

}
