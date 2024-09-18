import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonFieldProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    customLable?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonFieldProps>(({ ...props }, ref) => {
    return (
        <button className={`bg-black text-white capitalize font-semibold px-4 py-3 rounded-md`} {...props} ref={ref}>{props.children || 'Button'}</button>
    );
});

export default Button;
