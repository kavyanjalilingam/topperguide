import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Minus, Target, 
  Filter, Zap, Brain, BookOpen, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { getTopicRankings, getSyllabusMapping, getTopicPredictions } from '../api';

const COLORS = ['#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TopicAnalysis() {
  const { subjectId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [syllabusMapping, setSyllabusMapping] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rankings');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    try {
      const [rankingsRes, mappingRes, predictionsRes] = await Promise.all([
        getTopicRankings(subjectId),
        getSyllabusMapping(subjectId).catch(() => ({ data: null })),
        getTopicPredictions(subjectId).catch(() => ({ data: null }))
      ]);
      setRankings(rankingsRes.data.rankings || []);
      setSyllabusMapping(mappingRes.data);
      setPredictions(predictionsRes.data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const filteredRankings = selectedDifficulty === 'all' 
    ? rankings 
    : rankings.filter(r => {
        const distribution = r.difficulty_distribution || {};
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        const diffCount = distribution[selectedDifficulty] || 0;
        return diffCount / total > 0.3;
      });

  const radarData = rankings.slice(0, 8).map(topic => ({
    topic: topic.topic.substring(0, 12),
    score: topic.importance_score,
    frequency: Math.min(topic.frequency * 10, 100)
  }));

  const tabs = [
    { id: 'rankings', label: 'Topic Rankings', icon: Target },
    { id: 'visual', label: 'Visual Analysis', icon: Brain },
    { id: 'predictions', label: 'AI Predictions', icon: Zap },
    { id: 'coverage', label: 'Syllabus Coverage', icon: BookOpen }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 shimmer rounded-2xl" />
        <div className="h-12 w-96 shimmer rounded-xl" />
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link to={`/subject/${subjectId}`}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </motion.div>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Topic Analysis</h1>
          <p className="text-gray-400">AI-powered pattern analysis and predictions</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Filter */}
          <div className="glass-card p-4 flex flex-wrap items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing {filteredRankings.length} topics
            </span>
          </div>

          {/* Rankings Table */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-blue" />
              High-Yield Topics (Ranked by Importance)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Topic</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Frequency</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Avg Marks</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Trend</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Last Seen</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.map((topic, index) => (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-white/5 hover:bg-white/5 ${getPriorityClass(topic.importance_score)}`}
                    >
                      <td className="py-4 px-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-white">{topic.topic}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="badge">{topic.frequency} questions</span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400">
                        {topic.avg_marks?.toFixed(1) || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center justify-center gap-1">
                          {getTrendIcon(topic.trend)}
                          <span className="text-xs text-gray-400 hidden sm:inline">{topic.trend}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400">{topic.last_appeared}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                              style={{ width: `${topic.importance_score}%` }}
                            />
                          </div>
                          <span className={`font-bold w-12 text-right ${getScoreColor(topic.importance_score)}`}>
                            {topic.importance_score}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visual Analysis Tab */}
      {activeTab === 'visual' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Top Topics Bar Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Topic Importance Scores</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={rankings.slice(0, 10)} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                <YAxis type="category" dataKey="topic" width={100} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance_score" radius={[0, 8, 8, 0]}>
                  {rankings.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Topic Comparison Radar</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" />
                <Radar name="Importance" dataKey="score" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.4} />
                <Radar name="Frequency" dataKey="frequency" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Difficulty Distribution */}
          <div className="glass-card p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Difficulty Distribution by Topic</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rankings.slice(0, 8).map((topic, index) => {
                const dist = topic.difficulty_distribution || {};
                const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="font-medium text-sm text-white mb-2 truncate">{topic.topic}</p>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <div
                          key={diff}
                          className={`${
                            diff === 'easy' ? 'bg-green-500' :
                            diff === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${((dist[diff] || 0) / total) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span className="text-green-400">E: {dist.easy || 0}</span>
                      <span className="text-yellow-400">M: {dist.medium || 0}</span>
                      <span className="text-red-400">H: {dist.hard || 0}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {predictions ? (
            <>
              {/* High Probability Topics */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Predicted High Probability Topics
                </h3>
                <div className="space-y-3">
                  {predictions.predicted_high_probability_topics?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{item.topic}</p>
                          <p className="text-sm text-gray-400 mt-1">{item.reasoning}</p>
                          <p className="text-sm text-yellow-400 mt-2">
                            <strong>Prep tip:</strong> {item.suggested_preparation}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          item.probability >= 0.8 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          item.probability >= 0.6 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {(item.probability * 100).toFixed(0)}% likely
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trends */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Emerging Topics
                  </h3>
                  <div className="space-y-2">
                    {predictions.emerging_topics?.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="font-medium text-white">{item.topic}</p>
                        <p className="text-sm text-green-400">{item.trend} • First: {item.first_appeared}</p>
                      </div>
                    ))}
                    {(!predictions.emerging_topics || predictions.emerging_topics.length === 0) && (
                      <p className="text-gray-500 text-sm">No emerging topics identified</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    Declining Topics
                  </h3>
                  <div className="space-y-2">
                    {predictions.declining_topics?.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-medium text-white">{item.topic}</p>
                        <p className="text-sm text-red-400">Last: {item.last_appearance}</p>
                        <p className="text-sm text-gray-400">{item.recommendation}</p>
                      </div>
                    ))}
                    {(!predictions.declining_topics || predictions.declining_topics.length === 0) && (
                      <p className="text-gray-500 text-sm">No declining topics identified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card-neon p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Summary</h3>
                <p className="text-gray-300">{predictions.analysis_summary}</p>
                <p className="text-sm text-neon-blue mt-2">
                  Confidence: {(predictions.prediction_confidence * 100).toFixed(0)}%
                </p>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Zap className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Upload more papers to generate AI predictions</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {syllabusMapping ? (
            <>
              {/* Coverage Overview */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Syllabus Coverage Overview</h3>
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(syllabusMapping.coverage_analysis?.coverage_percentage || 0) * 3.52} 352`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="#00d4ff" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {syllabusMapping.coverage_analysis?.coverage_percentage || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-medium text-white">Syllabus Coverage</p>
                    <p className="text-gray-400">
                      {syllabusMapping.coverage_analysis?.covered_topics?.length || 0} of {
                        (syllabusMapping.coverage_analysis?.covered_topics?.length || 0) + 
                        (syllabusMapping.coverage_analysis?.uncovered_topics?.length || 0)
                      } topics covered
                    </p>
                  </div>
                </div>
              </div>

              {/* Covered vs Uncovered */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Covered Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {syllabusMapping.coverage_analysis?.covered_topics?.map((topic, index) => (
                      <span key={index} className="badge-green">{topic}</span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Uncovered Topics (Gaps)</h3>
                  <div className="flex flex-wrap gap-2">
                    {syllabusMapping.coverage_analysis?.uncovered_topics?.map((topic, index) => (
                      <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
                        {topic}
                      </span>
                    ))}
                    {(!syllabusMapping.coverage_analysis?.uncovered_topics || 
                      syllabusMapping.coverage_analysis.uncovered_topics.length === 0) && (
                      <p className="text-gray-500 text-sm">All topics covered!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {syllabusMapping.recommendations?.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-neon-blue">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-blue" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {syllabusMapping.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-neon-blue">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">Upload a syllabus to see coverage analysis</p>
              <Link to={`/subject/${subjectId}/upload`}>
                <motion.button whileHover={{ scale: 1.05 }} className="btn-primary">
                  Upload Syllabus
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
