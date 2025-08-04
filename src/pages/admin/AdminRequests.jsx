import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ⬅️ Import this
import { FiArrowLeft } from "react-icons/fi";

const AdminRequests = () => {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "mandapams"),
        where("adminId", "==", user?.uid)
      );
      const mandapamSnapshot = await getDocs(q);
      if (mandapamSnapshot.empty) return;

      const mandapamId = mandapamSnapshot.docs[0].id;
      const reqRef = collection(db, "mandapams", mandapamId, "joinRequests");
      const reqSnap = await getDocs(reqRef);

      const pending = reqSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        mandapamId,
      }));
      setRequests(pending);
    } catch (err) {
      toast.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleApprove = async (req) => {
    await updateDoc(
      doc(db, "mandapams", req.mandapamId, "joinRequests", req.id),
      { status: "approved" }
    );
    toast.success("Member approved!");
    fetchRequests();
  };

  const handleReject = async (req) => {
    await updateDoc(
      doc(db, "mandapams", req.mandapamId, "joinRequests", req.id),
      { status: "rejected" }
    );
    toast("Request rejected.");
    fetchRequests();
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 px-4 py-8">
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <motion.button
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  whileHover={{ scale: 1.05 }}
                  className="absolute left-4 top-4 text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <FiArrowLeft /> Back
                </motion.button>
      
      <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
        Pending Join Requests
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-100 animate-pulse h-24 rounded-lg"
            ></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-600">No pending requests.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, index) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl text-gray-400">
                  <FaUserCircle />
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-800">{req.fullName}</p>
                  <p className="text-sm text-gray-500">{req.userEmail}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center sm:flex-row sm:items-center gap-2 sm:mt-0">


                <button
                  onClick={() => handleApprove(req)}
                  className="bg-green-500 hover:bg-green-600 transition px-4 py-2 text-white rounded-lg text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="bg-red-500 hover:bg-red-600 transition px-4 py-2 text-white rounded-lg text-sm"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminRequests;
