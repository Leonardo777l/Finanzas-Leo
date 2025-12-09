import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { type ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;
}

export function GlassCard({ children, className, hoverEffect = false, delay = 0 }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "glass rounded-2xl p-6",
                hoverEffect && "glass-hover hover:-translate-y-1",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
