import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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

  if (loading || checkingRole) return <div className="text-center py-10">Loading...</div>;

  if (!mandapam) return <div className="text-center py-10">No Mandapam found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Welcome, Admin</h1>
            <p className="text-sm text-gray-600">
              Mandapam: <strong>{mandapam.name}</strong>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="👥 Join Requests" desc="Approve or reject members" route="/admin/requests" color="blue" />
          <Card title="🛠️ Team Roles" desc="Assign volunteers roles" route="/admin/team" color="purple" />
          <Card title="📅 Daily Schedule" desc="Update 9-day program" route="/admin/schedule" color="green" />
          <Card title="💰 Expense Tracker" desc="Monitor finances" route="/admin/expenses" color="amber" />
          <Card title="🖼️ Gallery" desc="Upload & manage images" route="/admin/gallery" color="teal" />
          <Card title="⚙️ Settings" desc="Edit Mandapam info" route="/admin/settings" color="gray" />
          <Card title="🎵 Bhajan Uploads" desc="Upload bhajan lyrics images/audio" route="/bhajansupload" color="purple" />
          <Card title="🎼 My Bhajans" desc="View or delete your uploads" route="/mybhajans"  color="teal"/>
        </div>
      </div>
    </div>
  );
};

// Use fixed Tailwind color class mappings to avoid purge issues
const colorClasses = {
  blue: {
    border: "border-blue-200 hover:border-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  purple: {
    border: "border-purple-200 hover:border-purple-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  green: {
    border: "border-green-200 hover:border-green-400",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  amber: {
    border: "border-amber-200 hover:border-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  teal: {
    border: "border-teal-200 hover:border-teal-400",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  gray: {
    border: "border-gray-200 hover:border-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-700",
  },
};

const Card = ({ title, desc, route, color }) => {
  const navigate = useNavigate();
  const styles = colorClasses[color] || colorClasses.gray;

  return (
    <div
      onClick={() => navigate(route)}
      className={`cursor-pointer ${styles.border} ${styles.bg} p-6 rounded-2xl shadow transition-all`}
    >
      <h2 className={`text-xl font-bold ${styles.text} mb-2`}>{title}</h2>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
};

export default AdminDashboard;
