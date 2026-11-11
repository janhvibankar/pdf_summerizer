import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Check, X, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import Input from '../components/common/Input.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useUI();

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!hasMinLength) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!hasNumberOrSpecial) {
      newErrors.password = 'Password must contain a number or special character.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must accept the terms of service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const user = await register({
        name: fullName.trim(),
        email: email.trim(),
        password
      });

      addToast(`Welcome to PRANPAN, ${user.name}! Account registered.`, 'success');
      navigate('/app', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please review your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start distilling complex documents with PRANPAN"
      footerLink={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy-900 hover:text-accent-600 underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
          }}
          placeholder="Jane Doe"
          error={errors.fullName}
          required
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          }}
          placeholder="jane@example.com"
          error={errors.email}
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          }}
          placeholder="At least 8 characters"
          error={errors.password}
          required
          autoComplete="new-password"
        />

        {/* Password Strength Guidance */}
        <div className="p-2.5 rounded bg-warm-50 border border-warm-200 text-[11px] space-y-1 text-navy-600">
          <div className="flex items-center gap-1.5">
            {hasMinLength ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-navy-300" />
            )}
            <span>At least 8 characters long</span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasNumberOrSpecial ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <X className="w-3.5 h-3.5 text-navy-300" />
            )}
            <span>Contains a number or special symbol</span>
          </div>
        </div>

        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
          }}
          placeholder="Repeat password"
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Terms acceptance */}
        <div className="space-y-1">
          <label className="flex items-start gap-2 cursor-pointer text-xs text-navy-700">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
              }}
              className="mt-0.5 rounded border-surface-border text-navy-900 focus:ring-accent-600"
            />
            <span className="leading-tight">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => addToast('Terms will be published prior to public launch', 'info')}
                className="underline text-navy-900 hover:text-accent-600"
              >
                Terms of Service
              </button>{' '}
              and Privacy Policy.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.agreeTerms}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            icon={UserPlus}
          >
            Create Account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
