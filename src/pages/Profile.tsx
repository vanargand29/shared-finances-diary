import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

const Profile = () => {
  const { user, updateUser, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if username is already taken by another user
      if (username !== user?.username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user?.id || '')
          .maybeSingle();

        if (existingUser) {
          toast.error('Username sudah digunakan');
          setIsLoading(false);
          return;
        }
      }

      // Try to update with all fields first
      let updateData: any = {
        username,
      };

      // Try to add name and phone if columns exist
      try {
        console.log('Updating profile for user ID:', user?.id);
        console.log('Data to update:', { name, username, phone });
        
        const { data: updateResult, error: testError } = await supabase
          .from('users')
          .update({
            name,
            username,
            phone: phone || null,
          })
          .eq('id', user?.id || '')
          .select();

        console.log('Update result:', updateResult);
        console.log('Update error:', testError);

        if (testError) {
          // If error is about missing columns, try without them
          if (testError.message?.includes('column') || testError.code === '42703') {
            console.log('Columns name/phone not found, updating username only');
            const { data: usernameResult, error: usernameError } = await supabase
              .from('users')
              .update({ username })
              .eq('id', user?.id || '')
              .select();

            if (usernameError) throw usernameError;
            
            console.log('Username update result:', usernameResult);
            updateUser({ username });
            toast.warning('Hanya username yang diupdate. Kolom name/phone belum ada di database.');
            setIsLoading(false);
            return;
          } else {
            throw testError;
          }
        }

        // Verify update by fetching fresh data
        const { data: verifyData, error: verifyError } = await supabase
          .from('users')
          .select('id, username, name, phone')
          .eq('id', user?.id || '')
          .single();

        console.log('Verification data:', verifyData);

        if (verifyError) {
          console.error('Verification error:', verifyError);
        }

        // If no error, update was successful
        updateUser({ name, username, phone });
        toast.success('Profile berhasil diperbarui');
      } catch (innerError: any) {
        throw innerError;
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Gagal memperbarui profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Semua field password harus diisi');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      // Verify current password - try both hash methods
      const currentPasswordHashCrypto = CryptoJS.MD5(currentPassword).toString();
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id || '')
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        toast.error('Gagal memverifikasi password');
        setIsLoading(false);
        return;
      }

      console.log('Current password hash in DB:', userData?.password_hash);
      console.log('CryptoJS hash:', currentPasswordHashCrypto);

      // Check if current password matches (using CryptoJS hash)
      if (userData?.password_hash !== currentPasswordHashCrypto) {
        toast.error('Password saat ini salah');
        console.error('Password mismatch!');
        console.error('DB hash:', userData?.password_hash);
        console.error('Input hash:', currentPasswordHashCrypto);
        setIsLoading(false);
        return;
      }

      // Update password using CryptoJS MD5 (consistent with login)
      const newPasswordHash = CryptoJS.MD5(newPassword).toString();
      console.log('Updating password for user ID:', user?.id);
      console.log('Old hash in DB:', userData?.password_hash);
      console.log('New password hash (CryptoJS):', newPasswordHash);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', user?.id || '')
        .select('id, username, password_hash');

      console.log('Password update result:', updateResult);
      console.log('Password update error:', updateError);

      if (updateError) {
        console.error('Update password error:', updateError);
        toast.error('Gagal mengubah password: ' + updateError.message);
        setIsLoading(false);
        return;
      }

      if (!updateResult || updateResult.length === 0) {
        toast.error('Update gagal - tidak ada baris yang diupdate. Cek RLS policy.');
        setIsLoading(false);
        return;
      }

      // Verify password was actually updated
      const { data: verifyData } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id || '')
        .single();

      console.log('Password verification - new hash in DB:', verifyData?.password_hash);
      console.log('Expected hash:', newPasswordHash);
      console.log('Match:', verifyData?.password_hash === newPasswordHash);

      if (verifyData?.password_hash !== newPasswordHash) {
        toast.error('⚠️ Password tidak berubah di database! Kemungkinan masalah RLS atau trigger.');
        console.error('PASSWORD NOT UPDATED IN DATABASE!');
        console.error('Expected:', newPasswordHash);
        console.error('Got:', verifyData?.password_hash);
        setIsLoading(false);
        return;
      }

      toast.success('Password berhasil diubah! Silakan login ulang dengan password baru.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profile Saya
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola informasi akun Anda
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Information Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profile
              </CardTitle>
              <CardDescription>
                Update informasi pribadi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <div className="flex gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Pastikan password Anda aman dan kuat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru (min. 6 karakter)"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  {isLoading ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
