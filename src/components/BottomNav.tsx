
import { Link, useLocation } from "react-router-dom";
import { Home, Download, Bell, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  // Add the "For Teachers" button, which links to "/home" 
  { to: "/home", label: "For Teachers", icon: Home },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 shadow md:hidden">
      <ul className="flex justify-around items-center py-2 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition text-slate-600 hover:text-blue-700 ${
                pathname === to
                  ? "text-blue-700"
                  : ""
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;

