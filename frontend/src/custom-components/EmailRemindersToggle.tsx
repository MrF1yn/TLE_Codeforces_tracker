import {useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Mail, X, Loader2} from 'lucide-react';
import {type Student, useStudentStore} from "@/stores/useStudentStore.tsx";
import {toast} from "sonner";
import axios from "axios";
// import {mapToStudent} from "@/lib/requests.ts";


interface EmailRemindersToggleProps {
    student: Student;
}

export const EmailRemindersToggle = ({student}: EmailRemindersToggleProps) => {
    // Mock student data - replace with your actual data
    const {updateStudent,setProcesses,processes} = useStudentStore();
    const [isLoading, setIsLoading] = useState(false);
    if (!student) {
        return <div className="text-red-500">Student not found</div>;
    }

    const handleToggleChange = async (checked: any) => {
        setIsLoading(true);

        // Simulate API call with cooldown
        try {
            const id = Date.now();
            setProcesses([...processes, {
                id: id,
                name: `Modifying Email Reminders for ${student.name}`,
                progress: 50,
                status: 'active'
            }])
            // toast(`Adding ${form.name}`, {
            //     description: "This may take a few seconds",
            // })
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/student/students/${student.id}/email-reminders`, {
                enabled: checked,
            })
            setProcesses(processes.map(p => p.id === id ? {...p, progress: 100, status: 'completed'} : p))
            updateStudent(student.id, {
                emailRemindersDisabled: !checked,
            });

            // Update the student state
            // if (student.emailRemindersDisabled) {
            //     student.remindersSent += 1; // Increment reminders sent count
            // }

            // Here you would make your actual API call
            console.log('Email reminder preference updated:', !student.emailRemindersDisabled);
            toast.success(`Email reminders ${student.emailRemindersDisabled ? 'enabled' : 'disabled'} successfully!`);

        } catch (error) {
            console.error('Failed to update email reminder preference:', error);
            // Handle error - could show a toast notification
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Right Column */}
            <div className="space-y-8">
                {/* Additional Info */}
                <div
                    className="bg-card rounded-lg shadow-xl border border-border dark:border-2 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Info</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Reminders Sent:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{student.remindersSent}</span>
                        </div>

                        {/* Email Reminders Toggle Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin"/>
                                    ) : student.emailRemindersDisabled ? (
                                        <X className="h-4 w-4 text-red-500"/>
                                    ) : (
                                        <Mail className="h-4 w-4 text-green-500"/>
                                    )}
                                    <div className="flex flex-col">
                                        <Label htmlFor="email-reminders"
                                               className="text-sm font-medium text-gray-900 dark:text-white">
                                            Email Reminders
                                        </Label>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                      Receive email notifications for upcoming deadlines
                    </span>
                                    </div>
                                </div>
                                <Switch
                                    id="email-reminders"
                                    checked={!student.emailRemindersDisabled}
                                    onCheckedChange={handleToggleChange}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-green-600 disabled:opacity-50"
                                />
                            </div>

                            {/* Status Display */}
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                                <span
                                    className={`font-medium flex items-center space-x-1 ${
                                        isLoading
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : student.emailRemindersDisabled
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                    }`}
                                >
                  <span>
                    {isLoading
                        ? 'Updating...'
                        : student.emailRemindersDisabled
                            ? 'Disabled'
                            : 'Enabled'
                    }
                  </span>
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailRemindersToggle;