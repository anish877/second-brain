import React, { useState, useCallback } from 'react';
import { X, Youtube, Twitter, FileText, Plus, Bold, Underline, List, Type, Hash, Link2, Eye, Wand2 } from 'lucide-react';
import axios from 'axios';
import Button from './Button';

interface CreateContentModelProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCards: () => void;
}

interface FormatButton {
  format: string;
  icon: React.ReactNode;
  active: boolean;
  tooltip: string;
}

const CreateContentModel = ({ isOpen, onClose, fetchCards }: CreateContentModelProps) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'youtube' as "youtube" | "twitter" | "document",
    link: '',
    description: '',
    tags: [] as string[],
    currentTag: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    underline: false,
    bullet: false
  });

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const autoFillContent = async () => {
    if (!formData.link) {
      setError('Please enter a URL first');
      return;
    }

    setIsAutoFilling(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/content/metadata', {
        link: formData.link,
        type: formData.type
      });

      const metadata = response.data;
      
      setFormData(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        tags: [...new Set([...prev.tags, ...(metadata.tags || [])])]
      }));
    } catch (error) {
      setError('Failed to fetch content details. Please fill them manually.');
      console.error(error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const formattedText = text
      .split('\n')
      .map(line => {
        let processedLine = line;
        processedLine = processedLine.replace(
          /\*\*(.*?)\*\*/g,
          '<span class="font-bold">$1</span>'
        );
        processedLine = processedLine.replace(
          /__(.*?)__/g,
          '<span class="underline">$1</span>'
        );
        if (processedLine.startsWith('• ')) {
          processedLine = `<li class="ml-4">${processedLine.substring(2)}</li>`;
        }
        return processedLine;
      })
      .join('<br/>');

    return { __html: formattedText };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.link.trim()) {
      setError('Please enter a valid link');
      return;
    }

    try {
      await api.post("/api/v1/content", {
        title: formData.title,
        type: formData.type,
        link: formData.link,
        description: formData.description,
        tags: formData.tags,
      });
      fetchCards();
      onClose();
    } catch (error) {
      setError('Failed to create content. Please try again.');
      console.error(error);
    }
  };

  const addTag = useCallback(() => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  }, [formData.currentTag, formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const formatButtons: FormatButton[] = [
    {
      format: 'bold',
      icon: <Bold className="h-4 w-4" />,
      active: activeFormats.bold,
      tooltip: 'Bold'
    },
    {
      format: 'underline',
      icon: <Underline className="h-4 w-4" />,
      active: activeFormats.underline,
      tooltip: 'Underline'
    },
    {
      format: 'bullet',
      icon: <List className="h-4 w-4" />,
      active: activeFormats.bullet,
      tooltip: 'Bullet List'
    }
  ];

  const applyFormatting = useCallback((format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) return;

    let newText = formData.description;
    let newStart = start;
    let newEnd = end;

    const formatMap = {
      bold: { prefix: '**', suffix: '**' },
      underline: { prefix: '__', suffix: '__' },
      bullet: { prefix: '• ', suffix: '' }
    };

    const { prefix, suffix } = formatMap[format as keyof typeof formatMap];
    
    if (format === 'bullet') {
      const lines = selectedText.split('\n');
      const formattedText = lines
        .map(line => line.startsWith('• ') ? line.substring(2) : `• ${line}`)
        .join('\n');
      newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      newEnd = start + formattedText.length;
    } else {
      const isFormatted = selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
      if (isFormatted) {
        const unformattedText = selectedText.slice(prefix.length, -suffix.length);
        newText = textarea.value.substring(0, start) + unformattedText + textarea.value.substring(end);
        newEnd = start + unformattedText.length;
      } else {
        newText = textarea.value.substring(0, start) + prefix + selectedText + suffix + textarea.value.substring(end);
        newEnd = start + selectedText.length + prefix.length + suffix.length;
      }
    }

    setFormData(prev => ({
      ...prev,
      description: newText
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  }, [formData.description]);

  const getPlaceholderText = () => {
    switch(formData.type) {
      case 'youtube':
        return 'Enter YouTube video URL';
      case 'twitter':
        return 'Enter Twitter post URL';
      case 'document':
        return 'Enter Google Docs document URL';
      default:
        return 'Enter URL';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Add New Content</h2>
            <p className="text-sm text-gray-500">Create and organize your content collection</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" />
                Content Type
              </span>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'youtube' })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    formData.type === 'youtube' 
                      ? 'border-gray-900 text-gray-900 bg-gray-50/75' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Youtube className="h-5 w-5" />
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'twitter' })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    formData.type === 'twitter' 
                      ? 'border-gray-900 text-gray-900 bg-gray-50/75' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Twitter className="h-5 w-5" />
                  Twitter
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'document' })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    formData.type === 'document' 
                      ? 'border-gray-900 text-gray-900 bg-gray-50/75' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  Google Docs
                </button>
              </div>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4" />
                Content URL
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                  placeholder={getPlaceholderText()}
                />
                <button
                  type="button"
                  onClick={autoFillContent}
                  disabled={isAutoFilling || !formData.link}
                  className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2
                    ${isAutoFilling ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                    formData.link ? 'bg-gray-900 text-white hover:bg-gray-800' : 
                    'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <Wand2 className="h-4 w-4" />
                  {isAutoFilling ? 'Loading...' : 'Auto-fill'}
                </button>
              </div>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" />
                Title
              </span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                placeholder="Enter a descriptive title"
              />
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4" />
                  Description
                </span>
              </label>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 p-1 border border-gray-200 rounded-lg bg-gray-50">
                  {formatButtons.map((button) => (
                    <button
                      key={button.format}
                      type="button"
                      onClick={() => applyFormatting(button.format)}
                      className={`p-2 rounded-md hover:bg-white transition-all ${
                        button.active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                      }`}
                      title={button.tooltip}
                    >
                      {button.icon}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {showPreview ? (
                <div
                  className="w-full min-h-[120px] p-2.5 border border-gray-200 rounded-lg bg-gray-50"
                  dangerouslySetInnerHTML={renderFormattedText(formData.description)}
                />
              ) : (
                <textarea
                  value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors min-h-[120px] resize-y"
                    placeholder="Add a detailed description..."
                  />
                )}
              </div>
  
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4" />
                  Tags
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.currentTag}
                    onChange={(e) => setFormData({ ...formData, currentTag: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                    placeholder="Add tags and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center gap-1.5 group hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 group-hover:text-gray-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </label>
            </div>
  
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant='secondary' text='Cancel' onClick={onClose} size='md'/>
              <button type="submit">
                <Button variant='primary' text='Create Content' onClick={()=>{}} size='md'/>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default CreateContentModel;