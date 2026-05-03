import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import SubjectDashboard from './pages/SubjectDashboard';
import UploadPapers from './pages/UploadPapers';
import TopicAnalysis from './pages/TopicAnalysis';
import StudyPlanner from './pages/StudyPlanner';
import PracticeQuestions from './pages/PracticeQuestions';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="subject/:subjectId" element={<SubjectDashboard />} />
          <Route path="subject/:subjectId/upload" element={<UploadPapers />} />
          <Route path="subject/:subjectId/analysis" element={<TopicAnalysis />} />
          <Route path="subject/:subjectId/study-plan" element={<StudyPlanner />} />
          <Route path="subject/:subjectId/practice" element={<PracticeQuestions />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
