import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type Profile = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
};

const LOCAL_STORAGE_KEY = "student-profiles";

const getStoredProfiles = (): Profile[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveProfile = (profile: Profile) => {
  const profiles = getStoredProfiles();
  // If a profile with same phone exists, replace it; else add new
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
  });

  const [nameAvailable, setNameAvailable] = useState<null | boolean>(null);

  useEffect(() => {
    // If profile already exists for this device, load the latest one (by phone number)
    const profiles = getStoredProfiles();
    if (profiles.length > 0) {
      setForm(profiles[profiles.length - 1]);
    }
  }, []);

  // Check name availability whenever name changes
  useEffect(() => {
    if (!form.name.trim()) {
      setNameAvailable(null);
      return;
    }
    const profiles = getStoredProfiles();
    // Allow the in-use name if it's the same as the current user's own profile
    const isTaken = profiles.some(
      (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      p.phone !== form.phone // only disallow if it's a different phone number
    );
    setNameAvailable(!isTaken);
  }, [form.name, form.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(form);
    alert("Profile saved (on this device only). Teachers can now see your profile!");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full pt-12 animate-fade-in">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800 text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
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
              disabled={nameAvailable === false}
            >
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
