import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationOnManyToOneBetweenQuizAndGameInfoUser1696221138449 implements MigrationInterface {
    name = 'ChangedRelationOnManyToOneBetweenQuizAndGameInfoUser1696221138449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "REL_e5c490c69ab6e22e92ec0017f6"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a"`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "REL_e5c490c69ab6e22e92ec0017f6" UNIQUE ("quizId")`);
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD CONSTRAINT "FK_e5c490c69ab6e22e92ec0017f6a" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
