import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../common/Input.jsx';

export const PasswordInput = ({ label = 'Password', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      label={label}
      type={showPassword ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-navy-400 hover:text-navy-700 p-1 rounded focus:outline-none focus:ring-1 focus:ring-accent-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
};

export default PasswordInput;
