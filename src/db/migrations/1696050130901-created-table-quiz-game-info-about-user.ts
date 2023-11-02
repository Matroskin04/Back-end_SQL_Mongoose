import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTableQuizGameInfoAboutUser1696050130901 implements MigrationInterface {
    name = 'CreatedTableQuizGameInfoAboutUser1696050130901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quiz_game_info_about_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numberOfAnswers" smallint NOT NULL, "score" smallint NOT NULL, "quizId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "REL_d54568c77db30c5381854bda62" UNIQUE ("quizId"), CONSTRAINT "REL_2fa736fdf76b9b0b795c85cb90" UNIQUE ("userId"), CONSTRAINT "PK_1f712221c6ed69d8e8f6f96942f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quiz_game_info_about_user" ADD CONSTRAINT "FK_d54568c77db30c5381854bda62d" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_game_info_about_user" ADD CONSTRAINT "FK_2fa736fdf76b9b0b795c85cb907" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_game_info_about_user" DROP CONSTRAINT "FK_2fa736fdf76b9b0b795c85cb907"`);
        await queryRunner.query(`ALTER TABLE "quiz_game_info_about_user" DROP CONSTRAINT "FK_d54568c77db30c5381854bda62d"`);
        await queryRunner.query(`DROP TABLE "quiz_game_info_about_user"`);
    }

}
