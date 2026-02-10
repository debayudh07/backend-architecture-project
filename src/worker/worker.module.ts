
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Job, JobSchema } from '../schema/job.schema';
import { WorkerService } from './worker.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
        ScheduleModule.forRoot(),
    ],
    providers: [WorkerService],
    exports: [WorkerService],
})
export class WorkerModule { }
