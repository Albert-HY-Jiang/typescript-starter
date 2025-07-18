import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private eventRepo: Repository<Event>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ){}

    async createEvent(dto:CreateEventDto): Promise<Event>{
        const users = await this.userRepo.find({where: {id: In(dto.invitees)},});

        const event = this.eventRepo.create({
            ...dto,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            invitees: users,
        })

        return this.eventRepo.save(event)
    }

    async getEventById(id: number): Promise<Event> {
        return this.eventRepo.findOne({
          where: { id },
          relations: ['invitees'],
        });
    }

    async deleteEvent(id: number): Promise<void> {
        await this.eventRepo.delete(id);
    }
    
    async getAllEvents(): Promise<Event[]> {
        return this.eventRepo.find({
          relations: ['invitees'], // Include invitee data
        });
    }
    
}
