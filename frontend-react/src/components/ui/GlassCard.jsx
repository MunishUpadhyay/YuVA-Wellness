import React from 'react';
import { cn } from '../../utils/utils';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className, hoverEffect = false, onClick, ...props }) => {
    const Component = onClick ? motion.button : motion.div;

    return (
        <Component
            onClick={onClick}
            className={cn(
                "bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg text-left w-full",
                hoverEffect && "hover:border-white/10 hover:bg-slate-800/40 hover:-translate-y-1 transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};

export default GlassCard;
