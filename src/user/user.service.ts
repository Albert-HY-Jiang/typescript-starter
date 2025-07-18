import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Event, EventStatus } from '../event/event.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(Event)
        private eventRepo: Repository<Event>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ){}

    async create(name:string): Promise<User>{
        const data = new User()
        data.name = name
        return this.userRepo.save(data)
    }

    async findById(id: number): Promise<User> {
        return this.userRepo.findOne({ where: { id }, relations: ['events'] });
      }
    
    async findAll(): Promise<User[]> {
        return this.userRepo.find({ relations: ['events'] });
    }
    
    async remove(id: number): Promise<void> {
        await this.userRepo.delete(id);        
    }

    async mergeAll(id:number): Promise<User>{
        const user = await this.userRepo.findOne({
            where: {id},
            relations: ['events', 'events.invitees'],
        });

        //console.log(user)

        if(!user || !user.events || user.events.length === 0){
            return
        }

        //sort events by startTime
        const sorted = user.events.sort((a,b) => a.startTime.getTime() - b.startTime.getTime())

        //console.log(sorted)

        const mergedEvents:{
            startTime: Date;
            endTime: Date;
            invitees: Set<number>;
            titles: string[];
            descriptions: string[];
        }[] = [];

        let currentEvent = {
            startTime: sorted[0].startTime,
            endTime: sorted[0].endTime,
            invitees: new Set(sorted[0].invitees.map((u) => u.id)),
            titles: [sorted[0].title],
            descriptions: [sorted[0].description|| ''],            
        };
        
        const idToRemove = new Set<Number>();

        for (let i = 1; i < sorted.length; i++){
            const event = sorted[i];
            //check for overlapping events
            if (event.startTime <= currentEvent.endTime){
                //merge
                currentEvent.endTime = new Date(Math.max(currentEvent.endTime.getTime(), event.endTime.getTime()));
                event.invitees.forEach((u) => currentEvent.invitees.add(u.id));
                currentEvent.titles.push(event.title);
                if(event.description)
                    currentEvent.descriptions.push(event.description)

                idToRemove.add(sorted[i].id);
                idToRemove.add(sorted[i-1].id);
            }
            else{
                //push current event and move to the next one
                if (idToRemove.has(sorted[i-1].id))
                    mergedEvents.push({...currentEvent});
                currentEvent = {
                    startTime: event.startTime,
                    endTime: event.endTime,
                    invitees: new Set(event.invitees.map((u) => u.id)),
                    titles: [event.title],
                    descriptions: [event.description|| ''],    
                };
            }
        }
        if (idToRemove.has(sorted[sorted.length-1].id))
            mergedEvents.push({...currentEvent});

        await this.eventRepo.remove(user.events.filter(e => idToRemove.has(e.id)));

        //console.log(mergedEvents)

        for(const m of mergedEvents){
            const invitee = await this.userRepo.findBy({id: In([...m.invitees])});
            const newEvent = this.eventRepo.create({
                title: m.titles.join(""),
                description: m.descriptions.join(""),
                startTime: m.startTime,
                endTime: m.endTime,
                status: EventStatus.TODO,
                invitees: invitee
            });

            //console.log(newEvent)
            await this.eventRepo.save(newEvent);
        }

        return this.userRepo.findOne({ where: { id }, relations: ['events', 'events.invitees'] });
    }
}
