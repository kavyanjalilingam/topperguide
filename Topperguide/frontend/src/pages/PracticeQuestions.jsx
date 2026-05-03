import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Brain, Sparkles, Filter, ChevronLeft, ChevronRight,
  Eye, EyeOff, CheckCircle2, XCircle, RotateCcw, Target, Zap,
  BookOpen, Clock, Trophy
} from 'lucide-react';
import { getPracticeQuestions, generatePracticeQuestions } from '../api';

// Normalize question format from AI to what frontend expects
const normalizeQuestion = (q, index) => ({
  id: q.id || index,
  question: q.question || q.question_text || '',
  topic: q.topic || 'General',
  difficulty: q.difficulty || 'medium',
  options: q.options || [],
  answer: q.answer || q.correct_answer || '',
  correct_answer: q.correct_answer || q.answer || '',
  explanation: q.explanation || '',
  marks: q.marks || 0,
  time_suggested: q.time_suggested || '',
  question_type: q.question_type || 'short_answer',
  key_points: q.key_points || []
});

export default function PracticeQuestions() {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [userAnswers, setUserAnswers] = useState({});
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [subjectId]);

  const loadQuestions = async () => {
    try {
      const res = await getPracticeQuestions(subjectId);
      // Backend returns array of practice questions, each has question_data JSON
      const data = res.data || [];
      let rawQuestions = [];
      
      if (Array.isArray(data)) {
        rawQuestions = data.flatMap(pq => {
          try {
            const qData = typeof pq.question_data === 'string' 
              ? JSON.parse(pq.question_data) 
              : pq.question_data;
            // qData might be {topic, difficulty, questions: [...]} or array
            if (qData?.questions) return qData.questions;
            return Array.isArray(qData) ? qData : [qData];
          } catch (e) {
            return [];
          }
        });
      } else if (data.questions) {
        rawQuestions = data.questions;
      }
      
      setQuestions(rawQuestions.map((q, i) => normalizeQuestion(q, i)));
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generatePracticeQuestions(subjectId, {
        count: 10,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined
      });
      // Backend returns {message: ..., questions: result}
      const data = res.data?.questions || res.data || [];
      let newQuestions = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Handle {topic, difficulty, questions: [...]} format
      if (newQuestions?.questions) {
        newQuestions = newQuestions.questions;
      }
      
      const questionsArray = Array.isArray(newQuestions) ? newQuestions : [newQuestions];
      const normalizedQuestions = questionsArray.map((q, i) => 
        normalizeQuestion(q, questions.length + i)
      );
      setQuestions(prev => [...prev, ...normalizedQuestions]);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];

  const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))];

  const goToNext = () => {
    setShowAnswer(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAnswer = (status) => {
    const qId = currentQuestion.id || currentIndex;
    setUserAnswers(prev => ({ ...prev, [qId]: status }));
    setSessionStats(prev => ({
      ...prev,
      [status]: prev[status] + 1
    }));
    goToNext();
  };

  const startSession = () => {
    setSessionStarted(true);
    setCurrentIndex(0);
    setUserAnswers({});
    setSessionStats({ correct: 0, incorrect: 0, skipped: 0 });
    setShowAnswer(false);
  };

  const resetSession = () => {
    setSessionStarted(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setSessionStats({ correct: 0, incorrect: 0, skipped: 0 });
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const totalAnswered = sessionStats.correct + sessionStats.incorrect + sessionStats.skipped;
  const accuracy = totalAnswered > 0 ? ((sessionStats.correct / totalAnswered) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 shimmer rounded-2xl" />
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
            <h1 className="text-2xl font-bold text-white">Practice Questions</h1>
            <p className="text-gray-400">AI-generated questions based on past papers</p>
          </div>
        </div>
        {sessionStarted && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        )}
      </motion.div>

      {/* Session Stats */}
      {sessionStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4"
        >
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-neon-blue">{filteredQuestions.length}</p>
            <p className="text-sm text-gray-400">Total</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-green-500">
            <p className="text-2xl font-bold text-green-400">{sessionStats.correct}</p>
            <p className="text-sm text-gray-400">Correct</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-red-500">
            <p className="text-2xl font-bold text-red-400">{sessionStats.incorrect}</p>
            <p className="text-sm text-gray-400">Incorrect</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-neon-purple">
            <p className="text-2xl font-bold text-neon-purple">{accuracy}%</p>
            <p className="text-sm text-gray-400">Accuracy</p>
          </div>
        </motion.div>
      )}

      {!sessionStarted ? (
        /* Setup Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
              <Brain className="w-10 h-10 text-neon-blue" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Practice Session</h2>
            <p className="text-gray-400">
              {questions.length} questions available
            </p>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="input-field"
              >
                <option value="all">All Topics</option>
                {topics.map((topic, i) => (
                  <option key={i} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            {filteredQuestions.length} questions match your filters
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {filteredQuestions.length > 0 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="btn-primary flex items-center justify-center gap-2 px-8"
              >
                <Zap className="w-5 h-5" />
                Start Practice Session
              </motion.button>
            ) : (
              <p className="text-yellow-400 text-center">No questions match your filters</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generating}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate More Questions
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Question Card */
        <AnimatePresence mode="wait">
          {currentQuestion ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <div className="glass-card-neon p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium">
                      {currentIndex + 1} / {filteredQuestions.length}
                    </span>
                    <span className={`badge ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty || 'Medium'}
                    </span>
                  </div>
                  <span className="badge">{currentQuestion.topic}</span>
                </div>

                <div className="min-h-[200px]">
                  <h3 className="text-xl font-semibold text-white mb-4 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Multiple Choice Options */}
                  {currentQuestion.options && (
                    <div className="space-y-3 mt-6">
                      {currentQuestion.options.map((option, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isCorrect = showAnswer && 
                          (currentQuestion.correct_answer === letter || 
                           currentQuestion.correct_answer === option);

                        return (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.01 }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              showAnswer 
                                ? isCorrect 
                                  ? 'bg-green-500/20 border-green-500/50' 
                                  : 'bg-white/5 border-white/10'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span className="font-medium text-gray-300 mr-3">{letter}.</span>
                            <span className={isCorrect ? 'text-green-400' : 'text-white'}>
                              {option}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Marks Info */}
                  {currentQuestion.marks && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                      <Trophy className="w-4 h-4" />
                      {currentQuestion.marks} marks
                    </div>
                  )}
                </div>

                {/* Show/Hide Answer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex items-center gap-2 text-neon-blue hover:text-neon-blue/80 transition-colors"
                  >
                    {showAnswer ? (
                      <>
                        <EyeOff className="w-5 h-5" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        Show Answer
                      </>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                      >
                        <p className="font-medium text-green-400 mb-2">Answer:</p>
                        <p className="text-white">
                          {currentQuestion.answer || currentQuestion.correct_answer}
                        </p>
                        {currentQuestion.explanation && (
                          <div className="mt-3 pt-3 border-t border-green-500/20">
                            <p className="font-medium text-green-400 mb-1">Explanation:</p>
                            <p className="text-gray-300">{currentQuestion.explanation}</p>
                          </div>
                        )}
                        {currentQuestion.key_points && (
                          <div className="mt-3 pt-3 border-t border-green-500/20">
                            <p className="font-medium text-green-400 mb-1">Key Points:</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {currentQuestion.key_points.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNext}
                    disabled={currentIndex === filteredQuestions.length - 1}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </motion.button>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAnswer('skipped')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                  >
                    Skip
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAnswer('incorrect')}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Incorrect
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAnswer('correct')}
                    className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Correct
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                />
              </div>
            </motion.div>
          ) : (
            /* Session Complete */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-neon p-8 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-neon-blue/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
              <p className="text-gray-400 mb-6">Great job finishing your practice session</p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-400">{sessionStats.correct}</p>
                  <p className="text-sm text-gray-400">Correct</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</p>
                  <p className="text-sm text-gray-400">Incorrect</p>
                </div>
                <div className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
                  <p className="text-3xl font-bold text-neon-purple">{accuracy}%</p>
                  <p className="text-sm text-gray-400">Accuracy</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetSession}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Practice Again
                </motion.button>
                <Link to={`/subject/${subjectId}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Back to Dashboard
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
