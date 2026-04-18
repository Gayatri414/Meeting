import { useEffect, useState } from 'react';
import { getAllMeetings } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, CheckSquare, Users, Calendar, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-white', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card rounded-2xl p-5 border border-white/5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-xl bg-white/5">
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
    {sub && <p className="text-xs text-indigo-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const meetings = await getAllMeetings();
        const taskMap = {};
        let totalTasks = 0, completedTasks = 0;
        const riskMap = {};
        const weeklyMap = {};

        meetings.forEach((m) => {
          // Weekly data
          const week = new Date(m.createdAt);
          const weekKey = `${week.getMonth() + 1}/${week.getDate()}`;
          weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;

          (m.tasks || []).forEach((t) => {
            totalTasks++;
            if (t.completed) completedTasks++;
            const name = t.person || t.user || 'Unassigned';
            taskMap[name] = (taskMap[name] || 0) + 1;
          });

          (m.risks || []).forEach((r) => {
            riskMap[r] = (riskMap[r] || 0) + 1;
          });
        });

        const score = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setMetrics({
          totalMeetings: meetings.length,
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          score,
          byUser: Object.entries(taskMap).map(([name, tasks]) => ({ name: name.split(' ')[0], tasks })).slice(0, 8),
          status: [
            { name: 'Completed', value: completedTasks, color: '#10b981' },
            { name: 'Pending', value: Math.max(totalTasks - completedTasks, 0), color: '#f59e0b' }
          ],
          weekly: Object.entries(weeklyMap).slice(-7).map(([date, count]) => ({ date, meetings: count })),
          risks: Object.entries(riskMap).map(([topic, count]) => ({ topic, count })).slice(0, 5)
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-28 glass-card rounded-2xl animate-pulse border border-white/5" />)}
    </div>
  );

  if (!metrics) return <p className="text-muted-foreground">Failed to load analytics.</p>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your meeting intelligence overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Meetings" value={metrics.totalMeetings} delay={0} />
        <StatCard icon={CheckSquare} label="Total Tasks" value={metrics.totalTasks} delay={0.05} />
        <StatCard icon={CheckSquare} label="Completed" value={metrics.completedTasks} color="text-emerald-400" delay={0.1} />
        <StatCard icon={Zap} label="Productivity Score" value={`${metrics.score}%`} color="text-indigo-400" sub="Based on task completion" delay={0.15} />
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-sm">Overall Progress</span>
          </div>
          <span className="text-sm font-bold text-indigo-400">{metrics.score}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.score}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{metrics.completedTasks} completed</span>
          <span>{metrics.pendingTasks} pending</span>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks per user */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-sm">Tasks Per Person</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.byUser} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0f0f11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Task status pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Task Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={metrics.status} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                {metrics.status.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f0f11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly meetings */}
        {metrics.weekly.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-5 border border-white/5 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold text-sm">Meeting Activity</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={metrics.weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f0f11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                />
                <Line type="monotone" dataKey="meetings" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Risks */}
      {metrics.risks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <h3 className="font-semibold text-sm">Top Risks Identified</h3>
          </div>
          <div className="space-y-2">
            {metrics.risks.map((risk, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <p className="text-sm">{risk.topic}</p>
                <span className="text-xs text-rose-400 font-medium">{risk.count}x</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
