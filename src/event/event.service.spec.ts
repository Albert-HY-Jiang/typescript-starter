import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { Event, EventStatus } from './event.entity';
import { User } from '../user/user.entity';
import { EntitySchema, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { In } from 'typeorm';

describe('EventService', () => {
  let service: EventService;
  let eventRepo: Repository<Event>
  let userRepo: Repository<User>

  const mockEventRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepo = {
    find: jest.fn(),
  }

  const mockEvents: Event[] = [
    {
      id: 1,
      title: 'Meeting A',
      description: 'First event',
      status: EventStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date('2025-07-15T14:00:00'),
      endTime: new Date('2025-07-15T15:00:00'),
      invitees: [],
    },
    {
      id: 2,
      title: 'Meeting B',
      description: 'Second event',
      status: EventStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date('2025-07-15T14:30:00'),
      endTime: new Date('2025-07-15T16:00:00'),
      invitees: [],
    },
    {
      id: 3,
      title: 'Meeting C',
      description: 'Second event',
      status: EventStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date('2025-07-15T17:30:00'),
      endTime: new Date('2025-07-15T18:00:00'),
      invitees: [],
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepo,
        },
        { provide: getRepositoryToken(User), 
          useValue: mockUserRepo, 
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create and save a new event', async () => {

      mockUserRepo.find.mockResolvedValue([
        { id: 1, name: 'User A' },
        { id: 2, name: 'User B' },
      ]);

      const mockCreateEventDto : CreateEventDto = {
        title: mockEvents[0].title,
        description: mockEvents[0].description,
        status: mockEvents[0].status,
        startTime: mockEvents[0].startTime.toISOString(),
        endTime: mockEvents[0].endTime.toISOString(),
        invitees: [1, 2],
      }

      const expectedEvent = {
        ...mockEvents[0],
        invitees: [
          { id: 1, name: 'User A' },
          { id: 2, name: 'User B' },
        ],
      };

      mockEventRepo.create.mockReturnValue(expectedEvent);
      mockEventRepo.save.mockResolvedValue(expectedEvent);
  
      const result = await service.createEvent(mockCreateEventDto);
  
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { id: In(mockCreateEventDto.invitees) },
      });
      expect(result).toEqual(expectedEvent);
    });
  });


  describe('getAllEvents', () => {
    it('should return all events', async () => {
      mockEventRepo.find.mockResolvedValue(mockEvents);

      const result = await service.getAllEvents();
      expect(mockEventRepo.find).toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventById', () => {
    it('should return a single event by ID', async () => {
      const targetEvent = mockEvents[0];
      mockEventRepo.findOne.mockResolvedValue(targetEvent);

      const result = await service.getEventById(1);
      expect(mockEventRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['invitees'],
      });
      expect(result).toEqual(targetEvent);
    });

    it('should return null if event not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      const result = await service.getEventById(999);
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event by ID', async () => {
      mockEventRepo.delete.mockResolvedValue(1);

      const result = await service.deleteEvent(1);
      expect(mockEventRepo.delete).toHaveBeenCalledWith(1);
    });
  });  

});
