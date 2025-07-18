import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Event, EventStatus } from '../event/event.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  let eventRepo: jest.Mocked<Repository<Event>>;

  const mockEventRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findBy: jest.fn(),
  }

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', events: [] },
    { id: 2, name: 'Bob', events: [] },
    { id: 3, name: 'Charlie', events: [] },
  ];

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
      status: EventStatus.COMPLETED,
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
        UserService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepo,
        },
        { provide: getRepositoryToken(User), 
          useValue: mockUserRepo, 
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    eventRepo = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const name = mockUsers[0].name;
      const user = { id:1 , name } as User;
      const save = new User;
      save.name = name;

      userRepo.create.mockReturnValue(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.create(name);
      expect(userRepo.save).toHaveBeenCalledWith(save);
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = mockUsers[0];
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findById(user.id);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        relations: ['events'],
      });
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      userRepo.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(userRepo.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      mockUserRepo.delete.mockResolvedValue(1);

      const result = await service.remove(1);
      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
    });
  });  

  describe('mergeAll', () => {
    it('merge two simple events', async () => {
      const mockEvents1: Event[] = [
        {
          id: 1,
          title: 'E1',
          description: 'A',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:00:00Z'),
          endTime: new Date('2025-07-01T11:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[0]],
        },
        {
          id: 2,
          title: 'E2',
          description: 'B',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:30:00Z'),
          endTime: new Date('2025-07-01T12:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
      ];

      const mergedRes = {
        title: 'E1E2',
        description: 'AB',
        status: EventStatus.TODO,
        startTime: new Date('2025-07-01T10:00:00Z'),
        endTime: new Date('2025-07-01T12:00:00Z'),
        invitees: [mockUsers[1], mockUsers[0]],        
      }

      userRepo.findOne.mockResolvedValue({ id: 1, name: 'Alice', events: mockEvents1 } as User);
      eventRepo.find.mockResolvedValue(mockEvents);
      userRepo.findBy.mockResolvedValue([mockUsers[1], mockUsers[0]])

      const result = await service.mergeAll(1);
      expect(eventRepo.create).toHaveBeenCalledWith(mergedRes);

    });

    it('not merge two simple events', async () => {
      const mockEvents2: Event[] = [
        {
          id: 1,
          title: 'E1',
          description: 'A',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:00:00Z'),
          endTime: new Date('2025-07-01T11:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[0]],
        },
        {
          id: 2,
          title: 'E2',
          description: 'B',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T12:00:00Z'),
          endTime: new Date('2025-07-01T12:30:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
      ];

      userRepo.findOne.mockResolvedValue({ id: 1, name: 'Alice', events: mockEvents2 } as User);
      eventRepo.find.mockResolvedValue(mockEvents);
      userRepo.findBy.mockResolvedValue([mockUsers[1], mockUsers[0]])

      const result = await service.mergeAll(1);
      expect(eventRepo.create).toHaveBeenCalledTimes(0);

    });

    it('merge three simple events (overlap at edge)', async () => {
      const mockEvents3: Event[] = [
        {
          id: 1,
          title: 'E1',
          description: 'A',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:00:00Z'),
          endTime: new Date('2025-07-01T11:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[0]],
        },
        {
          id: 2,
          title: 'E2',
          description: 'B',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:30:00Z'),
          endTime: new Date('2025-07-01T12:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
        {
          id: 3,
          title: 'E3',
          description: 'C',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T12:00:00Z'),
          endTime: new Date('2025-07-01T13:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
      ];

      const mergedRes = {
        title: 'E1E2E3',
        description: 'ABC',
        status: EventStatus.TODO,
        startTime: new Date('2025-07-01T10:00:00Z'),
        endTime: new Date('2025-07-01T13:00:00Z'),
        invitees: [mockUsers[1], mockUsers[0]],        
      }

      userRepo.findOne.mockResolvedValue({ id: 1, name: 'Alice', events: mockEvents3 } as User);
      eventRepo.find.mockResolvedValue(mockEvents);
      userRepo.findBy.mockResolvedValue([mockUsers[1], mockUsers[0]])

      const result = await service.mergeAll(1);
      expect(eventRepo.create).toHaveBeenCalledWith(mergedRes);

    });
    it('merge five events into 3 groups', async () => {
      const mockEvents1: Event[] = [
        {
          id: 1,
          title: 'E1',
          description: '',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:00:00Z'),
          endTime: new Date('2025-07-01T11:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[0]],
        },
        {
          id: 2,
          title: 'E2',
          description: 'B',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T10:30:00Z'),
          endTime: new Date('2025-07-01T12:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
        {
          id: 3,
          title: 'E3',
          description: 'C',
          status: EventStatus.TODO,
          startTime: new Date('2025-07-01T13:00:00Z'),
          endTime: new Date('2025-07-01T13:30:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1]],
        },
        {
          id: 4,
          title: 'E4',
          description: 'D',
          status: EventStatus.COMPLETED,
          startTime: new Date('2025-07-01T14:00:00Z'),
          endTime: new Date('2025-07-01T14:30:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[2]],
        },
        {
          id: 5,
          title: 'E5',
          description: '',
          status: EventStatus.COMPLETED,
          startTime: new Date('2025-07-01T14:15:00Z'),
          endTime: new Date('2025-07-01T14:30:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          invitees: [mockUsers[1], mockUsers[2]],
        },
      ];

      const mergedRes1 = 
      {
        title: 'E1E2',
        description: 'B',
        status: EventStatus.TODO,
        startTime: new Date('2025-07-01T10:00:00Z'),
        endTime: new Date('2025-07-01T12:00:00Z'),
        invitees: [mockUsers[1], mockUsers[0]],        
      }
      const mergedRes2 = 
      {
        title: 'E4E5',
        description: 'D',
        status: EventStatus.TODO,
        startTime: new Date('2025-07-01T14:00:00Z'),
        endTime: new Date('2025-07-01T14:30:00Z'),
        invitees: [mockUsers[1], mockUsers[2]],  
      }
      
      userRepo.findOne.mockResolvedValue({ id: 1, name: 'Alice', events: mockEvents1 } as User);
      eventRepo.find.mockResolvedValue(mockEvents);
      userRepo.findBy.mockResolvedValueOnce([mockUsers[1], mockUsers[0]])
      userRepo.findBy.mockResolvedValueOnce([mockUsers[1], mockUsers[2]])

      const result = await service.mergeAll(1);
      expect(eventRepo.create).toHaveBeenNthCalledWith(1, mergedRes1);
      expect(eventRepo.create).toHaveBeenNthCalledWith(2, mergedRes2);

    });
  });

});


