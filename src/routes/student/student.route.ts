import {Router} from "express";
import {StudentController} from "../../controllers/student";

export class StudentRoute {
  public router: Router;
  private studentController: StudentController;

  constructor() {
    this.router = Router();
    this.studentController = new StudentController();

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/students', this.studentController.getAllStudents);
    this.router.post('/students', this.studentController.addStudent);
    this.router.get('/emailTemplate', this.studentController.getEmailTemplate);
    this.router.put('/emailTemplate', this.studentController.updateEmailTemplate);
    this.router.delete('/students/:studentId', this.studentController.deleteStudent);
    this.router.get('/students/:studentId/contests', this.studentController.getContestHistory);
    this.router.get('/students/:studentId/problems', this.studentController.getProblemStats);
    this.router.get('/students/:studentId/emails', this.studentController.getEmailHistory);
    this.router.put('/students/:studentId/codeforces', this.studentController.updateCodeforcesHandle);
    this.router.put('/students/:studentId/update', this.studentController.updateStudent);
    this.router.put('/students/:studentId/email-reminders', this.studentController.toggleEmailReminders);
    this.router.post('/students/:studentId/sync', this.studentController.syncStudent);
  }
}