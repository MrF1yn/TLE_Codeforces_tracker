import {EmailTemplate, Prisma, PrismaClient} from '@prisma/client';
import { IResponse } from '../../interfaces';
import { CodeforcesService } from '../codeforces.service';
import {EmailService} from "../email";

interface Student {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  rating: number | null;
  codeforcesHandle: string | null;
  lastDataUpdate: Date | null;
  reminderEmailCount: number;
  lastSubmissionDate: Date | null;
}

interface AddStudentData {
  name: string;
  email?: string;
  codeforcesHandle?: string;
    phoneNumber?: string;
}

interface ContestData {
  contests: any[];
  ratingGraph: {
    date: Date;
    rating: number | null;
    contestName: string;
    ratingChange: number | null;
  }[];
  totalContests: number;
}

interface ProblemStats {
  totalProblems: number;
  averageRating: number;
  averageProblemsPerDay: number;
  mostDifficultProblem: {
    name: string;
    rating: number;
    solvedAt: Date;
  } | null;
  ratingBuckets: {
    '800-1000': number;
    '1000-1200': number;
    '1200-1400': number;
    '1400-1600': number;
    '1600-1800': number;
    '1800-2000': number;
    '2000+': number;
  };
  heatmapData: { [date: string]: { total: number; solved: number } };
  recentSubmissions: any[];
}

interface EmailHistoryData {
  emailLogs: any[];
  totalRemindersSent: number;
}

