import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, BarChart2, Calendar, HelpCircle, FileText, 
  TrendingUp, TrendingDown, Minus, ArrowRight, Target,
  Zap, Brain, BookOpen, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { getDashboardData, getSubject } from '../api';

const COLORS = ['#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card with animation
const StatCard = ({ icon: Icon, value, label, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="glass-card-neon p-6 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-20"
      style={{ background: gradient }} />
    <Icon className="w-8 h-8 mb-3" style={{ color: COLORS[0] }} />
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </motion.div>
);

// Quick Action Card
const ActionCard = ({ to, icon: Icon, title, subtitle, gradient }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-5 cursor-pointer group h-full"
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: gradient }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-neon-blue transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  </Link>
);

// Topic Rank Card
const TopicRankCard = ({ topic, index }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityClass = (score) => {
    if (score >= 70) return 'priority-high';
    if (score >= 40) return 'priority-medium';
    return 'priority-low';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className={`glass-card p-4 ${getPriorityClass(topic.importance_score)}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
          index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
          index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          'bg-white/5 text-gray-400 border border-white/10'
        }`}>
          #{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{topic.topic}</p>
          <p className="text-xs text-gray-500">
            {topic.frequency} questions · Last: {topic.last_appeared}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {getTrendIcon(topic.trend)}
            <span className="text-xs text-gray-400 hidden sm:inline">{topic.trend}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-neon-blue">{topic.importance_score}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function SubjectDashboard() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    try {
      const [subjectRes, dashboardRes] = await Promise.all([
        getSubject(subjectId),
        getDashboardData(subjectId).catch(() => ({ data: null }))
      ]);
      setSubject(subjectRes.data);
      setDashboardData(dashboardRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 shimmer rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    );
  }

  const topicDistributionData = dashboardData?.analytics_summary?.topic_distribution
    ? Object.entries(dashboardData.analytics_summary.topic_distribution)
        .slice(0, 8)
        .map(([name, value]) => ({ name: name.substring(0, 15), value }))
    : [];

  const difficultyData = dashboardData?.analytics_summary?.difficulty_overview
    ? Object.entries(dashboardData.analytics_summary.difficulty_overview)
        .map(([name, value]) => ({ name, value }))
    : [];

  const yearlyTrendsData = dashboardData?.analytics_summary?.yearly_trends || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subject?.name}</h1>
          {subject?.description && (
            <p className="text-gray-400">{subject.description}</p>
          )}
        </div>
        <Link to={`/subject/${subjectId}/upload`}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Papers
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={FileText} 
          value={dashboardData?.stats?.total_papers || 0} 
          label="Total Papers"
          gradient="linear-gradient(135deg, #00d4ff, #0ea5e9)"
          delay={0}
        />
        <StatCard 
          icon={Brain} 
          value={dashboardData?.stats?.total_questions || 0} 
          label="Questions Analyzed"
          gradient="linear-gradient(135deg, #a855f7, #7c3aed)"
          delay={0.1}
        />
        <StatCard 
          icon={Target} 
          value={dashboardData?.topic_rankings?.length || 0} 
          label="Topics Found"
          gradient="linear-gradient(135deg, #10b981, #059669)"
          delay={0.2}
        />
        <StatCard 
          icon={Calendar} 
          value={dashboardData?.stats?.years_covered?.length || 0} 
          label="Years Covered"
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <ActionCard
          to={`/subject/${subjectId}/upload`}
          icon={Upload}
          title="Upload Papers"
          subtitle="Add past papers"
          gradient="linear-gradient(135deg, #00d4ff, #0ea5e9)"
        />
        <ActionCard
          to={`/subject/${subjectId}/analysis`}
          icon={BarChart2}
          title="Topic Analysis"
          subtitle="View patterns"
          gradient="linear-gradient(135deg, #a855f7, #7c3aed)"
        />
        <ActionCard
          to={`/subject/${subjectId}/study-plan`}
          icon={Calendar}
          title="Study Planner"
          subtitle="Plan your prep"
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />
        <ActionCard
          to={`/subject/${subjectId}/practice`}
          icon={HelpCircle}
          title="Practice"
          subtitle="Generate questions"
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        />
      </div>

      {dashboardData?.stats?.total_papers > 0 ? (
        <>
          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Topic Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-neon-blue" />
                Topic Distribution
              </h3>
              {topicDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicDistributionData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis type="category" dataKey="name" width={100} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {topicDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </motion.div>

            {/* Difficulty Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-purple" />
                Difficulty Distribution
              </h3>
              {difficultyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </motion.div>
          </div>

          {/* Yearly Trends */}
          {yearlyTrendsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Year-wise Question Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyTrendsData}>
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="question_count" 
                    name="Questions"
                    stroke="#00d4ff" 
                    strokeWidth={3}
                    dot={{ fill: '#00d4ff', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#00d4ff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique_topics" 
                    name="Unique Topics"
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Top Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                High-Yield Topics
              </h3>
              <Link 
                to={`/subject/${subjectId}/analysis`}
                className="text-neon-blue text-sm hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.topic_rankings?.slice(0, 5).map((topic, index) => (
                <TopicRankCard key={index} topic={topic} index={index} />
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <Target className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Papers Analyzed Yet</h3>
          <p className="text-gray-400 mb-6">
            Upload past papers to see detailed analytics et insights.
          </p>
          <Link to={`/subject/${subjectId}/upload`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Upload Your First Paper
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
