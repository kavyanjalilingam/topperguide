import { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { 
  Plus, BookOpen, FileText, TrendingUp, Sparkles, 
  Brain, Target, Calendar, Zap, ChevronRight, ArrowRight
} from 'lucide-react';
import { getSubjects, createSubject } from '../api';

// 3D Animated Sphere Component
function AnimatedSphere() {
  return (
    <Sphere args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#00d4ff"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

// 3D Background Scene
function Scene3D() {
  return (
    <div className="absolute inset-0 opacity-30">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <AnimatedSphere />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}

// Animated Feature Card
const FeatureCard = ({ icon: Icon, title, description, delay, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass-card-neon p-6 cursor-pointer group"
  >
    <div 
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
      style={{ background: gradient }}
    >
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-blue transition-colors">
      {title}
    </h3>
    <p className="text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
);

// Stat Card Component
const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="glass-card p-4 text-center"
  >
    <Icon className="w-6 h-6 text-neon-blue mx-auto mb-2" />
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </motion.div>
);

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const response = await createSubject({
        name: newSubjectName.trim(),
        description: newSubjectDesc.trim() || null,
      });
      setSubjects([...subjects, response.data]);
      setNewSubjectName('');
      setNewSubjectDesc('');
      setShowNewSubject(false);
      navigate(`/subject/${response.data.id}`);
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-16"
    >
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center -mt-8">
        {/* 3D Background */}
        <Scene3D />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mt-8"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-gray-300">AI-Powered Exam Preparation</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Study </span>
              <span className="text-neon">Smarter</span>
              <br />
              <span className="text-white">with </span>
              <span className="text-neon">AI</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload past papers, discover patterns, and get AI-powered insights 
              to focus on what matters most. Your personalized study plan awaits.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewSubject(true)}
                className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <Plus className="w-5 h-5" />
                Get Started
              </motion.button>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-3 gap-4 mt-16 max-w-md mx-auto"
          >
            <StatCard value="AI" label="Powered Analysis" icon={Brain} />
            <StatCard value="24/7" label="Available" icon={Zap} />
            <StatCard value="100%" label="Free & Local" icon={Target} />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-3 bg-neon-blue rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Features for <span className="text-neon">Smart Study</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to analyze past papers and prepare strategically
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={FileText}
            title="Multi-Paper Upload"
            description="Upload multiple years of past papers with PDF and image support. OCR extracts text automatically."
            delay={0}
            gradient="linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)"
          />
          <FeatureCard
            icon={Brain}
            title="AI Pattern Analysis"
            description="Discover topic frequency, question patterns, and difficulty trends across all your papers."
            delay={0.1}
            gradient="linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
          />
          <FeatureCard
            icon={Target}
            title="Topic Scoring"
            description="AI ranks topics by importance based on historical data, recency, and exam weight."
            delay={0.2}
            gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
          />
          <FeatureCard
            icon={Calendar}
            title="Smart Study Planner"
            description="Get personalized study schedules with daily tasks, milestones, and optimized time allocation."
            delay={0.3}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Visual Analytics"
            description="Beautiful charts and heatmaps showing trends, coverage gaps, and insights at a glance."
            delay={0.4}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
          <FeatureCard
            icon={Zap}
            title="Practice Generator"
            description="AI creates practice questions on high-yield topics with instant answers and explanations."
            delay={0.5}
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          />
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-8">
        <motion.div
          variants={itemVariants}
          className="glass-card p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Subjects</h2>
              <p className="text-gray-400">Create subjects and start analyzing past papers</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewSubject(!showNewSubject)}
              className="btn-neon flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </motion.button>
          </div>

          {/* New Subject Form */}
          {showNewSubject && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateSubject}
              className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g., Physics, Mathematics"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    placeholder="e.g., Class 12 CBSE Physics"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSubject(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Subject
                </button>
              </div>
            </motion.form>
          )}

          {/* Subjects Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl shimmer" />
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/subject/${subject.id}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-card-neon p-5 cursor-pointer group h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-neon-blue" />
                        </div>
                        <span className="badge">
                          {subject.paper_count} papers
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-neon-blue transition-colors mb-1">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-sm text-gray-400">{subject.description}</p>
                      )}
                      <div className="flex items-center gap-1 mt-4 text-sm text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No subjects yet</h3>
              <p className="text-gray-400 mb-6">Create your first subject to get started with AI-powered analysis</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewSubject(true)}
                className="btn-primary"
              >
                Create First Subject
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-neon p-12 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-pink/10" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Study <span className="text-neon">Smarter</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of students using AI to ace their exams. 
              100% free, runs locally with Ollama.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewSubject(true)}
              className="btn-primary text-lg px-10 py-4"
            >
              Start Analyzing Now
            </motion.button>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
