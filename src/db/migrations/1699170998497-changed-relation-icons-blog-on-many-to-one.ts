import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationIconsBlogOnManyToOne1699170998497 implements MigrationInterface {
    name = 'ChangedRelationIconsBlogOnManyToOne1699170998497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "finishTimeFirstUser"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ADD "finishTimeFirstUser" integer`);
    }

}
