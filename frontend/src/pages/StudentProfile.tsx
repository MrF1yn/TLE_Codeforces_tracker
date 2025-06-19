import React, {useEffect, useState} from 'react';
import {Calendar, Mail, Phone, Award, TrendingUp, Users, Code, Filter, LinkIcon, Medal} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart, Area
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {useStudentStore} from "@/stores/useStudentStore.tsx";
import {useParams} from "react-router-dom";
import {Tooltip as ReactTooltip} from 'react-tooltip'
// import LiquidGlass from "liquid-glass-react";
import {fetchStudentContests, fetchStudentProblems} from "@/lib/requests.ts";
import EmailRemindersToggle from "@/custom-components/EmailRemindersToggle.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {FloatingCard} from "@/custom-components/FloatingCard.tsx";

const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {start, end};
};

const filterByDateRange = <T extends { date: string }>(items: T[], days: number): T[] => {
    const {start} = getDateRange(days);
    return items.filter(item => new Date(item.date) >= start);
};

const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-600';
    if (rating >= 2100) return 'text-orange-600';
    if (rating >= 1900) return 'text-purple-600';
    if (rating >= 1600) return 'text-blue-600';
    if (rating >= 1400) return 'text-cyan-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-orange-200';
};

const StudentProfile: React.FC = () => {
    const {students} = useStudentStore();
    const {id} = useParams();
    const [contestFilter, setContestFilter] = useState<30 | 90 | 365>(365);
    const [problemFilter, setProblemFilter] = useState<7 | 30 | 90>(30);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const student = students.find(s => s.id === id);

    useEffect(() => {
        if (id) {
            fetchStudentContests(id)
            fetchStudentProblems(id)
        }
    }, [id]);

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
                    <p className="text-gray-600 mt-2">The student profile you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Filter data based on selected time ranges
    const filteredContests = filterByDateRange(student.contests, contestFilter);

    // Get problem stats based on selected filter
    const getCurrentProblemStats = () => {
        if (!student.problemStats) return null;
        console.log(student.problemStats.daysAllTime)
        switch (problemFilter) {
            case 7:
                return student.problemStats.days7;
            case 30:
                return student.problemStats.days30;
            case 90:
                return student.problemStats.days90;
            default:
                return student.problemStats.days30;
        }
    };

    const currentStats = getCurrentProblemStats();

    // Rating distribution from stored stats
    const getRatingDistribution = () => {
        if (!currentStats) return [];

        const distribution = currentStats.ratingDistribution;
        return [
            {range: '800', count: distribution.rating800},
            {range: '900', count: distribution.rating900},
            {range: '1000', count: distribution.rating1000},
            {range: '1100', count: distribution.rating1100},
            {range: '1200', count: distribution.rating1200},
            {range: '1300', count: distribution.rating1300},
            {range: '1400', count: distribution.rating1400},
            {range: '1500', count: distribution.rating1500},
            {range: '1600', count: distribution.rating1600},
            {range: '1700', count: distribution.rating1700},
            {range: '1800', count: distribution.rating1800},
            {range: '1900', count: distribution.rating1900},
            {range: '2000', count: distribution.rating2000},
            {range: '2100', count: distribution.rating2100},
            {range: '2200', count: distribution.rating2200},
            {range: '2300', count: distribution.rating2300},
            {range: '2400+', count: distribution.rating2400Plus},
            {range: 'Unknown', count: distribution.ratingUnknown},
        ].filter(item => item.count > 0); // Only show non-zero counts
    };

    // Contest rating chart data
    const ratingChartData = filteredContests
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(contest => ({
            date: new Date(contest.date).toLocaleDateString(),
            rating: contest.rating,
            name: contest.name
        }));
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    // Submission heatmap data from stored stats
    const getSubmissionHeatmapData = () => {
        if (!student.problemStats) return [];

        return student.problemStats?.daysAllTime.dailySubmissions.map(submission => ({
            date: submission.date,
            count: submission.count
        }));
    };

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <FloatingCard delay={0}>
                <div className=" dark:border-gray-700">
                    <div className=" mx-auto px-4 sm:px-6 lg:px-8 ">
                        <div className="">
                            <div className="flex items-start space-x-6">
                                <div className="flex-shrink-0">
                                    <div
                                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {student.titlePhoto ? (
                                            <img src={student.titlePhoto} alt={student.name}
                                                 className="w-full h-full rounded-full object-cover"/>
                                        ) : (
                                            <span
                                                className="text-xl lg:text-4xl">{student.name.split(' ').map(n => n[0]).join('')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 ">
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-all">{student.name}</h1>
                                    <div
                                        className="text-lg text-gray-600 dark:text-gray-300 mt-1 flex gap-2 flex-col md:flex-row w-fit">
                                        <a className="bg-primary hover:text-muted text-white dark:bg-secondary px-2 py-1 rounded text-sm items-center justify-center inline-flex gap-1"
                                           href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                           target={"_blank"} rel="noopener noreferrer"
                                        >
                                            <LinkIcon className="inline h-4 w-4 mr-1"/>
                                            <span
                                                className={"font-semibold hover:underline break-all "}
                                            >{student.codeforcesHandle}</span>

                                        </a>

                                        <span
                                            className="bg-primary text-white dark:bg-secondary px-2 py-1 rounded text-sm items-center justify-center inline-flex gap-1"
                                        >
                                        <Medal className="inline h-4 w-4 mr-1"/>
                                                    <span
                                                        className={"font-semibold break-all "}
                                                    >{student.rank}
                                                    </span>

                                    </span>
                                    </div>
                                    <div
                                        className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4"/>
                                            <a href={`mailto:${student.email}`} className="hover:underline break-all">
                                                {student.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-4 h-4"/>
                                            {student.phone}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4"/>
                                            Last synced: {new Date(student.lastSyncedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">

                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100">Current Rating</p>
                                            <p className="text-2xl font-bold">{student.currentRating}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-blue-200"/>
                                    </div>
                                </div>
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100">Max Rating</p>
                                            <p className="text-2xl font-bold">{student.maxRating}</p>
                                        </div>
                                        <Award className="w-8 h-8 text-purple-200"/>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100">Contests</p>
                                            <p className="text-2xl font-bold">{student.contests.length}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-green-200"/>
                                    </div>
                                </div>
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100">Problems Solved</p>
                                            <p className="text-2xl font-bold">{student.problemStats?.daysAllTime?.totalSolved || 0}</p>
                                        </div>
                                        <Code className="w-8 h-8 text-orange-200"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FloatingCard>

            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Contest History */}

                    <div className="lg:col-span-2 space-y-8">
                        {/* Contest History */}
                        <FloatingCard delay={200}>
                            <div
                                className="bg-card rounded-lg shadow-xl border border-border dark:border-2 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contest
                                        History</h2>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={contestFilter.toString()}
                                            onValueChange={(e) => setContestFilter(Number(e) as 30 | 90 | 365)}
                                            // className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <SelectTrigger className=" rounded-md text-sm bg-background border-border">
                                                <Filter className="w-2 h-2  "/>
                                                <SelectValue placeholder="Theme"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={"30"}>Last 30 days</SelectItem>
                                                <SelectItem value={"90"}>Last 90 days</SelectItem>
                                                <SelectItem value={"365"}>Last 365 days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Rating Chart */}
                                {ratingChartData.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Rating
                                            Progress</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={ratingChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                                    <XAxis dataKey="date" stroke="#6b7280"/>
                                                    <YAxis stroke="#6b7280"/>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--card, #ffffff)',
                                                            border: '1px solid var(--tooltip-border, #e5e7eb)',
                                                            borderRadius: '8px',
                                                            color: 'var(--primary, #1f2937)'
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="rating"
                                                        stroke='var(--primary, #ffffff)'
                                                        strokeWidth={2}
                                                        fill='var(--primary, #ffffff)'
                                                        fillOpacity={0.3}
                                                        dot={{fill: 'var(--primary, #ffffff)', strokeWidth: 2, r: 4}}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Contest List */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Contest
                                        Results</h3>
                                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                                        {filteredContests.length > 0 ? (
                                            filteredContests
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((contest, index) => (
                                                    <div key={index}
                                                         className="flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white">{contest.name}</h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(contest.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-semibold`}>
                                                            <span className={` ${getRatingColor(contest.rating)}`}>
                                                                {contest.rating}
                                                            </span>
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                Rank: {contest.rank} | Unsolved: {contest.unsolved}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No contests
                                                found for the selected period</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </FloatingCard>

                        {/* Submission Activity */}
                        <FloatingCard delay={400}>
                            <div
                                className="submission-heatmap bg-card rounded-lg shadow-xl border border-border dark:border-2 p-6">
                                <div className="flex-col items-center justify-between mb-6">

                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <h2 className="text-xl font-semibold ">Submission
                                            Activity</h2>
                                        <span className={"flex items-center gap-1"}>
                                        {/*<Filter className="w-4 h-4 text-gray-500 dark:text-gray-400"/>*/}
                                            <Select
                                                value={selectedYear.toString()}
                                                onValueChange={e => setSelectedYear(Number(e))}
                                                // className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                    <SelectTrigger className=" rounded-md text-sm border-border">
                                        <Filter className="w-2 h-2"/>
                                        <SelectValue placeholder="Theme"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </span>

                                    </div>
                                    <div className="overflow-x-auto pb-2">
                                        <div className="min-w-[700px]">
                                            <CalendarHeatmap

                                                startDate={new Date(selectedYear, 0, 1)}
                                                endDate={new Date(selectedYear, 11, 31)}
                                                values={getSubmissionHeatmapData()}
                                                transformDayElement={(rect) => {
                                                    const element = rect as unknown as {
                                                        props: {
                                                            width: number;
                                                            height: number;
                                                            x: number;
                                                            y: number;
                                                        }
                                                    };

                                                    const originalWidth = element.props.width;
                                                    const originalHeight = element.props.height;
                                                    const newWidth = originalWidth * 0.9;
                                                    const newHeight = originalHeight * 0.9;
                                                    const xOffset = (originalWidth - newWidth) / 2;
                                                    const yOffset = (originalHeight - newHeight) / 2;

                                                    return React.cloneElement(rect as React.ReactElement<React.SVGProps<SVGRectElement>>, {
                                                        width: newWidth,
                                                        height: newHeight,
                                                        x: element.props.x + xOffset,
                                                        y: element.props.y + yOffset,
                                                        rx: 2,
                                                        ry: 2,
                                                    });
                                                }}
                                                classForValue={(value) => {
                                                    if (!value || value.count === 0) return 'color-empty';
                                                    if (value.count < 2) return 'color-github-1';
                                                    if (value.count < 4) return 'color-github-2';
                                                    if (value.count < 6) return 'color-github-3';
                                                    return 'color-github-4';
                                                }}
                                                tooltipDataAttrs={(value) => ({
                                                    'data-tooltip-id': 'heatmap-tooltip',
                                                    'data-tooltip-content': value?.date
                                                        ? `${new Date(value.date).toISOString().slice(0, 10)} has count: ${value.count}`
                                                        : 'No submissions'
                                                }) as { [key: string]: string }}
                                                showWeekdayLabels={true}
                                                onClick={(value) => value && alert(`Clicked on ${value.date} with count: ${value.count}`)}
                                            />
                                            <ReactTooltip id="heatmap-tooltip"/>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
                                    <span>Less</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-green-800 dark:bg-green-400 rounded-sm"></div>
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>
                        </FloatingCard>

                        {/* Problem Solving Data */}
                        <FloatingCard delay={600}>
                            <div
                                className="bg-card rounded-lg shadow-xl border border-border dark:border-2 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-black dark:text-white">Problem
                                        Solving
                                        Data</h2>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={problemFilter.toString()}
                                            onValueChange={(e) => setProblemFilter(Number(e) as 7 | 30 | 90)}
                                            // className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <SelectTrigger className=" rounded-md text-sm border-border">
                                                <Filter className="w-2 h-2 "/>
                                                <SelectValue placeholder="Theme"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={"7"}>Last 7 days</SelectItem>
                                                <SelectItem value={"30"}>Last 30 days</SelectItem>
                                                <SelectItem value={"90"}>Last 90 days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                {currentStats && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStats.maxRating}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Most
                                                Difficult</p>
                                        </div>
                                        <div
                                            className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentStats.totalSolved}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Total Solved</p>
                                        </div>
                                        <div
                                            className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(currentStats.avgRating)}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Average
                                                Rating</p>
                                        </div>
                                        <div
                                            className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentStats.avgPerDay.toFixed(1)}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Problems/Day</p>
                                        </div>
                                    </div>
                                )}

                                {/* Rating Distribution Chart */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Rating
                                        Distribution</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={getRatingDistribution()}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                                <XAxis dataKey="range" stroke="#6b7280"/>
                                                <YAxis stroke="#6b7280"/>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--card, #ffffff)',
                                                        border: '1px solid var(--primary, #ffffff)',
                                                        borderRadius: '8px',
                                                        color: 'var(--primary, #ffffff)'
                                                    }}
                                                />
                                                <Bar dataKey="count" fill="var(--primary, #ffffff)"/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </FloatingCard>
                    </div>
                    <FloatingCard delay={100}>
                        <EmailRemindersToggle student={student}/>
                    </FloatingCard>
                </div>
            </div>

            <style>{`
                .submission-heatmap {
                    font-size: 12px;
                }
                .submission-heatmap .color-empty {
                    fill: #ebedf0;
                }
                .submission-heatmap .color-github-1 {
                    fill: #9be9a8;
                }
                .submission-heatmap .color-github-2 {
                    fill: #40c463;
                }
                .submission-heatmap .color-github-3 {
                    fill: #30a14e;
                }
                .submission-heatmap .color-github-4 {
                    fill: #216e39;
                }
                
                /* Dark mode styles for heatmap */
                .dark .submission-heatmap .color-empty {
                    fill: var(--secondary, #374151);
                }
                .dark .submission-heatmap .color-github-1 {
                    fill: #064e3b;
                }
                .dark .submission-heatmap .color-github-2 {
                    fill: #065f46;
                }
                .dark .submission-heatmap .color-github-3 {
                    fill: #047857;
                }
                .dark .submission-heatmap .color-github-4 {
                    fill: #059669;
                }
                
                
                /* CSS variables for chart tooltips */
                :root {
                    --tooltip-bg: #ffffff;
                    --tooltip-border: #e5e7eb;
                    --tooltip-text: #1f2937;
                }
                
                .dark {
                    --tooltip-bg: #374151;
                    --tooltip-border: #4b5563;
                    --tooltip-text: #f9fafb;
                }
            `}</style>
        </div>
    );
};

export default StudentProfile;