import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', ...props }) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        ghost: 'px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all',
    };

    return (
        <button
            className={cn(variants[variant], className)}
            {...props}
        />
    );
};

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('card-premium p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const Badge = ({ className, variant = 'info', children, ...props }) => {
    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        neutral: 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600',
    };

    return (
        <span
            className={cn(variants[variant], className)}
            {...props}
        >
            {children}
        </span>
    );
};

export const Input = ({ className, label, error, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-tighter">{label}</label>}
            <input
                className={cn('input-field', error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500', className)}
                {...props}
            />
            {error && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{error}</p>}
        </div>
    );
};
