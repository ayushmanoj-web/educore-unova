import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

interface TeacherProfileAuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (teacher: { name: string; phone: string; class: string }) => void;
}

const VALID_TEACHERS = [
  { name: "Asainar Pookkaitha", phone: "8921463769", class: "Mathematics" },
  { name: "Ranjith Lal", phone: "9447427171", class: "Science" },
  { name: "Bushara Lt", phone: "9037209728", class: "English" }
];

const TeacherProfileAuth: React.FC<TeacherProfileAuthProps> = ({
  open,
  onOpenChange,
  onLoginSuccess
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    class: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if teacher credentials are valid
      const validTeacher = VALID_TEACHERS.find(
        teacher => 
          teacher.name.toLowerCase() === formData.name.toLowerCase() &&
          teacher.phone === formData.phone
      );

      if (validTeacher) {
        // Store teacher login status with class information
        const teacherData = {
          ...validTeacher,
          class: formData.class || validTeacher.class,
          division: 'All', // Teachers can access all divisions
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem("teacher-logged-in", JSON.stringify(teacherData));

        onLoginSuccess({
          name: validTeacher.name,
          phone: validTeacher.phone,
          class: formData.class || validTeacher.class
        });

        toast({
          title: "Login Successful", 
          description: `Welcome, ${validTeacher.name}! You have been added to your class chat.`,
        });

        // Reset form and close modal
        setFormData({ name: "", phone: "", class: "" });
        onOpenChange(false);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid teacher credentials. Please check your name and phone number.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Teacher Profile Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input
                id="teacher-name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="teacher-phone">Phone Number</Label>
              <Input
                id="teacher-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="teacher-class">Class/Subject</Label>
              <Input
                id="teacher-class"
                type="text"
                placeholder="Enter class or subject (optional)"
                value={formData.class}
                onChange={(e) => handleInputChange("class", e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.phone}
                className="flex-1"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfileAuth;