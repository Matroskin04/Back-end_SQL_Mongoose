import { Column } from 'typeorm';

export abstract class PhotoInfo {
  @Column('varchar')
  url: string;

  @Column('smallint')
  width: number;

  @Column('smallint')
  height: number;

  @Column('int')
  fileSize: number;
}
