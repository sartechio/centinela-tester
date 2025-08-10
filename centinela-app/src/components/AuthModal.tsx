import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const AuthModal: React.FC<AuthModalProps> = ({ isVisible, onClose, theme: _theme }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signUp, signIn, signInWithGoogle } = useAuth();


  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    console.log('🔍 AuthModal: handleClose llamado');
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return false;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    // Solo validar longitud de contraseña en registro, no en login
    if (!isLogin && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    console.log('🔍 AuthModal: handleGoogleSignIn llamado');
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Error al iniciar sesión con Google. Intenta nuevamente.');
      } else {
        setSuccess('Redirigiendo a Google...');
        // Note: The redirect will happen automatically, so we don't close the modal here
      }
    } catch (err) {
      setError('Error inesperado con Google. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        console.log('🔐 Intentando login para:', email)
        const { error } = await signIn(email, password);
        if (error) {
          console.error('❌ Error en login:', error)
          setError(error.message === 'Invalid login credentials' 
            ? 'Email o contraseña incorrectos' 
            : 'Error al iniciar sesión. Intenta nuevamente.');
        } else {
          console.log('✅ Login exitoso')
          setSuccess('¡Bienvenido de vuelta!');
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      } else {
        console.log('📝 Intentando registro para:', email)
        const { error } = await signUp(email, password);
        if (error) {
          console.error('❌ Error en registro:', error)
          if (error.message.includes('already registered')) {
            setError('Este email ya está registrado. Intenta iniciar sesión.');
          } else {
            setError('Error al crear la cuenta. Intenta nuevamente.');
          }
        } else {
          console.log('✅ Registro exitoso')
          setSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
          setTimeout(() => {
            handleClose();
          }, 3000);
        }
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      onClick={handleBackdropClick}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className={`w-full max-w-md bg-black rounded-2xl transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 lg:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 
            className="text-white text-xl font-semibold"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 600
            }}
          >
            {isLogin ? 'iniciar sesión.' : 'crear cuenta.'}
          </h2>
          
          {/* Close button for desktop */}
          <button
            onClick={onClose}
            className="hidden lg:flex w-8 h-8 rounded-full bg-gray-800 items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: '60vh' }}>
          {/* Success Message */}
          {success && (
            <div 
              className="mb-4 p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: '#10B981' + '20',
                borderLeftColor: '#10B981',
                color: '#10B981',
                fontSize: '14px'
              }}
            >
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: '#EF4444' + '20',
                borderLeftColor: '#EF4444',
                color: '#EF4444',
                fontSize: '14px'
              }}
            >
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            disabled={loading}
            className="w-full mb-4 py-3 px-4 rounded-lg border border-gray-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center hover:border-gray-600 bg-gray-900 text-white"
            type="button"
            style={{ fontSize: '14px' }}
          >
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            {loading ? 'Conectando...' : `Continuar con Google`}
          </button>

          {/* Divider */}
          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="px-3 text-gray-500" style={{ fontSize: '14px' }}>o</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block font-medium mb-2 text-gray-300" style={{ fontSize: '14px' }}>
                Email
              </label>
              <div className="relative">
                <Mail 
                  size={18} 
                  color="#9CA3AF"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 outline-none transition-all bg-gray-900 text-white focus:border-green-500"
                  placeholder="tu@email.com"
                  disabled={loading}
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-medium mb-2 text-gray-300" style={{ fontSize: '14px' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  color="#9CA3AF"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-700 outline-none transition-all bg-gray-900 text-white focus:border-green-500"
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  style={{ fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#9CA3AF" />
                  ) : (
                    <Eye size={18} color="#9CA3AF" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (only for signup) */}
            {!isLogin && (
              <div>
                <label className="block font-medium mb-2 text-gray-300" style={{ fontSize: '14px' }}>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock 
                    size={18} 
                    color="#9CA3AF"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-700 outline-none transition-all bg-gray-900 text-white focus:border-green-500"
                    placeholder="Repite tu contraseña"
                    disabled={loading}
                    style={{ fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#9CA3AF" />
                    ) : (
                      <Eye size={18} color="#9CA3AF" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50 hover:shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                fontSize: '14px'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-300" style={{ fontSize: '14px' }}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={toggleMode}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="ml-1 font-medium hover:underline text-green-500"
                type="button"
                disabled={loading}
                style={{ fontSize: '14px' }}
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;