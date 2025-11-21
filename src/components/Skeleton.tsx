import { motion } from 'framer-motion';

interface SkeletonProps {
    width?: string;
    height?: string;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    className = '',
    variant = 'rectangular'
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'text':
                return 'rounded';
            case 'circular':
                return 'rounded-full';
            case 'card':
                return 'rounded-xl';
            case 'rectangular':
            default:
                return 'rounded-lg';
        }
    };

    return (
        <motion.div
            className={`bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 ${getVariantStyles()} ${className}`}
            style={{ width, height }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
            initial={{ backgroundSize: '200% 100%' }}
        />
    );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
    lines = 3,
    className = ''
}) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                height="16px"
                width={i === lines - 1 ? '70%' : '100%'}
                variant="text"
            />
        ))}
    </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`p-6 space-y-4 ${className}`}>
        <Skeleton height="200px" variant="card" />
        <Skeleton height="24px" width="60%" variant="text" />
        <SkeletonText lines={2} />
    </div>
);

export const SkeletonVideo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        <Skeleton height="300px" variant="card" />
        <Skeleton height="20px" width="80%" variant="text" />
        <div className="flex items-center gap-2">
            <Skeleton height="40px" width="40px" variant="circular" />
            <div className="flex-1">
                <Skeleton height="16px" width="40%" variant="text" />
            </div>
        </div>
    </div>
);

export const SkeletonTestimonial: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`p-6 space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
            <Skeleton height="60px" width="60px" variant="circular" />
            <div className="flex-1 space-y-2">
                <Skeleton height="20px" width="40%" variant="text" />
                <Skeleton height="16px" width="60%" variant="text" />
            </div>
        </div>
        <SkeletonText lines={3} />
    </div>
);