export class StudentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllStudents(page: number, limit: number, search?: string): Promise<IResponse<any>> {
    const skip = (page - 1) * limit;
    try {
      const whereClause = search ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { codeforcesHandle: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      } : {};
      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          skip,
          take: limit,
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            codeforcesHandle: true,
            lastDataUpdate: true,
            reminderEmailCount: true,
            emailReminderEnabled: true,
            phoneNumber: true,
            lastSubmissionDate: true,
            maxRating: true,
            rank: true,
            maxRank: true,
            titlePhoto: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }),
        this.prisma.student.count()
      ]);

      return {
        success: true,
        message: 'Students fetched successfully',
        data: {
          students,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        success: false,
        message: 'Failed to fetch students',
        data: null
      };
    }
  }

  //get student by id
    async getStudentById(studentId: string): Promise<IResponse<Student>> {
        try {
        if (!studentId) {
            return {
            success: false,
            message: 'Student ID is required',
            data: null
            };
        }

        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            codeforcesHandle: true,
            lastDataUpdate: true,
            reminderEmailCount: true,
            emailReminderEnabled: true,
            phoneNumber: true,
            lastSubmissionDate: true,
            maxRating: true,
            rank: true,
            maxRank: true,
            titlePhoto: true
            }
        });

        if (!student) {
            return {
            success: false,
            message: 'Student not found',
            data: null
            };
        }

        return {
            success: true,
            message: 'Student fetched successfully',
            data: student
        };
        } catch (error) {
        console.error('Error fetching student:', error);
        return {
            success: false,
            message: 'Failed to fetch student',
            data: null
        };
        }
    }

  async addStudent(studentData: AddStudentData): Promise<IResponse<Student>> {
    try {
      if (!studentData.name || studentData.name.trim() === '' || studentData.codeforcesHandle === '') {
        return {
          success: false,
          message: 'Student name is required',
          data: null
        };
      }

      // Check if email already exists (if provided)
      if (studentData.email) {
        const existingEmailStudent = await this.prisma.student.findUnique({
          where: { email: studentData.email }
        });

        if (existingEmailStudent) {
          return {
            success: false,
            message: 'A student with this email already exists',
            data: null
          };
        }
      }

      //check if phone number already exists (if provided)
        if (studentData.phoneNumber) {
            const existingPhoneStudent = await this.prisma.student.findUnique({
            where: { phoneNumber: studentData.phoneNumber }
            });

            if (existingPhoneStudent) {
            return {
                success: false,
                message: 'A student with this phone number already exists',
                data: null
            };
            }
        }

      // Check if codeforces handle already exists (if provided)
      if (studentData.codeforcesHandle) {
        const existingHandleStudent = await this.prisma.student.findUnique({
          where: { codeforcesHandle: studentData.codeforcesHandle }
        });

        if (existingHandleStudent) {
          return {
            success: false,
            message: 'A student with this Codeforces handle already exists',
            data: null
          };
        }
      }

      let newStudent = await this.prisma.student.create({
        data: {
          name: studentData.name.trim(),
          email: studentData.email || null,
            phoneNumber: studentData.phoneNumber || null,
          codeforcesHandle: studentData.codeforcesHandle || null,
          rating: 0,
          emailReminderEnabled: true,
          reminderEmailCount: 0
        },
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          phoneNumber: true,
          codeforcesHandle: true,
          lastDataUpdate: true,
          reminderEmailCount: true,
          lastSubmissionDate: true
        }
      });

      // If codeforces handle is provided, trigger initial sync
      if (studentData.codeforcesHandle) {
        try {
          newStudent = await CodeforcesService.syncStudentData(newStudent.id);
        } catch (syncError) {
          console.warn('Initial sync failed for new student:', syncError);
          // Don't fail the entire operation if sync fails
        }
      }

      return {
        success: true,
        message: 'Student added successfully',
        data: newStudent
      };
    } catch (error) {
      console.error('Error adding student:', error);
      return {
        success: false,
        message: 'Failed to add student',
        data: null
      };
    }
  }

  async deleteStudent(studentId: string): Promise<IResponse<null>> {
    try {
      if (!studentId) {
        return {
          success: false,
          message: 'Student ID is required',
          data: null
        };
      }

      // Check if student exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!existingStudent) {
        return {
          success: false,
          message: 'Student not found',
          data: null
        };
      }

      // Delete the student (cascade will handle related records)
      await this.prisma.student.delete({
        where: { id: studentId }
      });

      return {
        success: true,
        message: 'Student deleted successfully',
        data: null
      };
    } catch (error) {
      console.error('Error deleting student:', error);
      return {
        success: false,
        message: 'Failed to delete student',
        data: null
      };
    }
  }

  async getContestHistory(
      studentId: string,
      days: number,
  ): Promise<IResponse<{
    contests: any[];
    ratingData: { date: string; rating: number }[];
    totalContests: number;
    averageChange: number;
  }>> {
    const cutoffDate = new Date();
    if (days)
      cutoffDate.setDate(cutoffDate.getDate() - days);

    const contests = await this.prisma.contest.findMany({
      where: {
        studentId,
        contestTime: days?{
          gte: cutoffDate
        }: undefined
      },
      orderBy: {
        contestTime: 'desc'
      }
    });

    // Calculate rating progression
    const ratingData = contests
        .sort((a, b) => a.contestTime.getTime() - b.contestTime.getTime())
        .map(c => ({
          date: c.contestTime.toISOString().split('T')[0],
          rating: c.newRating || 0
        }));

    const totalRatingChange = contests.reduce((sum, c) => sum + (c.ratingChange || 0), 0);
    const averageChange = contests.length > 0 ? totalRatingChange / contests.length : 0;

    return {
      success: true,
        message: 'Contest history fetched successfully',
        data: {
          contests,
          ratingData,
          totalContests: contests.length,
          averageChange
        }
    };
  }

  async getProblemStats(
      studentId: string,
      days: number,
  ): Promise<IResponse<{
    totalSolved: number;
    maxRating: number | null;
    avgRating: number | null;
    avgPerDay: number;
    ratingDistribution: { [key: string]: number };
    dailySubmissions: Array<{ date: string; count: number; accepted: number }>;
  }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get problem stats - always apply date filter when days is provided
    const problemStats = await this.prisma.problemStats.findMany({
      where: {
        studentId,
        ...(days > 0 ? {
          date: {
            gte: cutoffDate
          }
        } : {})
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get heatmap data - apply same filtering logic
    const heatmapData = await this.prisma.submissionHeatmap.findMany({
      where: {
        studentId,
        ...(days > 0 ? {
          date: {
            gte: cutoffDate
          }
        } : {})
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Aggregate statistics
    const totalSolved = problemStats.reduce((sum, stat) => sum + stat.totalSolved, 0);
    const maxRating = Math.max(...problemStats.map(s => s.maxRatingSolved || 0), 0) || null;

    const ratingsSum = problemStats
        .filter(s => s.avgRating !== null)
        .reduce((sum, stat) => sum + (stat.avgRating || 0) * stat.totalSolved, 0);
    const avgRating = totalSolved > 0 ? ratingsSum / totalSolved : null;

    // Fix avgPerDay calculation
    const avgPerDay = days > 0 ? totalSolved / days : 0;

    // Rating distribution
    const ratingDistribution: { [key: string]: number } = {};
    const buckets = [
      'rating800', 'rating900', 'rating1000', 'rating1100', 'rating1200',
      'rating1300', 'rating1400', 'rating1500', 'rating1600', 'rating1700',
      'rating1800', 'rating1900', 'rating2000', 'rating2100', 'rating2200',
      'rating2300', 'rating2400Plus', 'ratingUnknown'
    ];

    buckets.forEach(bucket => {
      ratingDistribution[bucket] = problemStats.reduce((sum, stat) => {
        return sum + (stat[bucket as keyof typeof stat] as number || 0);
      }, 0);
    });

    // Daily submissions for heatmap
    const dailySubmissions = heatmapData.map(d => ({
      date: d.date.toISOString().split('T')[0],
      count: d.submissionCount,
      accepted: d.acceptedCount
    }));

    return {
      success: true,
      message: 'Problem stats fetched successfully',
      data: {
        totalSolved,
        maxRating,
        avgRating,
        avgPerDay,
        ratingDistribution,
        dailySubmissions
      }
    };
  }

  //update student
    async updateStudent(studentId: string, updateData: Partial<Student>): Promise<IResponse<Student>> {
        try {
        if (!studentId) {
            return {
            success: false,
            message: 'Student ID is required',
            data: null
            };
        }

        // Validate email if provided
        if (updateData.email) {
            const existingEmailStudent = await this.prisma.student.findUnique({
            where: { email: updateData.email }
            });

            if (existingEmailStudent && existingEmailStudent.id !== studentId) {
            return {
                success: false,
                message: 'A student with this email already exists',
                data: null
            };
            }
        }

        // Validate Codeforces handle if provided
        if (updateData.codeforcesHandle) {
            const existingHandleStudent = await this.prisma.student.findUnique({
            where: { codeforcesHandle: updateData.codeforcesHandle }
            });

            if (existingHandleStudent && existingHandleStudent.id !== studentId) {
            return {
                success: false,
                message: 'A student with this Codeforces handle already exists',
                data: null
            };
            }
        }

        const updatedStudent = await this.prisma.student.update({
            where: { id: studentId },
            data: updateData,
            select: {
              id: true,
              name: true,
              email: true,
              rating: true,
              codeforcesHandle: true,
              lastDataUpdate: true,
              reminderEmailCount: true,
              lastSubmissionDate: true,
              maxRating: true,
              phoneNumber: true,
              rank: true,
              maxRank: true,
              titlePhoto: true
            }
        });

        return {
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        };
        } catch (error) {
        console.error('Error updating student:', error);
        return {
            success: false,
            message: 'Failed to update student',
            data: null
        };
        }
    }



  async updateCodeforcesHandle(studentId: string, codeforcesHandle: string): Promise<IResponse<Student>> {
    try {
      if (!codeforcesHandle) {
        return {
          success: false,
          message: 'Codeforces handle is required',
          data: null
        };
      }

      // Update the handle
      await this.prisma.student.update({
        where: { id: studentId },
        data: { codeforcesHandle }
      });

      // Trigger immediate sync
      const student = await CodeforcesService.syncStudentData(studentId);

      return {
        success: true,
        message: 'Codeforces handle updated and data synced successfully',
        data: student
      };
    } catch (error) {
      console.error('Error updating Codeforces handle:', error);
      return {
        success: false,
        message: 'Failed to update Codeforces handle',
        data: null
      };
    }
  }

  async getEmailTemplate(): Promise<IResponse<Partial<EmailTemplate>>> {
    try {
      const template = await this.prisma.emailTemplate.findFirst({
      });

      if (!template) {
        return {
          success: true,
          message: 'Email template fetched successfully',
          data: {
            subject: '🔔 Time to get back to coding!',
            body: EmailService.emailHtml
          }
        };
      }

      return {
        success: true,
        message: 'Email template fetched successfully',
        data: template
      };
    } catch (error) {
      console.error('Error fetching email template:', error);
      return {
        success: false,
        message: 'Failed to fetch email template',
        data: null
      };
    }

  }

  async updateEmailTemplate(templateData: Partial<EmailTemplate>): Promise<IResponse<EmailTemplate>> {
    try {
      // Delete all existing email templates
      await this.prisma.emailTemplate.deleteMany({});

      // Create a new template with all required fields
      const newTemplate = await this.prisma.emailTemplate.create({
        data: {
          name: templateData.name || 'Default Reminder Template',
          subject: templateData.subject || '🔔 Time to get back to coding!',
          body: templateData.body || EmailService.emailHtml,
        }
      });

      return {
        success: true,
        message: 'Email template updated successfully',
        data: newTemplate
      };
    } catch (error) {
      console.error('Error updating email template:', error);
      return {
        success: false,
        message: 'Failed to update email template',
        data: null
      };
    }
  }


  async toggleEmailReminders(studentId: string, enabled: boolean): Promise<IResponse<null>> {
    try {
      console.log(`Toggling email reminders for student ${studentId} to ${enabled}`);
      await this.prisma.student.update({
        where: { id: studentId },
        data: { emailReminderEnabled: enabled }
      });

      return {
        success: true,
        message: `Email reminders ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: null
      };
    } catch (error) {
      console.error('Error toggling email reminders:', error);
      return {
        success: false,
        message: 'Failed to toggle email reminders',
        data: null
      };
    }
  }

  async getEmailHistory(studentId: string): Promise<IResponse<EmailHistoryData>> {
    try {
      const emailLogs = await this.prisma.emailLog.findMany({
        where: { studentId },
        orderBy: { sentAt: 'desc' },
        take: 50
      });

      const reminderCount = await this.prisma.emailLog.count({
        where: {
          studentId,
          type: 'REMINDER'
        }
      });

      return {
        success: true,
        message: 'Email history fetched successfully',
        data: {
          emailLogs,
          totalRemindersSent: reminderCount
        }
      };
    } catch (error) {
      console.error('Error fetching email history:', error);
      return {
        success: false,
        message: 'Failed to fetch email history',
        data: null
      };
    }
  }

  async syncStudent(studentId: string): Promise<IResponse<null>> {
    try {
      await CodeforcesService.syncStudentData(studentId);

      return {
        success: true,
        message: 'Student data synced successfully',
        data: null
      };
    } catch (error) {
      console.error('Error syncing student:', error);
      return {
        success: false,
        message: 'Failed to sync student data',
        data: null
      };
    }
  }
}