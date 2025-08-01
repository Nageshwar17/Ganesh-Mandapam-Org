import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Fetch all schedule events for a given day and mandapamId.
 */
export const getScheduleByDay = async (day, mandapamId) => {
  const q = query(
    collection(db, "schedules"),
    where("day", "==", day),
    where("mandapamId", "==", mandapamId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      datetime: data.datetime || "", // fallback if older data doesn't have this
    };
  });
};

/**
 * Add a new schedule event with datetime field.
 */
export const addSchedule = async (data) => {
  await addDoc(collection(db, "schedules"), {
    ...data,
    datetime: data.datetime || "", // ensure field exists
  });
};

/**
 * Update a schedule event.
 */
export const updateSchedule = async (id, data) => {
  await updateDoc(doc(db, "schedules", id), {
    ...data,
    datetime: data.datetime || "", // ensure datetime persists if not changed
  });
};

/**
 * Delete a schedule event.
 */
export const deleteSchedule = async (id) => {
  await deleteDoc(doc(db, "schedules", id));
};
