'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NameEntryWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NameEntryWizard({ 
  open, 
  onOpenChange 
}: NameEntryWizardProps) {
  const [userNames, setUserNames] = useState({
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { updateDisplayName, userInfo, markNameAsEntered } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Prefill existing names if available
  useEffect(() => {
    if (open) {
      setUserNames({
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
      });
    }
  }, [open, userInfo]);

  const validateNames = () => {
    return userNames.firstName.trim() && userNames.lastName.trim();
  };

  const handleNameSubmit = async () => {
    if (!validateNames()) {
      toast({
        title: "Error",
        description: "Please enter both first and last name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Update display name
      await updateDisplayName({
        firstName: userNames.firstName.trim(),
        lastName: userNames.lastName.trim()
      });

      // Mark name as entered
      await markNameAsEntered();

      toast({
        title: "Success",
        description: "Name updated successfully!",
      });

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Prevent closing if names are not valid
        if (isOpen || validateNames()) {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
          <DialogDescription>
            Please provide your first and last name to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="First Name"
              value={userNames.firstName}
              onChange={(e) => setUserNames(prev => ({ ...prev, firstName: e.target.value }))}
              required
              disabled={isLoading}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              value={userNames.lastName}
              onChange={(e) => setUserNames(prev => ({ ...prev, lastName: e.target.value }))}
              required
              disabled={isLoading}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleNameSubmit}
            disabled={!validateNames() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Name'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
