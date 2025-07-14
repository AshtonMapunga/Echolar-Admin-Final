import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import AuthService from 'src/services/teacher_services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.loginTeacher({ email, password });
      
      if (response) {
        localStorage.setItem('teachertoken', response.token);
        localStorage.setItem('teacherData', JSON.stringify(response.data));
        alert('Login successful!');
        router.push('/');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {isLoading ? (
        <>
          <Skeleton variant="rounded" width="100%" height={56} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" width="100%" height={56} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" width="100%" height={40} />
        </>
      ) : (
        <>
          <TextField
            fullWidth
            name="email"
            label="Email address"
            value={email}
            onChange={handleEmailChange}
            sx={{ mb: 3 }}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
            Forgot password?
          </Link>

          <TextField
            fullWidth
            name="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="contained"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        {isLoading ? (
          <>
            <Skeleton variant="text" width={100} height={40} />
            <Skeleton variant="text" width={250} height={20} />
          </>
        ) : (
          <>
            <Typography variant="h5">Sign in</Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              Don&apos;t have an account?
              <Link variant="subtitle2" sx={{ ml: 0.5 }} href="/signup">
                Get started
              </Link>
            </Typography>
          </>
        )}
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </>
        ) : (
          <>
            <IconButton color="inherit">
              <Iconify width={22} icon="socials:google" />
            </IconButton>
            <IconButton color="inherit">
              <Iconify width={22} icon="socials:github" />
            </IconButton>
            <IconButton color="inherit">
              <Iconify width={22} icon="socials:twitter" />
            </IconButton>
          </>
        )}
      </Box>
    </>
  );
}