'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { api } from '@/lib/api';

function SignUpForm() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
      });
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const router = useRouter();
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
    
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
    
        setLoading(true);
    
        try {
          const response = await api.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
          });
    
          if (response.error) {
            setError(response.error);
          } else {
            // Registration successful, redirect to OTP send page
            router.push(`/otp/send?email=${encodeURIComponent(formData.email)}`);
          }
        } catch (err: any) {
          setError(err.message || 'Registration failed. Please try again.');
        } finally {
          setLoading(false);
        }
      };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col items-center justify-center">
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    )}

    <div className='w-full'>
      <label htmlFor="name" className="block text-sm font-medium text-[#242424] mb-2">
        Full Name
      </label>
      <div className="relative">
        {/* <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>
    </div>

    <div className='w-full'>
      <label htmlFor="email" className="block text-sm font-medium text-[#242424] mb-2">
        Email
      </label>
      <div className="relative">
        {/* <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>
    </div>

    <div className='w-full'>
      <label htmlFor="phone" className="block text-sm font-medium text-[#242424] mb-2">
        Phone (Optional)
      </label>
      <div className="relative">
        {/* <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </div>

    <div className='w-full'>
      <label htmlFor="password" className="block text-sm font-medium text-[#242424] mb-2">
        Password
      </label>
      <div className="relative">
        {/* <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
      <p className="text-xs text-[#242424] mt-1">Must be at least 8 characters</p>
    </div>

    <div className='w-full'>
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#242424] mb-2">
        Confirm Password
      </label>
      <div className="relative">
        {/* <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="auth-submit-button mx-auto"
    >
      {loading ? 'Creating Account...' : 'Create Account'}
    </button>
  </form>
  );
}

export default SignUpForm;
