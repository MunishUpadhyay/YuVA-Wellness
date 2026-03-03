import React from 'react';
import { cn } from '../../utils/utils';
import styles from '../../styles/components/Input.module.css';

const Input = React.forwardRef(({ className, type, label, error, variant = 'default', ...props }, ref) => {
    return (
        <div className={styles.inputContainer}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                className={cn(
                    styles.input,
                    variant === 'glass' && styles.glass,
                    error && styles.error,
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
});
Input.displayName = 'Input';

export { Input };
