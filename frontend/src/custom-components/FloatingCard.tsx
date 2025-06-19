import {useEffect, useState} from "react";

export const FloatingCard = ({children, delay = 0, className = ''}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            } ${className}`}
            style={{
                animation: isVisible ? 'float 6s ease-in-out infinite' : 'none',
                animationDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
};