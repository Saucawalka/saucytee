import { Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import img1 from '../assets/edit.png';

interface SignupFormValues {
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  isAdmin?: boolean;
  adminCode?: string;
}

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Full name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').required('Phone is required'),
  address: Yup.string().required('Address is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if URL has ?admin=true to auto-fill admin values
  const isAdminSignup = new URLSearchParams(location.search).get('admin') === 'true';

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
      isAdmin: isAdminSignup,                     // hidden admin field
      adminCode: isAdminSignup ? '04310112saucytee' : '', // hidden admin code
    },
    validationSchema: SignupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          isAdmin: isAdminSignup,
        };
    
        if (isAdminSignup) {
          payload.adminCode = prompt('Enter admin code:') || ''; // Ask user for the secret code
        }
    
        const res = await fetch('http://localhost:3000/api/userInfo/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
    
        const data = await res.json();
        console.log('Signup result:', data);
    
        if (res.ok) {
          navigate('/signin');
        } else {
          alert(data.message || 'Signup failed');
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
      } finally {
        setSubmitting(false);
      }
    }
    ,
  });

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src={img1} alt="Your Company" />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Create your account</h2>
      </div>

      <form onSubmit={formik.handleSubmit} className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {[
          { name: 'name', label: 'Full Name' },
          { name: 'username', label: 'Username' },
          { name: 'email', label: 'Email address', type: 'email' },
          { name: 'phone', label: 'Phone Number' },
          { name: 'address', label: 'Contact address' },
          { name: 'password', label: 'Password', type: 'password' },
          { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
        ].map(({ name, label, type = 'text' }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-900">{label}</label>
            <div className="mt-2">
              <input
                type={type}
                id={name}
                {...formik.getFieldProps(name)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
              {formik.touched[name as keyof SignupFormValues] && formik.errors[name as keyof SignupFormValues] && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors[name as keyof SignupFormValues]}
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none"
        >
          {formik.isSubmitting ? 'Signing up...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in here</Link>
      </p>
    </div>
  );
};

export default Signup;
