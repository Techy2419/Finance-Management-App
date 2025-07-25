'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Profile } from '@/lib/profileService';

const PROFILE_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'family', label: 'Family' },
] as const;

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
] as const;

interface ProfileEditDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ profile, open, onOpenChange }: ProfileEditDialogProps) {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: profile.name,
    type: profile.type,
    currency: profile.currency,
  });

  const handleSubmit = async () => {
    if (!profile.id || isLoading) return;

    try {
      setIsLoading(true);
      
      // Validate profile data
      if (!profileData.name || !profileData.type || !profileData.currency) {
        throw new Error('Please fill in all required fields');
      }

      await updateProfile(profile.id, {
        name: profileData.name.trim(),
        type: profileData.type,
        currency: profileData.currency,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Name</label>
            <Input
              placeholder="Profile Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Type</label>
            <Select
              value={profileData.type}
              onValueChange={(value) => setProfileData({ ...profileData, type: value as typeof PROFILE_TYPES[number]['value'] })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profile type" />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={profileData.currency}
              onValueChange={(value) => setProfileData({ ...profileData, currency: value as typeof CURRENCIES[number]['value'] })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
