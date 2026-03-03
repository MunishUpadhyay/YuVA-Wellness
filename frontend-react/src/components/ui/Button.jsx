import React from 'react';
import { cn } from '../../utils/utils';
import styles from '../../styles/components/Button.module.css';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
    return (
        <button
            className={cn(styles.button, styles[variant], styles[size], className)}
            ref={ref}
            {...props}
        />
    );
});

Button.displayName = 'Button';

export { Button };
