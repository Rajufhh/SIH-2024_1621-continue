import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import Footer from "./Component/Footer";
import Header from "./Component/Header";
import Explore from "./Component/Explore";
import AboutUs from "./Component/AboutUs";
import Model from "./Component/Model";
import Home from "./Component/Home";
import Contact from "./Component/Contact";
import Dashboard from "./Component/dashboard";
import { useState, useEffect } from 'react';

// User Profile Components
const UserProfile = () => {
  const { user } = useUser();
  
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-purple-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500">First Name</label>
                <p className="text-gray-900">{user.firstName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Name</label>
                <p className="text-gray-900">{user.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500">Account Created</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Updated</label>
                <p className="text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role-based middleware component
const RoleProtected = ({ children, allowedRoles }) => {
  const { user } = useUser();
  
  // Get user's role from public metadata
  const userRole = user?.publicMetadata?.role || 'user';
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Unauthorized access component
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <Link to="/home" className="text-purple-600 hover:text-purple-700">
        Return to Home
      </Link>
    </div>
  </div>
);

// Admin Settings Component
const AdminSettings = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await user.getToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = await user.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) throw new Error('Failed to update user role');
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        >
                          <option value="user">User</option>
                          <option value="tester">Tester</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">API Status</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">All systems operational</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Last Backup</h3>
                <span className="text-sm text-gray-600">Today at 3:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Clerk theme customization
const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "iconButton",
    termsPageUrl: "/terms",
    privacyPageUrl: "/privacy",
  },
  variables: {
    colorPrimary: "#6366f1",
    colorText: "#1f2937",
    colorBackground: "#ffffff",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "shadow-xl border border-gray-100",
    navbar: "hidden",
    footer: "hidden",
    socialButtons: "gap-2",
    formButtonPrimary: 
      "bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-200",
    formFieldInput: 
      "rounded border-gray-200 focus:border-purple-500 focus:ring-purple-500",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-500",
  },
};

function App() {
  if (!clerkPubKey) {
    throw new Error("Missing Publishable Key");
  }
  
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
    >
      <Router>
        <div className="font-sans min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <>
                    <SignedIn>
                      <RoleProtected allowedRoles={['admin', 'manager', 'user']}>
                        <Dashboard />
                      </RoleProtected>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/explore"
                element={
                  <>
                    <SignedIn>
                      <RoleProtected allowedRoles={['admin', 'manager', 'user']}>
                        <Explore />
                      </RoleProtected>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/model"
                element={
                  <>
                    <SignedIn>
                      <RoleProtected allowedRoles={['admin', 'manager']}>
                        <Model />
                      </RoleProtected>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              
              {/* Admin Settings Route */}
              <Route
                path="/admin-settings"
                element={
                  <>
                    <SignedIn>
                      <RoleProtected allowedRoles={['admin']}>
                        <AdminSettings />
                      </RoleProtected>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              
              {/* User Profile Routes */}
              <Route
                path="/user-profile"
                element={
                  <>
                    <SignedIn>
                      <UserProfile />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              
              {/* Redirect root to home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
