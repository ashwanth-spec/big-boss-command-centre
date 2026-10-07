export type ContestantState = "active" | "evicted";

export type Contestant = {
  id: string;
  name: string;
  initials: string;
  team: string;
  teamTone: "amber" | "violet" | "mint";
  points: number;
  productivity: number;
  tasksCompleted: number;
  tasksAssigned: number;
  state: ContestantState;
};

export type HouseTask = {
  id: string;
  title: string;
  assigneeId: string;
  due: string;
  points: number;
  completed: boolean;
};

export type Announcement = {
  id: string;
  time: string;
  label: string;
  text: string;
  tone: "red" | "amber" | "mint" | "violet";
};

export type ActivityEvent = {
  id: string;
  time: string;
  text: string;
  tone: "red" | "amber" | "mint" | "violet";
};

export const INITIAL_CONTESTANTS: Contestant[] = [
  { id: "aarav", name: "Aarav Mehta", initials: "AM", team: "Orbit", teamTone: "amber", points: 186, productivity: 82, tasksCompleted: 7, tasksAssigned: 8, state: "active" },
  { id: "maya", name: "Maya Shah", initials: "MS", team: "Nova", teamTone: "violet", points: 164, productivity: 76, tasksCompleted: 6, tasksAssigned: 8, state: "active" },
  { id: "kabir", name: "Kabir Rao", initials: "KR", team: "Orbit", teamTone: "amber", points: 151, productivity: 71, tasksCompleted: 5, tasksAssigned: 7, state: "active" },
  { id: "ishita", name: "Ishita Menon", initials: "IM", team: "Nova", teamTone: "violet", points: 142, productivity: 88, tasksCompleted: 8, tasksAssigned: 9, state: "active" },
  { id: "rohan", name: "Rohan Das", initials: "RD", team: "Orbit", teamTone: "amber", points: 128, productivity: 64, tasksCompleted: 4, tasksAssigned: 7, state: "active" },
  { id: "sara", name: "Sara Khan", initials: "SK", team: "Ember", teamTone: "mint", points: 117, productivity: 69, tasksCompleted: 5, tasksAssigned: 8, state: "active" },
  { id: "neil", name: "Neil Verma", initials: "NV", team: "Ember", teamTone: "mint", points: 98, productivity: 57, tasksCompleted: 3, tasksAssigned: 7, state: "active" },
  { id: "tara", name: "Tara Iyer", initials: "TI", team: "Nova", teamTone: "violet", points: 85, productivity: 49, tasksCompleted: 2, tasksAssigned: 6, state: "active" },
];

export const INITIAL_TASKS: HouseTask[] = [
  { id: "task-1", title: "Confessional set reset", assigneeId: "aarav", due: "Today · 10:30", points: 8, completed: true },
  { id: "task-2", title: "Breakfast prep & service", assigneeId: "maya", due: "Today · 11:15", points: 10, completed: true },
  { id: "task-3", title: "Pantry inventory sweep", assigneeId: "kabir", due: "Today · 12:00", points: 12, completed: false },
  { id: "task-4", title: "Weekly inventory log", assigneeId: "ishita", due: "Today · 13:00", points: 15, completed: true },
  { id: "task-5", title: "Garden + pool deck", assigneeId: "rohan", due: "Today · 14:30", points: 10, completed: false },
  { id: "task-6", title: "Camera battery run", assigneeId: "neil", due: "Today · 15:00", points: 6, completed: false },
  { id: "task-7", title: "Wardrobe rack reset", assigneeId: "tara", due: "Today · 16:00", points: 9, completed: false },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: "ann-1", time: "09:42", label: "LIVE ALERT", text: "Nomination window is open. The house is watching.", tone: "red" },
  { id: "ann-2", time: "09:18", label: "BIG BOSS", text: "Pantry inventory is due before the lunch bell.", tone: "amber" },
  { id: "ann-3", time: "08:55", label: "SYSTEM", text: "Maya Shah is protected by the immunity shield.", tone: "mint" },
  { id: "ann-4", time: "08:30", label: "BIG BOSS", text: "Captaincy review is scheduled after the next task.", tone: "violet" },
];

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  { id: "evt-1", time: "09:42", text: "Nomination window opened", tone: "red" },
  { id: "evt-2", time: "09:18", text: "Maya received immunity", tone: "mint" },
  { id: "evt-3", time: "09:04", text: "Aarav completed Confessional set reset (+8)", tone: "amber" },
  { id: "evt-4", time: "08:30", text: "Captaincy assigned to Aarav Mehta", tone: "violet" },
];

export const INITIAL_NOMINEES = ["kabir", "neil", "tara"];
export const INITIAL_VOTES: Record<string, number> = { kabir: 18, neil: 11, tara: 7 };
