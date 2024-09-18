import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { toast } from 'react-toastify';
import { z } from 'zod';

const schema = z.object({
  username: z
    .string()
    .min(1, 'Username required'),
  password: z
    .string()
    .min(4, 'Password required')
});

type FormDataType = z.infer<typeof schema>;
type FormDataErrorType = Partial<Record<keyof FormDataType, string>>;

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search).get('RedirectTo');



  const [formData, setFormData] = useState<FormDataType>({
    username: 'Hukum Gupta',
    password: 'Hukum Gupta',
  });
  const [errors, setErrors] = useState<FormDataErrorType>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = schema.safeParse(formData);
    if (!result.success) {
      const zodErrors: Partial<Record<keyof FormDataType, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          const fieldName = error.path[0] as keyof FormDataType;
          zodErrors[fieldName] = error.message;
        }
      });
      setErrors(zodErrors);
    } else {
      setErrors({});
      try {
        const response = await axios.post('http://localhost:3000/login', formData, { withCredentials: true });
        if (response.status == 200) {
          localStorage.setItem('isAuthenticated', "true");
          localStorage.setItem('name', response.data.name);
          navigate(queryParams || '/dashboard');
        }
      } catch (error) {
        toast.error("Invalid Credentials!")
      }
    }
  };

  return (
    <div className='w-screen flex items-center flex-col gap-8 my-10'>
      <h1 className='text-5xl font-semibold'>Login</h1>
      <form onSubmit={handleSubmit} className='flex justify-center flex-col gap-4 w-2/5'>
        <div>
          <InputField name="username" type="text" value={formData.username} onChange={handleChange} />
          {errors.username && <span className='text-red-600 font-medium'>{errors.username}</span>}
        </div>
        <div>
          <InputField name="password" type="password" value={formData.password} onChange={handleChange} />
          {errors.password && <span className='text-red-600 font-medium'>{errors.password}</span>}
        </div>
        <Button type='submit'>Register</Button>
      </form>
    </div>
  );
};

export default Login;
