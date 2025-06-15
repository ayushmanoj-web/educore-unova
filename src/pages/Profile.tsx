
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    class: "",
    division: "",
    dob: "",
    phone: "",
  });

  // Only local form state (not persistent)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show a simple alert for now
    alert("Profile updated (locally only)");
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
