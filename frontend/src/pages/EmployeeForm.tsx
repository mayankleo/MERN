import { useEffect, useState } from 'react';
import axios from 'axios';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';

const baseSchema = z.object({
  name: z
    .string()
    .min(2, 'Name should have at least 2 characters')
    .max(20, 'Name can have a maximum of 20 characters')
    .regex(/^[A-Za-z\s]+$/, 'Name should only contain letters'),

  email: z.string().email('Invalid email address'),

  mobile_no: z
    .string()
    .min(10, 'Mobile number should have at least 10 digits')
    .max(15, 'Mobile number can have a maximum of 15 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only digits'),

  designation: z
    .string()
    .refine((value) => ['HR', 'Sales', 'Manager'].includes(value), {
      message: 'Designation must be one of: HR, Sales, Manager',
    }),

  gender: z
    .string()
    .refine((value) => ['Male', 'Female', 'Other'].includes(value), {
      message: 'Gender must be one of: Male, Female, Other',
    }),

  course: z
    .string()
    .refine((value) => ['MCA', 'BCA', 'BSC'].includes(value), {
      message: 'Course must be one of: MCA, BCA, BSC',
    }),

  image: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: 'Image file is required',
    })
});

const schema = baseSchema.extend({
  image: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: 'Image file is required',
    })
});

const schemaOptinalImg = baseSchema.extend({
  image: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: 'Image file is required',
    }).optional()
});


type FormDataType = z.infer<typeof schema>;
type FormDataErrorType = Partial<Record<keyof FormDataType, string>>;

const EmployeeForm = () => {
  const navigate = useNavigate()

  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${id}`, { withCredentials: true });
        setFormData({ ...response.data, image: undefined });
        setImageUrl(response.data.image)
      } catch (error) {
        toast.error("Error Fetching Data!")
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);


  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    email: '',
    mobile_no: '',
    designation: '',
    gender: '',
    course: '',
    image: null as unknown as File
  });

  const [errors, setErrors] = useState<FormDataErrorType>({});


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFormData({ ...formData, image: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePost = async () => {
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
        const response = await axios.post('http://localhost:3000/user', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          toast.success('Employee Added Successfully!');
          navigate('/employees');
        }
      } catch (error) {
        toast.error('Something Went Wrong!');
      }
    }
  };

  const handlePatch = async () => {
    const result = schemaOptinalImg.safeParse(formData);
    if (!result.success) {
      const zodErrors: Partial<Record<keyof FormDataType, string>> = {};

      result.error.errors.forEach((error) => {

        if (error.path.length > 0 && error.path[0] != 'image') {
          const fieldName = error.path[0] as keyof FormDataType;
          zodErrors[fieldName] = error.message;
        }
      });
      setErrors(zodErrors);
    } else {
      setErrors({});

      try {
        const response = await axios.patch(`http://localhost:3000/user/${id}`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 200) {
          toast.success('Employee Updated Successfully!');
          navigate('/employees');
        }
      } catch (error) {
        toast.error('Something Went Wrong!');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (id) {
      handlePatch();
    } else {
      handlePost();
    }
  }

  return (
    <div className="w-screen flex items-center flex-col gap-8 my-10">
      <h1 className="text-5xl font-semibold">{id ? 'Edit Employee' : 'Add Employee'}</h1>
      <form onSubmit={handleSubmit} className="flex justify-center flex-col gap-6 w-3/4">
        <div className="flex justify-evenly gap-6">
          <div className="w-full">
            <InputField name="name" type="text" value={formData.name} onChange={handleChange} />
            {errors.name && <span className="text-red-600 font-medium">{errors.name}</span>}
          </div>
          <div className="w-full">
            <InputField name="email" type="email" value={formData.email} onChange={handleChange} />
            {errors.email && <span className="text-red-600 font-medium">{errors.email}</span>}
          </div>
        </div>

        <div className="flex justify-evenly gap-6">
          <div className="w-full">
            <InputField name="mobile_no" customlable='Mobile No' type="tel" value={formData.mobile_no} onChange={handleChange} />
            {errors.mobile_no && <span className="text-red-600 font-medium">{errors.mobile_no}</span>}
          </div>
          <div className="w-full">
            <InputField name="designation" type="text" value={formData.designation} onChange={handleChange} />
            {errors.designation && <span className="text-red-600 font-medium">{errors.designation}</span>}
          </div>
        </div>

        <div className="flex justify-evenly gap-6">
          <div className="w-full">
            <InputField name="gender" type="text" value={formData.gender} onChange={handleChange} />
            {errors.gender && <span className="text-red-600 font-medium">{errors.gender}</span>}
          </div>
          <div className="w-full">
            <InputField name="course" type="text" value={formData.course} onChange={handleChange} />
            {errors.course && <span className="text-red-600 font-medium">{errors.course}</span>}
          </div>
        </div>

        <div className="flex justify-evenly gap-6">
          <div className="w-full">
            <InputField name="image" type="file" accept=".png, .jpg, .jpeg" onChange={handleChange} />
            {errors.image && <span className="text-red-600 font-medium">{errors.image}</span>}
          </div>
          {imageUrl &&
            <img src={`http://localhost:3000/images/${imageUrl}`} className='border-2 border-black rounded-md h-32' alt="image" />
          }
        </div>


        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default EmployeeForm;
