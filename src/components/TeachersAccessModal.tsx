import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Eye, EyeOff } from "lucide-react";

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
  const [showProfiles, setShowProfiles] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (showProfiles) {
      setProfiles(getStoredProfiles());
    }
  }, [showProfiles, open]);

  // Reset state when closing
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setPassword("");
      setShowProfiles(false);
      setError("");
      setShowPassword(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ayush735602419") {
      setShowProfiles(true);
      setError("");
      setProfiles(getStoredProfiles());
    } else {
      setError("Incorrect password. Try again.");
      setShowProfiles(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[95vh] sm:max-w-md sm:mx-auto py-6 px-4 rounded-t-xl flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="text-center">{showProfiles ? "All Students' Profiles" : "For Teachers Only"}</SheetTitle>
        </SheetHeader>
        {!showProfiles ? (
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
                className="text-lg pr-12" // Add right padding for the icon
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
            <Button type="submit" className="w-full mt-2">
              Unlock
            </Button>
          </form>
        ) : (
          <div className="mt-2 flex flex-col gap-3 overflow-y-auto max-h-[60vh]">
            {profiles.length === 0 ? (
              <span className="text-center text-sm text-slate-500">No student profiles available yet.</span>
            ) : (
              profiles.map((student, idx) => (
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
              ))
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeachersAccessModal;
