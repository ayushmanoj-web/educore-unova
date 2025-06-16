
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Profile = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
  image?: string; // base64 string or undefined
};

const LOCAL_STORAGE_KEY = "student-profiles";

// Utility functions for localStorage (kept for backward compatibility)
const getStoredProfiles = (): Profile[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveProfileLocally = (profile: Profile) => {
  const profiles = getStoredProfiles();
  const updatedProfiles = [
    ...profiles.filter(p => p.phone !== profile.phone),
    profile,
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfiles));
};

const Profile = () => {
  const [form, setForm] = useState<Profile>({
    name: "",
    class: "",
    division: "",
    dob: "",
    phone: "",
    image: undefined,
  });

  const [nameAvailable, setNameAvailable] = useState<null | boolean>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [imageFileName, setImageFileName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        // If authenticated, try to load from Supabase first
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profiles && !error) {
            const profile: Profile = {
              name: profiles.name,
              class: profiles.class,
              division: profiles.division,
              dob: profiles.dob,
              phone: profiles.phone,
              image: profiles.image || undefined,
            };
            setForm(profile);
            setImagePreview(profile.image || undefined);
            // Also save to localStorage for backward compatibility
            saveProfileLocally(profile);
            return;
          }
        }
      }

      // Fallback to localStorage if not authenticated or no Supabase data
      const profiles = getStoredProfiles();
      if (profiles.length > 0) {
        const last = profiles[profiles.length - 1];
        setForm(last);
        setImagePreview(last.image || undefined);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  // Check name availability
  useEffect(() => {
    if (!form.name.trim()) {
      setNameAvailable(null);
      return;
    }

    const checkNameAvailability = async () => {
      if (isAuthenticated) {
        // Check in Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('name, user_id')
            .ilike('name', form.name.trim());

          const isTaken = profiles?.some(
            (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
            p.user_id !== session.user.id
          );
          setNameAvailable(!isTaken);
          return;
        }
      }

      // Fallback to localStorage check
      const profiles = getStoredProfiles();
      const isTaken = profiles.some(
        (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        p.phone !== form.phone
      );
      setNameAvailable(!isTaken);
    };

    const timeoutId = setTimeout(checkNameAvailability, 300);
    return () => clearTimeout(timeoutId);
  }, [form.name, form.phone, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG and PNG images are allowed.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setForm(prev => ({ ...prev, image: reader.result as string }));
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImagePreview(undefined);
    setImageFileName(undefined);
    setForm(prev => ({ ...prev, image: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isAuthenticated) {
        // Save to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              name: form.name,
              class: form.class,
              division: form.division,
              dob: form.dob,
              phone: form.phone,
              image: form.image || null,
            });

          if (error) {
            throw error;
          }

          toast({
            title: "Profile saved successfully!",
            description: "Your profile is now synced across all devices.",
          });
        }
      } else {
        // Save to localStorage only
        toast({
          title: "Profile saved locally",
          description: "Sign in to sync your profile across devices.",
        });
      }

      // Always save to localStorage for backward compatibility
      saveProfileLocally(form);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Failed to save profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full pt-12 animate-fade-in">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800 text-center">Profile</CardTitle>
          {!isAuthenticated && (
            <p className="text-sm text-center text-gray-600">
              Sign in to sync your profile across devices
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            <div className="flex flex-col items-center px-2 mb-2">
              <Avatar className="w-20 h-20 mb-2">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt={form.name || "Profile"} />
                ) : (
                  <AvatarFallback>{getInitials(form.name || "User")}</AvatarFallback>
                )}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                id="profile-image-upload"
                onChange={handleImageChange}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={handleImageRemove}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {imageFileName && (
                <span className="text-xs mt-1 text-gray-500">{imageFileName}</span>
              )}
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              {nameAvailable === false && (
                <span className="text-xs text-red-600">This name is already taken by another profile.</span>
              )}
              {nameAvailable === true && form.name.trim() && (
                <span className="text-xs text-green-600">This name is available!</span>
              )}
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                name="class"
                placeholder="Enter your class"
                value={form.class}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="division">Division</Label>
              <Input
                id="division"
                name="division"
                placeholder="Enter your division"
                value={form.division}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                pattern="[0-9]*"
                required
              />
            </div>
            <Button 
              className="w-full mt-2" 
              type="submit"
              disabled={nameAvailable === false || isLoading}
            >
              {isLoading ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
