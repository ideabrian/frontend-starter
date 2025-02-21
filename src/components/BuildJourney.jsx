import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Clock, Plus, Trash, Edit2, X, Save } from 'lucide-react';

const BuildJourney = () => {
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('steps');
    return saved ? JSON.parse(saved) : [{
      id: Date.now(),
      text: "Started my build journey",
      timestamp: new Date().toISOString(),
      completed: true
    }];
  });
  const [newStep, setNewStep] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('steps', JSON.stringify(steps));
  }, [steps]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addStep = (e) => {
    e.preventDefault();
    if (!newStep.trim()) return;

    const step = {
      id: Date.now(),
      text: newStep,
      timestamp: new Date().toISOString(),
      completed: false
    };

    try {
      setSteps(prev => [...prev, step]);
      setNewStep('');
    } catch (error) {
      console.error('Error adding step:', error);
    }
  };

  const deleteStep = (id) => {
    try {
      setSteps(prev => prev.filter(step => step.id !== id));
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  const startEdit = (step) => {
    setEditingId(step.id);
    setEditText(step.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    
    try {
      setSteps(prev => prev.map(step =>
        step.id === id ? { ...step, text: editText } : step
      ));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleStep = (id) => {
    setSteps(prev => prev.map(step =>
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-2">Build Journey</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>
      </div>

      <form onSubmit={addStep} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Add a new build step..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300"
          />
          <button
            type="submit"
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2 sm:w-auto w-full"
          >
            <Plus className="w-5 h-5" />
            <span>Add Step</span>
          </button>
        </div>
      </form>

      <div className="space-y-3 sm:space-y-4">
        {steps.map(step => (
          <div
            key={step.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(step.id)}
                className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                {step.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              
              <div className="flex-1 min-w-0">
                {editingId === step.id ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 min-w-0"
                    />
                    <div className="flex gap-2 justify-end sm:justify-start">
                      <button
                        onClick={() => saveEdit(step.id)}
                        className="text-green-500 hover:text-green-400"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className={`text-gray-300 break-words ${step.completed ? 'line-through opacity-50' : ''}`}>
                        {step.text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(step.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start flex-shrink-0">
                      <button
                        onClick={() => startEdit(step)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-400">
          <AlertCircle className="w-5 h-5" />
          <span>Currently using localStorage. MongoDB integration coming soon!</span>
        </div>
      </div>
    </div>
  );
};

export default BuildJourney;