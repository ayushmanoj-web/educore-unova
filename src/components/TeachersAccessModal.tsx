
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Eye, EyeOff, Users, Bell } from "lucide-react";
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
};

type ViewMode = "menu" | "password" | "profiles" | "notifications";

const LOCAL_STORAGE_KEY = "student-profiles";

const getStoredProfiles = (): Profile[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const TeachersAccessModal = ({ open, onOpenChange }: TeachersAccessModalProps) => {
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState<"profiles" | "notifications" | null>(null);

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

  useEffect(() => {
    if (viewMode === "profiles") {
      const loadProfiles = async () => {
        let allProfiles: Profile[] = [];

        // If authenticated, fetch from Supabase first
        if (isAuthenticated) {
          const { data: supabaseProfiles, error } = await supabase
            .from('profiles')
            .select('*');

          if (supabaseProfiles && !error) {
            const formattedSupabaseProfiles: Profile[] = supabaseProfiles.map(profile => ({
              name: profile.name,
              class: profile.class,
              division: profile.division,
              dob: profile.dob,
              phone: profile.phone,
            }));
            allProfiles = [...formattedSupabaseProfiles];
          }
        }

        // Also get localStorage profiles for backward compatibility
        const localProfiles = getStoredProfiles();
        
        // Merge profiles, avoiding duplicates by phone number
        const phoneNumbers = new Set(allProfiles.map(p => p.phone));
        const uniqueLocalProfiles = localProfiles.filter(p => !phoneNumbers.has(p.phone));
        
        setProfiles([...allProfiles, ...uniqueLocalProfiles]);
      };

      loadProfiles();
    }
  }, [viewMode, open, isAuthenticated]);

  // Reset state when closing
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setPassword("");
      setViewMode("menu");
      setError("");
      setShowPassword(false);
      setNotificationMessage("");
      setSelectedAction(null);
    }
  };

  const handleActionSelect = (action: "profiles" | "notifications") => {
    setSelectedAction(action);
    setViewMode("password");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "password") {
      if (selectedAction === "profiles") {
        setViewMode("profiles");
      } else if (selectedAction === "notifications") {
        setViewMode("notifications");
      }
      setError("");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the notification to all students
    // For now, we'll just show a success message
    toast({
      title: "Notification sent!",
      description: `Message sent to all ${profiles.length} students.`,
    });
    setNotificationMessage("");
    setViewMode("menu");
  };

  const handleBackToMenu = () => {
    setViewMode("menu");
    setPassword("");
    setError("");
    setSelectedAction(null);
  };

  const getTitle = () => {
    switch (viewMode) {
      case "menu":
        return "For Teachers Only";
      case "password":
        return selectedAction === "profiles" ? "Access Student Profiles" : "Send Notifications";
      case "profiles":
        return "All Students' Profiles";
      case "notifications":
        return "Send Notification";
      default:
        return "For Teachers Only";
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[95vh] sm:max-w-md sm:mx-auto py-6 px-4 rounded-t-xl flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="text-center">{getTitle()}</SheetTitle>
        </SheetHeader>

        {viewMode === "menu" && (
          <div className="flex flex-col gap-4 mt-4">
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

        {viewMode === "password" && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
            <label htmlFor="teacher-pass" className="font-medium text-base text-slate-700 text-center">
              Password
            </label>
            <div className="relative">
              <Input
                id="teacher-pass"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBackToMenu} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Unlock
              </Button>
            </div>
          </form>
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
              {profiles.length === 0 ? (
                <span className="text-center text-sm text-slate-500">No student profiles available yet.</span>
              ) : (
                <>
                  {isAuthenticated && (
                    <div className="text-center text-xs text-green-600 mb-2">
                      Showing profiles from all devices (synced)
                    </div>
                  )}
                  {profiles.map((student, idx) => (
                    <div key={student.phone + idx} className="flex items-center gap-3 border rounded-xl px-4 py-3 shadow bg-slate-50">
                      <User className="text-blue-700" />
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
                disabled={!notificationMessage.trim()}
              >
                <Bell size={16} />
                Send Notification to All Students
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeachersAccessModal;
