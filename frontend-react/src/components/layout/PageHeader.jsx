import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const PageHeader = ({
    title,
    subtitle,
    icon: Icon,
    color = "text-accent-violet",
    orbitColor = "border-accent-violet/30"
}) => {
    return (
        <section className="relative pt-8 pb-12 overflow-hidden px-4">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
                {/* Hero Icon Composition */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative w-32 h-32 flex items-center justify-center"
                >
                    {/* Rotating Ring */}
                    <motion.div
                        className={`absolute inset-0 rounded-full border ${orbitColor}`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]`}></div>
                    </motion.div>

                    {/* Inner Icon */}
                    <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Icon size={40} className={`${color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
                        </motion.div>
                    </div>

                    {/* Sparkles */}
                    <motion.div
                        className="absolute -top-2 -right-2 text-accent-amber"
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Sparkles size={16} />
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold mb-4 font-heading tracking-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        {title}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg text-slate-400 max-w-2xl font-light"
                >
                    {subtitle}
                </motion.p>
            </div>
        </section>
    );
};

export default PageHeader;
