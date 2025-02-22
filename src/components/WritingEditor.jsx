import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react'; // Import X icon for modal close button

const WritingEditor = () => {
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get today's date in MM/DD/YY format
  const getTodayDate = () => {
    return new Date().toLocaleString().split(',')[0];
  };

  // Get day name for greeting
  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Get appropriate greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour > 17 ? 'Evening' : 'Afternoon';
    return `Good ${getDayOfWeek()} ${timeOfDay}`;
  };

  // Word counting function
  const countWords = useCallback((text) => {
    const words = text.match(/(?:\w|['-]\w)+/gi);
    return words ? words.length : 0;
  }, []);

  // Load history on mount
  useEffect(() => {
    const loadHistory = () => {
      const allKeys = Object.keys(localStorage);
      const entries = allKeys
        .filter(key => key.startsWith('words_')) // we'll change the storage format
        .map(key => {
          const [date, text] = localStorage.getItem(key).split('::');
          return {
            id: key,
            date,
            text,
            preview: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
            wordCount: countWords(text)
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setHistory(entries);
    };

    loadHistory();
  }, [countWords]);

  // Modified save function to keep history
  const saveToLocalStorage = useCallback(() => {
    const date = getTodayDate();
    const id = `words_${Date.now()}`; // unique ID for each save
    localStorage.setItem(id, `${date}::${text}`);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 1000);
    
    // Update history
    setHistory(prev => [{
      id,
      date,
      text,
      preview: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
      wordCount: countWords(text)
    }, ...prev]);
  }, [text, getTodayDate, countWords]);

  // Load saved text on component mount
  useEffect(() => {
    const storedItems = localStorage.getItem('words');
    if (storedItems) {
      const [savedDate, savedText] = storedItems.split('::');
      if (getTodayDate() === savedDate) {
        setText(savedText);
      } else {
        setText('Delete this and start writing!');
      }
    }
  }, []);

  // Setup autosave countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          saveToLocalStorage();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [saveToLocalStorage]);

  // Update word count when text changes
  useEffect(() => {
    setWordCount(countWords(text));
  }, [text, countWords]);

  // Dark mode toggle handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey && event.key === 'd') {
        document.body.classList.toggle('dark-mode');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load entry to editor
  const loadEntry = (entry) => {
    setText(entry.text);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">{getGreeting()}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          History
        </button>
      </div>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing..."
          className="w-full min-h-[300px] bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 resize-y"
        />
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex gap-4">
            <span>Word Count: {wordCount}</span>
            <span>Auto-save in: {countdown}s</span>
          </div>
          {showMessage && (
            <span className="text-green-500 font-medium">Saved!</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveToLocalStorage}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Save Now
          </button>
          <button
            onClick={() => {
              setText('');
              localStorage.setItem('words', '');
            }}
            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* History Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl text-yellow-500 font-bold">Writing History</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 max-h-[60vh]">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="border-b border-gray-700 last:border-0 py-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-300 font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {entry.wordCount} words
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{entry.preview}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadEntry(entry)}
                      className="text-sm bg-yellow-500 text-gray-900 px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Load in Editor
                    </button>
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      View Full Text
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Text Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl text-yellow-500 font-bold">
                {new Date(selectedEntry.date).toLocaleDateString()}
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-300 whitespace-pre-wrap">{selectedEntry.text}</p>
            </div>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  loadEntry(selectedEntry);
                  setSelectedEntry(null);
                }}
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Load in Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingEditor; 