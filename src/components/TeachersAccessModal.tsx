import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Eye, EyeOff, Users, Bell, Calendar, Check, X, Clock, Search, FileText, ArrowLeft, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import TeacherProfileAuth from "./TeacherProfileAuth";
import { useNavigate } from "react-router-dom";

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

type LeaveApplication = {
  id: string;
  student_name: string;
  student_class: string;
  student_division: string;
  student_dob: string;
  student_phone: string;
  student_image?: string;
  number_of_days: number;
  start_date: string;
  return_date: string;
  reason: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
};

type StudentWithLeaveCount = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
  image?: string;
  leaveCount: number;
};

type ViewMode = "login" | "menu" | "profiles" | "notifications" | "absents" | "leave_history" | "student_leave_detail";

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
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState<"profiles" | "notifications" | "absents" | "leave_history" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentsWithLeaves, setStudentsWithLeaves] = useState<StudentWithLeaveCount[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithLeaveCount | null>(null);
  const [selectedStudentLeaves, setSelectedStudentLeaves] = useState<LeaveApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTeacherAuth, setShowTeacherAuth] = useState(false);

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

  useEffect(() => {
    if (viewMode === "absents") {
      const loadLeaveApplications = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('leave_applications')
            .select('*')
            .order('submitted_at', { ascending: false });

          if (error) {
            throw error;
          }

          setLeaveApplications(data || []);
        } catch (error) {
          console.error('Error loading leave applications:', error);
          toast({
            title: "Error",
            description: "Failed to load leave applications. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadLeaveApplications();
    }
  }, [viewMode, open]);

  useEffect(() => {
    if (viewMode === "leave_history") {
      const loadStudentsWithLeaves = async () => {
        setIsLoading(true);
        try {
          // Get all profiles
          let allProfiles: Profile[] = [];
          
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

          // Get localStorage profiles for backward compatibility
          const localProfiles = getStoredProfiles();
          const phoneNumbers = new Set(allProfiles.map(p => p.phone));
          const uniqueLocalProfiles = localProfiles.filter(p => !phoneNumbers.has(p.phone));
          allProfiles = [...allProfiles, ...uniqueLocalProfiles];

          // Get leave counts for each student
          const studentsWithLeaveCounts: StudentWithLeaveCount[] = await Promise.all(
            allProfiles.map(async (profile) => {
              const { data: leaves, error } = await supabase
                .from('leave_applications')
                .select('id')
                .eq('student_phone', profile.phone);

              return {
                ...profile,
                leaveCount: leaves ? leaves.length : 0
              };
            })
          );

          setStudentsWithLeaves(studentsWithLeaveCounts);
        } catch (error) {
          console.error('Error loading students with leaves:', error);
          toast({
            title: "Error",
            description: "Failed to load students leave history. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadStudentsWithLeaves();
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

  const handleActionSelect = (action: "profiles" | "notifications" | "absents" | "leave_history") => {
    setSelectedAction(action);
    if (action === "profiles") {
      setViewMode("profiles");
    } else if (action === "notifications") {
      setViewMode("notifications");
    } else if (action === "absents") {
      setViewMode("absents");
    } else if (action === "leave_history") {
      setViewMode("leave_history");
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

  const handleLeaveApplicationAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'Teacher'
        })
        .eq('id', applicationId);

      if (error) {
        throw error;
      }

      // Update local state
      setLeaveApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action, reviewed_at: new Date().toISOString(), reviewed_by: 'Teacher' }
            : app
        )
      );

      toast({
        title: `Application ${action}`,
        description: `Leave application has been ${action}.`,
      });
    } catch (error) {
      console.error('Error updating leave application:', error);
      toast({
        title: "Error",
        description: "Failed to update leave application. Please try again.",
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
    setSearchQuery("");
    setSelectedStudent(null);
    setSelectedStudentLeaves([]);
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
      case "absents":
        return "View Leave Applications";
      case "leave_history":
        return "Students Leave History";
      case "student_leave_detail":
        return `${selectedStudent?.name}'s Leave History`;
      default:
        return "For Teachers Only";
    }
  };

  const handleStudentClick = async (student: StudentWithLeaveCount) => {
    setSelectedStudent(student);
    setIsLoading(true);
    
    try {
      const { data: leaves, error } = await supabase
        .from('leave_applications')
        .select('*')
        .eq('student_phone', student.phone)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSelectedStudentLeaves(leaves || []);
      setViewMode("student_leave_detail");
    } catch (error) {
      console.error('Error loading student leave history:', error);
      toast({
        title: "Error",
        description: "Failed to load student leave history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLeaveHistory = () => {
    setViewMode("leave_history");
    setSelectedStudent(null);
    setSelectedStudentLeaves([]);
  };

  const filteredStudentsWithLeaves = studentsWithLeaves.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery)
  );

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check size={16} />;
      case 'rejected':
        return <X size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

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
            <Button 
              onClick={() => handleActionSelect("absents")}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Calendar size={20} />
              View Leaves
            </Button>
            <Button 
              onClick={() => handleActionSelect("leave_history")}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <FileText size={20} />
              View Students Leave History
            </Button>
            {/* Removed Teacher Profile and View Messages buttons */}
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

        {viewMode === "absents" && (
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
                  <span className="text-sm text-slate-500">Loading leave applications...</span>
                </div>
              ) : leaveApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <span className="text-center text-sm text-slate-500">No leave applications submitted yet.</span>
                </div>
              ) : (
                <>
                  <div className="text-center text-xs text-green-600 mb-4">
                    Showing {leaveApplications.length} leave application{leaveApplications.length !== 1 ? 's' : ''}
                  </div>
                  {leaveApplications.map((application) => (
                    <div key={application.id} className="border rounded-xl p-4 mb-4 bg-white shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          {application.student_image ? (
                            <AvatarImage src={application.student_image} alt={application.student_name} />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {getInitials(application.student_name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-900">{application.student_name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 space-y-1">
                            <p><strong>Class:</strong> {application.student_class} | <strong>Division:</strong> {application.student_division}</p>
                            <p><strong>DOB:</strong> {formatDate(application.student_dob)}</p>
                            <p><strong>Phone:</strong> {application.student_phone}</p>
                            <p><strong>Days:</strong> {application.number_of_days}</p>
                            <p><strong>Period:</strong> {formatDate(application.start_date)} to {formatDate(application.return_date)}</p>
                            <p><strong>Submitted:</strong> {formatDate(application.submitted_at)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-1">Reason:</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{application.reason}</p>
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleLeaveApplicationAction(application.id, 'approved')}
                            disabled={isLoading}
                          >
                            <Check size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleLeaveApplicationAction(application.id, 'rejected')}
                            disabled={isLoading}
                          >
                            <X size={16} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {application.reviewed_at && (
                        <div className="mt-2 text-xs text-slate-500">
                          Reviewed by {application.reviewed_by} on {formatDate(application.reviewed_at)}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === "leave_history" && (
          <div className="mt-2 flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={handleBackToMenu} 
              className="self-start mb-2"
            >
              Back to Menu
            </Button>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <span className="text-sm text-slate-500">Loading students leave history...</span>
                </div>
              ) : studentsWithLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <span className="text-center text-sm text-slate-500">No student profiles available yet.</span>
                </div>
              ) : (
                <>
                  <div className="text-center text-xs text-green-600 mb-4">
                    Showing {filteredStudentsWithLeaves.length} of {studentsWithLeaves.length} students
                  </div>
                  {filteredStudentsWithLeaves.map((student, idx) => (
                    <div 
                      key={student.phone + idx} 
                      className="flex items-center gap-3 border rounded-xl px-4 py-3 shadow bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
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
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">Phone: {student.phone}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {student.leaveCount} leaves
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === "student_leave_detail" && selectedStudent && (
          <div className="mt-2 flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={handleBackToLeaveHistory} 
              className="self-start mb-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Leave History
            </Button>
            
            <div className="border rounded-xl p-4 bg-blue-50 mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  {selectedStudent.image ? (
                    <AvatarImage src={selectedStudent.image} alt={selectedStudent.name} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {getInitials(selectedStudent.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-700">
                    Class: {selectedStudent.class} | Division: {selectedStudent.division}
                  </p>
                  <p className="text-sm text-slate-600">Total Leaves: {selectedStudent.leaveCount}</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <span className="text-sm text-slate-500">Loading leave history...</span>
                </div>
              ) : selectedStudentLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <span className="text-center text-sm text-slate-500">No leave applications found for this student.</span>
                </div>
              ) : (
                selectedStudentLeaves.map((application) => (
                  <div key={application.id} className="border rounded-xl p-4 mb-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Submitted: {formatDate(application.submitted_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-700 space-y-1 mb-3">
                      <p><strong>Days:</strong> {application.number_of_days}</p>
                      <p><strong>Period:</strong> {formatDate(application.start_date)} to {formatDate(application.return_date)}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Reason:</p>
                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{application.reason}</p>
                    </div>

                    {application.reviewed_at && (
                      <div className="text-xs text-slate-500">
                        Reviewed by {application.reviewed_by} on {formatDate(application.reviewed_at)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </SheetContent>
      
      <TeacherProfileAuth
        open={showTeacherAuth}
        onOpenChange={setShowTeacherAuth}
        onLoginSuccess={(teacher) => {
          // Store teacher login in localStorage for session management
          localStorage.setItem("teacher-logged-in", JSON.stringify({
            name: teacher.name,
            phone: teacher.phone,
            class: teacher.class,
            loginTime: new Date().toISOString()
          }));
          
          toast({
            title: "Teacher Profile Login Successful",
            description: `Welcome, ${teacher.name}! You can now access teacher features.`,
          });
          
          // Close the auth modal
          setShowTeacherAuth(false);
        }}
      />
    </Sheet>
  );
};

export default TeachersAccessModal;