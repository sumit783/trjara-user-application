'use client';

import * as React from 'react';
import { User, Phone, Mail, Calendar, Shield, CheckCircle, XCircle, Pencil, LogOut, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileDetailsProps {
  profile: {
    _id: string;
    phone: string;
    role: string;
    verified: boolean;
    isAdminVerified: string;
    customId: string;
    email?: string;
    name?: string;
    profileImageUrl?: string;
    createdAt: string;
  };
  onEditClick: () => void;
  onLogOut: () => void;
}

export function ProfileDetails({ profile, onEditClick, onLogOut }: ProfileDetailsProps) {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-400">
      {/* Header/Hero Section with Dynamic HSL Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-primary/5 to-background pt-10 pb-8 px-4 border-b border-border/10">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent -top-20 -left-20 h-72 w-72 blur-3xl opacity-50" />
        <div className="flex flex-col items-center space-y-4 relative z-10">
          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl hover:scale-102 transition-transform duration-300">
            <AvatarImage src={profile.profileImageUrl} alt={profile.name || 'User'} className="object-cover" />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
              {profile.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
              {profile.name || 'Anonymous User'}
            </h1>
            <div className="flex items-center justify-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full border border-border/30 text-xs font-semibold text-muted-foreground w-fit mx-auto">
              <span>{profile.customId}</span>
              {profile.verified && (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 fill-current" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Details Grid Card */}
      <Card className="mx-4 overflow-hidden border border-border/40 bg-card/65 backdrop-blur-md shadow-xl rounded-3xl transition-all duration-300 hover:shadow-primary/5">
        <CardHeader className="bg-muted/30 border-b border-border/20 py-4 px-6">
          <CardTitle className="text-base font-bold tracking-tight text-foreground/90">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Role Item */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary/15 transition-colors duration-250">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">Role</p>
                <p className="font-semibold text-foreground/90 capitalize">{profile.role}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-indigo-500/10 p-3 rounded-2xl group-hover:bg-indigo-500/15 transition-colors duration-250">
                <Phone className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">Phone Number</p>
                <p className="font-semibold text-foreground/90 tracking-wide">{profile.phone}</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-pink-500/10 p-3 rounded-2xl group-hover:bg-pink-500/15 transition-colors duration-250">
                <Mail className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-foreground/90 truncate">
                  {profile.email || <span className="text-muted-foreground/50 font-normal italic">Not provided</span>}
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center space-x-4 group">
              <div className={`p-3 rounded-2xl group-hover:opacity-90 transition-opacity duration-250 ${
                profile.isAdminVerified === 'verified' 
                  ? 'bg-emerald-500/10' 
                  : 'bg-destructive/10'
              }`}>
                <Shield className={`h-5 w-5 ${
                  profile.isAdminVerified === 'verified' 
                    ? 'text-emerald-500' 
                    : 'text-destructive'
                }`} />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">Verification Status</p>
                  <p className="font-semibold text-foreground/90 capitalize">{profile.isAdminVerified}</p>
                </div>
                {profile.isAdminVerified === 'verified' ? (
                  <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Verified
                  </div>
                ) : (
                  <div className="bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-destructive/20">
                    Pending
                  </div>
                )}
              </div>
            </div>

            {/* Joined On */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-amber-500/10 p-3 rounded-2xl group-hover:bg-amber-500/15 transition-colors duration-250">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-wider">Joined On</p>
                <p className="font-semibold text-foreground/90">
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

      {/* Action Trigger Buttons Container */}
      <div className="px-4 space-y-3.5">
        <Button
          variant="default"
          className="w-full justify-center gap-2 h-12.5 rounded-2xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] duration-300 cursor-pointer"
          onClick={() => window.location.href = '/profile/orders'}
        >
          <Package className="h-4.5 w-4.5" />
          My Purchase Orders
        </Button>

        <Button
          variant="outline"
          className="w-full justify-center gap-2 h-12.5 rounded-2xl text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99] duration-300 cursor-pointer border-border"
          onClick={onEditClick}
        >
          <Pencil className="h-4.5 w-4.5 text-primary" />
          Edit Account Profile
        </Button>

        <Button
          variant="outline"
          className="w-full justify-center gap-2 h-12.5 rounded-2xl text-base font-bold border-destructive/20 hover:border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/5 transition-all duration-300 cursor-pointer"
          onClick={onLogOut}
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out Account
        </Button>
      </div>
    </div>
  );
}
