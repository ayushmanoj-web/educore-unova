import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Eye, EyeOff, Users, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type TeachersAccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Profile = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
  image?: string;
};

type ViewMode = "login" | "menu" | "profiles" | "notifications";

const LOCAL_STORAGE_KEY = "student-profiles";
const TEACHER_LOGIN_KEY = "teacher-logged-in";

// Hardcoded credentials
const TEACHER_USERNAME = "devadar";
const TEACHER_PASSWORD = "dghsstanur";

const getStoredProfiles = (): Profile[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const isTeacherLoggedIn = (): boolean => {
  return localStorage.getItem(TEACHER_LOGIN_KEY) === "true";
};

const setTeacherLoggedIn = (loggedIn: boolean) => {
  if (loggedIn) {
    localStorage.setItem(TEACHER_LOGIN_KEY, "true");
  } else {
    localStorage.removeItem(TEACHER_LOGIN_KEY);
  }
};

const TeachersAccessModal = ({ open, onOpenChange }: TeachersAccessModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState<"profiles" | "notifications" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Check if teacher is already logged in
      if (isTeacherLoggedIn()) {
        setViewMode("menu");
      } else {
        setViewMode("login");
      }
    }
  }, [open]);

  useEffect(() => {
    if (viewMode === "profiles") {
      const loadProfiles = async () => {
        setIsLoading(true);
        let allProfiles: Profile[] = [];

        try {
          // Get all profiles from Supabase public_profiles
          const { data: supabaseProfiles, error } = await supabase
            .from('public_profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (supabaseProfiles && !error) {
            const formattedSupabaseProfiles: Profile[] = supabaseProfiles.map(profile => ({
              name: profile.name,
              class: profile.class,
              division: profile.division,
              dob: profile.dob,
              phone: profile.phone,
              image: profile.image || undefined,
            }));
            allProfiles = [...formattedSupabaseProfiles];
          }

          // Also get localStorage profiles for backward compatibility
          const localProfiles = getStoredProfiles();
          
          // Merge profiles, avoiding duplicates by phone number
          const phoneNumbers = new Set(allProfiles.map(p => p.phone));
          const uniqueLocalProfiles = localProfiles.filter(p => !phoneNumbers.has(p.phone));
          
          setProfiles([...allProfiles, ...uniqueLocalProfiles]);
        } catch (error) {
          console.error('Error loading profiles:', error);
          // Fallback to localStorage only
          setProfiles(getStoredProfiles());
          toast({
            title: "Warning",
            description: "Could not load all profiles from server. Showing local profiles only.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadProfiles();
    }
  }, [viewMode, open]);

  // Reset state when closing
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setUsername("");
      setPassword("");
      setError("");
      setShowPassword(false);
      setNotificationMessage("");
      setSelectedAction(null);
      setIsLoading(false);
      // Don't reset viewMode here - keep login state
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD) {
      setTeacherLoggedIn(true);
      setViewMode("menu");
      setError("");
      setUsername("");
      setPassword("");
      toast({
        title: "Login successful",
        description: "Welcome, teacher!",
      });
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  const handleActionSelect = (action: "profiles" | "notifications") => {
    setSelectedAction(action);
    if (action === "profiles") {
      setViewMode("profiles");
    } else if (action === "notifications") {
      setViewMode("notifications");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a public notification that everyone can see
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          title: "New Announcement",
          message: notificationMessage,
          sender_id: null, // No authentication required
          recipient_id: null, // Public notification
          role: "student"
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Notification sent!",
        description: "Message sent to all students successfully.",
      });
      
      setNotificationMessage("");
      setViewMode("menu");
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setViewMode("menu");
    setError("");
    setSelectedAction(null);
  };

  const handleLogout = () => {
    setTeacherLoggedIn(false);
    setViewMode("login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const getTitle = () => {
    switch (viewMode) {
      case "login":
        return "Teacher Login";
      case "menu":
        return "For Teachers Only";
      case "profiles":
        return "All Students' Profiles";
      case "notifications":
        return "Send Notification";
      default:
        return "For Teachers Only";
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[95vh] sm:max-w-md sm:mx-auto py-6 px-4 rounded-t-xl flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="text-center">{getTitle()}</SheetTitle>
        </SheetHeader>

        {viewMode === "login" && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>
            <label htmlFor="teacher-username" className="font-medium text-base text-slate-700 text-center">
              Teacher Login
            </label>
            <Input
              id="teacher-username"
              type="text"
              autoComplete="username"
              placeholder="Username"
              className="text-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <div className="relative">
              <Input
                id="teacher-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className="text-lg pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-blue-700 bg-transparent outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <span className="text-red-600 text-xs text-center">{error}</span>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        )}

        {viewMode === "menu" && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-600">Logged in as teacher</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
            <Button 
              onClick={() => handleActionSelect("profiles")}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Users size={20} />
              View All Student Profiles
            </Button>
            <Button 
              onClick={() => handleActionSelect("notifications")}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Bell size={20} />
              Send Notifications
            </Button>
          </div>
        )}

        {viewMode === "profiles" && (
          <div className="mt-2 flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={handleBackToMenu} 
              className="self-start mb-2"
            >
              Back to Menu
            </Button>
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <span className="text-sm text-slate-500">Loading profiles...</span>
                </div>
              ) : profiles.length === 0 ? (
                <span className="text-center text-sm text-slate-500">No student profiles available yet.</span>
              ) : (
                <>
                  <div className="text-center text-xs text-green-600 mb-2">
                    Showing {profiles.length} student profile{profiles.length !== 1 ? 's' : ''} from all devices
                  </div>
                  {profiles.map((student, idx) => (
                    <div key={student.phone + idx} className="flex items-center gap-3 border rounded-xl px-4 py-3 shadow bg-slate-50">
                      <Avatar className="w-12 h-12">
                        {student.image ? (
                          <AvatarImage src={student.image} alt={student.name} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-blue-900">{student.name}</span>
                        <span className="text-sm text-slate-700">
                          Class: <b>{student.class}</b> | Division: <b>{student.division}</b>
                        </span>
                        <span className="text-sm text-gray-600">
                          DOB: {student.dob}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            Phone: {student.phone}
                          </span>
                          <a
                            className="ml-2 px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 text-xs flex items-center gap-1"
                            href={`tel:${student.phone}`}
                            title={`Call ${student.name}`}
                          >
                            <Phone size={16} /> Call
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === "notifications" && (
          <div className="mt-2 flex flex-col gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackToMenu} 
              className="self-start"
            >
              Back to Menu
            </Button>
            <div className="flex flex-col gap-3">
              <label htmlFor="notification-message" className="font-medium text-base text-slate-700">
                Notification Message
              </label>
              <textarea
                id="notification-message"
                placeholder="Enter your message for all students..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
              <Button 
                onClick={handleSendNotification}
                className="w-full flex items-center justify-center gap-2"
                disabled={!notificationMessage.trim() || isLoading}
              >
                <Bell size={16} />
                {isLoading ? "Sending..." : "Send Notification to All Students"}
              </Button>
              <div className="text-center text-sm text-green-600">
                Note: Notifications are public and don't require authentication.
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeachersAccessModal;