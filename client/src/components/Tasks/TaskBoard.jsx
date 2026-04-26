import TaskCard from "./TaskCard";

const TaskBoard = ({ tasks, onTaskUpdate, canEdit = false, isOwner = false }) => {
  const columns = {
    "To Do": tasks.filter((t) => t.status === "To Do"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    Done: tasks.filter((t) => t.status === "Done"),
  };

  const columnColors = {
    "To Do": "bg-gray-50",
    "In Progress": "bg-yellow-50",
    Done: "bg-green-50",
  };

  const columnHeaders = {
    "To Do": "📋 To Do",
    "In Progress": "⚡ In Progress",
    Done: "✅ Done",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(columns).map(([status, statusTasks]) => (
        <div key={status} className={`${columnColors[status]} rounded-xl p-4`}>
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">
            {columnHeaders[status]} ({statusTasks.length})
          </h3>
          <div className="space-y-3">
            {statusTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={onTaskUpdate} canEdit={canEdit} isOwner={isOwner} />
            ))}
            {statusTasks.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;