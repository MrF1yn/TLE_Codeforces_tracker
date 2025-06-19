import { Router } from 'express';
import {CronController} from "../../controllers";

export class CronRoute {
    public router: Router;
    private cronController: CronController;

    constructor() {
        this.router = Router();
        this.cronController = new CronController();

        this.initializeRoutes();
    }

    private initializeRoutes() {
        // this.router.get('/', this.participantController.getProfile);
        this.router.get('/configs', this.cronController.getCronConfigs);
        this.router.post('/:jobName/enable', this.cronController.enableCronJob);
        this.router.post('/:jobName/disable', this.cronController.disableCronJob);
        this.router.post('/:jobName/trigger', this.cronController.triggerCronJob);
        this.router.put('/:jobName', this.cronController.updateCronConfig);

    }
}