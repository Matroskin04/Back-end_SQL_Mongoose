import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedEntityIconOfPost1699415902426 implements MigrationInterface {
    name = 'CreatedEntityIconOfPost1699415902426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "icon_of_post" ("url" character varying NOT NULL, "width" smallint NOT NULL, "height" smallint NOT NULL, "fileSize" integer NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, CONSTRAINT "PK_202b6aba9f37c4735cb2889184b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "postId-index" ON "icon_of_post" ("postId") `);
        await queryRunner.query(`ALTER TABLE "icon_of_post" ADD CONSTRAINT "FK_8eaa6cd26f08c08788bac703533" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "icon_of_post" DROP CONSTRAINT "FK_8eaa6cd26f08c08788bac703533"`);
        await queryRunner.query(`DROP INDEX "public"."postId-index"`);
        await queryRunner.query(`DROP TABLE "icon_of_post"`);
    }

}
