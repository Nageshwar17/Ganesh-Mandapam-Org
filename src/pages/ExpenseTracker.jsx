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
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CLOUDINARY_CLOUD_NAME = "dpeikoqsv";
const COLORS = ["#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

export default function ExpenseTracker() {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [chartsMinimized, setChartsMinimized] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !amount || !category)
      return toast.error("Title, amount, and category are required");

    setUploading(true);
    let uploadedImageURL = "";

    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "vinayakauploads");
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
        category,
        imageURL: uploadedImageURL,
        createdAt: serverTimestamp(),
      });
      toast.success("Expense added");
      setTitle("");
      setAmount("");
      setCategory("");
      setImage(null);
      fetchExpenses();
      setShowExpenses(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    } finally {
      setUploading(false);
    }
  };

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
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const expensesByDate = expenses.reduce((acc, cur) => {
    const date = cur.createdAt?.toDate
      ? cur.createdAt.toDate().toISOString().slice(0, 10)
      : "Unknown";
    if (!acc[date]) acc[date] = 0;
    acc[date] += cur.amount || 0;
    return acc;
  }, {});

  const dateData = Object.entries(expensesByDate).map(([date, total]) => ({
    date,
    total,
  }));

  const expensesByCategory = expenses.reduce((acc, cur) => {
    const cat = cur.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += cur.amount || 0;
    return acc;
  }, {});

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 px-4 py-8 relative">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed top-4 left-4 flex items-center gap-2 rounded-full p-3 bg-white/90 backdrop-blur-md border border-orange-300 text-orange-600 shadow-md hover:shadow-lg transition-shadow duration-300 active:scale-95 z-50"
      >
        <FiArrowLeft className="text-3xl" />
        <span className="font-semibold text-base sm:block hidden">Back</span>
      </button>

      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md border border-orange-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-3xl font-extrabold font-roboto text-orange-600 mb-6 text-center drop-shadow-md">
          Vinayaka Chavithi Expense Tracker
        </h2>

        {/* Charts header with toggle */}
        <div className="flex justify-center items-center mb-4 gap-4">
          <h3 className="text-xl font-bold text-orange-600 select-none">Expense Summary</h3>
          <button
            onClick={() => setChartsMinimized(!chartsMinimized)}
            aria-label={chartsMinimized ? "Show charts" : "Hide charts"}
            className="p-1 rounded-full border border-orange-400 text-orange-600 hover:bg-orange-100 transition"
          >
            {chartsMinimized ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
          </button>
        </div>

        {!chartsMinimized && (
          <div className="space-y-10 mb-10 max-h-[340px] overflow-auto">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dateData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#ff7e5f" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: "12px" }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Modern Form */}
        <form className="space-y-6 mb-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Expense Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-orange-300 rounded-lg px-5 py-3 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              required
            />
            <input
              type="number"
              placeholder="Amount (INR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-orange-300 rounded-lg px-5 py-3 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="border border-orange-300 rounded-lg px-5 py-3 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Gifts">Gifts</option>
              <option value="Others">Others</option>
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="border border-orange-300 rounded-lg px-5 py-2 cursor-pointer bg-white
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-xl border-2 border-orange-300 shadow-md mt-3 mx-auto"
            />
          )}

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-full font-semibold text-white transition-all duration-300 ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-pink-500 hover:via-purple-600 hover:to-orange-400 shadow-lg hover:shadow-xl"
            }`}
          >
            {uploading ? "Saving..." : "Save Expense"}
          </button>
        </form>

        {/* Total */}
        <div className="text-right text-2xl font-bold text-gray-800 mb-6 tracking-wide drop-shadow-sm">
          Total:{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Toggle button for expenses list */}
        <button
          onClick={() => setShowExpenses(!showExpenses)}
          className="mb-6 px-5 py-3 w-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition active:scale-95"
        >
          {showExpenses ? "Hide Expenses" : `Show Expenses (${expenses.length})`}
        </button>

        {/* Compact Expense List */}
        {showExpenses && (
          <Gallery>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">No expenses yet.</p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="group flex items-center justify-between bg-white/70 backdrop-blur-sm border border-orange-200 rounded-xl p-3 shadow-md hover:shadow-xl transition-shadow duration-300"
                    style={{ minHeight: "4.5rem" }}
                  >
                    <div className="flex items-center gap-4 w-full max-w-[calc(100%-3.5rem)] overflow-hidden">
                      {expense.imageURL && (
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
                              className="w-14 h-14 object-cover rounded-lg border border-orange-300 cursor-pointer transition-transform duration-300 hover:scale-110 flex-shrink-0"
                            />
                          )}
                        </Item>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 text-base truncate" title={expense.title}>
                          {expense.title}
                        </p>
                        <p className="text-orange-600 font-semibold text-sm mt-0.5">
                          ₹{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate hidden md:block" title={expense.category}>
                          {expense.category || "Uncategorized"}
                        </p>
                        <p
  className="text-xs text-gray-500 mt-0.5 truncate "
  title={
    expense.createdAt?.toDate
      ? expense.createdAt.toDate().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "No date/time"
  }
>
  
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
                      aria-label={`Delete expense ${expense.title}`}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center text-sm font-semibold ml-3 flex-shrink-0"
                    >
                      <FiTrash2 className="mr-1 text-lg" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Gallery>
        )}
      </div>
    </div>
  );
}
