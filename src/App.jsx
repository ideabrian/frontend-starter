import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WritingEditor from './components/WritingEditor';
import BuildJourney from './components/BuildJourney';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex gap-4">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Build Journey
            </Link>
            <Link 
              to="/write" 
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Writing Editor
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<BuildJourney />} />
          <Route path="/write" element={<WritingEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
