import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto, EventStatus } from './dto/create-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEventService = {
    createEvent: jest.fn(),
    getEventById: jest.fn(),
    getAllEvents: jest.fn(),
    deleteEvent: jest.fn(),
    mergeAllEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const dto: CreateEventDto = {
        title: 'Event A',
        description: 'Some event',
        status: EventStatus.TODO,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        invitees: [1, 2],
      };
      const mockResult = { id: 1, ...dto };

      mockEventService.createEvent.mockResolvedValue(mockResult);

      const result = await controller.create(dto);
      expect(result).toEqual(mockResult);
      expect(mockEventService.createEvent).toHaveBeenCalledWith(dto);
    });
  });

  describe('getEventById', () => {
    it('should return a single event', async () => {
      const mockEvent = { id: 1, title: 'Event A' };
      mockEventService.getEventById.mockResolvedValue(mockEvent);

      const result = await controller.findOne("1");
      expect(result).toEqual(mockEvent);
      expect(mockEventService.getEventById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [{ id: 1 }, { id: 2 }];
      mockEventService.getAllEvents.mockResolvedValue(mockEvents);

      const result = await controller.getAllEvents();
      expect(result).toEqual(mockEvents);
    });
  });
  
  describe('deleteEvent', () => {
    it('should delete the event and return a success message', async () => {
      const mockMessage = { message: 'Event deleted' };
      mockEventService.deleteEvent.mockResolvedValue(mockMessage);

      const result = await controller.delete("1");
      expect(result).toEqual(mockMessage);
      expect(mockEventService.deleteEvent).toHaveBeenCalledWith(1);
    });
  });
});
