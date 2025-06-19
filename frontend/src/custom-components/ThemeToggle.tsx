import { Moon, Sun } from "lucide-react";
// import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
    };

    return (
        <button  className={"flex items-center gap-2 text-gray-600 dark:text-white hover:rotate-45 transition"} onClick={toggleTheme}>
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:inline-block" />
        </button>
    );
}
