export default function ScheduleList({ events, onEdit, onDelete }) {
  if (!events || events.length === 0) {
    return <p className="text-center text-gray-500">No events scheduled for this day.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 bg-orange-50 rounded-lg shadow border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-700">{event.title}</h3>

            {event.description && (
              <p className="text-sm text-gray-700 mb-1">{event.description}</p>
            )}

            {event.datetime && (
              <p className="text-xs text-gray-500">
                Scheduled: {new Date(event.datetime).toLocaleString()}
              </p>
            )}

            <p className="text-xs text-gray-500">
              Volunteers: {event.assignedTo || "Not assigned"}
            </p>

            {event.createdAt && (
              <p className="text-xs text-gray-400">
                Created: {new Date(event.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(event)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
