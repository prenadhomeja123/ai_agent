'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiKey, FiRefreshCw } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function VerifyOTPPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await api.verifyOTP(email, otp);

      if (response.error) {
        setError(response.error);
      } else {
        // OTP verified successfully
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    try {
      const response = await api.sendOTP(email);
      if (response.error) {
        setError(response.error);
      } else {
        setError('');
        alert('OTP resent successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter the 6-digit code sent to</p>
          <p className="text-gray-900 font-medium mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code from your email</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleResendOTP}
            disabled={resending}
            className="w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Resending...' : "Didn't receive code? Resend OTP"}</span>
          </button>

          <div className="text-center text-sm text-gray-600">
            <p>
              Wrong email?{' '}
              <Link href="/otp/send" className="text-primary-600 hover:text-primary-700 font-medium">
                Change email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

