
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

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

// Mocked list for demo (replace this with actual data if backend is available)
const students: Profile[] = [
  {
    name: "Ayush Gupta",
    class: "6",
    division: "A",
    dob: "2012-05-15",
    phone: "735602419",
  },
  {
    name: "Riya Sharma",
    class: "5",
    division: "B",
    dob: "2013-09-22",
    phone: "9123498765",
  },
  {
    name: "Dev Patel",
    class: "6",
    division: "C",
    dob: "2012-02-11",
    phone: "8695231407",
  },
];

const TeachersAccessModal = ({ open, onOpenChange }: TeachersAccessModalProps) => {
  const [password, setPassword] = useState("");
  const [showProfiles, setShowProfiles] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ayush735602419") {
      setShowProfiles(true);
      setError("");
    } else {
      setError("Incorrect password. Try again.");
      setShowProfiles(false);
    }
  };

  // Reset state when closing
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setPassword("");
      setShowProfiles(false);
      setError("");
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
              Enter password to access:
            </label>
            <Input
              id="teacher-pass"
              type="password"
              autoComplete="off"
              placeholder="Password"
              className="text-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && (
              <span className="text-red-600 text-xs text-center">{error}</span>
            )}
            <Button type="submit" className="w-full mt-2">
              Unlock
            </Button>
          </form>
        ) : (
          <div className="mt-2 flex flex-col gap-3 overflow-y-auto max-h-[60vh]">
            {students.map((student, idx) => (
              <div key={idx} className="flex items-center gap-3 border rounded-xl px-4 py-3 shadow bg-slate-50">
                <User className="text-blue-700" />
                <div className="flex flex-col">
                  <span className="font-semibold text-blue-900">{student.name}</span>
                  <span className="text-sm text-slate-700">
                    Class: <b>{student.class}</b> | Division: <b>{student.division}</b>
                  </span>
                  <span className="text-sm text-gray-600">
                    DOB: {student.dob}
                  </span>
                  <span className="text-sm text-gray-600">
                    Phone: {student.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeachersAccessModal;
