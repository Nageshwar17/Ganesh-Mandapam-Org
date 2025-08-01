import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ExpenseTracker() {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Upload image to Cloudinary
  const handleImageUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "your_upload_preset"); // Replace with your preset
    formData.append("folder", "vinayaka_chavithi_receipts");

    setUploading(true);
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/<your_cloud_name>/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageURL(data.secure_url);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  // Submit expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return toast.error("Title and amount are required");

    try {
      await addDoc(collection(db, "expenses"), {
        userId: user?.uid,
        title,
        amount: parseFloat(amount),
        imageURL,
        createdAt: serverTimestamp(),
      });
      toast.success("Expense added");
      setTitle("");
      setAmount("");
      setImage(null);
      setImageURL("");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    }
  };

  // Fetch all expenses
  const fetchExpenses = async () => {
    if (!user) return;

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  // Delete expense
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
      toast("Expense deleted");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h2 className="text-3xl font-bold text-orange-600 mb-4">Vinayaka Chavithi Expense Tracker</h2>

      {/* Expense Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-4 py-2 w-full rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Amount (INR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-4 py-2 w-full rounded-lg"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
        {image && !imageURL && (
          <button
            type="button"
            disabled={uploading}
            onClick={handleImageUpload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {uploading ? "Uploading..." : "Upload Bill Image"}
          </button>
        )}
        {imageURL && (
          <img
            src={imageURL}
            alt="Uploaded bill"
            className="w-32 h-32 object-cover rounded border"
          />
        )}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Save Expense
        </button>
      </form>

      {/* Total */}
      <div className="text-xl font-semibold text-right text-gray-700 mb-4">
        Total: ₹{total.toLocaleString("en-IN")}
      </div>

      {/* Expense List */}
      <div className="grid gap-4">
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center">No expenses yet.</p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between bg-orange-50 border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {expense.imageURL && (
                  <img
                    src={expense.imageURL}
                    alt="Bill"
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold">{expense.title}</p>
                  <p className="text-sm text-gray-500">₹{expense.amount.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
