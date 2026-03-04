import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    // Synchronized scroll to top on mount (before entrance animation)
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
