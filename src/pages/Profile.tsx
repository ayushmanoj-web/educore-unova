
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

  useEffect(() => {
    // If profile already exists for this device, load the latest one (by phone number)
    const profiles = getStoredProfiles();
    if (profiles.length > 0) {
      // Try to find the most recent profile for this device by phone (can be improved)
      setForm(profiles[profiles.length - 1]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage
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
              />
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
            <Button className="w-full mt-2" type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
