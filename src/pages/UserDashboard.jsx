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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white dark:bg-gray-900 shadow-sm py-4 px-4 sm:px-6 flex justify-between items-center"
          >
            <h1
              className="text-base sm:text-xl rainbow-icon font-pacifico max-w-full truncate"
              title={user ? user.email : 'Welcome, Guest'}
            >
              {user ? user.email : "Welcome, Guest"}
            </h1>

            {/* Hamburger + Dropdown */}
            <div
            className="relative group"
            onClick={() => setMenuOpen(!menuOpen)}    // tap on mobile
          >
            <FiMenu className="text-2xl cursor-pointer rainbow-icon" />
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-40 z-50 
              ${menuOpen ? "block" : "hidden"} group-hover:block
            `}
          >

              <button
                onClick={() => navigate("/about")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                About
              </button>
            
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                >
                  <FiLogOut /> Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Login
                </button>
              )}
            </motion.div>
          </div>
      </motion.header>



      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid gap-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => navigate("/create-mandapam")} className="rounded-2xl p-6 bg-blue-100 hover:bg-blue-200 dark:hover:bg-blue-300 font-medium">🙌 Create Your Mandapam 🛕 (Admin)</button>
          <button onClick={() => navigate("/join-mandapam")} className="rounded-2xl p-6 bg-green-100 hover:bg-green-200 font-medium">🔗 Join Existing Mandapam (Volunteer)</button>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">🔍 Search Mandapams</h2>

          <div className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-400 focus-within:shadow-lg">
            <span className="px-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-focus-within:scale-110">
              <FiArrowRight />
            </span>

            <input
              type="text"
              placeholder="Search by Name, City or State"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent py-3 pr-4 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />

            <button
              onClick={handleSearch}
              className="bg-orange-500 text-white px-5 py-3 rounded-none transition transform duration-200 hover:scale-105 hover:bg-orange-600 focus:scale-105 focus:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </motion.section>


        <section>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="absolute inset-0 pointer-events-none ripple" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500">
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="no results" className="w-32 mx-auto mb-4 opacity-70" />
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
                  className="cursor-pointer bg-yellow-50 dark:bg-gray-700 border border-yellow-200 rounded-2xl shadow transition-transform duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  {/* Image with local themed placeholder */}
                  <img
                    src={mandapam.logoUrl || MandapamPlaceholder}
                    alt={mandapam.name}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-orange-700 mb-1">
                      {mandapam.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{mandapam.address}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {mandapam.city}, {mandapam.state}
                    </p>
                  </div>

      <span className="absolute inset-0 pointer-events-none ripple-effect" />
    </motion.div>
  ))}
</div>

          )}
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-4 text-center text-sm text-gray-600 dark:text-gray-300 border-t">© 2024 Ganesha Mandapam Portal. All rights reserved.</footer>
      <span className="absolute inset-0 pointer-events-none ripple" />
    </div>
  );
}
