import { MigrationInterface, QueryRunner } from "typeorm";

export class RanamedTableQuestionQuizConnection1696137595286 implements MigrationInterface {
    name = 'RanamedTableQuestionQuizConnection1696137595286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_quiz_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quizId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "PK_d34a760d6e63ed7945b699badb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_info_about_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numberOfAnswers" smallint NOT NULL DEFAULT '0', "score" smallint NOT NULL DEFAULT '0', "quizId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "REL_e5c490c69ab6e22e92ec0017f6" UNIQUE ("quizId"), CONSTRAINT "REL_f74db7b309c2937a51b1c25abd" UNIQUE ("userId"), CONSTRAINT "PK_efa0c790dbc1aba3ff353de88f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quiz" ALTER COLUMN "status" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "question_quiz_relation" ADD CONSTRAINT "FK_9d73c884fefd7360e622dddf033" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_quiz_relation" ADD CONSTRAINT "FK_829eb18601805defc54dafd87de" FOREIGN KEY ("questionId") REFERENCES "question_quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_f74db7b309c2937a51b1c25abd5"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a"`);
        await queryRunner.query(`ALTER TABLE "question_quiz_relation" DROP CONSTRAINT "FK_829eb18601805defc54dafd87de"`);
        await queryRunner.query(`ALTER TABLE "question_quiz_relation" DROP CONSTRAINT "FK_9d73c884fefd7360e622dddf033"`);
        await queryRunner.query(`ALTER TABLE "quiz" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "quiz_info_about_user"`);
        await queryRunner.query(`DROP TABLE "question_quiz_relation"`);
    }

}
