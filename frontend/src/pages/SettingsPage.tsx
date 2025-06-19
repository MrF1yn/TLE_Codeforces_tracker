import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Settings,
    Clock,
    Play,
    Database,
    UserCheck,
    RefreshCw,
    Loader2,
    Calendar,
} from 'lucide-react';
import {formatDistanceToNow, format} from 'date-fns';
import {toast} from "sonner";
import {Switch} from "@/components/ui/switch.tsx";
import EmailTemplateEditor from "@/custom-components/EmailTemplateEditor.tsx";
import {Button} from "@/components/ui/button.tsx";
import {FloatingCard} from "@/custom-components/FloatingCard.tsx";

interface CronJob {
    id: string;
    name: string;
    displayName?: string;
    cronExpression: string;
    description?: string;
    enabled: boolean;
    lastRun: string | null;
    nextRun: string | null;
    icon?: React.ComponentType<any>;
}

const SettingsPage: React.FC = () => {
    const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [notifications, setNotifications] = useState<{
        [key: string]: { type: 'success' | 'error', message: string }
    }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [emailTemplate, setEmailTemplate] = useState({
        subject: "",
        body: "",
    });

    useEffect(() => {
        fetchCronJobs();
        fetchEmailTemplate();
    }, []);

    const fetchEmailTemplate = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/emailTemplate`);
            console.log('Email Template Response:', response.data);
            if (response.data.success) {
                setEmailTemplate(response.data.data);
            } else {
                toast.error("Failed to fetch email template");
            }
        } catch (error) {
            toast.error("Error fetching email template");
        }
    }

    const fetchCronJobs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cron/configs`);
            if (response.data.success) {
                // Map API data to include UI properties
                const jobsWithUI = response.data.data.map((job: any) => ({
                    ...job,
                    displayName: job.name === 'DATA_SYNC' ? 'Data Sync' :
                        job.name === 'INACTIVITY_CHECK' ? 'Inactivity Check' : job.name,
                    description: job.name === 'DATA_SYNC' ? 'Synchronizes student data from external sources' :
                        job.name === 'INACTIVITY_CHECK' ? 'Checks for inactive students and sends reminders' : '',
                    icon: job.name === 'DATA_SYNC' ? Database :
                        job.name === 'INACTIVITY_CHECK' ? UserCheck : Clock
                }));
                setCronJobs(jobsWithUI);
            }
        } catch (error) {
            toast.error("Failed to fetch cron jobs");
        } finally {
            setIsLoading(false);
        }
    };

    const updateCronSchedule = async (jobId: string, jobName: string, cronExpression: string) => {
        setLoading(prev => ({...prev, [jobId]: true}));
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cron/${jobName}`, {
                cronExpression
            });

            await fetchCronJobs();

            setNotifications(prev => ({
                ...prev,
                [jobId]: {type: 'success', message: 'Schedule updated successfully!'}
            }));
        } catch (error) {
            setNotifications(prev => ({
                ...prev,
                [jobId]: {type: 'error', message: 'Failed to update schedule'}
            }));
        } finally {
            setLoading(prev => ({...prev, [jobId]: false}));
        }
    };

    const toggleCronJobStatus = async (jobId: string,jobName: string, enabled: boolean) => {
        setLoading(prev => ({...prev, [`toggle_${jobId}`]: true}));
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cron/${jobName}/${enabled?'enable':'disable'}`);

            // await fetchCronJobs();
            setCronJobs(prev => prev.map(job =>
                job.name === jobName ? {...job, enabled: enabled} : job
            ));
            setNotifications(prev => ({
                ...prev,
                [`toggle_${jobId}`]: {
                    type: 'success',
                    message: `Job ${!enabled ? 'enabled' : 'disabled'} successfully!`
                }
            }));
        } catch (error) {
            console.error('Error toggling job status:', error);
            setNotifications(prev => ({
                ...prev,
                [`toggle_${jobId}`]: {type: 'error', message: `Failed to ${!enabled ? 'enable' : 'disable'} job`}
            }));
        } finally {
            setLoading(prev => ({...prev, [`toggle_${jobId}`]: false}));
        }
    };

    const triggerCronJob = async (jobId: string, jobName: string) => {
        setLoading(prev => ({...prev, [`trigger_${jobId}`]: true}));
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cron/${jobName}/trigger`);

            await fetchCronJobs();

            setNotifications(prev => ({
                ...prev,
                [`trigger_${jobId}`]: {type: 'success', message: 'Job triggered successfully!'}
            }));
        } catch (error) {
            setNotifications(prev => ({
                ...prev,
                [`trigger_${jobId}`]: {type: 'error', message: 'Failed to trigger job'}
            }));
        } finally {
            setLoading(prev => ({...prev, [`trigger_${jobId}`]: false}));
        }
    };

    const saveEmailTemplate = async () => {
        setIsSaving(true);
        try {
            // Simulate API call

            console.log('Saving email template:', emailTemplate);
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/student/emailTemplate`,{
                subject: emailTemplate.subject,
                body: emailTemplate.body
            });
            toast.success("Email template saved successfully!");
            setNotifications(prev => ({
                ...prev,
                emailTemplate: {type: 'success', message: 'Email template saved successfully!'}
            }));
        } catch (error) {
            toast.error("Failed to save email template");
            setNotifications(prev => ({
                ...prev,
                emailTemplate: {type: 'error', message: 'Failed to save email template'}
            }));
        } finally {
            setIsSaving(false);
        }
    };

    // Clear notifications after 3 seconds
    useEffect(() => {
        Object.keys(notifications).forEach(key => {
            setTimeout(() => {
                setNotifications(prev => {
                    const updated = {...prev};
                    delete updated[key];
                    return updated;
                });
            }, 3000);
        });
    }, [notifications]);

    const validateCronExpression = (expression: string): boolean => {
        // Basic cron validation (5 parts separated by spaces)
        const parts = expression.trim().split(/\s+/);
        return parts.length === 5;
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, yyyy HH:mm');
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatTimeFromNow = (dateString: string | null) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            return formatDistanceToNow(date, {addSuffix: true});
        } catch (e) {
            return 'Invalid date';
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <FloatingCard delay={0}>
            <div className=" ">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div
                                    className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                                    <Settings className="w-8 h-8 md:w-12 md:h-12 text-black dark:text-white hover:rotate-45 transition"/>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg md:text-4xl font-bold dark:text-white">System <span className={"text-primary"}>Settings</span></h1>
                                <p className="text-xs md:text-lg text-gray-600 dark:text-gray-300 mt-1">
                                    Manage system configuration and automation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </FloatingCard>

            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Cron Jobs Section */}
                    <FloatingCard delay={200}>
                    <div
                        className="bg-secondary/10 dark:bg-card/30 rounded-lg shadow-xl border border-border  p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-6 h-6 "/>
                                <h2 className="text-md md:text-xl font-semibold text-gray-900 dark:text-white">Scheduled Jobs</h2>
                            </div>
                            <Button
                                onClick={fetchCronJobs}
                                disabled={isLoading}
                                className="text-xs md:text-sm inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent font-medium rounded-md text-white bg-transparent md:bg-primary transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2"/>
                                )}
                                <span className="hidden md:inline">Refresh</span>
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                            </div>
                        ) : (
                            <div className=" flex flex-col lg:flex-row items-center justify-around gap-6">
                                {cronJobs.map((job) => {
                                    const IconComponent = job.icon || Clock;
                                    return (
                                        <div key={job.id}
                                             className=" border-border shadow-xl  rounded-lg p-6 w-full bg-secondary/20 dark:bg-card">
                                            <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-2">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center`}>
                                                        <IconComponent className="w-5 h-5 text-white"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
                                                            {job.displayName || job.name}
                                                        </h3>
                                                        <p className="text-xs md:text-md text-gray-600 dark:text-gray-300">
                                                            {job.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <div className="flex items-center space-x-2">
                                                        {loading[`toggle_${job.id}`] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                                        ) : (
                                                            <Switch
                                                                checked={job.enabled}
                                                                onCheckedChange={(checked) => toggleCronJobStatus(job.id,job.name, checked)}
                                                                disabled={loading[`toggle_${job.id}`]}
                                                                className="data-[state=checked]:bg-green-600 disabled:opacity-50"
                                                            />
                                                        )}
                                                            <span
                                                                className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{job.enabled ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => triggerCronJob(job.id, job.name)}
                                                        disabled={loading[`trigger_${job.id}`] || !job.enabled}
                                                        className="transition text-xs md:text-sm inline-flex items-center px-1 py-1 md:px-3 md:py-2 border border-transparent font-medium rounded-md text-green-600 hover:text-green-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[`trigger_${job.id}`] ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                                        ) : (
                                                            <Play className="w-4 h-4 scale-110"/>
                                                        )}
                                                        {/*<span className="hidden md:inline">Run Now</span>*/}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div
                                                    className="p-3 bg-input/20 rounded-md flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-primary"/>
                                                    <div>
                                                        <div
                                                            className="text-xs text-primary font-medium">Last
                                                            Run
                                                        </div>
                                                        <div className="text-sm text-blue-900 dark:text-blue-100">
                                                            {formatDateTime(job.lastRun)} ({formatTimeFromNow(job.lastRun)})
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="p-3 bg-input/20 rounded-md flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-primary"/>
                                                    <div>
                                                        <div
                                                            className="text-xs text-primary font-medium">Next
                                                            Run
                                                        </div>
                                                        <div className="text-sm text-purple-900 dark:text-purple-100">
                                                            {formatDateTime(job.nextRun)} ({formatTimeFromNow(job.nextRun)})
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium  mb-2">
                                                        Cron Expression
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={job.cronExpression}
                                                        onChange={(e) => {
                                                            const newExpression = e.target.value;
                                                            setCronJobs(prev => prev.map(j =>
                                                                j.id === job.id ? {
                                                                    ...j,
                                                                    cronExpression: newExpression
                                                                } : j
                                                            ));
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none dark:bg-secondary  text-gray-900 dark:text-white"
                                                        placeholder="0 2 * * *"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Format: minute hour day month weekday
                                                    </p>
                                                </div>
                                                <div>
                                                    <Button
                                                        onClick={() => updateCronSchedule(job.id, job.name, job.cronExpression)}
                                                        disabled={loading[job.id] || !validateCronExpression(job.cronExpression)}
                                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary  transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[job.id] ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                                        ) : (
                                                            <RefreshCw className="w-4 h-4 mr-2"/>
                                                        )}
                                                        Update Schedule
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    </FloatingCard>
                    <FloatingCard delay={400}>
                    <EmailTemplateEditor
                        emailTemplate={emailTemplate}
                        setEmailTemplate={setEmailTemplate}
                        saveEmailTemplate={saveEmailTemplate}
                        isSaving={isSaving}
                    ></EmailTemplateEditor>
                    </FloatingCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;