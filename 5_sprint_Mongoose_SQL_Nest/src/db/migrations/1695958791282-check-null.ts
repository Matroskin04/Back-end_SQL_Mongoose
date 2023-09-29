import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckNull1695958791282 implements MigrationInterface {
    name = 'CheckNull1695958791282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "banned_users_of_blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isBanned" boolean NOT NULL, "banReason" character varying, "banDate" TIMESTAMP DEFAULT now(), "userId" uuid NOT NULL, "blogId" uuid NOT NULL, CONSTRAINT "UQ_b0ea65c789d17c663cd784e967f" UNIQUE ("userId", "blogId"), CONSTRAINT "PK_57a5aa1ab269067c6a5e397593b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "banned_users_of_blog" ADD CONSTRAINT "FK_4903f837a8ee2bfa71ad54a1632" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "banned_users_of_blog" ADD CONSTRAINT "FK_cdc0f181fd3d5bac77d9ec783a7" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banned_users_of_blog" DROP CONSTRAINT "FK_cdc0f181fd3d5bac77d9ec783a7"`);
        await queryRunner.query(`ALTER TABLE "banned_users_of_blog" DROP CONSTRAINT "FK_4903f837a8ee2bfa71ad54a1632"`);
        await queryRunner.query(`DROP TABLE "banned_users_of_blog"`);
    }

}
