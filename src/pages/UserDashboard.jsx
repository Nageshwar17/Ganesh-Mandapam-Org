import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FiLogOut, FiArrowRight } from "react-icons/fi";

export default function UserDashboard() {
  const [user] = useAuthState(auth);
  const [mandapams, setMandapams] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMandapams = async () => {
      try {
        const snap = await getDocs(collection(db, "mandapams"));
        const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMandapams(all);
        setFiltered(all);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load mandapams");
      } finally {
        setLoading(false);
      }
    };
    fetchMandapams();
  }, []);

  const handleSearch = () => {
    const term = search.trim().toLowerCase();
    const filtered = mandapams.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.city?.toLowerCase().includes(term) ||
        m.state?.toLowerCase().includes(term)
    );
    setFiltered(filtered);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully");
    navigate("/userdashboard");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const viewDetails = (mandapamId) => {
    navigate(`/mandapam/${mandapamId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
          <h1 className="text-md sm:text-1xl md:text-3xl font-bold text-orange-600">
            {user ? `${user.email}` : "Welcome, Guest"}
          </h1>
          <button
              onClick={() => navigate("/about")}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-2 rounded-md transition m-2"
            >
              About
            </button>
          <div>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition"
              >
                <FiLogOut />
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mandapam Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Get Started with Mandapam</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/create-mandapam")}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 px-5 rounded-xl shadow-md transition-all"
            >
              🙌 Create Your Mandapam (Admin)
            </button>
            <button
              onClick={() => navigate("/join-mandapam")}
              className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-3 px-5 rounded-xl shadow-md transition-all"
            >
              🔗 Join Existing Mandapam (Volunteer)
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🔍 Search Mandapams</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by Name, City or State"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Mandapams */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="no results"
              className="w-32 mx-auto mb-4 opacity-70"
            />
            <p>No mandapams found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mandapam) => (
              <div
                key={mandapam.id}
                className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl shadow hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-1">
                  {mandapam.name}
                </h3>
                <p className="text-sm text-gray-600">{mandapam.address}</p>
                <p className="text-sm text-gray-600">
                  {mandapam.city}, {mandapam.state}
                </p>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => viewDetails(mandapam.id)}
                    className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg transition"
                  >
                    View Details <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
