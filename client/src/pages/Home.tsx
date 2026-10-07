import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Crown,
  Flame,
  Gauge,
  Gavel,
  LayoutDashboard,
  LockKeyhole,
  ListChecks,
  Megaphone,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  Trophy,
  UserRound,
  UsersRound,
  Vote,
  X,
  Zap,
} from "lucide-react";
import type { ActivityEvent, Announcement, Contestant, HouseTask } from "@/lib/house";
import {
  INITIAL_ACTIVITY,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CONTESTANTS,
  INITIAL_NOMINEES,
  INITIAL_TASKS,
  INITIAL_VOTES,
} from "@/lib/house";

type Tone = "red" | "amber" | "mint" | "violet";
type AnalyticsTab = "scores" | "house" | "productivity";

const teamColors: Record<Contestant["teamTone"], string> = {
  amber: "avatar-amber",
  violet: "avatar-violet",
  mint: "avatar-mint",
};

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const clockNow = () => new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

export default function Home() {
  const [contestants, setContestants] = useState<Contestant[]>(INITIAL_CONTESTANTS);
  const [tasks, setTasks] = useState<HouseTask[]>(INITIAL_TASKS);
  const [nomineeIds, setNomineeIds] = useState<string[]>(INITIAL_NOMINEES);
  const [votes, setVotes] = useState<Record<string, number>>(INITIAL_VOTES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activity, setActivity] = useState<ActivityEvent[]>(INITIAL_ACTIVITY);
  const [captainId, setCaptainId] = useState<string | null>("aarav");
  const [immunityId, setImmunityId] = useState<string | null>("maya");
  const [timerSeconds, setTimerSeconds] = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeZone, setActiveZone] = useState("overview");
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("scores");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("kabir");
  const [newTaskPoints, setNewTaskPoints] = useState("10");
  const [announcementDraft, setAnnouncementDraft] = useState("");

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds(current => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          toast.error("Task timer finished", { description: "The house has been called to the task floor." });
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const activeContestants = useMemo(() => contestants.filter(contestant => contestant.state !== "evicted"), [contestants]);
  const leaderboard = useMemo(() => [...activeContestants].sort((a, b) => b.points - a.points), [activeContestants]);
  const nominees = useMemo(() => nomineeIds.map(id => contestants.find(contestant => contestant.id === id)).filter(Boolean) as Contestant[], [contestants, nomineeIds]);
  const completedTasks = tasks.filter(task => task.completed).length;
  const highestScorer = leaderboard[0];
  const totalVotes = Object.values(votes).reduce((sum, voteCount) => sum + voteCount, 0);
  const timerProgress = ((30 * 60 - timerSeconds) / (30 * 60)) * 100;
  const averageScore = activeContestants.length ? Math.round(activeContestants.reduce((sum, contestant) => sum + contestant.points, 0) / activeContestants.length) : 0;
  const productivityLeader = useMemo(() => [...activeContestants].sort((a, b) => b.productivity - a.productivity)[0], [activeContestants]);
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const teamBreakdown = useMemo(() => {
    const totals = activeContestants.reduce<Record<string, { points: number; productivity: number; count: number }>>((result, contestant) => {
      const current = result[contestant.team] ?? { points: 0, productivity: 0, count: 0 };
      result[contestant.team] = { points: current.points + contestant.points, productivity: current.productivity + contestant.productivity, count: current.count + 1 };
      return result;
    }, {});
    return Object.entries(totals).map(([team, value]) => ({ team, points: value.points, productivity: Math.round(value.productivity / value.count), count: value.count })).sort((a, b) => b.points - a.points);
  }, [activeContestants]);

  const contestantName = (id: string) => contestants.find(contestant => contestant.id === id)?.name ?? "Unknown";
  const statusFor = (contestant: Contestant) => {
    if (contestant.state === "evicted") return "Evicted";
    if (immunityId === contestant.id) return "Immune";
    if (captainId === contestant.id) return "Captain";
    if (nomineeIds.includes(contestant.id)) return "Nominated";
    return "Active";
  };

  const pushActivity = (text: string, tone: Tone) => {
    setActivity(current => [{ id: `evt-${Date.now()}`, time: clockNow(), text, tone }, ...current].slice(0, 5));
  };

  const pushAnnouncement = (text: string, label: string, tone: Tone) => {
    setAnnouncements(current => [{ id: `ann-${Date.now()}`, time: clockNow(), label, text, tone }, ...current].slice(0, 6));
  };

  const handlePoints = (id: string, delta: number) => {
    const person = contestants.find(contestant => contestant.id === id);
    if (!person || person.state === "evicted") return;
    const nextPoints = Math.max(0, person.points + delta);
    setContestants(current => current.map(contestant => contestant.id === id ? { ...contestant, points: nextPoints } : contestant));
    const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
    pushActivity(`${person.name} points adjusted ${deltaLabel}`, delta > 0 ? "mint" : "red");
    toast(delta > 0 ? "Points added" : "Points deducted", { description: `${person.name} is now on ${nextPoints} points.` });
  };

  const handleTaskComplete = (taskId: string) => {
    const task = tasks.find(currentTask => currentTask.id === taskId);
    if (!task || task.completed) return;
    const assignee = contestants.find(contestant => contestant.id === task.assigneeId);
    setTasks(current => current.map(currentTask => currentTask.id === taskId ? { ...currentTask, completed: true } : currentTask));
    setContestants(current => current.map(contestant => contestant.id === task.assigneeId ? {
      ...contestant,
      points: contestant.points + task.points,
      tasksCompleted: contestant.tasksCompleted + 1,
      productivity: Math.min(100, contestant.productivity + 4),
    } : contestant));
    if (assignee) {
      pushActivity(`${assignee.name} completed ${task.title} (+${task.points})`, "mint");
      pushAnnouncement(`${assignee.name} completed ${task.title}.`, "TASK CLEAR", "mint");
      toast.success("Task marked complete", { description: `${assignee.name} earned +${task.points} points.` });
    }
  };

  const handleAssignTask = () => {
    const title = newTaskTitle.trim();
    const points = Number(newTaskPoints);
    if (!title || !newTaskAssignee || !Number.isFinite(points) || points <= 0) {
      toast.error("Complete the task brief", { description: "Add a task name, assignee, and positive point value." });
      return;
    }
    const task: HouseTask = { id: `task-${Date.now()}`, title, assigneeId: newTaskAssignee, due: "Today · 18:00", points, completed: false };
    setTasks(current => [task, ...current]);
    setContestants(current => current.map(contestant => contestant.id === newTaskAssignee ? { ...contestant, tasksAssigned: contestant.tasksAssigned + 1 } : contestant));
    pushActivity(`${contestantName(newTaskAssignee)} received ${title}`, "amber");
    pushAnnouncement(`${title} assigned to ${contestantName(newTaskAssignee)}.`, "TASK DROP", "amber");
    toast.success("Task assigned", { description: `${contestantName(newTaskAssignee)} has a new house duty.` });
    setNewTaskTitle("");
    setTaskFormOpen(false);
  };

  const handleCaptain = (id: string) => {
    if (id === "") {
      setCaptainId(null);
      pushActivity("Captaincy role removed", "violet");
      pushAnnouncement("The captaincy seat is currently vacant.", "CAPTAINCY", "violet");
      toast("Captaincy removed");
      return;
    }
    const person = contestants.find(contestant => contestant.id === id);
    if (!person || person.state === "evicted") return;
    setCaptainId(id);
    pushActivity(`${person.name} is now captain`, "violet");
    pushAnnouncement(`${person.name} has taken the captaincy seat.`, "CAPTAINCY", "violet");
    toast.success("Captaincy updated", { description: `${person.name} is now captain.` });
  };

  const handleImmunity = (id: string) => {
    if (id === "") {
      setImmunityId(null);
      pushActivity("Immunity shield removed", "mint");
      pushAnnouncement("No contestant currently holds immunity.", "IMMUNITY", "mint");
      toast("Immunity removed");
      return;
    }
    const person = contestants.find(contestant => contestant.id === id);
    if (!person || person.state === "evicted") return;
    setImmunityId(id);
    setNomineeIds(current => current.filter(nomineeId => nomineeId !== id));
    pushActivity(`${person.name} received the immunity shield`, "mint");
    pushAnnouncement(`${person.name} is protected and cannot be nominated.`, "IMMUNITY", "mint");
    toast.success("Immunity shield assigned", { description: `${person.name} is protected from nomination.` });
  };

  const handleNominate = (id: string) => {
    const person = contestants.find(contestant => contestant.id === id);
    if (!person || person.state === "evicted") return;
    if (immunityId === id) {
      toast.error("Nomination blocked", { description: `${person.name} is protected by the immunity shield.` });
      return;
    }
    if (nomineeIds.includes(id)) {
      setNomineeIds(current => current.filter(nomineeId => nomineeId !== id));
      pushActivity(`${person.name} removed from danger window`, "amber");
      toast("Nominee removed", { description: `${person.name} is safe for now.` });
      return;
    }
    setNomineeIds(current => [...current, id]);
    setVotes(current => ({ ...current, [id]: current[id] ?? 0 }));
    pushActivity(`${person.name} moved into the danger window`, "red");
    pushAnnouncement(`${person.name} is now facing the eviction vote.`, "NOMINATION", "red");
    toast.error("Nomination live", { description: `${person.name} is in the danger window.` });
  };

  const handleVote = (id: string) => {
    if (!nomineeIds.includes(id)) return;
    const nextVotes = (votes[id] ?? 0) + 1;
    setVotes(current => ({ ...current, [id]: nextVotes }));
    pushActivity(`Public vote cast against ${contestantName(id)}`, "red");
    toast("Vote registered", { description: `${contestantName(id)} now has ${nextVotes} votes.` });
  };

  const handleEviction = (id: string) => {
    const person = contestants.find(contestant => contestant.id === id);
    if (!person || !nomineeIds.includes(id)) return;
    setContestants(current => current.map(contestant => contestant.id === id ? { ...contestant, state: "evicted" } : contestant));
    setNomineeIds(current => current.filter(nomineeId => nomineeId !== id));
    if (captainId === id) setCaptainId(null);
    if (immunityId === id) setImmunityId(null);
    pushActivity(`${person.name} evicted from the active house`, "red");
    pushAnnouncement(`${person.name} has left the house. The leaderboard has been updated.`, "EVICTION", "red");
    toast.error("Eviction confirmed", { description: `${person.name} is no longer active in the house.` });
  };

  const handleAnnouncement = () => {
    const message = announcementDraft.trim();
    if (!message) return;
    pushAnnouncement(message, "BIG BOSS", "amber");
    pushActivity("Big Boss posted a new announcement", "amber");
    toast.success("Announcement broadcast", { description: "The house feed is updated." });
    setAnnouncementDraft("");
  };

  const captain = captainId ? contestants.find(contestant => contestant.id === captainId) : undefined;
  const immunityHolder = immunityId ? contestants.find(contestant => contestant.id === immunityId) : undefined;
  const sortedNominees = [...nominees].sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0));

  return (
    <div className="command-shell">
      <aside className="command-rail">
        <div className="brand-lockup">
          <div className="brand-mark"><span>BB</span><i /></div>
          <div>
            <div className="brand-wordmark">BIG BOSS</div>
            <div className="brand-subline">CONTROL CENTER</div>
          </div>
        </div>

        <div className="rail-status"><span className="live-dot" /> LIVE HOUSE FEED <span className="rail-status-time">09:48</span></div>

        <nav className="rail-nav" aria-label="Command center sections">
          <p className="rail-label">Command deck</p>
          <button className={`rail-link ${activeZone === "overview" ? "is-active" : ""}`} onClick={() => setActiveZone("overview")}><LayoutDashboard size={16} />Overview <span>01</span></button>
          <button className={`rail-link ${activeZone === "analytics" ? "is-active" : ""}`} onClick={() => setActiveZone("analytics")}><BarChart3 size={16} />Analytics <span>03</span></button>
          <button className={`rail-link ${activeZone === "house" ? "is-active" : ""}`} onClick={() => setActiveZone("house")}><UsersRound size={16} />House roster <span>08</span></button>
          <button className={`rail-link ${activeZone === "tasks" ? "is-active" : ""}`} onClick={() => setActiveZone("tasks")}><Target size={16} />Task board <span>{tasks.length}</span></button>
          <button className={`rail-link ${activeZone === "danger" ? "is-active" : ""}`} onClick={() => setActiveZone("danger")}><Flame size={16} />Danger window <span className="nav-danger">{nominees.length}</span></button>
          <button className={`rail-link ${activeZone === "vote" ? "is-active" : ""}`} onClick={() => setActiveZone("vote")}><Vote size={16} />Eviction vote <span>{totalVotes}</span></button>
        </nav>

        <div className="rail-callout">
          <div className="callout-kicker"><Zap size={12} /> HOUSE PULSE</div>
          <strong>{activeContestants.length} / 8</strong>
          <p>contestants active in the house</p>
          <div className="mini-progress"><span style={{ width: `${(activeContestants.length / 8) * 100}%` }} /></div>
        </div>

        <div className="rail-footer">
          <div className="operator-avatar">BB</div>
          <div><strong>Big Boss</strong><span>Operator mode</span></div>
          <CircleDot size={14} className="operator-live" />
        </div>
      </aside>

      <main className="command-main">
        <header className="topbar">
          <div className="breadcrumb"><span>HOUSE /</span> {activeZone === "overview" ? "LIVE OVERVIEW" : activeZone.toUpperCase()}</div>
          <div className="topbar-actions"><span className="sync-pill"><span className="sync-dot" /> SYNCED JUST NOW</span><button className="icon-button" aria-label="Notifications"><Bell size={17} /><span className="notification-badge">3</span></button><button className="operator-chip"><span className="operator-avatar small">BB</span><span>Big Boss</span><ChevronRight size={14} /></button></div>
        </header>

        <div className="content-wrap" id="overview">
          <section className="hero-row">
            <div>
              <div className="eyebrow"><Activity size={14} /> LIVE OPERATIONS / WEDNESDAY, 07 OCT 2026</div>
              <h1>The house is <em>moving.</em></h1>
              <p className="hero-copy">Keep the board honest. Every score, task and vote is visible from the command seat.</p>
            </div>
            <div className="hero-meta"><div><span className="meta-label">Current phase</span><strong>NOMINATION WEEK</strong></div><div><span className="meta-label">Next check-in</span><strong>11:30 <small>IST</small></strong></div></div>
          </section>

          <section className="metric-strip" aria-label="House metrics">
            <MetricCard label="Active housemates" value={String(activeContestants.length).padStart(2, "0")} note="of 08 total" tone="amber" icon={<UsersRound size={15} />} />
            <MetricCard label="Highest scorer" value={highestScorer ? String(highestScorer.points) : "—"} note={highestScorer?.name ?? "No active players"} tone="violet" icon={<Trophy size={15} />} />
            <MetricCard label="Tasks cleared" value={`${completedTasks}/${tasks.length}`} note="this game cycle" tone="mint" icon={<CheckCircle2 size={15} />} />
            <MetricCard label="In danger" value={String(nominees.length).padStart(2, "0")} note={`${totalVotes} public votes`} tone="red" icon={<Flame size={15} />} />
          </section>

          <section className="panel analytics-panel" id="analytics">
            <div className="analytics-topline"><PanelHeader eyebrow="02 / ANALYTICS STUDIO" title="Score dashboard & house analytics" action={<span className="live-tag"><span className="sync-dot" /> LIVE CALC</span>} /><div className="analytics-tabs" role="tablist" aria-label="Analytics views"><button className={analyticsTab === "scores" ? "is-active" : ""} onClick={() => setAnalyticsTab("scores")} role="tab" aria-selected={analyticsTab === "scores"}><BarChart3 size={14} />Score dashboard</button><button className={analyticsTab === "house" ? "is-active" : ""} onClick={() => setAnalyticsTab("house")} role="tab" aria-selected={analyticsTab === "house"}><UsersRound size={14} />House statistics</button><button className={analyticsTab === "productivity" ? "is-active" : ""} onClick={() => setAnalyticsTab("productivity")} role="tab" aria-selected={analyticsTab === "productivity"}><ListChecks size={14} />Productivity tracker</button></div></div>
            {analyticsTab === "scores" && <div className="analytics-body"><div className="analytics-lead-card"><span className="analytics-kicker"><Trophy size={13} /> CURRENT SCORE LEADER</span><div className="analytics-lead-score">{highestScorer?.points ?? 0}<small>PTS</small></div><strong>{highestScorer?.name ?? "No active housemate"}</strong><span>+{highestScorer ? highestScorer.points - (leaderboard[1]?.points ?? highestScorer.points) : 0} ahead of the next rank</span></div><div className="score-chart"><div className="chart-title"><div><span className="analytics-kicker"><TrendingUp size={13} /> POINTS BY CONTESTANT</span><strong>Live ranking spread</strong></div><span className="chart-meta">AVG {averageScore} PTS</span></div>{leaderboard.slice(0, 6).map((contestant, index) => <div className="score-bar-row" key={contestant.id}><span className="score-rank">{String(index + 1).padStart(2, "0")}</span><span className="score-name">{contestant.name.split(" ")[0]}</span><div className="score-bar-track"><span style={{ width: `${Math.round((contestant.points / Math.max(highestScorer?.points ?? 1, 1)) * 100)}%` }} /></div><strong>{contestant.points}</strong></div>)}</div><div className="analytics-side-stats"><MiniAnalyticsStat label="Public pressure" value={`${totalVotes}`} detail="votes live" tone="red" /><MiniAnalyticsStat label="Average score" value={`${averageScore}`} detail="points / active" tone="amber" /><MiniAnalyticsStat label="Top team" value={teamBreakdown[0]?.team ?? "—"} detail={`${teamBreakdown[0]?.points ?? 0} combined pts`} tone="violet" /></div></div>}
            {analyticsTab === "house" && <div className="analytics-body house-analytics"><div className="stat-hero"><span className="analytics-kicker"><Activity size={13} /> HOUSE HEALTH INDEX</span><strong>{Math.round((completionRate + (activeContestants.length / 8) * 100 + (100 - (nominees.length / Math.max(activeContestants.length, 1)) * 100)) / 3)}<small>/ 100</small></strong><p>Composite of task completion, active roster, and nomination pressure.</p><div className="health-track"><span style={{ width: `${Math.round((completionRate + (activeContestants.length / 8) * 100 + (100 - (nominees.length / Math.max(activeContestants.length, 1)) * 100)) / 3)}%` }} /></div></div><div className="house-stat-grid"><MiniAnalyticsStat label="Active housemates" value={`${activeContestants.length}/8`} detail="roster health" tone="amber" /><MiniAnalyticsStat label="Tasks cleared" value={`${completedTasks}/${tasks.length}`} detail={`${completionRate}% completion`} tone="mint" /><MiniAnalyticsStat label="Nominees" value={`${nominees.length}`} detail="danger window" tone="red" /><MiniAnalyticsStat label="Captain" value={captain?.initials ?? "—"} detail={captain?.name ?? "seat vacant"} tone="violet" /></div><div className="team-table"><div className="team-table-head"><span>TEAM PERFORMANCE</span><span>MEMBERS</span><span>POINTS</span><span>AVG PRODUCTIVITY</span></div>{teamBreakdown.map(team => <div className="team-table-row" key={team.team}><strong>{team.team}</strong><span>{team.count}</span><span>{team.points}</span><div><div className="productivity-line"><span style={{ width: `${team.productivity}%` }} /></div><b>{team.productivity}%</b></div></div>)}</div></div>}
            {analyticsTab === "productivity" && <div className="analytics-body productivity-analytics"><div className="productivity-summary"><div><span className="analytics-kicker"><Gauge size={13} /> PRODUCTIVITY LEADER</span><strong>{productivityLeader?.name ?? "—"}</strong><p>{productivityLeader?.tasksCompleted ?? 0} completed of {productivityLeader?.tasksAssigned ?? 0} assigned tasks</p></div><div className="productivity-summary-score">{productivityLeader?.productivity ?? 0}%</div></div><div className="productivity-roster">{[...activeContestants].sort((a, b) => b.productivity - a.productivity).map(contestant => <div className="productivity-row" key={contestant.id}><div className={`contestant-avatar ${teamColors[contestant.teamTone]}`}>{contestant.initials}</div><div className="productivity-person"><strong>{contestant.name}</strong><span>{contestant.tasksCompleted}/{contestant.tasksAssigned} tasks complete</span></div><div className="productivity-bar"><div className="productivity-line"><span style={{ width: `${contestant.productivity}%` }} /></div></div><strong className="productivity-value">{contestant.productivity}%</strong></div>)}</div><div className="productivity-foot"><span><CheckCircle2 size={14} /> {completedTasks} tasks cleared</span><span><Target size={14} /> {tasks.length - completedTasks} assignments in progress</span><span><TrendingUp size={14} /> {productivityLeader?.name.split(" ")[0] ?? "—"} is setting the pace</span></div></div>}
          </section>

          <div className="dashboard-grid">
            <section className="panel leaderboard-panel" id="house">
              <PanelHeader eyebrow="01 / LIVE RANKING" title="House leaderboard" action={<span className="live-tag"><span className="live-dot" /> LIVE</span>} />
              <div className="leaderboard-head"><span>RANK / CONTESTANT</span><span>PRODUCTIVITY</span><span>POINTS</span><span>MOVE</span></div>
              <div className="leaderboard-list">
                {leaderboard.map((contestant, index) => {
                  const status = statusFor(contestant);
                  return <div className={`leader-row ${index === 0 ? "leader-row-top" : ""}`} key={contestant.id}>
                    <div className="rank-cell"><span className="rank-number">{String(index + 1).padStart(2, "0")}</span><div className={`contestant-avatar ${teamColors[contestant.teamTone]}`}>{contestant.initials}</div><div className="contestant-info"><strong>{contestant.name}</strong><span>TEAM {contestant.team.toUpperCase()} {status !== "Active" && <i className={`status-chip status-${status.toLowerCase()}`}>{status === "Captain" ? <Crown size={10} /> : status === "Immune" ? <Shield size={10} /> : <Flame size={10} />} {status}</i>}</span></div></div>
                    <div className="productivity-cell"><div className="productivity-line"><span style={{ width: `${contestant.productivity}%` }} /></div><b>{contestant.productivity}%</b></div>
                    <div className="points-cell"><strong>{contestant.points}</strong><span>PTS</span></div>
                    <div className="move-cell"><button className="point-button plus" onClick={() => handlePoints(contestant.id, 5)} aria-label={`Add points to ${contestant.name}`}><Plus size={13} /></button><button className="point-button minus" onClick={() => handlePoints(contestant.id, -5)} aria-label={`Deduct points from ${contestant.name}`}><Minus size={13} /></button></div>
                  </div>;
                })}
              </div>
              <div className="panel-footnote"><span><Sparkles size={13} /> Scores recalculate instantly after every task or adjustment.</span><button onClick={() => setActiveZone("house")}>Open house roster <ChevronRight size={14} /></button></div>
            </section>

            <aside className="right-stack">
              <section className="panel announcement-panel" id="announcements">
                <PanelHeader eyebrow="02 / BROADCAST" title="Big Boss announcement" action={<Megaphone size={17} className="icon-muted" />} />
                <div className="announcement-compose"><input value={announcementDraft} onChange={event => setAnnouncementDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAnnouncement(); }} placeholder="Broadcast a message to the house…" /><button onClick={handleAnnouncement} aria-label="Send announcement"><ArrowUpRight size={16} /></button></div>
                <div className="announcement-list">{announcements.slice(0, 4).map(announcement => <div className="announcement-item" key={announcement.id}><span className={`announcement-pin pin-${announcement.tone}`} /><div><div className="announcement-meta"><b>{announcement.label}</b><span>{announcement.time}</span></div><p>{announcement.text}</p></div></div>)}</div>
                <button className="text-link" onClick={() => setActiveZone("overview")}>View full broadcast log <ChevronRight size={14} /></button>
              </section>

              <section className="panel pulse-panel">
                <div className="pulse-heading"><div><div className="panel-eyebrow"><Gauge size={13} /> HOUSE PULSE</div><h3>Who is setting the pace?</h3></div><span className="pulse-score">{highestScorer?.productivity ?? 0}%</span></div>
                <div className="pulse-person"><div className={`contestant-avatar ${highestScorer ? teamColors[highestScorer.teamTone] : "avatar-amber"}`}>{highestScorer?.initials ?? "—"}</div><div><strong>{highestScorer?.name ?? "No active housemate"}</strong><span>{highestScorer?.tasksCompleted ?? 0} tasks completed / {highestScorer?.points ?? 0} points</span></div><Award size={18} className="pulse-award" /></div>
                <div className="pulse-bars">{leaderboard.slice(0, 4).map(contestant => <div className="pulse-bar" key={contestant.id}><span>{contestant.initials}</span><div><span style={{ width: `${contestant.productivity}%` }} /></div></div>)}</div>
              </section>
            </aside>
          </div>

          <div className="operations-grid" id="tasks">
            <section className="panel task-panel">
              <PanelHeader eyebrow="03 / DUTY ROSTER" title="Task operations" action={<button className="outline-button" onClick={() => setTaskFormOpen(current => !current)}><Plus size={14} /> Assign task</button>} />
              {taskFormOpen && <div className="task-form"><input autoFocus value={newTaskTitle} onChange={event => setNewTaskTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAssignTask(); }} placeholder="Task brief" /><select value={newTaskAssignee} onChange={event => setNewTaskAssignee(event.target.value)}>{activeContestants.map(contestant => <option key={contestant.id} value={contestant.id}>{contestant.name}</option>)}</select><div className="task-points-input"><input type="number" min="1" value={newTaskPoints} onChange={event => setNewTaskPoints(event.target.value)} /><span>pts</span></div><button className="primary-button compact" onClick={handleAssignTask}>Drop task</button></div>}
              <div className="task-list">{tasks.slice(0, 5).map(task => { const assignee = contestants.find(contestant => contestant.id === task.assigneeId); return <div className={`task-row ${task.completed ? "is-complete" : ""}`} key={task.id}><button className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => handleTaskComplete(task.id)} aria-label={task.completed ? "Task completed" : `Mark ${task.title} complete`}>{task.completed ? <Check size={14} /> : <CircleDot size={14} />}</button><div className="task-main"><strong>{task.title}</strong><span>{assignee?.name} <i>·</i> {task.due}</span></div><span className={`task-reward ${task.completed ? "earned" : ""}`}>{task.completed ? "CLEARED" : `+${task.points} PTS`}</span><ChevronRight size={15} className="task-chevron" /></div>; })}</div>
              <div className="task-footer"><span><CheckCircle2 size={13} /> {completedTasks} cleared</span><span><Clock3 size={13} /> {tasks.length - completedTasks} in progress</span></div>
            </section>

            <section className="panel control-panel">
              <PanelHeader eyebrow="04 / ROLE DESK" title="House controls" action={<LockKeyhole size={16} className="icon-muted" />} />
              <div className="control-block"><div className="control-icon amber"><Crown size={15} /></div><div className="control-copy"><span className="control-label">Captaincy seat</span><strong>{captain?.name ?? "Seat is vacant"}</strong><small>Only one captain can hold the badge.</small></div><select aria-label="Change captain" value={captainId ?? ""} onChange={event => handleCaptain(event.target.value)}><option value="">Remove</option>{activeContestants.map(contestant => <option key={contestant.id} value={contestant.id}>{contestant.name}</option>)}</select></div>
              <div className="control-block"><div className="control-icon mint"><Shield size={15} /></div><div className="control-copy"><span className="control-label">Immunity shield</span><strong>{immunityHolder?.name ?? "No holder"}</strong><small>Protected from nomination.</small></div><select aria-label="Change immunity holder" value={immunityId ?? ""} onChange={event => handleImmunity(event.target.value)}><option value="">Remove</option>{activeContestants.map(contestant => <option key={contestant.id} value={contestant.id}>{contestant.name}</option>)}</select></div>
              <div className="control-block nomination-control"><div className="control-icon red"><Flame size={15} /></div><div className="control-copy"><span className="control-label">Nomination desk</span><strong>{nominees.length} in danger window</strong><small>Tap a housemate to add or remove.</small></div><button className="icon-button dark" onClick={() => setActiveZone("danger")} aria-label="Open nomination desk"><ChevronRight size={15} /></button></div>
              <div className="nomination-chips">{activeContestants.map(contestant => <button key={contestant.id} className={`nomination-chip ${nomineeIds.includes(contestant.id) ? "selected" : ""} ${immunityId === contestant.id ? "protected" : ""}`} onClick={() => handleNominate(contestant.id)} disabled={immunityId === contestant.id} title={immunityId === contestant.id ? "Immunity holder cannot be nominated" : "Toggle nomination"}>{contestant.initials}{immunityId === contestant.id && <Shield size={10} />}</button>)}</div>
            </section>
          </div>

          <div className="bottom-grid" id="danger">
            <section className="panel danger-panel">
              <PanelHeader eyebrow="05 / EVICTION BOARD" title="Danger window" action={<span className="danger-live"><span className="live-dot" /> VOTING LIVE</span>} />
              <div className="danger-subhead"><p>Nominees are ranked by public votes. The highest tally is currently exposed.</p><span>{totalVotes} total votes cast</span></div>
              {sortedNominees.length === 0 ? <div className="empty-state"><Shield size={22} /><strong>No one is in danger.</strong><span>Nominate an active housemate from the role desk.</span></div> : <div className="nominee-list">{sortedNominees.map((nominee, index) => { const voteCount = votes[nominee.id] ?? 0; const voteWidth = Math.min(100, Math.max(10, (voteCount / Math.max(...Object.values(votes), 1)) * 100)); return <div className={`nominee-row ${index === 0 ? "is-leading" : ""}`} key={nominee.id}><span className="danger-rank">{String(index + 1).padStart(2, "0")}</span><div className={`contestant-avatar ${teamColors[nominee.teamTone]}`}>{nominee.initials}</div><div className="nominee-details"><strong>{nominee.name}</strong><span>TEAM {nominee.team.toUpperCase()} · {nominee.points} PTS</span><div className="vote-meter"><span style={{ width: `${voteWidth}%` }} /></div></div><div className="vote-count"><strong>{voteCount}</strong><span>VOTES</span></div><button className="vote-button" onClick={() => handleVote(nominee.id)}><Plus size={13} /> Vote</button><button className="evict-button" onClick={() => handleEviction(nominee.id)} title={`Evict ${nominee.name}`}><Gavel size={14} /></button></div>; })}</div>}
              <div className="danger-footer"><span><AlertTriangle size={13} /> Immunity protects Maya Shah from this window.</span><span>Eviction is irreversible in this game cycle.</span></div>
            </section>

            <aside className="right-stack lower-stack">
              <section className="panel timer-panel"><div className="timer-top"><div><div className="panel-eyebrow"><Clock3 size={13} /> TASK TIMER</div><h3>Pantry reset window</h3></div><span className={`timer-status ${timerRunning ? "running" : ""}`}>{timerRunning ? "RUNNING" : "PAUSED"}</span></div><div className="timer-display"><span>{formatTime(timerSeconds)}</span><small>MINUTES / SECONDS</small></div><div className="timer-track"><span style={{ width: `${timerProgress}%` }} /></div><div className="timer-controls"><button className="primary-button" onClick={() => setTimerRunning(current => !current)}>{timerRunning ? <Pause size={15} /> : <Play size={15} />}{timerRunning ? "Pause timer" : "Start timer"}</button><button className="reset-button" onClick={() => { setTimerRunning(false); setTimerSeconds(30 * 60); toast("Timer reset", { description: "Pantry reset window is back at 30:00." }); }}><RotateCcw size={14} /> Reset</button></div></section>
              <section className="panel stats-panel"><PanelHeader eyebrow="06 / HOUSE STATS" title="Live statistics" action={<Zap size={16} className="icon-muted" />} /><div className="stats-grid"><Stat label="Avg. productivity" value={`${Math.round(activeContestants.reduce((sum, contestant) => sum + contestant.productivity, 0) / Math.max(activeContestants.length, 1))}%`} icon={<Gauge size={14} />} /><Stat label="Tasks assigned" value={String(tasks.length)} icon={<Target size={14} />} /><Stat label="Top team" value={topTeam(contestants)} icon={<Award size={14} />} /><Stat label="Votes live" value={String(totalVotes)} icon={<Vote size={14} />} /></div><div className="activity-mini"><div className="activity-heading"><span>ACTIVITY FEED</span><span className="activity-live"><span className="sync-dot" /> LIVE</span></div>{activity.slice(0, 3).map(event => <div className="activity-row" key={event.id}><span className={`activity-dot dot-${event.tone}`} /><span>{event.text}</span><time>{event.time}</time></div>)}</div></section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function topTeam(contestants: Contestant[]) {
  const totals = contestants.filter(contestant => contestant.state !== "evicted").reduce<Record<string, number>>((teams, contestant) => ({ ...teams, [contestant.team]: (teams[contestant.team] ?? 0) + contestant.points }), {});
  return Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";
}

function MetricCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: Tone; icon: React.ReactNode }) {
  return <div className={`metric-card metric-${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></div>;
}

function PanelHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="panel-header"><div><div className="panel-eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>;
}

function MiniAnalyticsStat({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: Tone }) {
  return <div className={`mini-analytics-stat tone-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="stat-cell"><span>{icon}{label}</span><strong>{value}</strong></div>;
}
