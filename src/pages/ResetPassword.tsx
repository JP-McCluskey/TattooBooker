import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { validatePassword, checkRateLimit } from '../lib/validation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const RATE_LIMIT_KEY = 'password_reset_attempts';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get token from URL
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      const { errors } = validatePassword(value);
      setValidationErrors(errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check rate limiting
    if (!checkRateLimit(RATE_LIMIT_KEY, MAX_ATTEMPTS, WINDOW_MS)) {
      setError(t('auth.tooManyAttempts'));
      return;
    }

    // Validate passwords
    const { isValid, errors } = validatePassword(formData.password);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    try {
      setLoading(true);

      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) throw updateError;

      // Log the password reset
      await supabase.from('auth_logs').insert({
        event: 'password_reset',
        status: 'success',
        ip_address: null, // We can't get this in the browser
        user_agent: navigator.userAgent
      });

      // Sign out all other sessions
      await supabase.auth.signOut({ scope: 'others' });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      // Log failed attempt
      await supabase.from('auth_logs').insert({
        event: 'password_reset',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        ip_address: null,
        user_agent: navigator.userAgent
      });

      setError(err instanceof Error ? err.message : t('auth.generalError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/login')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('auth.backToLogin')}
      </Button>

      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('auth.resetPassword')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.resetPasswordDescription')}
          </p>
        </div>

        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 border border-green-500/50 rounded-lg bg-green-500/10 text-green-500 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">{t('auth.passwordResetSuccess')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">
              {t('auth.newPassword')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
                disabled={loading || success}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || success}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {validationErrors.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('auth.confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pr-10"
                disabled={loading || success}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading || success}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('auth.resettingPassword')}
              </>
            ) : (
              t('auth.resetPassword')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;