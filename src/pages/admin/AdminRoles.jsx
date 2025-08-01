import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-hot-toast";

export default function AdminRoles() {
  const [user] = useAuthState(auth);
  const [mandapamId, setMandapamId] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchMandapam = async () => {
      if (!user) return;
      const q = query(collection(db, "mandapams"), where("adminId", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setMandapamId(snapshot.docs[0].id);
      } else {
        toast.error("No mandapam found for this admin.");
      }
    };
    fetchMandapam();
  }, [user]);

  useEffect(() => {
    if (mandapamId) {
      fetchVolunteers();
      fetchApprovedUsers();
    }
  }, [mandapamId]);

  const fetchVolunteers = async () => {
    const snap = await getDocs(collection(db, "mandapams", mandapamId, "volunteers"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVolunteers(data);
  };

  const fetchApprovedUsers = async () => {
    const q = query(
      collection(db, "mandapams", mandapamId, "joinRequests"),
      where("status", "==", "approved")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      userId: doc.data().userId,
      email: doc.data().userEmail,
    }));
    setApprovedUsers(data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !role) {
      return toast.error("Select a user and role");
    }

    const selectedUser = approvedUsers.find(u => u.userId === selectedUserId);
    if (!selectedUser) return toast.error("Selected user not found");

    try {
      await setDoc(doc(db, "mandapams", mandapamId, "volunteers", selectedUserId), {
        userId: selectedUserId,
        email: selectedUser.email,
        role,
        assignedBy: user.uid,
        assignedAt: new Date().toISOString(),
      });

      toast.success("Volunteer role assigned");
      setSelectedUserId("");
      setRole("");
      fetchVolunteers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign role");
    }
  };

  const handleRemove = async (volunteerId) => {
    try {
      await deleteDoc(doc(db, "mandapams", mandapamId, "volunteers", volunteerId));
      toast("Volunteer removed");
      fetchVolunteers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Assign Volunteer Roles</h2>

      <form onSubmit={handleAssign} className="grid md:grid-cols-2 gap-4 mb-8">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="border px-4 py-2 rounded-lg"
          required
        >
          <option value="">Select Approved Volunteer</option>
          {approvedUsers.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.fullName || user.email}
            </option>
          ))}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border px-4 py-2 rounded-lg"
          required
        >
          <option value="">Select Role</option>
          <option value="priest">Priest</option>
          <option value="cook">Cook</option>
          <option value="cleaner">Cleaner</option>
          <option value="assistant">Assistant</option>
        </select>

        <button
          type="submit"
          className="bg-green-500 text-white py-2 rounded-lg col-span-full hover:bg-green-600"
        >
          Assign Role
        </button>
      </form>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Volunteers</h3>
      {volunteers.length === 0 ? (
        <p className="text-gray-500">No volunteers assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
            >
              <div>
                <p className="font-medium">{v.email}</p>
                <p className="text-sm text-gray-600">Role: {v.role}</p>
              </div>
              <button
                onClick={() => handleRemove(v.id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
