import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  selectAllTasks,
  selectTaskActionLoading,
} from "../../redux/slices/tasksSlice";

function TaskColumn({ title, statusId, tasks, onStatusChange, onDelete }) {
  return (
    <div className="flex flex-col flex-1 bg-surface border border-border rounded-xl overflow-hidden min-h-[400px]">
      <div className="bg-surface px-4 py-3 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text-primary tracking-wide uppercase text-sm">{title}</h3>
        <span className="bg-[#C7D2FE] text-text-primary text-xs px-2 py-0.5 rounded-full font-bold">
          {tasks.length}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary opacity-60 my-auto py-10">
            <span className="material-symbols-outlined text-4xl mb-2">check_box_outline_blank</span>
            <p className="text-sm">Empty</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task._id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onStatusChange, onDelete }) {
  const isLoading = useSelector(state => selectTaskActionLoading(state, task._id));
  
  const nextStatusMap = {
    'pending': 'in_progress',
    'in_progress': 'done',
    'done': 'past',
    'past': 'pending' // Allow restoring past tasks to pending
  };

  const statusColors = {
    'pending': 'border-[#d29922]',
    'in_progress': 'border-[#2f81f7]',
    'done': 'border-primary',
    'past': 'border-[#475569]'
  };

  const nextStatusLabel = {
    'in_progress': 'Move to in progress',
    'done': 'Move to done',
    'past': 'Move to past task',
    'pending': 'Restore to pending',
  };

  return (
    <div className={`bg-background border-l-4 ${statusColors[task.status] || 'border-[#475569]'} border-border p-3 rounded shadow hover:border-[#475569] transition-colors relative group opacity-${isLoading ? '50' : '100'}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className={`text-sm font-semibold leading-tight pr-6 ${task.status === 'past' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
          {task.title}
        </h4>
        <button 
          onClick={() => onDelete(task._id)}
          disabled={isLoading}
          className="text-text-secondary hover:text-[#DC2626] transition-colors absolute top-3 right-3 opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
      
      <div className="flex justify-between items-end mt-4 text-xs font-medium">
        <div className="text-text-secondary flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">flag</span>
          <span className="capitalize">{task.priority}</span>
        </div>
        
        <button 
          onClick={() => onStatusChange(task._id, nextStatusMap[task.status])}
          disabled={isLoading}
          className="bg-surface-hover hover:bg-[#C7D2FE] text-text-primary px-2 py-1 flex items-center gap-1.5 rounded border border-border transition-colors"
        >
          <span>{nextStatusLabel[nextStatusMap[task.status]]}</span>
          <span className="material-symbols-outlined text-[14px]">
            {task.status === 'past' ? 'restore' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function StudentTasks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showPastTasks, setShowPastTasks] = useState(false);
  
  const status = useSelector(state => state.tasks.status);
  const tasks = useSelector(selectAllTasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    dispatch(createTask({ title: newTaskTitle, priority: 'medium' }));
    setNewTaskTitle("");
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const pastTasks = tasks.filter(t => t.status === 'past');

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 py-5 md:py-10 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">My Tasks</h1>
            <p className="text-text-secondary">Keep track of assignments and events.</p>
          </div>

          <form onSubmit={handleCreate} className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-surface border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full md:w-64 p-2.5 outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={!newTaskTitle.trim() || status === 'loading'}
              className="bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-sm px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add
            </button>
          </form>
        </div>

        {status === 'loading' ? (
          <div className="animate-pulse flex gap-6 h-[500px]">
            <div className="flex-1 bg-surface rounded-xl border border-border"></div>
            <div className="flex-1 bg-surface rounded-xl border border-border"></div>
            <div className="flex-1 bg-surface rounded-xl border border-border"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Active Kanban Board */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <TaskColumn 
                title="Pending" 
                statusId="pending" 
                tasks={pendingTasks} 
                onStatusChange={(id, target) => dispatch(updateTaskStatus({taskId: id, status: target}))}
                onDelete={(id) => dispatch(deleteTask(id))}
              />
              <TaskColumn 
                title="In Progress" 
                statusId="in_progress" 
                tasks={inProgressTasks} 
                onStatusChange={(id, target) => dispatch(updateTaskStatus({taskId: id, status: target}))}
                onDelete={(id) => dispatch(deleteTask(id))}
              />
              <TaskColumn 
                title="Done" 
                statusId="done" 
                tasks={doneTasks} 
                onStatusChange={(id, target) => dispatch(updateTaskStatus({taskId: id, status: target}))}
                onDelete={(id) => dispatch(deleteTask(id))}
              />
            </div>

            {/* Past Tasks Archive */}
            {pastTasks.length > 0 && (
              <div className="mt-4 pt-6 border-t border-border/50">
                <button 
                  onClick={() => setShowPastTasks(!showPastTasks)}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-semibold text-sm bg-surface border border-border px-4 py-2 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200" style={{ transform: showPastTasks ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                  {showPastTasks ? 'Hide Past Tasks' : 'Show Past Tasks'} 
                  <span className="bg-[#C7D2FE] text-text-primary px-2 py-0.5 rounded-full text-xs ml-1 font-bold">
                    {pastTasks.length}
                  </span>
                </button>
                
                {showPastTasks && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                    {pastTasks.map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        onStatusChange={(id, target) => dispatch(updateTaskStatus({taskId: id, status: target}))}
                        onDelete={(id) => dispatch(deleteTask(id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
