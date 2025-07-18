import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  
  export enum EventStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
  }
  
  @Entity()
  export class Event {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column({ nullable: true })
    description?: string;
  
    @Column({
      type: 'enum',
      enum: EventStatus,
    })
    status: EventStatus;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column()
    startTime: Date;
  
    @Column()
    endTime: Date;
  
    @ManyToMany(() => User, (user) => user.events)
    @JoinTable()
    invitees: User[];
  }