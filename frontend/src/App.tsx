
// import { BookOpen} from "lucide-react"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import StudentTable from "@/custom-components/StudentTable.tsx";
import CompetitiveProgrammingHomepage from "@/pages/HomePage.tsx";
import StudentProfile from "@/pages/StudentProfile.tsx";
import {Navbar} from "@/custom-components/Navbar.tsx";
import {Toaster} from "sonner";
import SettingsPage from "@/pages/SettingsPage.tsx";

function MainContent() {
    // const location = useLocation()

    return (
        <main className="flex-1">
            <div className=" mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                {/*    {location.pathname === '/dashboard' && (*/}
                {/*        <div className="text-center mb-8">*/}
                {/*            <div*/}
                {/*                className=" inline-flex flex-col md:flex-row items-center space-x-3 gap-2 px-6 py-3 border-border border-2  rounded-full mb-8 backdrop-blur-sm bg-primary/10  ">*/}
                {/*                <div className="relative">*/}
                {/*                    <BookOpen className="w-5 h-5 "/>*/}
                {/*                    <div*/}
                {/*                        className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>*/}
                {/*                </div>*/}
                {/*                <span className="text-sm md:text-md font-semibold ">*/}
                {/*  Competitive Programming Analytics*/}
                {/*</span>*/}
                {/*            </div>*/}
                {/*            <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight dark:text-white mb-2">*/}
                {/*                {"Student "}*/}
                {/*                <span className={"text-primary"}>*/}
                {/*                    Dashboard*/}
                {/*                </span>*/}
                {/*            </h1>*/}
                {/*            <p className="font-semibold text-lg text-primary dark:text-white max-w-2xl mx-auto">*/}
                {/*                Track competitive programming progress, analyze performance metrics, and monitor student*/}
                {/*                growth across multiple platforms.*/}
                {/*            </p>*/}
                {/*        </div>*/}
                {/*    )}*/}

                    {/*{location.pathname.startsWith('/students/') && (*/}
                    {/*    <div className="mb-6">*/}
                    {/*        <Link*/}
                    {/*            to="/"*/}
                    {/*            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-4"*/}
                    {/*        >*/}
                    {/*            <Home className="w-4 h-4 mr-2" />*/}
                    {/*            Back to Dashboard*/}
                    {/*        </Link>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>

                {/* Routes */}
                <Routes>
                    <Route path="/dashboard" element={<StudentTable />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/" element={<CompetitiveProgrammingHomepage />} />
                    <Route path="/students/:id" element={<StudentProfile />} />
                </Routes>
            </div>
        </main>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen text-foreground bg-background">
                <Toaster />
                <Navbar />
                <MainContent />


                {/* Background decoration */}
                {/*<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">*/}
                {/*    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>*/}
                {/*    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl"></div>*/}
                {/*    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-600/3 dark:to-purple-600/3 rounded-full blur-3xl"></div>*/}
                {/*</div>*/}
            </div>
        </BrowserRouter>
    )
}