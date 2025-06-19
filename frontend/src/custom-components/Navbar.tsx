import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useStudentStore} from "@/stores/useStudentStore.tsx";
import {Activity, Home, Loader2, Menu, Settings, TrendingUp, Users} from "lucide-react";
import {ThemeToggle} from "@/custom-components/ThemeToggle.tsx";
import {Sheet, SheetContent,SheetTrigger} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {ProgressIndicator} from "@/custom-components/ProgressIndicator.tsx";
import {AnimatedTabs} from "@/custom-components/AnimatedTabs.tsx";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation();
    const getActiveTab = () => {
        if (location.pathname === "/" || location.pathname === "/home") return "home";
        if (location.pathname.startsWith("/dashboard")) return "dashboard";
        if (location.pathname.startsWith("/settings")) return "settings";
        return "";
    };
    const activeTab = getActiveTab();
    const {processes} = useStudentStore();
    const NavigationLink = ({id, icon: Icon, children, onClick, to}: any) => {
        const navigate = useNavigate();

        return (
            <button
                onClick={() => {
                    // setActiveTab(id);
                    if (to) navigate(to);
                    onClick?.();
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                    activeTab === id
                        ? 'bg-primary/30 dark:bg-primary/30 text-primary dark:text-white'
                        : 'text-gray-600 dark:text-white hover:bg-primary/30 dark:hover:bg-primary/10'
                }`}
            >
                <Icon className="w-4 h-4"/>
                <span className="font-medium">{children}</span>
            </button>
        );
    };

    return (
        <nav
            className="bg-card backdrop-blur-xl  sticky top-0 z-50">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600
                                 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-md lg:text-xl font-bold ">
                                TLE CodeForces
                            </h1>
                            <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                Competitive Programming Tracker
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {/*<NavigationLink id="home" icon={Home} to="/">*/}
                        {/*    Home*/}
                        {/*</NavigationLink>*/}
                        {/*<NavigationLink id="dashboard" icon={Users} to="/dashboard">*/}
                        {/*    Dashboard*/}
                        {/*</NavigationLink>*/}
                        {/*<NavigationLink id="settings" icon={Settings} to="/settings">*/}
                        {/*    Settings*/}
                        {/*</NavigationLink>*/}


                        <AnimatedTabs/>
                    </div>

                    {/* Mobile menu */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ProgressIndicator/>
                        <ThemeToggle/>
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Menu className="w-5 h-5"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80 sm:w-96 p-3">

                                <nav className="space-y-2 mt-10">
                                    <NavigationLink
                                        to="/"
                                        id="home"
                                        icon={Home}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Home
                                    </NavigationLink>
                                    <NavigationLink
                                        to="/dashboard"
                                        id="dashboard"
                                        icon={Users}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </NavigationLink>
                                    <NavigationLink
                                        to="/settings"
                                        id="settings"
                                        icon={Settings}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Settings
                                    </NavigationLink>
                                </nav>

                                {/* Mobile Progress Section */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            System Status
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="w-4 h-4"/>
                                            <Loader2 className="w-3 h-3 animate-spin"/>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {processes.filter(p => p.status === "active").map(process => (
                                            <div key={process.id}
                                                 className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{process.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(process.progress)}%
                                                    </Badge>
                                                </div>
                                                <div className="relative">
                                                    <Progress value={process.progress} className="h-2"/>
                                                    <div
                                                        className="absolute inset-0 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))}
                                        {processes.filter(p => p.status === "active").length === 0 && (
                                            <div className="text-center py-4">
                                                <div
                                                    className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <Activity className="w-6 h-6 text-primary"/>
                                                </div>
                                                <p className="text-sm  font-medium">All processes
                                                    completed!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}