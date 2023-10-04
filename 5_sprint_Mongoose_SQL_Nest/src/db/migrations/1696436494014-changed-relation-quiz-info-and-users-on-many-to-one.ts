import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationQuizInfoAndUsersOnManyToOne1696436494014 implements MigrationInterface {
    name = 'ChangedRelationQuizInfoAndUsersOnManyToOne1696436494014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "REL_f74db7b309c2937a51b1c25abd"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "REL_f74db7b309c2937a51b1c25abd" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
