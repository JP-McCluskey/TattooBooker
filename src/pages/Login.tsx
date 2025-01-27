import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MAX_RETRY_ATTEMPTS = 3;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await signIn(formData.email, formData.password);
      
      if (rememberMe) {
        // Store auth token with 30-day expiration
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberMeExpires', expirationDate.toISOString());
      }

      navigate('/');
    } catch (err) {
      setRetryCount(prev => prev + 1);
      
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        setError(t('auth.tooManyAttempts'));
        return;
      }

      if (err instanceof Error) {
        if (err.message.includes('invalid_credentials')) {
          setError(t('auth.invalidCredentials'));
        } else {
          setError(t('auth.generalError'));
        }
      } else {
        setError(t('auth.generalError'));
      }

      // Auto-retry on network errors
      if (err instanceof Error && err.message.includes('network')) {
        setTimeout(() => handleSubmit(e), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Implement password reset logic here
    setShowResetDialog(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('auth.backToSite')}
      </Button>

      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('auth.signIn')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.signInDescription')}
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('auth.email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              aria-required="true"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {t('auth.password')} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                aria-required="true"
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                {t('auth.rememberMe')}
              </Label>
            </div>

            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-primary hover:text-primary/90"
                >
                  {t('auth.forgotPassword')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('auth.resetPassword')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('auth.resetDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  {resetStep === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">{t('auth.email')}</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  )}
                  {resetStep === 'code' && (
                    <div className="space-y-2">
                      <Label htmlFor="resetCode">{t('auth.securityCode')}</Label>
                      <Input
                        id="resetCode"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                  )}
                  {resetStep === 'password' && (
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('auth.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetPassword}>
                    {t('auth.continue')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('auth.signingIn')}
              </>
            ) : (
              t('auth.signIn')
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:text-primary/90 font-medium">
              {t('auth.register')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;