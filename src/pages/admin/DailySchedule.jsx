import { useEffect, useState } from "react";
import {
  addSchedule,
  getScheduleByDay,
  deleteSchedule,
  updateSchedule,
} from "../../services/scheduleService";
import { toast } from "react-hot-toast";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import ScheduleForm from "../../components/ScheduleForm";
import ScheduleList from "../../components/ScheduleList";
import { useNavigate } from "react-router-dom"; // ⬅️ Import this
import { FiArrowLeft } from "react-icons/fi";

export default function DailySchedule() {
  const [user] = useAuthState(auth);
  const [mandapamId, setMandapamId] = useState(null);
  const [day, setDay] = useState(1);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    assignedTo: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch Mandapam ID
  useEffect(() => {
    const fetchMandapam = async () => {
      if (!user) return;

      const q = query(collection(db, "mandapams"), where("adminId", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setMandapamId(snapshot.docs[0].id);
      } else {
        toast.error("No Mandapam assigned to this admin.");
      }
    };

    fetchMandapam();
  }, [user]);

  // Fetch Events
  useEffect(() => {
    if (mandapamId) {
      fetchEvents();
    }
  }, [day, mandapamId]);

  const fetchEvents = async () => {
    const data = await getScheduleByDay(day, mandapamId);
    setEvents(data);
  };

  const handleSubmit = async (formData) => {
    if (!formData.title || !formData.date || !formData.time) {
      return toast.error("Title, Date, and Time are required");
    }

    const datetime = new Date(`${formData.date}T${formData.time}`);
    if (isNaN(datetime)) {
      return toast.error("Invalid date or time");
    }

    const payload = {
  ...formData,
  datetime: datetime.toISOString(),
  day,
  mandapamId,
  createdAt: new Date().toISOString(),
  userId: user.uid, // <-- REQUIRED for Firestore security rules
};


    try {
      if (editId) {
        await updateSchedule(editId, payload);
        toast.success("Event updated");
      } else {
        await addSchedule(payload);
        toast.success("Event added");
      }

      setForm({ title: "", description: "", date: "", time: "", assignedTo: "" });
      setEditId(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Error saving schedule");
    }
  };

  const handleEdit = (event) => {
    const dt = new Date(event.datetime);
    setForm({
      ...event,
      date: dt.toISOString().slice(0, 10),
      time: dt.toISOString().slice(11, 16),
    });
    setEditId(event.id);
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    toast.success("Event deleted");
    fetchEvents();
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          whilehover={{ scale: 1.05 }}
          className="absolute left-5 top-9 text-orange-500 hover:text-orange-600 flex items-center gap-1"
        >
          <FiArrowLeft /> Back
        </button>
        <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">Day {day} Schedule</h2>

        <div className="mb-6 flex justify-center gap-4 flex-wrap">
          {[...Array(20)].map((_, i) => (
            <button
              key={i}
              onClick={() => setDay(i + 1)}
              className={`px-4 py-1 rounded-full border text-sm font-semibold transition-all ${
                day === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 hover:bg-orange-100"
              }`}
            >
              Day {i + 1}
            </button>
          ))}
        </div>

        <ScheduleForm onSubmit={handleSubmit} initialData={form} isEditing={!!editId} />
        <ScheduleList events={events} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
