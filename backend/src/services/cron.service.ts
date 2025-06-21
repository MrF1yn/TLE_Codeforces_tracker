// src/services/cronService.ts
import cron, {ScheduledTask} from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { CodeforcesService } from './codeforces.service';
import { EmailService } from './email';

const prisma = new PrismaClient();

export class CronService {
    private static jobs: Map<string, ScheduledTask> = new Map();

    static async initialize() {
        // Load cron configurations from database
        const cronConfigs = await prisma.cronConfig.findMany({
            where: { enabled: true }
        });

        for (const config of cronConfigs) {
            this.scheduleCronJob(config.name, config.cronExpression);
        }

        // Set up default cron jobs if they don't exist
        await this.setupDefaultCronJobs();
    }

    private static async setupDefaultCronJobs() {
        const defaultJobs = [
            {
                name: 'DATA_SYNC',
                cronExpression: '0 2 * * *', // 2 AM daily
                enabled: true
            },
            {
                name: 'INACTIVITY_CHECK',
                cronExpression: '0 3 * * *', // 3 AM daily
                enabled: true
            }
        ];

        for (const job of defaultJobs) {
            await prisma.cronConfig.upsert({
                where: { name: job.name },
                update: {},
                create: job
            });
        }
    }

    static scheduleCronJob(jobName: string, cronExpression: string) {
        // Stop existing job if it exists
        if (this.jobs.has(jobName)) {
            this.jobs.get(jobName)?.stop();
            this.jobs.delete(jobName);
        }

        // Validate cron expression
        if (!cron.validate(cronExpression)) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }

        const task = cron.schedule(cronExpression, async () => {
            console.log(`Running cron job: ${jobName}`);

            try {
                await this.updateCronRunTime(jobName, 'start');

                switch (jobName) {
                    case 'DATA_SYNC':
                        await this.runDataSync();
                        break;
                    case 'INACTIVITY_CHECK':
                        await this.runInactivityCheck();
                        break;
                    default:
                        console.log(`Unknown cron job: ${jobName}`);
                }

                await this.updateCronRunTime(jobName, 'complete');
                console.log(`Completed cron job: ${jobName}`);
            } catch (error) {
                console.error(`Error in cron job ${jobName}:`, error);
            }
        }, {
            // scheduled: false
        });

        this.jobs.set(jobName, task);
        task.start();

        console.log(`Scheduled cron job: ${jobName} with expression: ${cronExpression}`);
    }

    private static async updateCronRunTime(jobName: string, status: 'start' | 'complete') {
        const now = new Date();

        if (status === 'start') {
            await prisma.cronConfig.update({
                where: { name: jobName },
                data: { lastRun: now }
            });
        } else {
            // Calculate next run time based on cron expression
            const config = await prisma.cronConfig.findUnique({
                where: { name: jobName }
            });

            if (config) {
                const nextRun = this.getNextRunTime(config.cronExpression);
                await prisma.cronConfig.update({
                    where: { name: jobName },
                    data: { nextRun }
                });
            }
        }
    }

    private static getNextRunTime(cronExpression: string): Date {
        // This is a simplified implementation
        // For production, consider using a proper cron parser library
        const now = new Date();
        const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

        const nextRun = new Date(now);

        if (hour !== '*') {
            const targetHour = parseInt(hour);
            nextRun.setHours(targetHour, parseInt(minute) || 0, 0, 0);

            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
        }

        return nextRun;
    }

    private static async runDataSync() {
        console.log('Starting data sync for all students...');
        await CodeforcesService.syncAllStudents();
        console.log('Data sync completed');
    }

    private static async runInactivityCheck() {
        console.log('Starting inactivity check...');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const inactiveStudents = await prisma.student.findMany({
            where: {
                emailReminderEnabled: true,
                OR: [
                    {
                        lastSubmissionDate: {
                            lt: sevenDaysAgo
                        }
                    },
                    {
                        lastSubmissionDate: null
                    }
                ]
            }
        });

        console.log(`Found ${inactiveStudents.length} inactive students`);

        for (const student of inactiveStudents) {
            try {
                await EmailService.sendReminderEmail(student);

                // Update reminder count
                await prisma.student.update({
                    where: { id: student.id },
                    data: { reminderEmailCount: { increment: 1 } }
                });

                console.log(`Sent reminder email to ${student.name}`);
            } catch (error) {
                console.error(`Failed to send reminder to ${student.name}:`, error);
            }
        }

        console.log('Inactivity check completed');
    }

    // Update cron job configuration
    static async updateCronConfig(jobName: string, cronExpression: string, enabled: boolean = true) {
        // Validate cron expression
        if (!cron.validate(cronExpression)) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }

        // Update database
        await prisma.cronConfig.upsert({
            where: { name: jobName },
            update: {
                cronExpression,
                enabled,
                nextRun: enabled ? this.getNextRunTime(cronExpression) : null
            },
            create: {
                name: jobName,
                cronExpression,
                enabled,
                nextRun: enabled ? this.getNextRunTime(cronExpression) : null
            }
        });

        // Reschedule the job
        if (enabled) {
            this.scheduleCronJob(jobName, cronExpression);
        } else {
            this.stopCronJob(jobName);
        }

        console.log(`Updated cron job: ${jobName} with expression: ${cronExpression}, enabled: ${enabled}`);
    }

    static stopCronJob(jobName: string) {
        if (this.jobs.has(jobName)) {
            this.jobs.get(jobName)?.stop();
            this.jobs.delete(jobName);
            console.log(`Stopped cron job: ${jobName}`);
        }
    }

    static async getCronConfigs() {
        return await prisma.cronConfig.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async enableCronJob(jobName: string) {
        console.log(`Enabling cron job: ${jobName}`);
        const config = await prisma.cronConfig.findUnique({
            where: { name: jobName }
        });

        if (!config) {
            throw new Error(`Cron job ${jobName} not found`);
        }

        await this.updateCronConfig(jobName, config.cronExpression, true);
    }

    static async disableCronJob(jobName: string) {
        console.log(`Disabling cron job: ${jobName}`);
        await prisma.cronConfig.update({
            where: { name: jobName },
            data: {
                enabled: false,
                nextRun: null
            }
        });

        this.stopCronJob(jobName);
    }

    // Manual trigger for cron jobs
    static async triggerJob(jobName: string) {
        console.log(`Manually triggering cron job: ${jobName}`);

        try {
            await this.updateCronRunTime(jobName, 'start');
            switch (jobName) {
                case 'DATA_SYNC':
                    await this.runDataSync();
                    break;
                case 'INACTIVITY_CHECK':
                    await this.runInactivityCheck();
                    break;
                default:
                    throw new Error(`Unknown cron job: ${jobName}`);
            }
            console.log(`Manual trigger completed for: ${jobName}`);
            await this.updateCronRunTime(jobName, 'complete');
        } catch (error) {
            console.error(`Error in manual trigger for ${jobName}:`, error);
            throw error;
        }
    }
}