import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { userLogin } from '@/libraries/redux/middlewares/auth.middleware';

function loginErrorMessage(error: any) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'Login failed. Please try again.';
}

export function useLoginForm() {
  const dispatch = useAppDispatch();
  return useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object().shape({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      const id = toast.loading('Authenticating...');
      try {
        await dispatch(
          userLogin({ username: values.username, password: values.password }),
        );
        // If no error thrown we assume success
        toast.success('Login success', { id });
        // small delay so the toast is visible before navigating
        setTimeout(() => {
          // Must be a full page load, not router.replace: the role-based
          // routing lives in proxy.ts, which only runs on a real server
          // request. Client-side nav can be served from the router cache,
          // leaving sellers stranded on '/' instead of '/dashboard'.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/';
        }, 1000);
      } catch (error: any) {
        toast.error(loginErrorMessage(error), { id });
      }
    },
  });
}
