import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

// Input whose label floats up into the border once focused or filled.
export default function FloatingInput({
  id,
  label,
  className = 'text-base',
  ...inputProps
}: Props) {
  return (
    <div className="relative">
      <input
        id={id}
        placeholder=" "
        className={`peer w-full h-12 ${className} border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300`}
        {...inputProps}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                   peer-focus:-top-2 peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                   peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium"
      >
        {label}
      </label>
    </div>
  );
}
