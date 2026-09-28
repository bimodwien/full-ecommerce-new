import React from 'react';
import type { Role } from '@/models/user.model';
import FloatingInput from './floating-input';
import { RegisterFormState } from './use-register-form';

type Formik = RegisterFormState['formik'];

const TEXT_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text' },
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'email', label: 'Email Address', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
] as const;

const fieldLabel = 'block text-sm font-medium text-gray-900';

export function TextFields({ formik }: { formik: Formik }) {
  return (
    <>
      {TEXT_FIELDS.map(({ name, label, type }) => (
        <div key={name} className="space-y-2">
          <label className={fieldLabel}>{label}</label>
          <FloatingInput
            id={name}
            name={name}
            label={label}
            type={type}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
        </div>
      ))}
    </>
  );
}

function RoleOption({ formik, role }: { formik: Formik; role: Role }) {
  const checked = formik.values.role === role;
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <div className="relative">
        <input
          type="radio"
          name="role"
          value={role}
          checked={checked}
          onChange={() => formik.setFieldValue('role', role)}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            checked
              ? 'bg-emerald-600 border-emerald-600'
              : 'border-zinc-300 bg-transparent'
          }`}
        >
          {checked && (
            <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          )}
        </div>
      </div>
      <span className="text-sm text-zinc-700 capitalize">{role}</span>
    </label>
  );
}

export function RoleField({ formik }: { formik: Formik }) {
  return (
    <div className="space-y-2">
      <label className={fieldLabel}>Role</label>
      <div className="flex items-center space-x-8">
        <RoleOption formik={formik} role="buyer" />
        <RoleOption formik={formik} role="seller" />
      </div>
    </div>
  );
}
