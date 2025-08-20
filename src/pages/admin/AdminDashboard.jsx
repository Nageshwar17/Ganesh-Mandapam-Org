import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// ---------- Header Component ----------
const Header = ({ onLogout }) => {
  return (
   <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b shadow-md">
  <div className="max-w-6xl mx-auto flex flex-row justify-between items-center px-4 py-3 space-x-4 sm:space-x-6">
    
    {/* Gradient Title */}
    <h1 className="flex items-center text-sm sm:text-base md:text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-transparent bg-clip-text animate-pulse">
      <span className="mr-2 text-sm sm:text-base md:text-2xl">🛕</span> Mandapam Admin Panel
    </h1>

    {/* Logout Button */}
    <button
      onClick={onLogout}
      className="inline-flex items-center justify-center px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-full
                 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500
                 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                 transition-all duration-300 ease-in-out"
    >
      ⏻ Logout
    </button>

  </div>
</header>


  );
};

// ---------- Footer Component ----------
const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 text-center py-4 mt-10 shadow-inner">
      <p className="text-sm text-gray-700">
        © {new Date().getFullYear()} <span className="font-semibold">Mandapam Management</span>. All rights reserved.
      </p>
    </footer>
  );
};

// ---------- Admin Dashboard ----------
const AdminDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [mandapam, setMandapam] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          toast.error("Access denied: Not an admin");
          await signOut(auth);
          navigate("/login");
          return;
        }

        // Admin verified, fetch mandapam
        const q = query(collection(db, "mandapams"), where("adminId", "==", user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setMandapam({ id: doc.id, ...doc.data() });
        } else {
          toast.error("No Mandapam found for this admin.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error validating admin access.");
      } finally {
        setCheckingRole(false);
      }
    };

    if (user) checkAdminRole();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading || checkingRole) 
    return <div className="flex items-center justify-center h-screen text-lg font-semibold">Loading...</div>;

  if (!mandapam) 
    return <div className="flex items-center justify-center h-screen text-lg font-semibold">No Mandapam found.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-yellow-100">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          
          {/* Welcome Section */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 drop-shadow-md">
              Welcome, Admin 🎉
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-1">
              Managing <span className="font-semibold text-orange-500">{mandapam.name}</span>
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="👥 Join Requests" desc="Approve or reject members" route="/admin/requests" color="blue" />
            <Card title="🛠️ Team Roles" desc="Assign volunteers roles" route="/admin/team" color="purple" />
            <Card title="📅 Daily Schedule" desc="Update 9-day program" route="/admin/schedule" color="green" />
            <Card title="💰 Expense Tracker" desc="Monitor finances" route="/admin/expenses" color="amber" />
            <Card title="🖼️ Gallery" desc="Upload & manage images" route={`/uploadimage/${mandapam.id}`} color="teal" />
            <Card title="⚙️ Settings" desc="Edit Mandapam info" route="/admin/settings" color="gray" />
            <Card title="🎵 Bhajan Uploads" desc="Upload bhajan lyrics images/audio" route="/bhajansupload" color="purple" />
            <Card title="🎼 My Bhajans" desc="View or delete your uploads" route="/mybhajans" color="teal" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// ---------- Card Component ----------
const colorClasses = {
  blue: { border: "border-blue-300", bg: "bg-gradient-to-br from-blue-50 to-blue-100", text: "text-blue-700" },
  purple: { border: "border-purple-300", bg: "bg-gradient-to-br from-purple-50 to-purple-100", text: "text-purple-700" },
  green: { border: "border-green-300", bg: "bg-gradient-to-br from-green-50 to-green-100", text: "text-green-700" },
  amber: { border: "border-amber-300", bg: "bg-gradient-to-br from-amber-50 to-amber-100", text: "text-amber-700" },
  teal: { border: "border-teal-300", bg: "bg-gradient-to-br from-teal-50 to-teal-100", text: "text-teal-700" },
  gray: { border: "border-gray-300", bg: "bg-gradient-to-br from-gray-50 to-gray-100", text: "text-gray-700" },
};

const Card = ({ title, desc, route, color }) => {
  const navigate = useNavigate();
  const styles = colorClasses[color] || colorClasses.gray;

  return (
    <div
      onClick={() => navigate(route)}
      className={`cursor-pointer ${styles.border} ${styles.bg} p-6 rounded-2xl shadow-lg 
      transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95`}
    >
      <h2 className={`text-lg sm:text-xl font-bold ${styles.text} mb-2`}>{title}</h2>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
};

export default AdminDashboard;
