import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import Input from '../components/common/Input.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import Button from '../components/common/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useUI();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      addToast('Local validation passed. Entering prototype workspace.', 'info');
      navigate('/app');
    }, 600);
  };

  return (
    <AuthLayout
      title="Sign in to PRANPAN"
      subtitle="Access your synthesized document workspace"
      footerLink={
        <span>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-navy-900 hover:text-accent-600 underline"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          error={errors.email}
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-navy-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-surface-border text-navy-900 focus:ring-accent-600"
            />
            <span>Remember me for 30 days</span>
          </label>

          <button
            type="button"
            onClick={() => addToast('Password recovery will be activated in Phase 2', 'info')}
            className="text-navy-600 hover:text-navy-900 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            icon={LogIn}
          >
            Sign In to Prototype
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
