'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { updateUserInfo } from '@/lib/userService';

interface UserInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onComplete: () => Promise<void>;
}

export function UserInfoDialog({ open, onOpenChange, userId, onComplete }: UserInfoDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting user info:', { firstName, lastName });
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both first and last name",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Updating user info for:', userId);
      await updateUserInfo(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        updatedAt: new Date(),
      });
      
      toast({
        title: "Success",
        description: "Your information has been updated",
      });
      
      await onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating user info:', err);
      toast({
        title: "Error",
        description: "Failed to update your information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
