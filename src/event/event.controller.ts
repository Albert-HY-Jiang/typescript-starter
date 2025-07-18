import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService){}

    @Post('create')
    async create(@Body() CreateEventDto:CreateEventDto){
        return this.eventService.createEvent(CreateEventDto)
    }
    
    @Get()
    async  getAllEvents() {
      return this.eventService.getAllEvents();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.eventService.getEventById(Number(id));
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.eventService.deleteEvent(Number(id));
    }

    
}
