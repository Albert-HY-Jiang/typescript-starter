import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User } from '../src/user/user.entity';
import { Event } from '../src/event/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import exp from 'constants';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'newuser',
          password: '123456789zzZ!',
          database: 'event_planner',
          entities: [User, Event],
          autoLoadEntities: true, 
          synchronize: true,      // Set to false in production
        })
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user and events, then merge overlapping events', async () => {
    // Create user
    const names:string[] = ['Alice', 'Bob', 'Charlie'];
    const userIds:number[] = [];

    let userRes = await request(app.getHttpServer())
      .post('/users')
      .query({ name: 'Alice' })
      .expect(201);

    const userIdA = userRes.body.id;
    expect(userIdA).toBeDefined();

    for (let i = 0; i < names.length; i++) {
      const res = await request(app.getHttpServer())
        .post('/users')
        .query({ name: names[i] })
        .expect(201);
      expect(res.body.id).toBeDefined();
      userIds.push(res.body.id);
    }    

    expect(userIds).toHaveLength(3);

    // Create events   
    const eventsToCreate = [
      {
        title: 'E1',
        description: '',
        status: 'TODO',
        startTime: '2025-07-01T10:00:00Z',
        endTime: '2025-07-01T11:00:00Z',
        invitees: [userIds[0], userIds[1]],
      },
      {
        title: 'E2',
        description: 'B',
        status: 'TODO',
        startTime: '2025-07-01T10:30:00Z',
        endTime: '2025-07-01T12:00:00Z',
        invitees: [userIds[1]],
      },
      {
        title: 'E3',
        description: 'C',
        status: 'COMPLETED',
        startTime: '2025-07-01T13:00:00Z',
        endTime: '2025-07-01T13:30:00Z',
        invitees: [userIds[1]],
      },
      {
        title: 'E4',
        description: 'D',
        status: 'IN_PROGRESS',
        startTime: '2025-07-01T14:00:00Z',
        endTime: '2025-07-01T14:30:00Z',
        invitees: [userIds[1], userIds[2]],
      },
      {
        title: 'E5',
        description: '',
        status: 'IN_PROGRESS',
        startTime: '2025-07-01T14:15:00Z',
        endTime: '2025-07-01T14:30:00Z',
        invitees: [userIds[1], userIds[2]],
      },
    ]; 

    for (const event of eventsToCreate) {
      const res = await request(app.getHttpServer())
        .post('/event/create')
        .send(event)
        .expect(201);
      expect(res.body.title).toEqual(event.title);
    }


    const res = await request(app.getHttpServer())
      .post('/users/merge')
      .query({ userId: userIds[1] })
      .expect(201);

    const updatedUser = res.body;

    expect(updatedUser).toBeDefined();
    expect(updatedUser.id).toEqual(userIds[1]);
    expect(updatedUser.name).toEqual(names[1]);
    expect(Array.isArray(updatedUser.events)).toBe(true);
  
    const mergedEvents = updatedUser.events;

    expect(Array.isArray(mergedEvents)).toBe(true);
    expect(mergedEvents.length).toEqual(3);

    const titles = mergedEvents.map((e) => e.title);
    expect(titles.some((t) => t.includes('E1') && t.includes('E2'))).toBe(true);
    expect(titles.some((t) => t.includes('E3'))).toBe(true);
    expect(titles.some((t) => t.includes('E4') || t.includes('E5'))).toBe(true);

  });

});
