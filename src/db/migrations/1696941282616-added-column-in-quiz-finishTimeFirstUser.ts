import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnInQuizFinishTimeFirstUser1696941282616 implements MigrationInterface {
    name = 'AddedColumnInQuizFinishTimeFirstUser1696941282616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ADD "finishTimeFirstUser" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "finishTimeFirstUser"`);
    }

}
