import nodemailer from 'nodemailer';
import { PrismaClient, Student } from '@prisma/client';

const prisma = new PrismaClient();

export class EmailService {
    private static transporter: nodemailer.Transporter;
    static emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Time to Get Back to Coding! 🚀</h1>
          </div>
          <div class="content">
            <h2>Hi {{studentName}}</h2>
            <p>We noticed you haven't submitted any solutions on Codeforces in the last 7 days. Consistent practice is key to improving your programming skills!</p>
            
            <p>Here are some suggestions to get back on track:</p>
            <ul>
              <li>Start with easier problems to build momentum</li>
              <li>Set a daily goal (even 1 problem per day makes a difference)</li>
              <li>Review your recent submissions and learn from mistakes</li>
              <li>Try problems from different topics to expand your knowledge</li>
            </ul>
            
            <p>Remember, every expert was once a beginner. Keep pushing forward!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com/problemset" class="button">Start Solving Problems</a>
            </div>
          </div>
          <div class="footer">
            <p>Happy coding!<br>Your Programming Team</p>
            <p><small>If you don't want to receive these reminders, please contact your instructor.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
    static async initialize() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        try {
            await this.transporter.verify();
            console.log('Email service initialized successfully');
        } catch (error) {
            console.error('Email service initialization failed:', error);
        }
    }

    static async sendReminderEmail(student: Student): Promise<void> {
        if (!student.email) {
            throw new Error('Student email not found');
        }

        const template = await prisma.emailTemplate.findFirst({
            orderBy: { updatedAt: 'desc' }
        }) || {
            subject: '🔔 Time to get back to coding!',
            body: EmailService.emailHtml
        };
        //{{studentName}}
        // {{currentRating}}
        // {{maxRating}}
        // {{lastActivity}}
        // {{codeforcesHandle}}
        // {{email}}

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: template.subject.replace('{{studentName}}', student.name || 'Student')
                .replace('{studentName}', student.name || 'Student')
                .replace('{{currentRating}}', student.rating?.toString() || '')
                .replace('{{maxRating}}', student.maxRating?.toString() || '')
                .replace('{{lastActivity}}', student.lastSubmissionDate?.toLocaleDateString() || '')
                .replace('{{codeforcesHandle}}', student.codeforcesHandle || '')
                .replace('{{email}}', student.email || '')
            ,
            html: template.body.replace('{{studentName}}', student.name || 'Student')
                .replace('{studentName}', student.name || 'Student')
                .replace('{{currentRating}}', student.rating?.toString() || '')
                .replace('{{maxRating}}', student.maxRating?.toString() || '')
                .replace('{{lastActivity}}', student.lastSubmissionDate?.toLocaleDateString() || '')
                .replace('{{codeforcesHandle}}', student.codeforcesHandle || '')
                .replace('{{email}}', student.email || '')
        };


        try {
            await this.transporter.sendMail(mailOptions);

            // Log the email
            await this.logEmail(student.id, 'REMINDER', true);

            console.log(`Reminder email sent to ${student.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${student.email}:`, error);

            // Log the failed attempt
            await this.logEmail(student.id, 'REMINDER', false, error instanceof Error ? error.message : 'Unknown error');

            throw error;
        }
    }

    static async sendWelcomeEmail(student: Student): Promise<void> {
        if (!student.email) {
            throw new Error('Student email not found');
        }

        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Programming Platform! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name}!</h2>
            <p>Welcome to our programming tracking system! We're excited to help you on your coding journey.</p>
            
            <p>Here's what you can expect:</p>
            <ul>
              <li>Daily sync of your Codeforces submissions</li>
              <li>Detailed progress tracking and analytics</li>
              <li>Friendly reminders to keep you motivated</li>
              <li>Performance insights to help you improve</li>
            </ul>
            
            <p>Make sure your Codeforces handle is correctly set up so we can track your progress!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com" class="button">Visit Codeforces</a>
            </div>
          </div>
          <div class="footer">
            <p>Happy coding!<br>Your Programming Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: '🎉 Welcome to the Programming Platform!',
            html: emailHtml
        };

        try {
            await this.transporter.sendMail(mailOptions);
            await this.logEmail(student.id, 'WELCOME', true);
            console.log(`Welcome email sent to ${student.email}`);
        } catch (error) {
            console.error(`Failed to send welcome email to ${student.email}:`, error);
            await this.logEmail(student.id, 'WELCOME', false, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    private static async logEmail(studentId: string, type: string, success: boolean, errorMessage?: string) {
        await prisma.emailLog.create({
            data: {
                studentId,
                type,
                success,
                errorMessage
            }
        });
    }

    static async getEmailStats() {
        const totalEmails = await prisma.emailLog.count();
        const successfulEmails = await prisma.emailLog.count({
            where: { success: true }
        });
        const failedEmails = await prisma.emailLog.count({
            where: { success: false }
        });

        const reminderEmails = await prisma.emailLog.count({
            where: { type: 'REMINDER' }
        });

        const recentEmails = await prisma.emailLog.findMany({
            take: 10,
            orderBy: { sentAt: 'desc' },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return {
            totalEmails,
            successfulEmails,
            failedEmails,
            reminderEmails,
            successRate: totalEmails > 0 ? (successfulEmails / totalEmails) * 100 : 0,
            recentEmails
        };
    }
}