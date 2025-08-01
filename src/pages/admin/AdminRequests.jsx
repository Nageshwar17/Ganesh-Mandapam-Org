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

const AdminRequests = () => {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const q = query(
      collection(db, "mandapams"),
      where("adminId", "==", user.uid)
    );
    const mandapamSnapshot = await getDocs(q);
    if (mandapamSnapshot.empty) return;

    const mandapamId = mandapamSnapshot.docs[0].id;
    const reqRef = collection(db, "mandapams", mandapamId, "joinRequests");
    const reqSnap = await getDocs(reqRef);

    const pending = reqSnap.docs.map((doc) => ({ id: doc.id, ...doc.data(), mandapamId }));
    setRequests(pending);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleApprove = async (req) => {
    const reqDoc = doc(db, "mandapams", req.mandapamId, "joinRequests", req.id);
    await updateDoc(reqDoc, { status: "approved" });
    toast.success("Member approved!");
    fetchRequests();
  };

  const handleReject = async (req) => {
    const reqDoc = doc(db, "mandapams", req.mandapamId, "joinRequests", req.id);
    await updateDoc(reqDoc, { status: "rejected" });
    toast("Request rejected.");
    fetchRequests();
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Pending Join Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="bg-white p-4 rounded-lg shadow mb-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{req.name}</p>
              <p className="text-sm text-gray-500">{req.email}</p>
              <p className="text-xs text-yellow-600">Status: {req.status}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleApprove(req)}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(req)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRequests;
