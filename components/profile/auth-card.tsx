'use client';

import * as React from 'react';
import { User, Phone, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface AuthCardProps {
  phone: string;
  setPhone: (phone: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  step: 'phone' | 'otp';
  setStep: (step: 'phone' | 'otp') => void;
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  isSubmitting: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onVerifyOtp: (otpValue?: string) => void;
}

export function AuthCard({
  phone,
  setPhone,
  otp,
  setOtp,
  step,
  setStep,
  mode,
  setMode,
  isSubmitting,
  onSendOtp,
  onVerifyOtp,
}: AuthCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 bg-gradient-to-tr from-primary/5 via-background to-primary/10 animate-in fade-in duration-500">
      <Card className="w-full max-w-md border border-white/10 backdrop-blur-xl bg-card/65 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-primary/5">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-pink-500 w-full" />
        <CardHeader className="pt-8 pb-6 px-6 text-center space-y-3">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
            {step === 'phone' ? (
              <User className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {step === 'phone' 
                ? (mode === 'login' ? 'Welcome Back' : 'Create Account') 
                : 'Security Check'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-semibold">
              {step === 'phone'
                ? (mode === 'login' 
                    ? 'Enter your mobile number to receive a secure login code' 
                    : 'Enter your mobile number to get started and set up your account')
                : `Please enter the 4-digit code sent to ${phone}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8 space-y-6">
          {step === 'phone' ? (
            <form onSubmit={onSendOtp} className="space-y-4">
              {/* Premium Sliding Segmented Control Selector */}
              <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border/40 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-background text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`py-2.5 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-background text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Input Mobile Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  Mobile Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-250">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-13 bg-background/40 border-border/50 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-semibold tracking-wide transition-all duration-200"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Submit Action */}
              <Button
                type="submit"
                className="w-full h-13 rounded-2xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] duration-300 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {mode === 'login' ? 'Requesting OTP...' : 'Creating Account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Request Security OTP' : 'Register & Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              {/* Back Link and Badge */}
              <div className="w-full flex items-center justify-between">
                <button
                  onClick={() => setStep('phone')}
                  className="flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors gap-1.5 focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change number
                </button>
                <span className="text-xs font-bold text-muted-foreground/80 bg-muted px-3 py-1 rounded-full border border-border/40">
                  OTP Sent
                </span>
              </div>

              {/* Code Inputs */}
              <div className="space-y-2 text-center w-full">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  One-Time Code
                </label>
                <div className="flex justify-center py-2">
                  <InputOTP
                    maxLength={4}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (val.length === 4) {
                        onVerifyOtp(val);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <InputOTPGroup className="gap-2.5">
                      <InputOTPSlot index={0} className="w-13 h-13 text-xl font-bold rounded-xl border border-input shadow-sm focus-visible:ring-primary" />
                      <InputOTPSlot index={1} className="w-13 h-13 text-xl font-bold rounded-xl border border-input shadow-sm focus-visible:ring-primary" />
                      <InputOTPSlot index={2} className="w-13 h-13 text-xl font-bold rounded-xl border border-input shadow-sm focus-visible:ring-primary" />
                      <InputOTPSlot index={3} className="w-13 h-13 text-xl font-bold rounded-xl border border-input shadow-sm focus-visible:ring-primary" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Verify Trigger */}
              <Button
                onClick={() => onVerifyOtp()}
                className="w-full h-13 rounded-2xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] duration-300 cursor-pointer"
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
