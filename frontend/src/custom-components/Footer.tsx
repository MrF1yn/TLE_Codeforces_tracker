import {BookOpen, Github, Globe, Linkedin, Mail, Send, Twitter} from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-background text-black dark:text-gray-300 border-t border-gray-500 dark:border-gray-800">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-black dark:text-white">TLE CodeForces</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Empowering students and educators with data-driven competitive programming analytics and
                            insights.
                        </p>
                        <div className="flex space-x-4">
                            <a href={"https://github.com/MrF1yn"} target={"_blank"} rel="noopener noreferrer"
                               className="w-10 h-10 bg-accent dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer dark:hover:bg-gray-700 transition-colors">
                                <Github className="w-5 h-5"/>
                            </a>
                            <a
                                className="w-10 h-10 bg-accent dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer dark:hover:bg-gray-700 transition-colors">
                                <Twitter className="w-5 h-5"/>
                            </a>
                            <a href={"https://www.linkedin.com/in/dibyajyoti-dey-4652732a1/"} target={"_blank"}
                               rel="noopener noreferrer"
                               className="w-10 h-10 bg-accent dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer dark:hover:bg-gray-700 transition-colors">
                                <Linkedin className="w-5 h-5"/>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/dashboard"
                                   className="hover:text-orange-400 transition-colors cursor-pointer">Dashboard</a></li>
                            <li><a href="/settings"
                                   className="hover:text-orange-400 transition-colors cursor-pointer">Settings</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a
                                className="hover:text-orange-400 transition-colors cursor-pointer">Documentation</a>
                            </li>
                            <li><a className="hover:text-orange-400 transition-colors cursor-pointer">API
                                Reference</a></li>
                            <li><a
                                className="hover:text-orange-400 transition-colors cursor-pointer">Tutorials</a></li>
                            <li><a
                                className="hover:text-orange-400 transition-colors cursor-pointer">Blog</a></li>
                            <li><a
                                className="hover:text-orange-400 transition-colors cursor-pointer">Support</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Stay Updated</h4>
                        <p className="text-sm text-gray-400">
                            Get the latest updates on new features and competitive programming insights.
                        </p>
                        <div className="space-y-3">
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2 bg-accent dark:bg-gray-800 border border-border rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm"
                                />
                                <button
                                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-r-lg hover:from-orange-500 hover:to-orange-700 transition-all duration-200 flex items-center">
                                    <Send className="w-4 h-4"/>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-500"/>
                                <span className="text-xs text-gray-500">Weekly programming tips & updates</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div
                            className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
                            <p>&copy; 2025 Student Dashboard. All rights reserved.</p>
                            <div className="flex space-x-4">
                                <a href="/privacy" className="hover:text-orange-400 transition-colors cursor-pointer">Privacy
                                    Policy</a>
                                <a href="/terms" className="hover:text-orange-400 transition-colors cursor-pointer">Terms
                                    of Service</a>
                                <a href="/cookies" className="hover:text-orange-400 transition-colors cursor-pointer">Cookie
                                    Policy</a>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Globe className="w-4 h-4"/>
                            <span>Made with ❤️ By Dibyajyoti Dey</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}