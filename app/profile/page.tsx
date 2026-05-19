'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '@/lib/api/user';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { User, Phone, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    retry: false, // Don't retry if unauthorized
  });

  const profile = profileResponse?.data;
  const isSuccess = profileResponse?.success;

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
          <div className="bg-muted p-6 rounded-full">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Profile Not Found</h2>
            <p className="text-muted-foreground">Please log in or sign up to view your profile.</p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
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
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
            // Implement logout logic here
            // e.g., clear tokens, redirect
            console.log('Logout clicked');
          }}>
            Log Out
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {renderContent()}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
