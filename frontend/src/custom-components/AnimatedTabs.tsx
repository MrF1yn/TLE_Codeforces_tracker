import { motion } from "framer-motion";
import { useState } from "react";
import {ProgressIndicator} from "@/custom-components/ProgressIndicator.tsx";
import {ThemeToggle} from "@/custom-components/ThemeToggle.tsx";
import {Home, Settings, Users} from "lucide-react";
import {useNavigate} from "react-router-dom";

// Define the type for a tab item
interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
    to: string;
}

// Define props interface
interface AnimatedTabsProps {
    tabs?: TabItem[];
}

// Default tabs as fallback
const defaultTabs: TabItem[] = [
    { id: "home", label: "Home", icon: Home, to: "/" },
    { id: "dashboard", label: "Dashboard", icon: Users, to: "/dashboard" },
    { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
];

export function AnimatedTabs({ tabs = defaultTabs }: AnimatedTabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
    const navigate = useNavigate();
    return (
        <div className="flex space-x-1">
            {/*<NavigationLink id="home" icon={Home} to="/">*/}
            {/*    Home*/}
            {/*</NavigationLink>*/}
            {/*<NavigationLink id="dashboard" icon={Users} to="/dashboard">*/}
            {/*    Dashboard*/}
            {/*</NavigationLink>*/}
            {/*<NavigationLink id="settings" icon={Settings} to="/settings">*/}
            {/*    Settings*/}
            {/*</NavigationLink>*/}
            {/*<div className="w-px h-6 bg-primary mx-2"></div>*/}
            {/*<ProgressIndicator/>*/}
            {/*<ThemeToggle/>*/}
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id);
                        navigate(tab.to);
                    }}
                    className={`${
                        activeTab === tab.id ? "" : "hover:text-gray-600 dark:hover:text-white/60"
                    } relative cursor-pointer font-semibold font-black rounded-full px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-white outline-sky-400 dark:outline-sky-500 transition focus-visible:outline-2`}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                    }}
                >
                    {activeTab === tab.id && (
                        <motion.span
                            layoutId="bubble"
                            className="absolute inset-0 z-10 bg-orange-500 mix-blend-multiply"
                            style={{borderRadius: 9999}}
                            transition={{type: "spring", bounce: 0.2, duration: 0.6}}
                        />
                    )}
                    <span className={"flex items-center justify-center "}>
                        <tab.icon className="w-4 h-4 mr-2 inline-block"/>
                        <span>{tab.label}</span>
                    </span>
                </button>

            ))}
            <div className={"border-r-2 border-primary"}></div>
            <ProgressIndicator/>
            <ThemeToggle/>
        </div>
    );
}
