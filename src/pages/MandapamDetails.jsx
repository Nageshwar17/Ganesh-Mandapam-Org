// === File: src/pages/MandapamDetails.jsx ===

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-hot-toast";

const MandapamDetails = () => {
  const { mandapamId } = useParams();
  const [mandapam, setMandapam] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gallery, setGallery] = useState([]);

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
        console.error(err);
        toast.error("Error fetching mandapam");
      }
    };

    fetchMandapam();
  }, [mandapamId]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const snap = await getDocs(
        collection(db, "mandapams", mandapamId, "volunteers")
      );
      const approved = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVolunteers(approved);
    };

    const fetchSchedules = async () => {
      const q = query(
        collection(db, "schedules"),
        where("mandapamId", "==", mandapamId)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSchedules(data);
    };

    const fetchGallery = async () => {
      const galleryRef = collection(db, "mandapams", mandapamId, "gallery");
      const snap = await getDocs(galleryRef);
      const images = snap.docs.map((doc) => doc.data().imageURL);
      setGallery(images);
    };

    fetchVolunteers();
    fetchSchedules();
    fetchGallery();
  }, [mandapamId]);

  if (!mandapam)
    return <div className="text-center p-6 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">
        {mandapam.name}
      </h1>
      <p className="text-gray-700 mb-4">{mandapam.address}</p>

    {mandapam.logoUrl && (
  <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
    <img
      src={mandapam.logoUrl}
      alt={mandapam.name}
      className="w-full h-64 object-cover"
    />
  </div>
)}

      {/* Admin Info */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Admin Info</h2>
        <p className="text-sm text-gray-700">
          Admin Email: <span className="font-medium">{mandapam.adminEmail}</span>
        </p>
      </div>

      {/* Volunteers */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Volunteers</h2>
        {volunteers.length === 0 ? (
          <p className="text-gray-500">No volunteers yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {volunteers.map((v) => (
              <li
                key={v.id}
                className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-700">{v.email}</p>
                  <p className="text-sm text-gray-500">Role: {v.role}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Schedule */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Schedules</h2>
        {schedules.length === 0 ? (
          <p className="text-gray-500">No scheduled events yet.</p>
        ) : (
          <div className="space-y-3">
            {schedules
              .sort((a, b) => a.day - b.day)
              .map((s) => (
                <div
                  key={s.id}
                  className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded"
                >
                  <p className="font-semibold text-orange-700">
                    Day {s.day}: {s.title}
                  </p>
                  <p className="text-sm text-gray-600">{s.description}</p>
                  <p className="text-xs text-gray-400">
                    Time: {new Date(s.datetime).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Gallery */}
{gallery.length > 0 && (
  <div className="bg-white p-4 rounded-xl shadow mb-6">
    <h2 className="text-xl font-semibold mb-3 text-gray-800">Gallery</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {gallery.map((url, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg shadow hover:scale-105 transform transition duration-300"
        >
          <img
            src={url}
            alt={`gallery-${index}`}
            className="w-full h-32 object-cover"
          />
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

export default MandapamDetails;
