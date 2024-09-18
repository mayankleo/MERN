import { forwardRef, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    customlable?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ ...props }, ref) => {
    return (
        <div className='flex'>
            <label 
            className='capitalize min-w-[25%] text-center rounded-md rounded-e-none p-2 border-2 border-r-0 border-black bg-black text-white font-semibold'
             htmlFor={props.name}>{props.customlable || props.name}</label>
            <input className='w-full border-2 rounded-md border-black px-4 py-2 rounded-s-none' {...props} ref={ref} />
        </div>
    );
});

export default InputField;
