"use client";

import { FormEvent, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Task } from "../lib/api";
import { TaskService } from "../services/tasks";
import { AuthService, User as AuthUser } from "../services/auth";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiCalendar, FiUser, FiPlus, FiAlertCircle, FiX, FiInbox, FiClock, FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { DashboardHeader } from "./dashboard-header";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type TaskFormState = {
  title: string;
  description: string;
  status: "pending" | "completed";
  dueDate: string;
};

const initialFormState: TaskFormState = {
  title: "",
  description: "",
  status: "pending",
  dueDate: ""
};

function isOverdue(task: Task) {
  if (task.status !== "pending" || !task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function TaskDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TaskFormState>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "due-soon">("due-soon");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const TABS = (["all", "pending", "completed"] as const);

  useEffect(() => {
    const activeTab = tabsRef.current[TABS.indexOf(statusFilter)];
    if (activeTab) {
      setUnderlineStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [statusFilter]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const [tasksResponse, userResponse] = await Promise.all([
        TaskService.getTasks(),
        AuthService.getProfile()
      ]);
      setTasks(tasksResponse.tasks);
      setUser(userResponse.user);
    } catch (loadError: any) {
      if (loadError.status === 401) {
        router.push("/login");
        return;
      }
      setError(loadError instanceof Error ? loadError.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  // Integrated Filtering and Sorting Logic
  const filteredTasks = useMemo(() => {
    let res = [...tasks];

    // Filter by Status
    if (statusFilter !== "all") {
      res = res.filter((task) => task.status === statusFilter);
    }

    // Filter by Selected Date
    if (selectedDate) {
      const formattedFilterDate = format(selectedDate, "yyyy-MM-dd");
      res = res.filter((task) => {
        if (!task.dueDate) return false;
        return task.dueDate.slice(0, 10) === formattedFilterDate;
      });
    }

    // Apply Sorting
    return res.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "due-soon") {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aDate - bDate;
      }
      return 0;
    });
  }, [statusFilter, tasks, selectedDate, sortBy]);

  function handleOpenModal(task?: Task) {
    if (task) {
      setEditingTaskId(task._id);
      setFormState({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
      });
    } else {
      setEditingTaskId(null);
      setFormState(initialFormState);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setFormState(initialFormState);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        status: formState.status,
        dueDate: formState.dueDate || undefined
      };

      if (editingTaskId) {
        await TaskService.updateTask(editingTaskId, payload);
        showToast("Task updated successfully.");
      } else {
        await TaskService.createTask(payload);
        showToast("New Task captured.");
      }

      handleCloseModal();
      await loadTasks();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to save task"
      );
      showToast("Could not save your Task.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task: Task) {
    try {
      // Optimistic update with projected completedAt
      const newStatus = task.status === "pending" ? "completed" : "pending";
      const now = new Date().toISOString();

      setTasks(prev => prev.map(t => t._id === task._id ? {
        ...t,
        status: newStatus,
        completedAt: newStatus === "completed" ? now : undefined
      } : t));

      await TaskService.updateTask(task._id, { status: newStatus });
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update task");
      showToast("Sync failed. Reverting...", "error");
      await loadTasks();
    }
  }

  function handleDelete(taskId: string) {
    setTaskToDeleteId(taskId);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!taskToDeleteId) return;
    try {
      await TaskService.deleteTask(taskToDeleteId);
      showToast("Task deleted.");
      await loadTasks();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete task");
    } finally {
      setIsDeleteModalOpen(false);
      setTaskToDeleteId(null);
    }
  }

  async function handleLogout() {
    try {
      await AuthService.logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  // Derived properties for dashboard stats (Global)
  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f9f7f2] font-inter">
      {/* HEADER */}
      <DashboardHeader
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleLogout={handleLogout}
        handleOpenModal={() => handleOpenModal()}
        userName={user?.name}
        userEmail={user?.email}
      />

      <MaxWidthWrapper>
        {/* MAIN CONTENT */}
        <main className="max-w-[1200px] mx-auto py-5 sm:py-8">
          {/* HERO AREA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-6 lg:mb-10">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-manrope font-extrabold text-on-surface tracking-tight">My Desk</h1>
              <p className="text-on-surface-variant text-sm md:text-[0.95rem] font-medium m-0">You have {pendingCount} task{pendingCount !== 1 ? 's' : ''} remaining for today.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <nav className="order-last sm:order-first flex items-center justify-between sm:justify-start w-full sm:w-auto text-sm font-semibold text-on-surface-variant relative border-t border-[#dbe3e7] sm:border-none pt-2 sm:pt-0 mt-2 sm:mt-0 min-h-[44px]">
                {TABS.map((opt, i) => (
                  <button
                    key={opt}
                    ref={(el) => { tabsRef.current[i] = el; }}
                    className={`capitalize bg-transparent cursor-pointer transition-colors duration-300 h-10 flex flex-1 sm:flex-none justify-center items-center sm:px-1 mr-0 sm:mr-6 last:mr-0 whitespace-nowrap relative z-10 ${statusFilter === opt
                      ? "text-primary font-bold"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    onClick={() => setStatusFilter(opt)}
                    type="button"
                  >
                    {opt === "all" ? "All Tasks" : opt}
                  </button>
                ))}

                {/* Sliding Underline - Works across both mobile and desktop now */}
                <div
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                  }}
                />
              </nav>

              <div className="flex flex-row items-stretch sm:items-center gap-3">
                {/* SORT BY FILTER */}
                <div className="flex flex-1 items-center justify-between sm:justify-start gap-2 px-4 py-3 bg-white border border-[#dbe3e7] rounded-xl shadow-sm sm:w-auto">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/60">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-sm font-bold text-on-surface focus:outline-none cursor-pointer flex-1 text-right sm:text-left"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="due-soon">Due Soon</option>
                  </select>
                </div>

                {/* DATE FILTER */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-1 items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-white text-on-surface font-bold text-sm rounded-xl border border-[#dbe3e7] h-auto transition-all hover:bg-surface-container-low shadow-sm sm:w-auto",
                        !selectedDate && "text-on-surface-variant font-medium"
                      )}
                    >
                      <FiCalendar className="w-4 h-4 text-primary" />
                      <span className="truncate">{selectedDate ? format(selectedDate, "MMM dd") : "Date"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 rounded-2xl shadow-2xl border border-[#dbe3e7] bg-white overflow-hidden" align="end" sideOffset={12}>
                    <div className="p-3 border-b border-[#dbe3e7] flex justify-between items-center bg-surface-container-low/50">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Select Filter Date</span>
                      {selectedDate && (
                        <button
                          onClick={() => setSelectedDate(undefined)}
                          className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <button
                onClick={() => handleOpenModal()}
                className="hidden sm:flex items-center justify-center gap-2 bg-primary shadow-lg hover:bg-[#2588c5] text-white px-6 py-3 rounded-xl font-extrabold text-sm transition-all border-none cursor-pointer active:scale-95"
              >
                <FiPlus className="w-4 h-4 stroke-3" />
                New Task
              </button>
            </div>
          </div>

          {error && <p className="mb-8 text-error font-bold">{error}</p>}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

            {/* LEFT: TASK LIST */}
            <div className="flex flex-col gap-5 order-2 lg:order-1">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col gap-4 p-7 rounded-[20px] bg-white border border-[#dbe3e7] animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="h-4 w-20 bg-surface-container rounded-full" />
                        <div className="h-6 w-3/4 bg-surface-container rounded-lg" />
                      </div>
                      <div className="h-6 w-6 bg-surface-container rounded-full" />
                    </div>
                    <div className="h-4 w-full bg-surface-container rounded-lg" />
                    <div className="flex justify-between mt-auto">
                      <div className="h-4 w-32 bg-surface-container rounded-lg" />
                      <div className="flex gap-2">
                        <div className="h-4 w-10 bg-surface-container rounded-lg" />
                        <div className="h-4 w-10 bg-surface-container rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredTasks.length === 0 ? (
                <div className="p-20 text-center rounded-[32px] bg-white border-2 border-dashed border-[#dbe3e7] flex flex-col items-center justify-center animate-fade-in group hover:border-primary/30 transition-colors">
                  <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <FiInbox className="w-10 h-10 text-on-surface-variant/40" />
                  </div>
                  <h3 className="text-2xl font-bold font-manrope text-on-surface mb-3 tracking-tight">Your desk is clear</h3>
                  <p className="text-on-surface-variant max-w-[280px] mx-auto text-sm font-medium leading-relaxed mb-10">
                    All set! Take a moment to breathe or start curating your next meaningful goal.
                  </p>
                  <Button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white font-bold px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all h-auto"
                  >
                    <FiPlus className="mr-2" /> Create First Task
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const isCompleted = task.status === "completed";
                  const wasCompletedLate = isCompleted && task.dueDate && task.completedAt && (
                    new Date(task.completedAt).setHours(0, 0, 0, 0) > new Date(task.dueDate).setHours(0, 0, 0, 0)
                  );
                  return (
                    <article
                      key={task._id}
                      className={`relative p-7 rounded-[20px] border transition-all duration-500 ease-in-out bg-white ${overdue ? "border-[#f4c2cc] bg-[#fff5f6]" : "border-[#dbe3e7] hover:shadow-md"} ${isCompleted ? "opacity-60 grayscale" : ""}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit text-[0.65rem] uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-full ${overdue && !isCompleted ? "bg-[#eb3b5a] text-white" : isCompleted ? (wasCompletedLate ? "bg-[#eb3b5a]/10 text-[#eb3b5a]" : "bg-secondary-container text-[#637174]") : "bg-[#edf6fd] text-[#2d98da]"}`}>
                            {overdue && !isCompleted ? "Overdue" : wasCompletedLate ? "Finished Late" : task.status}
                          </span>
                          <div className="relative inline-block">
                            <h2 className={cn(
                              "font-manrope text-xl font-bold transition-colors duration-500",
                              isCompleted ? "text-on-surface-variant" : "text-on-surface"
                            )}>
                              {task.title}
                            </h2>
                            <div
                              className={cn(
                                "absolute left-0 top-[55%] h-[2px] bg-on-surface-variant transition-all duration-500 ease-in-out pointer-events-none",
                                isCompleted ? "w-full opacity-100" : "w-0 opacity-0"
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggle(task)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-90 hover:scale-110 ${isCompleted ? "bg-secondary-container border-transparent" : "border-[#c9d4d9] bg-transparent hover:border-primary"}`}
                          >
                            {isCompleted && <FiCheckCircle className="w-4 h-4 text-[#637174] animate-in zoom-in duration-300" />}
                          </button>
                        </div>
                      </div>

                      {task.description && <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{task.description}</p>}

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center gap-6">
                          {isCompleted && task.completedAt ? (
                            <span className={cn(
                              "flex items-center gap-2 text-xs font-bold",
                              wasCompletedLate ? "text-[#eb3b5a]" : "text-on-surface-variant"
                            )}>
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              {wasCompletedLate
                                ? `Completed late on ${format(new Date(task.completedAt), "MMM d")} (Due ${format(new Date(task.dueDate!), "MMM d")})`
                                : `Completed at ${format(new Date(task.completedAt), "MMM d")}`
                              }
                            </span>
                          ) : task.dueDate ? (
                            <span className={`flex items-center gap-2 text-xs font-bold ${overdue && !isCompleted ? "text-[#eb3b5a]" : "text-primary"}`}>
                              {overdue && !isCompleted ? <FiAlertCircle /> : <FiCalendar />}
                              {overdue && !isCompleted ? "Overdue by deadline" : `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-2" onClick={() => handleOpenModal(task)}>Edit</button>
                          <button className="text-xs font-bold text-error hover:text-error/80 transition-colors bg-transparent border-none cursor-pointer p-2" onClick={() => handleDelete(task._id)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* RIGHT: WIDGETS */}
            <div className="flex flex-col gap-6 order-1 lg:order-2">

              {/* Widget 1: Productivity */}
              <div className="bg-white p-5 sm:p-7 rounded-[24px] border border-[#dbe3e7] shadow-sm transition-all duration-300 overflow-hidden">
                <div
                  className="flex justify-between items-center cursor-pointer sm:cursor-default"
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsStatsExpanded(!isStatsExpanded);
                  }}
                >
                  <h3 className="font-manrope text-[1.1rem] font-bold text-on-surface">Productivity</h3>
                  <div className="flex items-center gap-3 lg:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{completionPercent}%</span>
                      <span className="text-[10px] font-bold text-on-surface-variant/40">DONE</span>
                    </div>
                    {isStatsExpanded ? <FiChevronUp className="text-on-surface-variant" /> : <FiChevronDown className="text-on-surface-variant" />}
                  </div>
                </div>

                <div className={cn(
                  "transition-all duration-300 lg:block lg:mt-6",
                  isStatsExpanded ? "block mt-6 opacity-100" : "hidden lg:opacity-100"
                )}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-on-surface-variant">Weekly Goal</span>
                    <span className="text-sm font-bold text-primary">{completionPercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-[#dcecf8] rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${completionPercent}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-low rounded-2xl p-5">
                      <div className="text-3xl font-manrope font-extrabold text-on-surface mb-1">{completedCount}</div>
                      <div className="text-[0.65rem] font-bold text-on-surface-variant tracking-widest uppercase">Done</div>
                    </div>
                    <div className="bg-surface-container-low rounded-2xl p-5">
                      <div className="text-3xl font-manrope font-extrabold text-on-surface mb-1">{pendingCount}</div>
                      <div className="text-[0.65rem] font-bold text-on-surface-variant tracking-widest uppercase">Left</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 2: New Stream */}
              {/* <div className="rounded-[24px] border-2 border-dashed border-[#e2e1df] p-8 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-[#f8f7f5] rounded-2xl flex items-center justify-center mb-6">
                  <FiPlus className="w-6 h-6 text-[#9a9996]" />
                </div>
                <h3 className="text-base font-bold font-manrope text-on-surface mb-2">New Stream?</h3>
                <p className="text-sm text-on-surface-variant my-0 px-2 leading-relaxed mb-6">
                  Start a fresh project workspace for your creative flow.
                </p>
                <button className="text-primary font-bold text-sm bg-transparent border-none cursor-pointer hover:underline">
                  Create New Board
                </button>
              </div> */}

            </div>

          </div>
        </main>

        {/* TASK MODAL OVERLAY */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
            <div className="absolute inset-0 bg-[rgba(45,52,54,0.28)] backdrop-blur-sm -z-10 animate-fade-in" onClick={handleCloseModal} />

            <form className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-10 w-full max-w-[500px] flex flex-col gap-5 sm:gap-6 animate-modal-scale-in max-h-[90vh] overflow-y-auto border border-[#dbe3e7]" onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-2 sm:mb-0">
                <div>
                  <span className="inline-flex uppercase tracking-[0.12em] text-[0.65rem] text-primary font-bold">{editingTaskId ? "Curate task" : "New Task"}</span>
                  <h2 className="m-0 mt-1 font-manrope font-bold text-2xl text-on-surface">{editingTaskId ? "Update task" : "Add task"}</h2>
                </div>
                <button type="button" onClick={handleCloseModal} className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center border-none cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <label className="flex flex-col gap-2">
                <span className="font-inter text-xs font-bold uppercase tracking-widest text-on-surface-variant">Title</span>
                <input
                  className="w-full rounded-xl border-none p-4 bg-surface-container-low text-sm font-semibold text-on-surface transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary placeholder:font-normal placeholder:text-[#98a5ab]"
                  onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ship backend tests"
                  required
                  value={formState.title}
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-inter text-xs font-bold uppercase tracking-widest text-on-surface-variant">Description</span>
                <textarea
                  className="w-full rounded-xl border-none p-4 bg-surface-container-low text-sm font-semibold text-on-surface transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary placeholder:font-normal placeholder:text-[#98a5ab]"
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Optional notes"
                  rows={4}
                  value={formState.description}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="font-inter text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
                  <select
                    className="w-full rounded-xl border-none p-4 bg-surface-container-low text-sm font-semibold text-on-surface transition-all focus:outline-none focus:bg-[#fffdf9] focus:ring-2 focus:ring-primary"
                    onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as "pending" | "completed" }))}
                    value={formState.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-inter text-xs font-bold uppercase tracking-widest text-on-surface-variant">Due date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full rounded-xl border-none p-4 h-auto bg-surface-container-low text-sm font-semibold text-on-surface justify-start transition-all focus:ring-2 focus:ring-primary hover:bg-surface-container-low",
                          !formState.dueDate && "text-on-surface-variant font-normal"
                        )}
                      >
                        <FiCalendar className="mr-2 h-4 w-4" />
                        {formState.dueDate ? format(new Date(formState.dueDate), "MMM dd") : <span>Pick deadline</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[101]" align="start">
                      <Calendar
                        mode="single"
                        selected={formState.dueDate ? new Date(formState.dueDate) : undefined}
                        onSelect={(date) => {
                          setFormState((current) => ({
                            ...current,
                            dueDate: date ? format(date, "yyyy-MM-dd") : ""
                          }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button className="px-6 py-3 bg-surface-container-low text-on-surface text-sm font-bold rounded-xl transition-colors hover:bg-[#e6ecef] border-none cursor-pointer" onClick={handleCloseModal} type="button">
                  Cancel
                </button>
                <button className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl transition-shadow hover:shadow-lg border-none cursor-pointer shadow-[0_10px_24px_rgba(45,152,218,0.22)]" disabled={saving} type="submit">
                  {saving ? "Saving..." : editingTaskId ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        )}
      </MaxWidthWrapper>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-5 right-6 sm:hidden w-15 h-15 rounded-full bg-primary text-white shadow-[0_12px_32px_rgba(45,152,218,0.45)] border-none flex items-center justify-center cursor-pointer transition-all active:scale-95 z-40 hover:brightness-110"
        aria-label="Create new task"
      >
        <FiPlus className="w-7 h-7" />
      </button>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 isolate">
          <div className="absolute inset-0 bg-[rgba(45,52,54,0.4)] backdrop-blur-md -z-10 animate-fade-in" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="scale-75 bg-white rounded-[32px] p-8 w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[#fff5f6] rounded-2xl flex items-center justify-center mb-6 text-[#eb3b5a]">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-manrope font-extrabold text-on-surface mb-2 tracking-tight">Delete Task?</h2>
            <p className="text-on-surface-variant font-medium leading-relaxed mb-8">
              This action cannot be undone. This task will be permanently removed from your desk.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-[#eb3b5a] hover:bg-[#d43550] shadow-lg shadow-[#eb3b5a]/30 transition-all active:scale-95 border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 animate-slide-up-fade-in">
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border",
            toast.type === "success" ? "bg-white/90 border-[#cfe3f2] text-[#2d98da]" :
              toast.type === "error" ? "bg-white/90 border-[#f4c2cc] text-[#eb3b5a]" :
                "bg-white/90 border-[#dbe3e7] text-on-surface"
          )}>
            {toast.type === "success" && <FiCheckCircle className="w-5 h-5" />}
            {toast.type === "error" && <FiAlertCircle className="w-5 h-5" />}
            {toast.type === "info" && <FiClock className="w-5 h-5" />}
            <span className="text-sm font-bold font-manrope">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
