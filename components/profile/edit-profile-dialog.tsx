'use client';

import * as React from 'react';
import { Camera, Upload, User, Mail, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  setEditName: (name: string) => void;
  editEmail: string;
  setEditEmail: (email: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  isSavingProfile: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  isSavingProfile,
  onSave,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-white/10 backdrop-blur-xl bg-card/90 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
        <DialogHeader className="pt-4 pb-2 text-center space-y-1">
          <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium">
            Update your profile picture and contact details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-6">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center space-y-4 py-3 bg-gradient-to-b from-primary/5 via-background/40 to-transparent rounded-2xl p-4 border border-border/40">
            <div
              className="relative group cursor-pointer overflow-hidden rounded-full shadow-lg hover:shadow-primary/10 transition-all duration-300"
              onClick={() => document.getElementById('profile-image-upload')?.click()}
            >
              <Avatar className="h-24 w-24 border-4 border-background transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={previewUrl} alt="Profile Preview" className="object-cover" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                  {editName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-350">
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
                  toast.success('Image selected');
                }
              }}
            />
            <div className="text-center space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl text-xs font-semibold cursor-pointer gap-1.5 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300"
                onClick={() => document.getElementById('profile-image-upload')?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                {selectedFile ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-[10px] text-muted-foreground/75 font-medium">Supports JPG, PNG, GIF up to 5MB</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-250">
                  <User className="h-4.5 w-4.5" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="pl-10 h-12 bg-background/40 border-border/50 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-250">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="pl-10 h-12 bg-background/40 border-border/50 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-medium transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <DialogFooter className="pt-4 flex gap-2.5 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11.5 rounded-xl flex-1 sm:flex-none font-semibold border-border/60 hover:bg-muted cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="h-11.5 rounded-xl flex-1 sm:flex-none font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
