'use client';

import { motion } from 'framer-motion';

/** Ko'rinish maydoniga kirganda pastdan silliq chiqib kelish */
const Reveal: React.FC<React.PropsWithChildren<{ className?: string; delay?: number }>> = ({
    className,
    delay = 0,
    children,
}) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
};

export default Reveal;
