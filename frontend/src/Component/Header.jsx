import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from "@clerk/clerk-react";

const Header = () => {
  const { user } = useUser();

  return (
    <header className="flex justify-between items-center px-4 py-2 border-b bg-white shadow-sm">
      <div className="text-xl font-bold">
        <Link to={"/"}>
          <img src="./src/assets/logo.png" className="h-20 w-20" alt="Logo" />
        </Link>
      </div>
      
      <nav className="space-x-6 justify-center items-center">
        <Link to="/home" className="text-gray-600 hover:text-gray-900 hover:underline hover:decoration-purple-600">
          Home
        </Link>
        <SignedIn>
          <Link to="/explore" className="text-gray-600 hover:text-gray-900 hover:underline hover:decoration-purple-600">
            Explore
          </Link>
          <Link to="/model" className="text-gray-600 hover:text-gray-900 hover:underline hover:decoration-purple-600">
            Model
          </Link>
        </SignedIn>
        <Link to="/contact" className="text-gray-600 hover:text-gray-900 hover:underline hover:decoration-purple-600">
          Contact Us
        </Link>
        <Link to="/aboutus" className="text-gray-600 hover:text-gray-900 hover:underline hover:decoration-purple-600">
          About Us
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <SignedIn>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Welcome, {user?.firstName || 'User'}
            </span>
            <Link 
              to="/dashboard"
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <UserButton 
              afterSignOutUrl="/home"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 rounded-full border-2 border-purple-100",
                  userButtonTrigger: "hover:bg-purple-50 rounded-full transition-colors duration-200"
                }
              }}
              userProfileMode="navigation"
              userProfileUrl="/user-profile"
            />
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex items-center space-x-3">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                Sign In
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200">
                Register
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;