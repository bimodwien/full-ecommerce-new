import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { userRegister } from '@/libraries/redux/middlewares/auth.middleware';
import type { Role, TRegisterPayload } from '@/models/user.model';
import type { AppDispatch } from '@/libraries/redux/store';

// Backend error message(s), including a { field: message } map.
function registerErrorMessage(error: any) {
  const data = error?.response?.data;
  if (typeof data?.message === 'string') return data.message as string;
  if (typeof data?.error === 'string') return data.error as string;
  if (Array.isArray(data?.errors)) return data.errors.join(', ') as string;
  if (data && typeof data === 'object') {
    const parts = Object.values(data)
      .filter((v) => typeof v === 'string')
      .slice(0, 3) as string[];
    return parts.length ? parts.join(', ') : 'Register failed';
  }
  return (error?.message as string) || 'Register failed';
}

const registerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
  role: Yup.string().required('Role is required'),
});

type RegisterValues = TRegisterPayload & { role: Role };
type SubmitDeps = {
  dispatch: AppDispatch;
  router: ReturnType<typeof useRouter>;
  setSubmitError: (msg: string | null) => void;
  setIsSubmitting: (on: boolean) => void;
};

async function submitRegister(values: RegisterValues, deps: SubmitDeps) {
  deps.setSubmitError(null);
  deps.setIsSubmitting(true);
  const toastId = toast.loading('Creating your account...');
  try {
    const result: any = await deps.dispatch(userRegister(values));
    if (result?.success) {
      toast.success('Registration successful. Please sign in.', {
        id: toastId,
      });
      deps.router.push('/login');
    } else {
      toast.error('Register failed', { id: toastId });
    }
  } catch (error: any) {
    const message = registerErrorMessage(error);
    toast.error(message, { id: toastId });
    deps.setSubmitError(message);
  } finally {
    deps.setIsSubmitting(false);
  }
}

export function useRegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'buyer' as Role,
    },
    validationSchema: registerSchema,
    onSubmit: (values) =>
      submitRegister(values, {
        dispatch,
        router,
        setSubmitError,
        setIsSubmitting,
      }),
  });

  return { formik, submitError, isSubmitting };
}

export type RegisterFormState = ReturnType<typeof useRegisterForm>;
