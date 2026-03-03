import React from 'react';
import { cn } from '../../utils/utils';
import styles from '../../styles/components/Badge.module.css';

function Badge({ className, variant = 'default', ...props }) {
    return (
        <div className={cn(styles.badge, styles[variant], className)} {...props} />
    );
}

export { Badge };
