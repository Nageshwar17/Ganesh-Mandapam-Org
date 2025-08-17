import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-hot-toast";
import GalleryView from "../components/GalleryView";
import {
  FiUsers,
  FiImage,
  FiCalendar,
  FiUser,
  FiArrowLeft,
  FiClock,
} from "react-icons/fi";

const MandapamDetails = () => {
  const { mandapamId } = useParams();
  const navigate = useNavigate();
  const [mandapam, setMandapam] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [progress, setProgress] = useState(0);
  const [upcomingTitle, setUpcomingTitle] = useState(""); // 🆕 Added for upcoming event title
  const userEmail = "user@example.com"; // 🔁 Replace with real user auth

  useEffect(() => {
    const fetchMandapam = async () => {
      try {
        const docRef = doc(db, "mandapams", mandapamId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMandapam(docSnap.data());
        } else {
          toast.error("Mandapam not found");
        }
      } catch (err) {
        toast.error("Error fetching mandapam");
      }
    };
    fetchMandapam();
  }, [mandapamId]);

  useEffect(() => {
    const fetchData = async () => {
      const vols = await getDocs(collection(db, "mandapams", mandapamId, "volunteers"));
      setVolunteers(vols.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const q = query(collection(db, "schedules"), where("mandapamId", "==", mandapamId));
      const schedSnap = await getDocs(q);
      const events = schedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSchedules(events);

      const galSnap = await getDocs(collection(db, "mandapams", mandapamId, "gallery"));
      setGallery(galSnap.docs.map((doc) => doc.data().imageURL));
    };

    fetchData();
  }, [mandapamId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (schedules.length > 0) {
        const now = new Date();
        const upcomingEvents = schedules
          .filter((s) => new Date(s.datetime) > now)
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        const upcoming = upcomingEvents[0];

        if (upcoming) {
          const target = new Date(upcoming.datetime);
          const diff = target - now;
          const hours = Math.floor(diff / 1000 / 60 / 60);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
          setUpcomingTitle(upcoming.title); // 🆕 Set the upcoming title
        } else {
          setCountdown("All events finished 🎉");
          setUpcomingTitle(""); // Clear the title
        }

        // Progress bar calculation
        const past = schedules.filter((s) => new Date(s.datetime) < now).length;
        const progressPercent = Math.floor((past / schedules.length) * 100);
        setProgress(progressPercent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedules]);

  const joinVolunteer = async () => {
    try {
      await addDoc(collection(db, "mandapams", mandapamId, "volunteers"), {
        email: userEmail,
        role: "volunteer",
      });
      toast.success("Joined successfully!");
      setVolunteers((prev) => [...prev, { email: userEmail, role: "volunteer" }]);
    } catch (err) {
      toast.error("Error joining as volunteer");
    }
  };

  if (!mandapam) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <>
    <div className="max-w-5xl mx-auto px-2 py-10 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-orange-500 hover:text-orange-600 flex items-center gap-1"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Mandapam Header */}
      <div className="mb-8 text-center">
        {mandapam.logoUrl && (
          <img
            src={mandapam.logoUrl}
            alt={mandapam.name}
            className="mx-auto w-48 h-48 rounded-full shadow-lg object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-extrabold text-orange-700">{mandapam.name}</h1>
        <p className="text-gray-600">{mandapam.address}</p>
        <p className="text-gray-600">{mandapam.description}</p>
      </div>

      {/* Admin + CTA */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-1">
            <FiUser className="text-orange-500" /> Admin
          </h2>
          <p className="text-sm text-gray-700">{mandapam.adminEmail}</p>
        </div>
        <button
          onClick={() => navigate("/join-mandapam")}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow transition"
        >
          🙋 Join as Volunteer
        </button>
      </section>

      {/* Countdown + Progress */}
      {schedules.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-xl mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-orange-600 font-semibold">
              <div className="flex items-center gap-2">
                <FiClock />
                Next Event In: <span>{countdown}</span>
              </div>
              {upcomingTitle && (
                <div className="text-sm text-orange-700 mt-1 sm:mt-0">
                  📌 <strong>Upcoming:</strong> {upcomingTitle}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">Progress: {progress}%</div>
          </div>
          <div className="mt-2 h-3 w-full bg-orange-100 rounded-full">
            <div
              className="h-3 bg-orange-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Volunteers */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
          <FiUsers className="text-orange-500" /> Volunteers
        </h2>
        {volunteers.length === 0 ? (
          <p className="text-gray-500">No volunteers yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {volunteers.map((v, i) => (
              <div key={i} className="bg-orange-100 p-3 rounded-xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center font-bold text-white">
                  {v.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{v.email}</p>
                  <p className="text-sm text-gray-600">{v.role}</p>
                  <p className="text-sm text-gray-600">{v.fullName}</p>
                  <p className="text-sm text-gray-600">{v.mobile}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Schedule */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
          <FiCalendar className="text-orange-500" /> Schedule
        </h2>
        {schedules.length === 0 ? (
          <p className="text-gray-500">No events scheduled yet.</p>
        ) : (
          <ol className="relative border-l-2 border-orange-300 space-y-6 pl-6">
            {schedules
              .sort((a, b) => a.day - b.day)
              .map((s) => (
                <li key={s.id}>
                  <div className="absolute w-4 h-4 bg-orange-500 rounded-full -left-2.5 top-1"></div>
                  <h4 className="text-orange-700 font-semibold">
                    Day {s.day}: {s.title}
                  </h4>
                  <p className="text-sm text-gray-600">{s.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.datetime).toLocaleString()}
                  </p>
                </li>
              ))}
          </ol>
        )}
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-4">
            <FiImage className="text-orange-500" /> Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((url, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl shadow hover:scale-105 transform transition duration-300"
              >
                <img
                  src={url}
                  alt={`gallery-${index}`}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    <div>  
      <GalleryView mandapamId={mandapamId} />
   
    </div>

    </>
  );
};

export default MandapamDetails;
