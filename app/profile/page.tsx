'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from '@/lib/api/user';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import { AuthCard } from '@/components/profile/auth-card';
import { ProfileDetails } from '@/components/profile/profile-details';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';

export default function ProfilePage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Profile States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('email', editEmail.trim());
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      } else {
        formData.append('profileImage', editProfileImage);
      }

      const res = await updateProfile(formData);
      toast.success(res.message || 'Profile updated successfully');
      setIsEditDialogOpen(false);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    retry: false, // Don't retry if unauthorized
  });

  const profile = profileResponse?.data;
  const isSuccess = profileResponse?.success;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint = mode === 'login'
        ? `${process.env.NEXT_PUBLIC_BASE_URI}/api/auth/user/send-otp`
        : `${process.env.NEXT_PUBLIC_BASE_URI}/api/auth/user/create-account`;

      const body = mode === 'login'
        ? { phone, role: 'customer' }
        : { phone };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to send OTP');
      }
      toast.success(data.message || 'OTP sent successfully');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const activeOtp = otpValue || otp;
    if (!activeOtp || activeOtp.length !== 4) {
      toast.error('Please enter a 4-digit OTP');
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint = mode === 'login'
        ? `${process.env.NEXT_PUBLIC_BASE_URI}/api/auth/user/verify-otp`
        : `${process.env.NEXT_PUBLIC_BASE_URI}/api/auth/user/verify-signup-otp`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: activeOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Invalid OTP');
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        toast.success(data.message || 'Verification successful');
        setOtp('');
        setStep('phone');
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      } else {
        throw new Error('Authentication token not received');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 pt-12 animate-pulse">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Card className="mx-4 border border-border/40 bg-card/65">
            <CardContent className="p-6 space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded-lg" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (error || !isSuccess) {
      return (
        <AuthCard
          phone={phone}
          setPhone={setPhone}
          otp={otp}
          setOtp={setOtp}
          step={step}
          setStep={setStep}
          mode={mode}
          setMode={setMode}
          isSubmitting={isSubmitting}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
        />
      );
    }

    return (
      <ProfileDetails
        profile={profile}
        onEditClick={() => {
          setEditName(profile.name || '');
          setEditEmail(profile.email || '');
          setEditProfileImage(profile.profileImageUrl || '');
          setSelectedFile(null);
          setPreviewUrl(profile.profileImageUrl || '');
          setIsEditDialogOpen(true);
        }}
        onLogOut={() => {
          localStorage.removeItem('token');
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
          toast.success('Logged out successfully');
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {renderContent()}

      {/* Edit Profile Dialog */}
      {profile && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editName={editName}
          setEditName={setEditName}
          editEmail={editEmail}
          setEditEmail={setEditEmail}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          isSavingProfile={isSavingProfile}
          onSave={handleSaveProfile}
        />
      )}

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
