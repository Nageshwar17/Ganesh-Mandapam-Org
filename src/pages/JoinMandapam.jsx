import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function JoinMandapam() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [name, setMandapamName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [results, setResults] = useState([]);
  const [allMandapams, setAllMandapams] = useState([]);
  const [selectedMandapam, setSelectedMandapam] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMandapams = async () => {
      try {
        const snap = await getDocs(collection(db, "mandapams"));
        const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllMandapams(all);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load mandapams");
      }
    };
    fetchMandapams();
  }, []);

  const handleSearch = async () => {
    if (!name && !city && !state) {
      toast.error("Enter mandapam name, city or state to search");
      return;
    }

    setLoading(true);

    try {
      const filtered = allMandapams.filter((m) => {
        const nameMatch = name
          ? m.name?.toLowerCase().includes(name.trim().toLowerCase())
          : true;
        const cityMatch = city
          ? m.city?.toLowerCase() === city.trim().toLowerCase()
          : true;
        const stateMatch = state
          ? m.state?.toLowerCase() === state.trim().toLowerCase()
          : true;
        return nameMatch && cityMatch && stateMatch;
      });

      setResults(filtered);
      if (filtered.length === 0) toast("No mandapams found");
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!selectedMandapam) {
      return toast.error("Please select a mandapam from suggestions.");
    }

    if (!fullName || !mobile) {
      return toast.error("Please fill in your full name and mobile number.");
    }

    setLoading(true);

    try {
      await addDoc(
        collection(db, "mandapams", selectedMandapam.id, "joinRequests"),
        {
          mandapamName: selectedMandapam.name,
          userId: user?.uid,
          userEmail: user?.email,
          fullName,
          mobile,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
      );

      toast.success("Join request sent successfully!");
      navigate("/userdashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send join request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-3xl p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">
          Join a Mandapam
        </h2>

        <div className="mb-6 relative">
          <label className="block font-semibold text-gray-700 mb-2">
            Enter Mandapam Name
          </label>
          <input
            type="text"
            placeholder="Mandapam Name"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setMandapamName(val);
              setSelectedMandapam(null);
              if (val.length > 1) {
                const filtered = allMandapams.filter((m) =>
                  m.name?.toLowerCase().includes(val.toLowerCase())
                );
                setResults(filtered);
              } else {
                setResults([]);
              }
            }}
            className="w-full border px-4 py-2 rounded-lg"
          />

          {name && results.length > 0 && (
            <div className="absolute z-10 bg-white border w-full rounded-lg mt-1 max-h-48 overflow-y-auto shadow">
              {results.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMandapam(m);
                    setMandapamName(m.name);
                    setResults([]);
                  }}
                  className="px-4 py-2 hover:bg-orange-100 cursor-pointer text-sm text-gray-700"
                >
                  {m.name}
                  <div className="text-xs text-gray-500">{m.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMandapam && (
          <div className="mb-4 p-3 bg-orange-100 rounded flex justify-between items-center text-orange-700 border border-orange-300">
            <div>
              Selected Mandapam: <strong>{selectedMandapam.name}</strong>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMandapam(null)}
              className="text-sm underline hover:text-orange-900"
            >
              Clear
            </button>
          </div>
        )}

        <div className="relative text-center text-gray-500 mb-4">OR</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 w-full"
        >
          {loading ? "Searching..." : "Search Mandapams"}
        </button>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Your Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          >
            {loading ? "Submitting..." : "Send Join Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
