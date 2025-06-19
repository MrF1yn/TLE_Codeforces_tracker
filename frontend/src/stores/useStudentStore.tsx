import { create } from "zustand";

export type Contest = {
    name: string
    date: string
    rating: number
    rank: number
    unsolved: number
}

export type Problem = {
    date: string
    rating: number
}

export type Submission = {
    date: string
}

// Updated ProblemStats interface to match API response
export interface ProblemStats {
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
}

// New interface for the time-based problem stats
export interface TimePeriodStats {
    days7: ProblemStats;
    days30: ProblemStats;
    days90: ProblemStats;
    daysAllTime: ProblemStats;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    codeforcesHandle: string;
    currentRating: number;
    maxRating: number;
    lastSyncedAt: string;
    remindersSent: number;
    titlePhoto?: string;
    emailRemindersDisabled: boolean;
    contests: Contest[]
    rank: string
    maxRank: string
    problems: Problem[]
    problemStats: TimePeriodStats | null; // Changed to TimePeriodStats
    submissions: Submission[]
}

interface StudentStore {
    students: Student[];
    setStudents: (students: Student[]) => void;
    addStudent: (student: Student) => void;
    updateStudent: (id: string, updated: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    processes: Process[];
    setProcesses: (processes: Process[]) => void;
    updateProcess: (id: number, updated: Partial<Process>) => void;
    removeProcess: (id: number) => void;

}

export interface Process {
    id: number;
    name: string;
    progress: number;
    status: string;
}

export const useStudentStore = create<StudentStore>((set) => ({
    students: [],
    processes: [
        // { id: 1, name: "Syncing CodeChef Data", progress: 45, status: "active" },
        // { id: 2, name: "Analyzing Performance", progress: 78, status: "active" },
        // { id: 3, name: "Updating Rankings", progress: 23, status: "active" },
        // { id: 4, name: "Data Validation", progress: 100, status: "completed" }
    ],
    setProcesses: (processes) => set({ processes }),
    updateProcess: (id, updated) =>
        set((state) => ({
            processes: state.processes.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        })),
    removeProcess: (id) =>
        set((state) => ({
            processes: state.processes.filter((p) => p.id !== id),
        })),
    setStudents: (students) => set({ students }),
    addStudent: (student) => set((state) => ({ students: [...state.students, student] })),
    updateStudent: (id, updated) =>
        set((state) => ({
            students: state.students.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        })),
    deleteStudent: (id) =>
        set((state) => ({
            students: state.students.filter((s) => s.id !== id),
        })),

}));