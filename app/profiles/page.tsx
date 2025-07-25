'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from 'next-themes';
import { Profile } from '@/lib/profileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileWizard } from '@/components/profile-wizard';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { Loader2, Plus, User2, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ProfilesPage() {
  const { user, signOutUser } = useAuth();
  const { setTheme } = useTheme();
  const { profiles, loading, error, activeProfile, setActiveProfile } = useProfile();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
    router.push('/expenses');
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOutUser();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground">Manage your expense tracking profiles</p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User2 className="h-5 w-5" />
                <span>{user?.displayName || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem disabled className="opacity-70">
                <span className="text-sm">{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card 
            key={profile.id} 
            className={`relative ${activeProfile?.id === profile.id ? 'border-primary' : ''}`}
          >
            <CardHeader>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>
                {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)} Profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                {profile.currency}
              </div>
              <div className="space-x-2">
                <Button onClick={() => handleProfileSelect(profile)}>
                  Select Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveProfile(profile);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card 
          className="border-2 border-dashed cursor-pointer hover:border-primary hover:bg-accent/50"
          onClick={() => setShowProfileWizard(true)}
        >
          <CardHeader>
            <CardTitle>Create New Profile</CardTitle>
            <CardDescription>
              Add a new profile to track expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {showProfileWizard && (
        <ProfileWizard onClose={() => setShowProfileWizard(false)} />
      )}

      {activeProfile && (
        <ProfileEditDialog
          profile={activeProfile}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
