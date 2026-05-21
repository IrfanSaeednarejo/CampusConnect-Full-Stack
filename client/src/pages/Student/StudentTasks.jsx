import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllTasks,
  setTasks,
  addTask,
  toggleTaskComplete as toggleTask,
  deleteTask as removeTask,
} from "../../redux/slices/taskSlice";
import TaskProgressBar from "../../components/common/TaskProgressBar";
import AddTaskForm from "../../components/common/AddTaskForm";
import TaskFilters from "../../components/common/TaskFilters";
import TaskItem from "../../components/common/TaskItem";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Avatar from "../../components/common/Avatar";
import IconButton from "../../components/common/IconButton";
import PageHeader from "../../components/common/PageHeader";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

export default function StudentTasks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

  const tasks = useSelector(selectAllTasks);

  useEffect(() => {
    if (tasks.length === 0) {
      const mockTasks = [
        {
          id: 1,
          text: "Complete AI assignment",
          completed: false,
          priority: "high",
          dueDate: "2026-02-15",
          category: "Academic",
        },
        {
          id: 2,
          text: "Prepare for debate tournament",
          completed: false,
          priority: "high",
          dueDate: "2026-02-20",
          category: "Society",
        },
        {
          id: 3,
          text: "Review mentorship application",
          completed: true,
          priority: "medium",
          dueDate: "2026-02-10",
          category: "Mentoring",
        },
        {
          id: 4,
          text: "Submit project proposal",
          completed: false,
          priority: "high",
          dueDate: "2026-02-18",
          category: "Academic",
        },
        {
          id: 5,
          text: "Attend IEEE meeting",
          completed: false,
          priority: "medium",
          dueDate: "2026-02-16",
          category: "Society",
        },
      ];
      dispatch(setTasks(mockTasks));
    }
  }, [dispatch, tasks.length]);

  const [newTask, setNewTask] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const handleAddTask = () => {
    if (newTask.trim()) {
      dispatch(
        addTask({
          id: Date.now(),
          text: newTask,
          completed: false,
          priority: "medium",
          dueDate: new Date().toISOString().split("T")[0],
          category: "General",
        })
      );
      setNewTask("");
    }
  };

  const toggleTaskComplete = (id) => {
    dispatch(toggleTask(id));
  };

  const deleteTask = (id) => {
    dispatch(removeTask(id));
  };

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const categoryMatch = filterCategory === "all" || task.category === filterCategory;
        const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
        return categoryMatch && priorityMatch;
      }),
    [tasks, filterCategory, filterPriority]
  );

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  return (
    <div className={cn("min-h-screen", theme.page)}>
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-sm", theme.header)}>
        <div className="flex items-center justify-between px-6 py-3 sm:px-10 lg:px-20">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate("/student/dashboard")} className={theme.navLink}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-4">
              <svg className="size-6 text-[#238636]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
              <h2 className={cn("text-lg font-semibold tracking-[-0.015em]", theme.text)}>CampusNexus</h2>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 md:gap-8">
            <div className="hidden items-center gap-9 lg:flex">
              <button onClick={() => navigate("/student/dashboard")} className={cn("text-sm font-medium", theme.navLink)}>
                Dashboard
              </button>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/tasks">
                Tasks
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/events">
                Events
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/societies">
                Societies
              </a>
            </div>
            <div className="flex gap-2">
              <IconButton
                icon="notifications"
                onClick={() => navigate("/student/notifications")}
                title="Notifications"
                variant="default"
              />
            </div>
            <Avatar
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
              size="10"
              hover={true}
              borderColor="[#238636]"
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-10 md:py-10 lg:px-20">
        <div className="layout-content-container flex w-full max-w-6xl flex-col">
          <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
            <PageHeader
              title="My Tasks"
              subtitle="Manage your assignments and deadlines"
              icon="task_alt"
              showBack={false}
              isDark={isDark}
              className="border-none bg-transparent px-0 py-0"
            />

            <TaskProgressBar
              completedCount={completedCount}
              totalCount={tasks.length}
              className="mb-8 mt-8"
              isDark={isDark}
            />

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <AddTaskForm
                  newTask={newTask}
                  onTaskChange={setNewTask}
                  onAddTask={handleAddTask}
                  isDark={isDark}
                />
              </div>

              <div className="lg:col-span-3">
                <TaskFilters
                  filterCategory={filterCategory}
                  filterPriority={filterPriority}
                  onCategoryChange={setFilterCategory}
                  onPriorityChange={setFilterPriority}
                  className="mb-6"
                  isDark={isDark}
                />

                <div className="flex flex-col gap-3">
                  {filteredTasks.length === 0 ? (
                    <Card padding="p-12" isDark={isDark}>
                      <EmptyState
                        icon="task_alt"
                        title="No tasks found"
                        description="Try adjusting your filters or add a new task"
                      />
                    </Card>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={toggleTaskComplete}
                        onDelete={deleteTask}
                        isDark={isDark}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
