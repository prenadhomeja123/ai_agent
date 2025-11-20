'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiSend } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function SendOTPPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.sendOTP(email);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('OTP sent successfully! Please check your email.');
        // Redirect to verify OTP page after 2 seconds
        setTimeout(() => {
          router.push(`/otp/verify?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      if (errorMessage.includes('backend is running')) {
        setError('Backend server is not running. Please start it with: python manage.py runserver');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send OTP</h1>
          <p className="text-gray-600">We'll send a verification code to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <FiSend className="w-5 h-5" />
            <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already verified?{' '}
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

