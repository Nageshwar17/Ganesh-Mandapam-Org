import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function UserDashboard() {
  const [user] = useAuthState(auth); // May be null
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
    navigate("/userdashboard");
  };

  const viewDetails = (mandapamId) => {
    navigate(`/mandapam/${mandapamId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-600">
            {user ? `Welcome, ${user.email}` : "Welcome, Guest"}
          </h1>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            >
              Login
            </button>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">🔍 Search Mandapams</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name, City or State"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 w-full rounded-lg"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading mandapams...</p>
        ) : filtered.length === 0 ? (
          <p>No mandapams found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((mandapam) => (
              <div
                key={mandapam.id}
                className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-1">
                  {mandapam.name}
                </h3>
                <p className="text-sm text-gray-600">{mandapam.address}</p>
                <p className="text-sm text-gray-600">
                  {mandapam.city}, {mandapam.state}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => viewDetails(mandapam.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    View Details
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
