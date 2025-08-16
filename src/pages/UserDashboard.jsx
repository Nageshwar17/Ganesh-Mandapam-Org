// Updated modern UserDashboard component
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import MandapamPlaceholder from "../assets/mandapam_placeholder.svg";
import { FiLogOut, FiArrowRight, FiMenu } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";


export default function UserDashboard() {
  const [user] = useAuthState(auth);
  const [mandapams, setMandapams] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleCardClick = (e,id)=>{const target=e.currentTarget;const circle=document.createElement("span");const diameter=Math.max(target.clientWidth,target.clientHeight);const radius=diameter/2;circle.style.width=circle.style.height=`${diameter}px`;circle.style.left=`${e.clientX-target.getBoundingClientRect().left-radius}px`;circle.style.top=`${e.clientY-target.getBoundingClientRect().top-radius}px`;circle.classList.add("ripple-effect");target.appendChild(circle);setTimeout(()=>circle.remove(),600); viewDetails(id);};

const viewDetails = (mandapamId) => {
    navigate(`/mandapam/${mandapamId}`);
  };

  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">

    {/* Header */}
    <motion.header
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="w-screen bg-white dark:bg-gray-900 shadow-sm py-4 px-4 sm:px-6 flex justify-between items-center"
>
  {/* Title */}
  <h1
    className="text-base sm:text-xl rainbow-icon font-pacifico truncate max-w-[60%] sm:max-w-[70%]"
    title={user ? user.email : 'Welcome, Guest'}
  >
    {user ? user.email : "Welcome, Guest"}
  </h1>

  {/* Hamburger Menu */}
  <div className="relative">
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="text-2xl sm:text-3xl rainbow-icon focus:outline-none"
      aria-label="Menu"
    >
      <FiMenu />
    </button>

    {/* Dropdown */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: menuOpen ? 1 : 0, scale: menuOpen ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden ${
        menuOpen ? "block" : "hidden"
      }`}
    >
      <button
        onClick={() => { navigate("/about"); setMenuOpen(false); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        About
      </button>

      {user ? (
        <button
          onClick={() => { handleLogout(); setMenuOpen(false); }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
        >
          <FiLogOut /> Logout
        </button>
      ) : (
        <button
          onClick={() => { navigate("/login"); setMenuOpen(false); }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Login
        </button>
      )}
    </motion.div>
  </div>
</motion.header>


    {/* Main content */}
    <main className="flex-1 max-w-screen-lg w-full mx-auto p-4 sm:p-6 grid gap-8">

      {/* Action buttons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/create-mandapam")}
          className="rounded-2xl p-3 bg-blue-100 hover:bg-blue-200 dark:hover:bg-blue-300 font-medium text-center"
        >
          🙌 Create Your Mandapam 🛕 (Admin)
        </button>
        <button
          onClick={() => navigate("/join-mandapam")}
          className="rounded-2xl p-3 bg-green-100 hover:bg-green-200 font-medium text-center"
        >
          🔗 Join Existing Mandapam (Volunteer)
        </button>
      </section>

      {/* Search Section */}
      <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <h2 className="text-2xl font-semibold mb-4">🔍 Search Mandapams</h2>

  <div className="flex w-full max-w-xl mx-auto items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl shadow-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-400 focus-within:scale-105">

    {/* Search icon inside input */}

    {/* Input */}
    <input
      type="text"
      placeholder="Search by Name, City or State"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={handleKeyDown}
      className="flex-1 px-2 py-3 text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-0"
    />

    {/* Button with icon */}
    <button
      onClick={handleSearch}
      className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center px-5 py-3 transition-all duration-200 rounded-r-3xl"
    >
      <FiSearch className="text-lg" />
    </button>
  </div>
</motion.section>
      {/* Mandapam Cards */}
      <section>
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
            {filtered.map((mandapam, index) => (
              <motion.div
                key={mandapam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={(e) => handleCardClick(e, mandapam.id)}
                className="cursor-pointer bg-yellow-50 dark:bg-gray-700 border border-yellow-200 rounded-2xl shadow hover:scale-105 transition-transform overflow-hidden"
              >
                <img
                  src={mandapam.logoUrl || MandapamPlaceholder}
                  alt={mandapam.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-orange-700 mb-1">{mandapam.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{mandapam.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{mandapam.city}, {mandapam.state}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </main>

    {/* Footer */}
    <footer className="bg-white dark:bg-gray-900 py-4 text-center text-sm text-gray-600 dark:text-gray-300 border-t">
      © 2024 Ganesha Mandapam Portal. All rights reserved.
    </footer>

  </div>
);

}
