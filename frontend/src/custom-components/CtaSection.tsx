import { useState } from 'react';
import { Trophy, Zap } from 'lucide-react';
import {GlowingButton} from "@/custom-components/GlowingButton.tsx";
import '@/App.css';
const CallToActionSection = () => {
    const [showPulse, setShowPulse] = useState(false);

    return (
        <div className="text-center bg-black/90 border border-orange-500/20 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Subtle orange accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-orange-400 to-orange-600"></div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>

            {/* Orange glow effects */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <Trophy className="w-16 h-16 mx-auto mb-6 text-orange-400 animate-bounce"/>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Transform Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Analytics
          </span>
                    ?
                </h2>

                <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto text-gray-300">
                    Join thousands of educators and students already using our platform
                </p>

                <div
                    className="relative inline-block"
                    onMouseEnter={() => setShowPulse(true)}
                    onMouseLeave={() => setShowPulse(false)}
                >
                    {showPulse && (
                        <div className="absolute top-1/2 left-1/2 w-7 h-7 bg-orange-500/60 rounded-full animate-pulse-expand pointer-events-none"></div>
                    )}
                    <GlowingButton
                        variant="secondary"
                        className="bg-white text-orange-600 hover:bg-gray-50 hover:scale-110 border border-orange-400/50 shadow-lg shadow-orange-500/25"
                    >
                        <Zap className="w-5 h-5"/>
                        <span>Get Started Free</span>
                    </GlowingButton>
                </div>
            </div>
        </div>
    );
};

export default CallToActionSection;