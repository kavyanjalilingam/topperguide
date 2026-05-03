import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, FileText, X, Check, AlertCircle, ArrowLeft, 
  Sparkles, File, Clock, Zap
} from 'lucide-react';
import { uploadPaper, uploadSyllabus } from '../api';

export default function UploadPapers() {
  const { subjectId } = useParams();
  const [uploadType, setUploadType] = useState('papers');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      year: new Date().getFullYear(),
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    multiple: uploadType === 'papers'
  });

  const updateFileYear = (index, year) => {
    setFiles(prev => {
      const updated = [...prev];
      updated[index].year = parseInt(year);
      return updated;
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadResults = [];

    if (uploadType === 'syllabus') {
      try {
        setFiles(prev => {
          const updated = [...prev];
          updated[0].status = 'uploading';
          return updated;
        });
        const response = await uploadSyllabus(subjectId, files[0].file);
        uploadResults.push({
          filename: files[0].file.name,
          success: true,
          message: 'Syllabus uploaded and analyzed successfully',
          data: response.data
        });
        setFiles(prev => {
          const updated = [...prev];
          updated[0].status = 'success';
          return updated;
        });
      } catch (error) {
        uploadResults.push({
          filename: files[0].file.name,
          success: false,
          message: error.response?.data?.detail || 'Upload failed'
        });
        setFiles(prev => {
          const updated = [...prev];
          updated[0].status = 'error';
          return updated;
        });
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        const { file, year } = files[i];
        try {
          setFiles(prev => {
            const updated = [...prev];
            updated[i].status = 'uploading';
            return updated;
          });
          const response = await uploadPaper(subjectId, year, file);
          uploadResults.push({
            filename: file.name,
            year,
            success: response.data.success,
            message: response.data.message,
            paperId: response.data.paper_id
          });
          setFiles(prev => {
            const updated = [...prev];
            updated[i].status = response.data.success ? 'success' : 'error';
            return updated;
          });
        } catch (error) {
          uploadResults.push({
            filename: file.name,
            year,
            success: false,
            message: error.response?.data?.detail || 'Upload failed'
          });
          setFiles(prev => {
            const updated = [...prev];
            updated[i].status = 'error';
            return updated;
          });
        }
      }
    }

    setResults(uploadResults);
    setUploading(false);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <Check className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'uploading': return (
        <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
      );
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
          <p className="text-gray-400">Add past papers or syllabus for AI analysis</p>
        </div>
      </motion.div>

      {/* Upload Type Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-2 inline-flex"
      >
        {['papers', 'syllabus'].map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setUploadType(type); clearAll(); }}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              uploadType === type 
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {type === 'papers' ? 'Past Papers' : 'Syllabus'}
          </motion.button>
        ))}
      </motion.div>

      {/* Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        {...getRootProps()}
        className={`glass-card-neon p-12 cursor-pointer transition-all ${
          isDragActive ? 'border-neon-blue bg-neon-blue/5 scale-[1.02]' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <motion.div
            animate={{ y: isDragActive ? -10 : 0 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center"
          >
            <Upload className={`w-10 h-10 ${isDragActive ? 'text-neon-blue' : 'text-gray-400'}`} />
          </motion.div>
          <p className="text-xl font-medium text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-gray-400 mb-4">
            or click to browse • Supports PDF and images
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span>
              {uploadType === 'papers' 
                ? 'Upload multiple years for better analysis'
                : 'Upload syllabus for coverage mapping'
              }
            </span>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Files to Upload ({files.length})</h3>
              <button 
                onClick={clearAll} 
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {files.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.status === 'success' ? 'border-green-500/30 bg-green-500/5' :
                    item.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                    item.status === 'uploading' ? 'border-neon-blue/30 bg-neon-blue/5' :
                    'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.status === 'success' ? 'bg-green-500/20' :
                    item.status === 'error' ? 'bg-red-500/20' :
                    'bg-white/10'
                  }`}>
                    <File className="w-6 h-6 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadType === 'papers' && item.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Year:</span>
                      <input
                        type="number"
                        value={item.year}
                        onChange={(e) => updateFileYear(index, e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-neon-blue outline-none"
                        min="1990"
                        max="2030"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {item.status === 'pending' && (
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Upload & Analyze
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-white mb-4">Upload Results</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${
                    result.success 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.filename}
                    </span>
                    {result.year && <span className="text-gray-500">({result.year})</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 ml-7">{result.message}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAll}
                className="btn-secondary"
              >
                Upload More
              </motion.button>
              <Link to={`/subject/${subjectId}/analysis`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                >
                  View Analysis
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 border-l-4 border-neon-blue"
      >
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-blue" />
          Tips for best results
        </h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-neon-blue">•</span>
            Use clear, high-quality PDFs for better text extraction
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue">•</span>
            For scanned papers, ensure images are not rotated or skewed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue">•</span>
            Upload papers from multiple years for better pattern analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neon-blue">•</span>
            Include the syllabus for coverage gap analysis
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
