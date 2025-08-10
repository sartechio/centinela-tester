import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import ImageCropModal from './ImageCropModal';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isVisible, onClose, theme: _theme }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Load user data when modal opens
  useEffect(() => {
    if (isVisible && user) {
      loadUserProfile();
    }
  }, [isVisible, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      // Set form data
      const fullName = user.user_metadata?.full_name || profile?.full_name || '';
      const nameParts = fullName ? fullName.split(' ') : ['', ''];
      
      setFirstName(nameParts[0]);
      setLastName(nameParts.slice(1).join(' '));
      setUsername(profile?.username || user.user_metadata?.username || '');
      setEmail(user.email || '');
      setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || '');
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    console.log('🖼️ Imagen cropeada recibida:', croppedImageUrl.substring(0, 50) + '...');
    setAvatarUrl(croppedImageUrl);
    setShowCropModal(false);
    setSelectedImageFile(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      console.log('💾 Guardando perfil con avatar:', avatarUrl ? 'Sí' : 'No');
      console.log('🔗 Avatar URL:', avatarUrl.substring(0, 100) + '...');
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl
        }
      });

      if (authError) throw authError;

      // Update or insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: username,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      console.log('✅ Perfil actualizado exitosamente con avatar:', avatarUrl ? 'Sí' : 'No');
      setSuccess('¡Perfil actualizado exitosamente!');
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible || !user) return null;

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
            mi perfil.
          </h2>
          
          {/* Close button */}
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

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden"
                style={{ 
                  background: avatarUrl 
                    ? `url("${avatarUrl}")` 
                    : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {!avatarUrl && (
                  <User size={48} color="#FFFFFF" />
                )}
              </div>
              
              {/* Camera Button */}
              <label className="absolute bottom-2 right-2 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer border-2 border-black">
                <Camera size={20} color="#FFFFFF" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <p 
              className="text-gray-400 mt-3"
              style={{ 
                fontSize: '14px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Cambiar foto de perfil
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* First Name */}
            <div>
              <label 
                className="block text-gray-400 mb-2"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Nombre
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-700 bg-transparent text-white outline-none transition-all focus:border-green-500"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label 
                className="block text-gray-400 mb-2"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Apellido
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-700 bg-transparent text-white outline-none transition-all focus:border-green-500"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div>
              <label 
                className="block text-gray-400 mb-2"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Nombre de usuario
              </label>
              <div className="relative">
                <span 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  style={{ 
                    fontSize: '14px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-700 bg-transparent text-white outline-none transition-all focus:border-green-500"
                  style={{ 
                    fontSize: '14px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label 
                className="block text-gray-400 mb-2"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-700 bg-transparent text-white outline-none transition-all focus:border-green-500"
                style={{ 
                  fontSize: '14px',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
                disabled={loading}
              />
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl font-medium text-white transition-all disabled:opacity-50 hover:shadow-lg mt-8"
              style={{ 
                background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                fontSize: '14px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                <>
                  Actualizar perfil ✨
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Image Crop Modal */}
      {selectedImageFile && (
        <ImageCropModal
          isVisible={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImageFile(null);
          }}
          imageFile={selectedImageFile}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default ProfileModal;