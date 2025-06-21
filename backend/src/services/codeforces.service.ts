import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CodeforcesUser {
    handle: string;
    rating?: number;
    maxRating?: number;
    email?: string;
    rank?: string;
    maxRank?: string;
    titlePhoto?: string;
}
export interface CodeforcesProblem {
    contestId: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
}


interface CodeforcesContest {
    id: number;
    contestId: number;
    creationTimeSeconds: number;
    relativeTimeSeconds: number;
    problem: CodeforcesProblem;
    author: {
        contestId: number;
        members: Array<{ handle: string }>;
        participantType: string;
        ghost: boolean;
        room?: number;
        startTimeSeconds: number;
    };
    programmingLanguage: string;
    verdict: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
}

interface CodeforcesRatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

interface DailyStats {
    date: string;
    totalSolved: number;
    maxRating: number | null;
    avgRating: number | null;
    ratingBuckets: { [key: string]: number };
    submissionCount: number;
    acceptedCount: number;
}

interface ContestProblemsData {
    contestId: number;
    totalProblems: number;
    problemsSolved: number;
    hardestRatingProblem:CodeforcesProblem | null;
}

export class CodeforcesService {
    private static readonly BASE_URL = 'https://codeforces.com/api';
    private static readonly RATE_LIMIT_DELAY = 1000;

    private static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private static async makeRequest<T>(url: string): Promise<T> {
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'StudentProfileApp/1.0'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Codeforces API error: ${response.data.comment}`);
            }

            return response.data.result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Request failed: ${error.message}`);
            }
            throw error;
        }
    }

    static async getUserInfo(handle: string): Promise<CodeforcesUser | null> {
        try {
            const users = await this.makeRequest<CodeforcesUser[]>(
                `${this.BASE_URL}/user.info?handles=${handle}`
            );
            return users[0] || null;
        } catch (error) {
            console.error(`Failed to fetch user info for ${handle}:`, error);
            return null;
        }
    }

    static async getUserSubmissions(handle: string, from: number = 1, count: number = 100000): Promise<CodeforcesContest[]> {
        try {
            return await this.makeRequest<CodeforcesContest[]>(
                `${this.BASE_URL}/user.status?handle=${handle}&from=${from}&count=${count}`
            );
        } catch (error) {
            console.error(`Failed to fetch submissions for ${handle}:`, error);
            return [];
        }
    }

    static async getUserRating(handle: string): Promise<CodeforcesRatingChange[]> {
        try {
            return await this.makeRequest<CodeforcesRatingChange[]>(
                `${this.BASE_URL}/user.rating?handle=${handle}`
            );
        } catch (error) {
            console.error(`Failed to fetch rating for ${handle}:`, error);
            return [];
        }
    }

    // NEW: Get contest problems data
    static async getContestProblems(contestId: number): Promise<any[]> {
        try {
            return await this.makeRequest<any[]>(
                `${this.BASE_URL}/contest.standings?contestId=${contestId}&from=1&count=1&showUnofficial=true`
            );
        } catch (error) {
            console.error(`Failed to fetch contest ${contestId} problems:`, error);
            return [];
        }
    }

    private static getRatingBucket(rating: number | undefined): string {
        if (!rating) return 'ratingUnknown';
        if (rating < 900) return 'rating800';
        if (rating < 1000) return 'rating900';
        if (rating < 1100) return 'rating1000';
        if (rating < 1200) return 'rating1100';
        if (rating < 1300) return 'rating1200';
        if (rating < 1400) return 'rating1300';
        if (rating < 1500) return 'rating1400';
        if (rating < 1600) return 'rating1500';
        if (rating < 1700) return 'rating1600';
        if (rating < 1800) return 'rating1700';
        if (rating < 1900) return 'rating1800';
        if (rating < 2000) return 'rating1900';
        if (rating < 2100) return 'rating2000';
        if (rating < 2200) return 'rating2100';
        if (rating < 2300) return 'rating2200';
        if (rating < 2400) return 'rating2300';
        return 'rating2400Plus';
    }

    private static formatDate(timestamp: number): string {
        return new Date(timestamp * 1000).toISOString().split('T')[0];
    }

    // NEW: Calculate contest problems data from submissions
    private static calculateContestProblemsData(
        submissions: CodeforcesContest[],
        ratingChanges: CodeforcesRatingChange[]
    ): Map<number, ContestProblemsData> {
        const contestProblemsMap = new Map<number, ContestProblemsData>();

        // Initialize contest data from rating changes
        ratingChanges.forEach(change => {
            contestProblemsMap.set(change.contestId, {
                contestId: change.contestId,
                totalProblems: 0,
                problemsSolved: 0,
                hardestRatingProblem: null
            });
        });

        // Group submissions by contest
        const contestSubmissions = new Map<number, CodeforcesContest[]>();

        submissions.forEach(submission => {
            if (submission.contestId && contestProblemsMap.has(submission.contestId)) {
                if (!contestSubmissions.has(submission.contestId)) {
                    contestSubmissions.set(submission.contestId, []);
                }
                contestSubmissions.get(submission.contestId)!.push(submission);
            }
        });

        // Calculate problems data for each contest
        contestSubmissions.forEach((contestSubs, contestId) => {
            const contestData = contestProblemsMap.get(contestId)!;

            // Get unique problems in this contest
            const uniqueProblems = new Set<string>();
            const solvedProblems = new Set<string>();
            let hardestRatingProblem:any = null;
            contestSubs.forEach(sub => {
                const problemKey = `${sub.problem.contestId}${sub.problem.index}`;
                uniqueProblems.add(problemKey);

                if (sub.verdict === 'OK') {
                    solvedProblems.add(problemKey);
                }
                if (sub.problem.rating) {
                    if (hardestRatingProblem === null || sub.problem.rating > hardestRatingProblem.rating) {
                        hardestRatingProblem = sub.problem;
                    }
                }
            });

            contestData.totalProblems = uniqueProblems.size;
            contestData.problemsSolved = solvedProblems.size;
            contestData.hardestRatingProblem = hardestRatingProblem ? hardestRatingProblem.rating : null;
        });

        return contestProblemsMap;
    }

    private static calculateDailyStats(submissions: CodeforcesContest[]): Map<string, DailyStats> {
        const dailyStats = new Map<string, DailyStats>();
        const solvedProblems = new Set<string>();
        const problemSolvedDates = new Map<string, string>(); // Track when each problem was first solved

        // Sort submissions by time to process chronologically
        const sortedSubmissions = submissions.sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

        // First pass: determine when each problem was first solved
        for (const submission of sortedSubmissions) {
            if (submission.verdict === 'OK') {
                const problemId = `${submission.problem.contestId}${submission.problem.index}`;
                const date = this.formatDate(submission.creationTimeSeconds);

                if (!problemSolvedDates.has(problemId)) {
                    problemSolvedDates.set(problemId, date);
                }
            }
        }

        // Second pass: build daily stats
        for (const submission of sortedSubmissions) {
            const date = this.formatDate(submission.creationTimeSeconds);
            const problemId = `${submission.problem.contestId}${submission.problem.index}`;

            if (!dailyStats.has(date)) {
                dailyStats.set(date, {
                    date,
                    totalSolved: 0,
                    maxRating: null,
                    avgRating: null,
                    ratingBuckets: {
                        rating800: 0, rating900: 0, rating1000: 0, rating1100: 0,
                        rating1200: 0, rating1300: 0, rating1400: 0, rating1500: 0,
                        rating1600: 0, rating1700: 0, rating1800: 0, rating1900: 0,
                        rating2000: 0, rating2100: 0, rating2200: 0, rating2300: 0,
                        rating2400Plus: 0, ratingUnknown: 0
                    },
                    submissionCount: 0,
                    acceptedCount: 0
                });
            }

            const stats = dailyStats.get(date)!;
            stats.submissionCount++;

            if (submission.verdict === 'OK') {
                stats.acceptedCount++;

                // Only count as solved on the day it was FIRST solved
                const firstSolvedDate = problemSolvedDates.get(problemId);
                if (firstSolvedDate === date && !solvedProblems.has(problemId)) {
                    solvedProblems.add(problemId);
                    stats.totalSolved++;

                    const rating = submission.problem.rating;
                    if (rating) {
                        stats.maxRating = Math.max(stats.maxRating || 0, rating);
                        const bucket = this.getRatingBucket(rating);
                        stats.ratingBuckets[bucket]++;
                    } else {
                        stats.ratingBuckets.ratingUnknown++;
                    }

                    console.log(`New problem solved: ${problemId} on ${date} (rating: ${rating || 'unknown'})`);
                }
            }
        }

        // Calculate average ratings
        for (const [date, stats] of dailyStats) {
            if (stats.totalSolved > 0) {
                const totalRated = Object.entries(stats.ratingBuckets)
                    .filter(([bucket]) => bucket !== 'ratingUnknown')
                    .reduce((sum, [bucket, count]) => {
                        const bucketRating = this.getBucketAverageRating(bucket);
                        return sum + (bucketRating * count);
                    }, 0);

                const ratedProblems = stats.totalSolved - stats.ratingBuckets.ratingUnknown;
                stats.avgRating = ratedProblems > 0 ? totalRated / ratedProblems : null;
            }
        }

        return dailyStats;
    }

    private static getBucketAverageRating(bucket: string): number {
        const bucketMap: { [key: string]: number } = {
            rating800: 850, rating900: 950, rating1000: 1050, rating1100: 1150,
            rating1200: 1250, rating1300: 1350, rating1400: 1450, rating1500: 1550,
            rating1600: 1650, rating1700: 1750, rating1800: 1850, rating1900: 1950,
            rating2000: 2050, rating2100: 2150, rating2200: 2250, rating2300: 2350,
            rating2400Plus: 2500
        };
        return bucketMap[bucket] || 0;
    }

    static async syncStudentData(studentId: string): Promise<any> {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                name: true,
                codeforcesHandle: true,
                lastDataUpdate: true
            }
        });

        if (!student || !student.codeforcesHandle) {
            throw new Error('Student not found or no Codeforces handle');
        }

        console.log(`Starting sync for student: ${student.name} (${student.codeforcesHandle})`);

        // Fetch all data
        const userInfo = await this.getUserInfo(student.codeforcesHandle);
        if (!userInfo) {
            throw new Error(`User ${student.codeforcesHandle} not found on Codeforces`);
        }

        const submissions = await this.getUserSubmissions(student.codeforcesHandle);
        const ratingChanges = await this.getUserRating(student.codeforcesHandle);

        // Process data
        await this.processAggregatedData(studentId, submissions, ratingChanges);

        // Update student info
        const lastSubmission = submissions.length > 0
            ? new Date(Math.max(...submissions.map(s => s.creationTimeSeconds * 1000)))
            : null;

        const student1 = await prisma.student.update({
            where: { id: studentId },
            data: {
                rating: userInfo.rating || 0,
                lastDataUpdate: new Date(),
                maxRating: userInfo.maxRating || 0,
                maxRank: userInfo.maxRank || '',
                rank: userInfo.rank || '',
                ...(userInfo.email ? { email: userInfo.email } : {}),
                titlePhoto: userInfo.titlePhoto || '',
                lastSubmissionDate: lastSubmission
            }
        });

        console.log(`Sync completed for student: ${student.name}`);
        return student1;
    }

    private static async processAggregatedData(
        studentId: string,
        submissions: CodeforcesContest[],
        ratingChanges: CodeforcesRatingChange[]
    ): Promise<void> {
        // Process contest data with problems information
        await this.processContestData(studentId, ratingChanges, submissions);

        // Calculate and store daily statistics
        const dailyStats = this.calculateDailyStats(submissions);
        await this.storeDailyStats(studentId, dailyStats);
    }

    private static async processContestData(
        studentId: string,
        ratingChanges: CodeforcesRatingChange[],
        submissions: CodeforcesContest[]
    ): Promise<void> {
        if (ratingChanges.length === 0) return;

        // Calculate contest problems data
        const contestProblemsData = this.calculateContestProblemsData(submissions, ratingChanges);

        // Clear existing contest data for this student
        await prisma.contest.deleteMany({
            where: { studentId }
        });

        // Insert new contest data with problems information
        const contestsData = ratingChanges.map(change => {
            const problemsData = contestProblemsData.get(change.contestId);

            return {
                studentId,
                codeforcesId: change.contestId,
                name: change.contestName,
                participantType: 'CONTESTANT',
                rank: change.rank,
                oldRating: change.oldRating,
                newRating: change.newRating,
                ratingChange: change.newRating - change.oldRating,
                contestTime: new Date(change.ratingUpdateTimeSeconds * 1000),
                totalProblems: problemsData?.totalProblems || 0,
                problemsSolved: problemsData?.problemsSolved || 0,
                hardestRatingProblem: JSON.stringify(problemsData?.hardestRatingProblem) || null
            };
        });

        await this.batchProcess(contestsData, 50, async (batch) => {
            await prisma.contest.createMany({
                data: batch
            });
        });

        console.log(`Processed ${contestsData.length} contests with problems data`);
    }

    private static async storeDailyStats(
        studentId: string,
        dailyStats: Map<string, DailyStats>
    ): Promise<void> {
        if (dailyStats.size === 0) return;

        // Clear existing stats for this student
        await prisma.problemStats.deleteMany({
            where: { studentId }
        });

        await prisma.submissionHeatmap.deleteMany({
            where: { studentId }
        });

        // Prepare data for batch insert
        const problemStatsData: any[] = [];
        const heatmapData: any[] = [];

        for (const [dateStr, stats] of dailyStats) {
            const date = new Date(dateStr);

            // Problem stats
            problemStatsData.push({
                studentId,
                date,
                totalSolved: stats.totalSolved,
                maxRatingSolved: stats.maxRating,
                avgRating: stats.avgRating,
                ...stats.ratingBuckets
            });

            // Heatmap data
            heatmapData.push({
                studentId,
                date,
                submissionCount: stats.submissionCount,
                acceptedCount: stats.acceptedCount
            });
        }

        // Batch insert
        await this.batchProcess(problemStatsData, 100, async (batch) => {
            await prisma.problemStats.createMany({
                data: batch
            });
        });

        await this.batchProcess(heatmapData, 100, async (batch) => {
            await prisma.submissionHeatmap.createMany({
                data: batch
            });
        });
    }

    private static async batchProcess<T>(
        items: T[],
        batchSize: number,
        processor: (batch: T[]) => Promise<void>
    ): Promise<void> {
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            await processor(batch);
        }
    }

    static async syncAllStudents(): Promise<void> {
        const students = await prisma.student.findMany({
            where: {
                codeforcesHandle: {
                    not: null
                }
            },
            select: {
                id: true,
                name: true,
                codeforcesHandle: true
            }
        });

        console.log(`Starting sync for ${students.length} students`);

        // Process students in batches to avoid overwhelming the API
        const STUDENT_BATCH_SIZE = 3;

        for (let i = 0; i < students.length; i += STUDENT_BATCH_SIZE) {
            const batch = students.slice(i, i + STUDENT_BATCH_SIZE);

            await Promise.allSettled(
                batch.map(async (student) => {
                    try {
                        await this.syncStudentData(student.id);
                    } catch (error) {
                        console.error(`Failed to sync student ${student.name}:`, error);
                    }
                })
            );

            // Add delay between batches
            if (i + STUDENT_BATCH_SIZE < students.length) {
                await this.delay(3000);
            }
        }

        console.log('Sync completed for all students');
    }

    // Analytics methods for dashboard
    static async getContestHistory(
        studentId: string,
        days: number = 365
    ): Promise<{
        contests: any[];
        ratingData: { date: string; rating: number }[];
        totalContests: number;
        averageChange: number;
        totalProblemsSolved: number;
        averageProblemsPerContest: number;
    }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const contests = await prisma.contest.findMany({
            where: {
                studentId,
                contestTime: {
                    gte: cutoffDate
                }
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

        const totalProblemsSolved = contests.reduce((sum, c) => sum + c.problemsSolved, 0);
        const averageProblemsPerContest = contests.length > 0 ? totalProblemsSolved / contests.length : 0;

        return {
            contests,
            ratingData,
            totalContests: contests.length,
            averageChange,
            totalProblemsSolved,
            averageProblemsPerContest
        };
    }

    static async getProblemSolvingData(
        studentId: string,
        days: number = 90
    ): Promise<{
        totalSolved: number;
        maxRating: number | null;
        avgRating: number | null;
        avgPerDay: number;
        ratingDistribution: { [key: string]: number };
        dailySubmissions: Array<{ date: string; count: number; accepted: number }>;
    }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Get problem stats
        const problemStats = await prisma.problemStats.findMany({
            where: {
                studentId,
                date: {
                    gte: cutoffDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Get heatmap data
        const heatmapData = await prisma.submissionHeatmap.findMany({
            where: {
                studentId,
                date: {
                    gte: cutoffDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Now totalSolved represents NEW problems solved each day, so sum is correct
        const totalSolved = problemStats.reduce((sum, stat) => sum + stat.totalSolved, 0);
        const maxRating = Math.max(...problemStats.map(s => s.maxRatingSolved || 0), 0) || null;

        const ratingsSum = problemStats
            .filter(s => s.avgRating !== null)
            .reduce((sum, stat) => sum + (stat.avgRating || 0) * stat.totalSolved, 0);
        const avgRating = totalSolved > 0 ? ratingsSum / totalSolved : null;

        const avgPerDay = totalSolved / days;

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
            totalSolved,
            maxRating,
            avgRating,
            avgPerDay,
            ratingDistribution,
            dailySubmissions
        };
    }
}