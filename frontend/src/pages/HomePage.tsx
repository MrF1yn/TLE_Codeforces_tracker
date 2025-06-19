import {useState, useEffect} from 'react';
import {
    BookOpen,
    TrendingUp,
    Users,
    Award,
    BarChart3,
    ArrowRight,
    Play,
    Trophy, Zap, Star,
} from 'lucide-react';
import {Link} from "react-router-dom";
import {Footer} from "@/custom-components/Footer.tsx";
import {GlowingButton} from "@/custom-components/GlowingButton.tsx";
import {FloatingCard} from "@/custom-components/FloatingCard.tsx";
// import CtaSection from "@/custom-components/CtaSection.tsx";
// import {TypewriterEffect} from "@/custom-components/typewriter-effect.tsx";

const AnimatedCounter = ({end, duration = 2000, suffix = ''}: {
    end: number;
    duration?: number;
    suffix?: string;
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString()}{suffix}</span>;
};



const PulseIcon = ({icon: Icon, colorClasses}: {
    icon: React.ComponentType<{ className?: string }>;
    colorClasses: {
        bg: string;
        text: string;
        pulse: string;
    };
}) => (
    <div className={`relative inline-flex items-center justify-center w-12 h-12 ${colorClasses.bg} rounded-xl`}>
        <Icon className={`w-6 h-6 ${colorClasses.text}`}/>
        <div className={`absolute inset-0 ${colorClasses.pulse} rounded-xl animate-ping opacity-20`}></div>
    </div>
);



export default function CompetitiveProgrammingHomepage() {
    // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // const [isLoaded, setIsLoaded] = useState(false);

    // useEffect(() => {
    //     setIsLoaded(true);
    //     const handleMouseMove = (e: any) => {
    //         setMousePosition({ x: e.clientX, y: e.clientY });
    //     };
    //     window.addEventListener('mousemove', handleMouseMove);
    //     return () => window.removeEventListener('mousemove', handleMouseMove);
    // }, []);
    const colorKeys = ['blue', 'purple', 'green', 'orange'] as const;
    type ColorKey = typeof colorKeys[number];
    const colorMap: Record<ColorKey, { bg: string; text: string; pulse: string }> = {
        blue: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            pulse: 'bg-blue-200 dark:bg-blue-700'
        },
        purple: {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-400',
            pulse: 'bg-purple-200 dark:bg-purple-700'
        },
        green: {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-600 dark:text-green-400',
            pulse: 'bg-green-200 dark:bg-green-700'
        },
        orange: {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400',
            pulse: 'bg-orange-200 dark:bg-orange-700'
        }
    };

    const features: {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        description: string;
        color: ColorKey;
    }[] = [
        {
            icon: TrendingUp,
            title: 'Performance Analytics',
            description: 'Track progress with detailed metrics and visualizations',
            color: 'blue'
        },
        {
            icon: Users,
            title: 'Multi-Platform Support',
            description: 'Aggregate data from Codeforces, AtCoder, LeetCode & more',
            color: 'purple'
        },
        {
            icon: Award,
            title: 'Achievement Tracking',
            description: 'Monitor contests, ratings, and skill development',
            color: 'green'
        },
        {
            icon: BarChart3,
            title: 'Advanced Reports',
            description: 'Generate comprehensive performance reports',
            color: 'orange'
        }
    ];

    const stats = [
        {label: 'Students Tracked', value: 10000, suffix: '+'},
        {label: 'Problems Solved', value: 500000, suffix: '+'},
        {label: 'Contests Analyzed', value: 25000, suffix: '+'},
        {label: 'Platforms Supported', value: 8, suffix: ''}
    ];

    return (
        <>
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

            <div className="min-h-screen  overflow-hidden">
                {/* Hero Section */}
                <div className="relative z-10 container mx-auto px-6 py-5">
                    <div className="text-center mb-16 text-primary">
                        <FloatingCard delay={0}>
                            <div
                                className=" inline-flex items-center px-2 sm:px-6 py-3 border-border border-2  rounded-full mb-8 backdrop-blur-sm bg-primary/10  ">
                                <div className="relative">
                                    <BookOpen className="w-5 h-5 hidden sm:block"/>
                                    <div
                                        className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse hidden sm:block"></div>
                                    </div>
                                    <span className="text-sm md:text-md font-semibold ml-2 ">
                                      Competitive Programming Analytics Platform
                                    </span>
                                </div>
                        </FloatingCard>

                        <FloatingCard delay={200}>
                            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                Student
                                <span className="text-primary">
                  {' '}Dashboard
                </span>
                            </h1>
                        </FloatingCard>

                        <FloatingCard delay={400}>
                            <p className="text-sm md:text-xl text-primary dark:text-white max-w-4xl mx-auto mb-12 leading-relaxed ">
                                Unlock the power of data-driven competitive programming. Track progress, analyze
                                performance,
                                and accelerate student growth across multiple platforms with cutting-edge analytics.
                            </p>
                        </FloatingCard>

                        <FloatingCard delay={600}>
                            <div
                                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                                <Link
                                    to="/dashboard"
                                >
                                    <GlowingButton variant="primary">
                                        <Play className="w-5 h-5"/>
                                        <span>Start Tracking</span>
                                        <ArrowRight className="w-5 h-5"/>

                                    </GlowingButton>
                                </Link>
                            </div>
                        </FloatingCard>
                    </div>

                    {/* Stats Section */}
                    <FloatingCard delay={800} className="mb-20">
                        <div
                            className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-primary-accent-transparent backdrop-blur-lg rounded-3xl p-8 border-border border-2  shadow-xl">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-2">
                                        <AnimatedCounter end={stat.value} suffix={stat.suffix}/>
                                    </div>
                                    <div className="text-sm text-primary dark:text-gray-200 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FloatingCard>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {features.map((feature, index) => (
                            <FloatingCard key={index} delay={1000 + index * 200}>
                                <div
                                    className="bg-gradient-secondary-accent-transparent backdrop-blur-lg rounded-2xl p-8 border-border border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 group cursor-pointer">
                                    <div className="mb-6">
                                        <PulseIcon icon={feature.icon} colorClasses={colorMap[feature.color]}/>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary dark:text-white mb-4 group-hover:text-primary/80 dark:group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="font-medium text-md text-primary dark:text-gray-200 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </FloatingCard>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <FloatingCard delay={1800}>
                        <div
                            className="text-center bg-primary rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                }}></div>
                            </div>
                            <div className="relative z-10">
                                <Trophy className="w-16 h-16 mx-auto mb-6 animate-bounce"/>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your
                                    Analytics?</h2>
                                <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                                    Join thousands of educators and students already using our platform
                                </p>
                                <GlowingButton variant="secondary"
                                               className="bg-white text-blue-600 hover:bg-gray-50 hover:scale-110">
                                    <Zap className="w-5 h-5"/>
                                    <span>Get Started Free</span>
                                    <Star className="w-5 h-5"/>
                                </GlowingButton>
                            </div>
                        </div>
                        {/*<CtaSection/>*/}
                    </FloatingCard>


                </div>

                <Footer/>
            </div>

        </>
    );
}