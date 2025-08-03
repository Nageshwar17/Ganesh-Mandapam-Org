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
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/style.css";

const CLOUDINARY_CLOUD_NAME = "dpeikoqsv";

export default function ExpenseTracker() {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Submit expense + upload image
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return toast.error("Title and amount are required");

    setUploading(true);
    let uploadedImageURL = "";

    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "vinayakauploads"); // Replace accordingly
      formData.append("folder", "vinayaka_chavithi_receipts");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (res.ok) {
          uploadedImageURL = data.secure_url;
        } else {
          toast.error("Image upload failed");
          setUploading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        toast.error("Error uploading image");
        setUploading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "expenses"), {
        userId: user?.uid,
        title,
        amount: parseFloat(amount),
        imageURL: uploadedImageURL,
        createdAt: serverTimestamp(),
      });
      toast.success("Expense added");
      setTitle("");
      setAmount("");
      setImage(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    } finally {
      setUploading(false);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

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
    <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-yellow-10 to-white-100 rounded-xl shadow mt-8">
      <h2 className="text-3xl font-bold text-orange-600 mb-4">
        Vinayaka Chavithi Expense Tracker
      </h2>

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
          className="border px-4 py-2 w-full rounded-lg cursor-pointer bg-white"
        />
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md border-2 border-gray-400 shadow-sm mt-2"
          />
        )}
        <button
          type="submit"
          disabled={uploading}
          className={`${
            uploading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-2 rounded w-full`}
        >
          {uploading ? "Saving..." : "Save Expense"}
        </button>
      </form>

      {/* Total */}
      <div className="text-xl font-semibold text-right text-gray-700 mb-4">
        Total: ₹{total.toLocaleString("en-IN")}
      </div>

      {/* Expense Gallery */}
      <Gallery>
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
                  {expense.imageURL ? (
                    <Item
                      original={expense.imageURL}
                      thumbnail={expense.imageURL}
                      width="1024"
                      height="768"
                    >
                      {({ ref, open }) => (
                        <img
                          ref={ref}
                          onClick={open}
                          src={expense.imageURL}
                          alt="Bill"
                          className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-105 transition"
                        />
                      )}
                    </Item>
                  ) : null}
                  <div>
                    <p className="text-lg font-semibold">{expense.title}</p>
                    <p className="text-sm text-blue-500">
                      ₹{expense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.createdAt?.toDate
                        ? expense.createdAt.toDate().toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })
                        : "No date/time"}
                    </p>
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
      </Gallery>
    </div>
  );
}
