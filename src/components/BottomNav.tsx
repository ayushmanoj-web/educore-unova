
import { Link, useLocation } from "react-router-dom";
import { Home, Download, Bell, User, Lock } from "lucide-react";
import { useState } from "react";
import TeachersAccessModal from "./TeachersAccessModal";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User }
  // "For Teachers" removed here, it's a special button below
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 shadow md:hidden">
        <ul className="flex justify-around items-center py-2 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition text-slate-600 hover:text-blue-700 ${pathname === to ? "text-blue-700" : ""}`}
              >
                <Icon size={22} />
                {label}
              </Link>
            </li>
          ))}
          <li>
            <button
              className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition text-slate-600 hover:text-blue-700 focus-visible:outline-none"
              onClick={() => setModalOpen(true)}
              aria-label="For Teachers"
              type="button"
            >
              <Lock size={22} />
              For Teachers
            </button>
          </li>
        </ul>
      </nav>
      <TeachersAccessModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};

export default BottomNav;
