
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Job, JobDocument } from '../schema/job.schema';
import { logToFile } from 'utils/logger';

@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);
    private isProcessing = false;

    constructor(
        @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    ) { }

    @Cron(CronExpression.EVERY_SECOND)
    async handleCron() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        try {
            const job = await this.jobModel.findOneAndUpdate(
                { status: 'pending' },
                { status: 'processing' },
                { sort: { createdAt: 1 }, new: true },
            );

            if (job) {
                this.logger.log(`Processing job ${job._id}: ${job.type}`);
                await this.processJob(job);
            }
        } catch (error) {
            this.logger.error('Error processing job', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processJob(job: JobDocument) {
        try {
            // Simulate heavy processing
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (job.type === 'user.created') {
                const message = `[Worker] Welcome email sent to ${job.payload.email} (User ID: ${job.payload.userId})`;
                console.log(message);
                void logToFile(message, 'worker');
            } else if (job.type === 'user.login') {
                const message = `[Worker] User logged in: ${job.payload.userId}`;
                console.log(message);
                void logToFile(message, 'worker');
            }

            await this.jobModel.updateOne(
                { _id: job._id },
                { status: 'completed', result: 'Success' },
            );
        } catch (error: any) {
            await this.jobModel.updateOne(
                { _id: job._id },
                { status: 'failed', error: error.message },
            );
        }
    }
}
