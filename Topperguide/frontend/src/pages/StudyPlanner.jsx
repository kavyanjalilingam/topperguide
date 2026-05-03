import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Target, CheckCircle2, Circle, 
  ChevronDown, ChevronRight, Sparkles, BookOpen, Settings,
  Play, Pause, RotateCcw, Brain, Flag
} from 'lucide-react';
import { getStudyPlan, getWeakAreas, generateStudyPlan } from '../api';

export default function StudyPlanner() {
  const { subjectId } = useParams();
  const [studyPlan, setStudyPlan] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(new Set());
  const [daysAvailable, setDaysAvailable] = useState(30);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    try {
      const [planRes, weakRes] = await Promise.all([
        getStudyPlan(subjectId).catch(() => ({ data: [] })),
        getWeakAreas(subjectId).catch(() => ({ data: { weak_areas: [] } }))
      ]);
      
      // Get the most recent plan and extract plan_data
      const plans = planRes.data || [];
      if (plans.length > 0) {
        const latestPlan = plans[0]; // Already sorted by created_at desc
        setStudyPlan({
          ...latestPlan.plan_data,
          id: latestPlan.id,
          total_days: latestPlan.duration_days,
          estimated_hours: latestPlan.duration_days * latestPlan.daily_hours
        });
      } else {
        setStudyPlan(null);
      }
      
      setWeakAreas(weakRes.data?.weak_areas || []);
    } catch (error) {
      console.error('Error loading study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await generateStudyPlan(subjectId, { 
        days_available: daysAvailable, 
        hours_per_day: hoursPerDay 
      });
      
      // Extract plan_data from response
      const planData = res.data?.plan_data || res.data;
      setStudyPlan({
        ...planData,
        id: res.data?.id,
        total_days: res.data?.duration_days || daysAvailable,
        estimated_hours: (res.data?.duration_days || daysAvailable) * (res.data?.daily_hours || hoursPerDay)
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = (id) => {
    setCompletedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getPhaseIcon = (index) => {
    const icons = ['🎯', '🚀', '🔥', '⚡', '✨'];
    return icons[index % icons.length];
  };

  const totalMilestones = studyPlan?.phases?.reduce((acc, phase) => 
    acc + (phase.milestones?.length || 0), 0) || 0;
  const progress = totalMilestones > 0 ? (completedMilestones.size / totalMilestones) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 shimmer rounded-2xl" />
        <div className="h-64 shimmer rounded-2xl" />
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
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
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
            <h1 className="text-2xl font-bold text-white">Smart Study Planner</h1>
            <p className="text-gray-400">AI-generated personalized study schedule</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </motion.button>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Plan Settings</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Days Available
                </label>
                <input
                  type="number"
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Hours Per Day
                </label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                  max="16"
                />
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate New Plan
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {studyPlan ? (
        <>
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-neon p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{studyPlan.plan_name}</h2>
                <p className="text-gray-400">{studyPlan.total_days} days • {studyPlan.estimated_hours} total hours</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-white">{progress.toFixed(0)}%</p>
                </div>
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                    <circle
                      cx="40" cy="40" r="35"
                      stroke="url(#progressGrad)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${progress * 2.2} 220`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="progressGrad">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {completedMilestones.size}/{totalMilestones}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weak Areas Alert */}
          {weakAreas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-4 border-l-4 border-orange-400"
            >
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Focus Areas Identified</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {weakAreas.slice(0, 5).map((area, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {area.topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strategy Summary */}
          {studyPlan.strategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="glass-card p-6 border-l-4 border-neon-blue"
            >
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-neon-blue mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-2">AI Strategy</h3>
                  <p className="text-gray-300 leading-relaxed">{studyPlan.strategy}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tips Section */}
          {studyPlan.tips?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.17 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Study Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {studyPlan.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.17 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-300 text-sm">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Global Milestones */}
          {studyPlan.milestones?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-400" />
                Key Milestones
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-blue via-neon-purple to-green-400" />
                <div className="space-y-4">
                  {studyPlan.milestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.08 }}
                      className="flex items-start gap-4 pl-8 relative"
                    >
                      <div className="absolute left-2 w-4 h-4 rounded-full bg-neon-blue border-2 border-dark-bg" />
                      <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-neon-blue">Day {milestone.day}</span>
                        </div>
                        <p className="text-white font-medium">{milestone.milestone}</p>
                        {milestone.self_test && (
                          <p className="text-sm text-gray-400 mt-1">📝 Self-test: {milestone.self_test}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly Reviews */}
          {studyPlan.weekly_reviews?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-neon-purple" />
                Weekly Review Schedule
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyPlan.weekly_reviews.map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.19 + i * 0.05 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-neon-purple">Week {review.week}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Review Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {review.review_topics?.map((topic, j) => (
                            <span key={j} className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.practice_focus?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Practice Focus</p>
                          <p className="text-xs text-gray-300">{review.practice_focus.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {studyPlan.phases?.map((phase, phaseIndex) => {
              const isExpanded = expandedPhase === phaseIndex;
              const phaseCompleted = phase.milestones?.every(m => 
                completedMilestones.has(`${phaseIndex}-${m.id || m.title}`)
              );
              
              // Handle different formats from AI
              const startDay = phase.start_day || (Array.isArray(phase.days) ? phase.days[0] : 1);
              const endDay = phase.end_day || (Array.isArray(phase.days) ? phase.days[1] : startDay);
              const phaseName = phase.phase_name || phase.name || `Phase ${phaseIndex + 1}`;
              const estimatedHours = phase.estimated_hours || phase.hours || ((endDay - startDay + 1) * hoursPerDay);

              return (
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: phaseIndex * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Phase Header */}
                  <motion.button
                    onClick={() => setExpandedPhase(isExpanded ? -1 : phaseIndex)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      phaseCompleted 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      {phaseCompleted ? '✓' : getPhaseIcon(phaseIndex)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{phaseName}</h3>
                        {phase.priority && (
                          <span className={`badge ${getPriorityColor(phase.priority)}`}>
                            {phase.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Day {startDay} - {endDay}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {estimatedHours}h
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </motion.button>

                  {/* Phase Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Topics */}
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-2">Topics to Cover</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.topics?.map((topic, i) => (
                                <span key={i} className="badge">{topic}</span>
                              ))}
                            </div>
                          </div>

                          {/* Milestones */}
                          {phase.milestones?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-3">Milestones</p>
                              <div className="space-y-2">
                                {phase.milestones.map((milestone, mIndex) => {
                                  const id = `${phaseIndex}-${milestone.id || milestone.title}`;
                                  const isComplete = completedMilestones.has(id);

                                  return (
                                    <motion.div
                                      key={mIndex}
                                      whileHover={{ x: 4 }}
                                      onClick={() => toggleMilestone(id)}
                                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                        isComplete 
                                          ? 'bg-green-500/10 border border-green-500/20' 
                                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        {isComplete ? (
                                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-gray-500" />
                                        )}
                                      </motion.div>
                                      <span className={`flex-1 ${isComplete ? 'text-gray-400 line-through' : 'text-white'}`}>
                                        {milestone.title || milestone}
                                      </span>
                                      {milestone.duration && (
                                        <span className="text-xs text-gray-500">
                                          {milestone.duration}
                                        </span>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Resources */}
                          {phase.resources?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-2">Recommended Resources</p>
                              <div className="space-y-2">
                                {phase.resources.map((resource, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-blue-400">
                                    <BookOpen className="w-4 h-4" />
                                    {resource}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips */}
                          {phase.tips && (
                            <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                              <p className="text-sm text-neon-blue">
                                <strong>Tip:</strong> {phase.tips}
                              </p>
                            </div>
                          )}

                          {/* Daily Breakdown */}
                          {phase.daily_breakdown?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-3">Daily Breakdown</p>
                              <div className="space-y-3">
                                {phase.daily_breakdown.map((day, dIndex) => (
                                  <motion.div
                                    key={dIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: dIndex * 0.05 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold text-white">Day {day.day}</span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {day.hours}h
                                      </span>
                                    </div>
                                    {day.topics?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {day.topics.map((t, ti) => (
                                          <span key={ti} className="px-2 py-0.5 text-xs rounded bg-neon-blue/20 text-neon-blue">
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {day.activities?.length > 0 && (
                                      <div className="text-sm text-gray-300 mb-2">
                                        <span className="text-gray-500">Activities:</span> {day.activities.join(' → ')}
                                      </div>
                                    )}
                                    {day.goals?.length > 0 && (
                                      <div className="text-sm">
                                        <span className="text-gray-500">Goals:</span>
                                        <ul className="list-disc list-inside text-gray-400 ml-2">
                                          {day.goals.map((g, gi) => (
                                            <li key={gi}>{g}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Daily Schedule Suggestion */}
          {studyPlan.daily_schedule && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Suggested Daily Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(studyPlan.daily_schedule).map(([time, activity], index) => (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-sm font-medium text-neon-blue mb-1">{time}</p>
                    <p className="text-white">{activity}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* No Plan - Generate CTA */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-neon-blue" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Study Plan Yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Generate a personalized AI-powered study plan based on your uploaded papers and topic analysis.
          </p>
          
          <div className="max-w-md mx-auto space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Days Available</label>
                <input
                  type="number"
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Hours/Day</label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGeneratePlan}
            disabled={generating}
            className="btn-primary text-lg px-8 py-4"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Plan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Study Plan
              </span>
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
