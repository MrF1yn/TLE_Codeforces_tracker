import { NextFunction, Request, Response } from 'express';
import { CronService } from '../services';
import { MethodBinder } from '../utils';

export class CronController {

    constructor() {
        MethodBinder.bind(this);
    }

    async getCronConfigs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const configs = await CronService.getCronConfigs();
            res.json({ success: true, data: configs });
        } catch (error) {
            next(error);
        }
    }

    async updateCronConfig(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { jobName } = req.params;
            const { cronExpression, enabled } = req.body;

            if (!cronExpression) {
                 res.status(400).json({
                    success: false,
                    error: 'Cron expression is required'
                });
                 return ;
            }

            await CronService.updateCronConfig(jobName, cronExpression, enabled);
            res.json({
                success: true,
                message: `Cron job ${jobName} updated successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    async enableCronJob(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { jobName } = req.params;
            await CronService.enableCronJob(jobName);
            res.json({
                success: true,
                message: `Cron job ${jobName} enabled successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    async disableCronJob(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { jobName } = req.params;
            await CronService.disableCronJob(jobName);
            res.json({
                success: true,
                message: `Cron job ${jobName} disabled successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    async triggerCronJob(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { jobName } = req.params;

            // Run the job in background to avoid request timeout
            CronService.triggerJob(jobName).catch(error => {
                console.error(`Background job ${jobName} failed:`, error);
            });

            res.json({
                success: true,
                message: `Cron job ${jobName} triggered successfully`
            });
        } catch (error) {
            next(error);
        }
    }
}