import { NextFunction, Request, Response } from 'express';

import {MethodBinder} from "../../utils";
import {StudentService} from "../../services";


export class StudentController {
  private studentService: StudentService;

  constructor() {
    MethodBinder.bind(this);
    this.studentService = new StudentService();
  }

  async getAllStudents(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string || '';
      const result = await this.studentService.getAllStudents(page, limit, search);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getContestHistory(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const { days } = req.query;

      const result = await this.studentService.getContestHistory(
          studentId,
          days ? parseInt(days as string) : 30
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProblemStats(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const { days } = req.query;

      const result1 = await this.studentService.getProblemStats(
          studentId,
          7,
      );
      const result2 = await this.studentService.getProblemStats(
          studentId,
          30,
      );
      const result3 = await this.studentService.getProblemStats(
          studentId,
          90,
      );
      const result4 = await this.studentService.getProblemStats(
          studentId,
          0,
      );
      res.status(200).json([result1, result2, result3, result4]);
    } catch (error) {
      next(error);
    }
  }

  //update student
    async updateStudent(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
        const { studentId } = req.params;
        const { name, email, codeforcesHandle, phoneNumber } = req.body;

        const result = await this.studentService.updateStudent(
            studentId, {
              name,
              email,
              codeforcesHandle,
              phoneNumber
            }
        );
        res.status(200).json(result);
        } catch (error) {
        next(error);
        }
    }

  async updateCodeforcesHandle(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const { codeforcesHandle } = req.body;

      const result = await this.studentService.updateCodeforcesHandle(
          studentId,
          codeforcesHandle
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleEmailReminders(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const { enabled } = req.body;

      const result = await this.studentService.toggleEmailReminders(
          studentId,
          enabled
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEmailTemplate(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
        const result = await this.studentService.getEmailTemplate();
        res.status(200).json(result);
        } catch (error) {
        next(error);
        }
    }

  async updateEmailTemplate(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
    try {
      const { subject, body } = req.body;

      const result = await this.studentService.updateEmailTemplate({
        subject,
        body
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEmailHistory(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;

      const result = await this.studentService.getEmailHistory(studentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async syncStudent(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;

      const result = await this.studentService.syncStudent(studentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async addStudent(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email, codeforcesHandle } = req.body;

      const result = await this.studentService.addStudent({
        name,
        email,
        codeforcesHandle
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(
      req: Request,
      res: Response,
      next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId } = req.params;

      const result = await this.studentService.deleteStudent(studentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}