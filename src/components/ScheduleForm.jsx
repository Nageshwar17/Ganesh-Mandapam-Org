import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ScheduleForm({ onSubmit, initialData = {}, isEditing }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (initialData) {
      let date = "";
      let time = "";

      if (initialData.datetime) {
        const dt = new Date(initialData.datetime);
        date = dt.toISOString().slice(0, 10);
        time = dt.toISOString().slice(11, 16);
      }

      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        assignedTo: initialData.assignedTo || "",
        date,
        time,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (!form.date || !form.time) {
      toast.error("Date and time are required");
      return;
    }

    onSubmit(form); // Leave datetime creation to DailySchedule

    if (!isEditing) {
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        assignedTo: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-md"
    >
      <div className="flex flex-col">
        <label htmlFor="title" className="text-sm font-medium mb-1">Event Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Ganesh Puja"
          className="border rounded-lg px-4 py-2 w-full"
          required
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="date" className="text-sm font-medium mb-1">Date *</label>
        <input
          id="date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2 w-full"
          required
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="time" className="text-sm font-medium mb-1">Time *</label>
        <input
          id="time"
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2 w-full"
          required
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="assignedTo" className="text-sm font-medium mb-1">Assigned Volunteers</label>
        <input
          id="assignedTo"
          type="text"
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          placeholder="e.g. Ram, Sita, Hanuman"
          className="border rounded-lg px-4 py-2 w-full"
        />
      </div>

      <div className="flex flex-col md:col-span-2">
        <label htmlFor="description" className="text-sm font-medium mb-1">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="e.g. Pooja led by village priest"
          className="border rounded-lg px-4 py-2 w-full"
        />
      </div>

      <div className="col-span-full">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg w-full"
        >
          {isEditing ? "Update Event" : "Add Event"}
        </button>
      </div>
    </form>
  );
}
