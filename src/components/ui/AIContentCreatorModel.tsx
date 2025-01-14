import React, { useState } from 'react';
import { Wand2, X, Youtube, Twitter, File, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Card from './Card';
import Button from './Button';

const contentTypes = [
  { id: 'youtube', label: 'YouTube Video', icon: Youtube, color: 'text-red-500' },
  { id: 'twitter', label: 'Twitter Post', icon: Twitter, color: 'text-blue-400' },
  { id: 'document', label: 'Document', icon: File, color: 'text-gray-500' }
];

const AIContentCreator = ({ isOpen, onClose, cards, onContentGenerated }) => {
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState('youtube');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const generateContent = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const contentHistory = cards.map(card => ({
        type: card.type,
        title: card.title,
        description: card.description,
        tags: card.tags
      }));

      const response = await axios.post('http://localhost:3000/api/v1/ai/generate-content', {
        topic,
        contentType: selectedType,
        contentHistory
      });

      if (!response.data) {
        throw new Error('Failed to generate content');
      }

      setPreviewData({
        ...response.data
      });
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onContentGenerated(previewData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Create Content with AI
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Select Content Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {contentTypes.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedType === id
                      ? 'border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selectedType===id?color:'text-gray-600'}`} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              What would you like to create content about?
            </label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your topic or idea..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Preview Card */}
          {previewData && (
            <div className="space-y-2 flex justify-center">
              <Card {...previewData} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary"
              size="md"
              text="Cancel"
              onClick={onClose}
            />
            {previewData ? (
              <Button
                variant="primary"
                size="md"
                text="Confirm & Save"
                onClick={handleConfirm}
              />
            ) : (
              <Button
                variant="primary"
                size="md"
                text={isGenerating ? "Generating..." : "Generate Content"}
                startIcon={isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                onClick={generateContent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentCreator;