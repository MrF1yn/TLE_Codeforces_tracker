// src/requests.ts
import axios from 'axios';
import {type Student, type TimePeriodStats, useStudentStore} from '../stores/useStudentStore';

// API response types
interface StudentResponse {
    id: string;
    name: string;
    email: string;
    rating: number;
    codeforcesHandle: string;
    lastDataUpdate: string;
    reminderEmailCount: number;
    lastSubmissionDate: string;
    emailReminderEnabled: boolean;
    maxRating: number;
    phoneNumber: string | null;
    rank: string;
    maxRank: string;
    titlePhoto: string | null;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        students: StudentResponse[];
        total: number;
        page: number;
        totalPages: number;
    };
}

// Contest related interfaces
interface ContestResponse {
    id: string;
    studentId: string;
    codeforcesId: number;
    name: string;
    participantType: string;
    rank: number;
    oldRating: number;
    newRating: number;
    ratingChange: number;
    problemsSolved: number;
    totalProblems: number;
    contestTime: string;
    createdAt: string;
}

interface RatingDataPoint {
    date: string;
    rating: number;
}

interface ContestApiResponse {
    success: boolean;
    message: string;
    data: {
        contests: ContestResponse[];
        ratingData: RatingDataPoint[];
        totalContests: number;
        averageChange: number;
    };
}

// Problem related interfaces
interface DailySubmission {
    date: string;
    count: number;
    accepted: number;
}

interface RatingDistribution {
    rating800: number;
    rating900: number;
    rating1000: number;
    rating1100: number;
    rating1200: number;
    rating1300: number;
    rating1400: number;
    rating1500: number;
    rating1600: number;
    rating1700: number;
    rating1800: number;
    rating1900: number;
    rating2000: number;
    rating2100: number;
    rating2200: number;
    rating2300: number;
    rating2400Plus: number;
    ratingUnknown: number;
}

interface ProblemsApiResponse {
    success: boolean;
    message: string;
    data: {
        totalSolved: number;
        maxRating: number;
        avgRating: number;
        avgPerDay: number;
        ratingDistribution: RatingDistribution;
        dailySubmissions: DailySubmission[];
    };
}

// Use the types from your store
export interface Contest {
    name: string;
    date: string;
    rating: number;
    rank: number;
    unsolved: number;
}

export interface Problem {
    date: string;
    rating: number;
}

export interface Submission {
    date: string;
}

export interface ContestHistory {
    contests: Contest[];
    ratingData: RatingDataPoint[];
    totalContests: number;
    averageChange: number;
}

export interface ProblemStats {
    totalSolved: number;
    maxRating: number;
    avgRating: number;
    avgPerDay: number;
    ratingDistribution: RatingDistribution;
    dailySubmissions: DailySubmission[];
}

export interface PaginatedResult {
    total: number;
    page: number;
    totalPages: number;
}

// Transform API response to match our Student interface
export const mapToStudent = (apiStudent: StudentResponse): Student => ({
    id: apiStudent.id,
    name: apiStudent.name,
    email: apiStudent.email,
    phone: apiStudent.phoneNumber,
    codeforcesHandle: apiStudent.codeforcesHandle,
    currentRating: apiStudent.rating,
    maxRating: apiStudent.maxRating,
    lastSyncedAt: apiStudent.lastDataUpdate,
    remindersSent: apiStudent.reminderEmailCount,
    titlePhoto: apiStudent.titlePhoto ?? undefined,
    emailRemindersDisabled: !apiStudent.emailReminderEnabled, // Default value
    contests: [],
    problems: [],
    rank: apiStudent.rank,
    maxRank: apiStudent.maxRank,
    problemStats: null,
    submissions: apiStudent.lastSubmissionDate
        ? [{ date: apiStudent.lastSubmissionDate }]
        : [],
});

// Transform contest API response to match your store's Contest interface
const mapToContest = (apiContest: ContestResponse): Contest => ({
    name: apiContest.name,
    date: apiContest.contestTime.split('T')[0], // Convert to YYYY-MM-DD format
    rating: apiContest.newRating,
    rank: apiContest.rank,
    unsolved: apiContest.totalProblems - apiContest.problemsSolved,
});

// Fetch students and update store
export const fetchStudents = async (page = 1, limit = 10, search = ''): Promise<PaginatedResult> => {
    try {
        const response = await axios.get<ApiResponse>(
            `${import.meta.env.VITE_BACKEND_URL}/api/student/students?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        const { students, total, page: currentPage, totalPages } = response.data.data;
        const mappedStudents = students.map(mapToStudent);

        // Update zustand store
        const { setStudents } = useStudentStore.getState();
        setStudents(mappedStudents);

        return { total, page: currentPage, totalPages };
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

// Fetch contest history for a specific student and update store
export const fetchStudentContests = async (studentId: string, days = 0): Promise<ContestHistory> => {
    try {
        const response = await axios.get<ContestApiResponse>(
            `${import.meta.env.VITE_BACKEND_URL}/api/student/students/${studentId}/contests?days=${days}`
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        const { contests, ratingData, totalContests, averageChange } = response.data.data;
        const mappedContests = contests.map(mapToContest);

        const contestHistory = {
            contests: mappedContests,
            ratingData,
            totalContests,
            averageChange,
        };

        // Update zustand store - update the student's contests array
        const { updateStudent } = useStudentStore.getState();
        updateStudent(studentId, { contests: mappedContests });

        return contestHistory;
    } catch (error) {
        console.error('Error fetching student contests:', error);
        throw error;
    }
};

// Transform daily submissions to Problem array (using accepted submissions)
const mapToProblems = (dailySubmissions: DailySubmission[]): Problem[] => {
    const problems: Problem[] = [];

    dailySubmissions.forEach(submission => {
        // Add one problem entry for each accepted submission
        for (let i = 0; i < submission.accepted; i++) {
            problems.push({
                date: submission.date,
                rating: 0 // You might want to calculate or assign this differently
            });
        }
    });

    return problems;
};

// Transform daily submissions to Submission array (using total submissions)
const mapToSubmissions = (dailySubmissions: DailySubmission[]): Submission[] => {
    const submissions: Submission[] = [];

    dailySubmissions.forEach(submission => {
        // Add one submission entry for each total submission
        for (let i = 0; i < submission.count; i++) {
            submissions.push({
                date: submission.date
            });
        }
    });

    return submissions;
};

// Update the API response interface to match the array structure
interface ProblemsApiResponse {
    success: boolean;
    message: string;
    data: {
        totalSolved: number;
        maxRating: number;
        avgRating: number;
        avgPerDay: number;
        ratingDistribution: {
            rating800: number;
            rating900: number;
            rating1000: number;
            rating1100: number;
            rating1200: number;
            rating1300: number;
            rating1400: number;
            rating1500: number;
            rating1600: number;
            rating1700: number;
            rating1800: number;
            rating1900: number;
            rating2000: number;
            rating2100: number;
            rating2200: number;
            rating2300: number;
            rating2400Plus: number;
            ratingUnknown: number;
        };
        dailySubmissions: {
            date: string;
            count: number;
            accepted: number;
        }[];
    };
}

// Updated fetchStudentProblems function
export const fetchStudentProblems = async (
    studentId: string,
    days = 30
): Promise<TimePeriodStats> => {
    try {
        // The API returns an array regardless of the days parameter
        const response = await axios.get<ProblemsApiResponse[]>(
            `${import.meta.env.VITE_BACKEND_URL}/api/student/students/${studentId}/problems?days=${days}`
        );

        // Validate that we have the expected array structure
        if (!Array.isArray(response.data) || response.data.length !== 4) {
            throw new Error('Unexpected API response format');
        }

        // Extract the three time periods from the response array
        const [days7Response, days30Response, days90Response, daysAllTimeResponse] = response.data;

        // Validate each response
        if (!days7Response.success || !days30Response.success || !days90Response.success) {
            throw new Error('One or more API responses failed');
        }

        // Create the time period stats object
        const timePeriodStats: TimePeriodStats = {
            days7: {
                totalSolved: days7Response.data.totalSolved,
                maxRating: days7Response.data.maxRating,
                avgRating: days7Response.data.avgRating,
                avgPerDay: days7Response.data.avgPerDay,
                ratingDistribution: days7Response.data.ratingDistribution,
                dailySubmissions: days7Response.data.dailySubmissions,
            },
            days30: {
                totalSolved: days30Response.data.totalSolved,
                maxRating: days30Response.data.maxRating,
                avgRating: days30Response.data.avgRating,
                avgPerDay: days30Response.data.avgPerDay,
                ratingDistribution: days30Response.data.ratingDistribution,
                dailySubmissions: days30Response.data.dailySubmissions,
            },
            days90: {
                totalSolved: days90Response.data.totalSolved,
                maxRating: days90Response.data.maxRating,
                avgRating: days90Response.data.avgRating,
                avgPerDay: days90Response.data.avgPerDay,
                ratingDistribution: days90Response.data.ratingDistribution,
                dailySubmissions: days90Response.data.dailySubmissions,
            },
            daysAllTime: {
                totalSolved: daysAllTimeResponse.data.totalSolved,
                maxRating: daysAllTimeResponse.data.maxRating,
                avgRating: daysAllTimeResponse.data.avgRating,
                avgPerDay: daysAllTimeResponse.data.avgPerDay,
                ratingDistribution: daysAllTimeResponse.data.ratingDistribution,
                dailySubmissions: daysAllTimeResponse.data.dailySubmissions,
            },
        };

        // Use the 30-day data for updating problems and submissions
        const problems = mapToProblems(days30Response.data.dailySubmissions);
        const submissions = mapToSubmissions(days30Response.data.dailySubmissions);

        // Update the student in the store
        const { updateStudent } = useStudentStore.getState();
        updateStudent(studentId, {
            problems,
            submissions,
            problemStats: timePeriodStats,
        });

        return timePeriodStats;
    } catch (error) {
        console.error('Error fetching student problems:', error);
        throw error;
    }
};

// Helper function to get specific time period data
export const getTimePeriodData = (
    problemStats: TimePeriodStats | null,
    period: '7' | '30' | '90'
): ProblemStats | null => {
    if (!problemStats) return null;

    switch (period) {
        case '7':
            return problemStats.days7;
        case '30':
            return problemStats.days30;
        case '90':
            return problemStats.days90;
        default:
            return null;
    }
};

