'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from '@/lib/api/user';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import Link from 'next/link';
import { User, Phone, Mail, Calendar, Shield, CheckCircle, XCircle, ArrowLeft, Loader2, Lock, ShieldCheck, Pencil, Camera, Upload } from 'lucide-react';

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
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Card className="mx-4">
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
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
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 bg-gradient-to-tr from-primary/5 via-background to-primary/10">
          <Card className="w-full max-w-md border border-border/50 backdrop-blur-md bg-card/70 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-primary/5">
            <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-pink-500 w-full" />
            <CardHeader className="pt-8 pb-6 px-6 text-center space-y-2">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
                {step === 'phone' ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {step === 'phone'
                  ? (mode === 'login' ? 'Welcome Back' : 'Create Account')
                  : 'Security Check'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm font-medium">
                {step === 'phone'
                  ? (mode === 'login'
                    ? 'Enter your mobile number to receive a secure login code'
                    : 'Enter your mobile number to get started and set up your account')
                  : `Please enter the 4-digit code sent to ${phone}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8 space-y-6">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Premium Mode Selector Toggle */}
                  <div className="grid grid-cols-2 p-1 bg-muted/65 rounded-xl border border-border/40 mb-4">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${mode === 'login'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${mode === 'signup'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                        <Phone className="h-4 w-4" />
                      </div>
                      <Input
                        type="tel"
                        placeholder="+91XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium tracking-wide transition-all"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {mode === 'login' ? 'Sending Security Code...' : 'Creating Account...'}
                      </>
                    ) : (
                      mode === 'login' ? 'Request Security OTP' : 'Register & Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full flex items-center justify-between">
                    <button
                      onClick={() => setStep('phone')}
                      className="flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change number
                    </button>
                    <span className="text-xs font-medium text-muted-foreground/75 bg-muted px-2.5 py-1 rounded-full border border-border/40">
                      OTP Sent
                    </span>
                  </div>

                  <div className="space-y-2 text-center w-full">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      One-Time Code
                    </label>
                    <div className="flex justify-center py-2">
                      <InputOTP
                        maxLength={4}
                        value={otp}
                        onChange={(val) => {
                          setOtp(val);
                          if (val.length === 4) {
                            handleVerifyOtp(val);
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold rounded-xl border border-input" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold rounded-xl border border-input" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold rounded-xl border border-input" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold rounded-xl border border-input" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleVerifyOtp()}
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
                    disabled={isSubmitting || otp.length !== 4}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      'Verify & Authorize'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-24">
        {/* Header/Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background pt-10 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarImage src={profile.profileImageUrl} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                {profile.customId}
                {profile.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500 fill-current" />
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <Card className="mx-4 overflow-hidden border-none shadow-md">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg font-semibold">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{profile.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    <p className="font-medium capitalize">{profile.isAdminVerified}</p>
                  </div>
                  {profile.isAdminVerified === 'verified' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Joined On</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="px-4 space-y-3">
          <Button
            variant="default"
            className="w-full justify-start gap-2 h-11 rounded-xl text-base font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] duration-200 cursor-pointer"
            onClick={() => {
              setEditName(profile.name || '');
              setEditEmail(profile.email || '');
              setEditProfileImage(profile.profileImageUrl || '');
              setSelectedFile(null);
              setPreviewUrl(profile.profileImageUrl || '');
              setIsEditDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => {
              localStorage.removeItem('token');
              queryClient.invalidateQueries({ queryKey: ['user-profile'] });
              toast.success('Logged out successfully');
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {renderContent()}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md border border-border/50 backdrop-blur-md bg-card/90 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <DialogHeader className="pt-4 pb-2 text-center space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update your account details and profile picture.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex flex-col items-center space-y-3 py-2 bg-muted/30 rounded-2xl p-4 border border-border/40">
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById('profile-image-upload')?.click()}
              >
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={previewUrl} alt="Profile Preview" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {editName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-7 w-7 text-white" />
                </div>
              </div>
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Image size must be less than 5MB');
                      return;
                    }
                    setSelectedFile(file);
                    const localUrl = URL.createObjectURL(file);
                    setPreviewUrl(localUrl);
                    toast.success('Local image selected');
                  }
                }}
              />
              <div className="text-center space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs font-semibold cursor-pointer gap-1.5 hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                >
                  <Upload className="h-3 w-3" />
                  {selectedFile ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-[10px] text-muted-foreground font-medium">Supports JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-11 rounded-xl flex-1 sm:flex-none font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="h-11 rounded-xl flex-1 sm:flex-none font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
