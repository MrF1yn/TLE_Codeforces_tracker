import {useState} from "react";
export const GlowingButton = ({children, variant = 'primary', onClick, className = ''}: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    className?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseClasses = 'relative inline-flex items-center px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4';
    const variants = {
        primary: 'bg-primary text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className} cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
      <span className="relative z-10 flex items-center space-x-2">
        {children}
      </span>
            {variant === 'primary' && (
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-30' : ''}`}></div>
            )}
        </button>
    );
};