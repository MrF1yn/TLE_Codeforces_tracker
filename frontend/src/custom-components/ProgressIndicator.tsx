import { useStudentStore} from "@/stores/useStudentStore.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Activity, Loader2} from "lucide-react";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";

export function ProgressIndicator() {
    const {processes} = useStudentStore()

    // Simulate progress updates

    const activeProcesses = processes.filter(p => p.status === "active")
    const hasActiveProcesses = activeProcesses.length > 0

    if (!hasActiveProcesses) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative p-2 hover:bg-primary/20"
                        >
                            <Activity className="w-4 h-4 text-gray-600 dark:text-white" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-600 dark:bg-white rounded-full"></div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p className="text-sm">All processes completed</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="relative p-2 hover:bg-primary/20"
                    >
                        <div className="relative">
                            <Activity className="w-4 h-4 text-primary" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <Loader2 className="w-3 h-3 ml-1 animate-spin text-primary" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-80 p-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Ongoing Processes</span>
                            <Badge variant="secondary" className="text-xs">
                                {activeProcesses.length} active
                            </Badge>
                        </div>
                        {activeProcesses.map(process => (
                            <div key={process.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium truncate max-w-48">
                                        {process.name}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {Math.round(process.progress)}%
                                    </span>
                                </div>
                                <div className="relative">
                                    <Progress value={process.progress} className="h-1.5" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white to-purple-100/10 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}