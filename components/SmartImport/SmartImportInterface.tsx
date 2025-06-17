// Smart Import Interface - Main Component

import { useState } from 'react';
import ImportMethodSelector from './ImportMethodSelector';
import UrlImportForm from './UrlImportForm';
import TextImportForm from './TextImportForm';
import FileImportForm from './FileImportForm';
import ImportPreview from './ImportPreview';
import ImportProgress from './ImportProgress';
import ImportResults from './ImportResults';
import { 
  ImportMethod, 
  ParsedContent, 
  ImportPreview as ImportPreviewType,
  ImportResult,
  ImportProgress as ImportProgressType 
} from '../../types/smart-import';

interface SmartImportInterfaceProps {
  onComplete?: (result: ImportResult) => void;
}

type ImportStage = 'method-selection' | 'input' | 'processing' | 'preview' | 'complete' | 'error';

export default function SmartImportInterface({ onComplete }: SmartImportInterfaceProps) {
  const [stage, setStage] = useState<ImportStage>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [previewData, setPreviewData] = useState<ImportPreviewType | null>(null);
  const [progress, setProgress] = useState<ImportProgressType | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (method: ImportMethod) => {
    setSelectedMethod(method);
    setStage('input');
    setError(null);
  };

  const handleBackToMethodSelection = () => {
    setStage('method-selection');
    setSelectedMethod(null);
    setParsedContent(null);
    setPreviewData(null);
    setProgress(null);
    setResult(null);
    setError(null);
  };

  const handleContentParsed = (content: ParsedContent) => {
    setParsedContent(content);
    setStage('processing');
    generatePreview(content);
  };

  const generatePreview = async (content: ParsedContent) => {
    try {
      setProgress({
        stage: 'processing',
        progress: 50,
        message: 'Generating preview...',
      });

      const token = localStorage.getItem('sanity_token') || '';
      const response = await fetch('/api/smart-import/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ parsedContent: content }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate preview');
      }

      setPreviewData(data.data);
      setStage('preview');
      setProgress(null);
    } catch (error) {
      console.error('Preview generation failed:', error);
      setError(error.message);
      setStage('error');
      setProgress(null);
    }
  };

  const handleCreatePost = async (finalData: any) => {
    try {
      setStage('processing');
      setProgress({
        stage: 'uploading',
        progress: 75,
        message: 'Creating post...',
      });

      const token = localStorage.getItem('sanity_token') || '';
      const response = await fetch('/api/smart-import/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create post');
      }

      setResult(data.data);
      setStage('complete');
      setProgress(null);

      if (onComplete) {
        onComplete(data.data);
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      setError(error.message);
      setStage('error');
      setProgress(null);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setStage('error');
    setProgress(null);
  };

  const renderCurrentStage = () => {
    switch (stage) {
      case 'method-selection':
        return (
          <ImportMethodSelector
            onMethodSelect={handleMethodSelect}
          />
        );

      case 'input':
        if (!selectedMethod) return null;
        
        const commonProps = {
          onContentParsed: handleContentParsed,
          onError: handleError,
          onBack: handleBackToMethodSelection,
        };

        switch (selectedMethod) {
          case 'url':
            return <UrlImportForm {...commonProps} />;
          case 'text':
            return <TextImportForm {...commonProps} />;
          case 'file':
            return <FileImportForm {...commonProps} />;
          default:
            return null;
        }

      case 'processing':
        return progress ? (
          <ImportProgress
            progress={progress}
            onCancel={handleBackToMethodSelection}
          />
        ) : null;

      case 'preview':
        return previewData ? (
          <ImportPreview
            preview={previewData}
            onCreatePost={handleCreatePost}
            onBack={handleBackToMethodSelection}
            onEdit={(content) => {
              setParsedContent(content);
              generatePreview(content);
            }}
          />
        ) : null;

      case 'complete':
        return result ? (
          <ImportResults
            result={result}
            onStartNew={handleBackToMethodSelection}
          />
        ) : null;

      case 'error':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Import Failed</h3>
                </div>
              </div>
              <div className="text-red-700 mb-4">
                {error}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBackToMethodSelection}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
            Smart Import
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Import blog posts from URLs, text, or files using AI-powered content analysis
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${stage === 'method-selection' ? 'text-blue-600' : stage === 'input' || stage === 'processing' || stage === 'preview' || stage === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${stage === 'method-selection' ? 'border-blue-600 bg-blue-50' : stage === 'input' || stage === 'processing' || stage === 'preview' || stage === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-sm font-medium">Select Method</span>
            </div>
            
            <div className={`w-8 h-0.5 ${stage === 'input' || stage === 'processing' || stage === 'preview' || stage === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${stage === 'input' ? 'text-blue-600' : stage === 'processing' || stage === 'preview' || stage === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${stage === 'input' ? 'border-blue-600 bg-blue-50' : stage === 'processing' || stage === 'preview' || stage === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium">Import Content</span>
            </div>
            
            <div className={`w-8 h-0.5 ${stage === 'preview' || stage === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${stage === 'preview' ? 'text-blue-600' : stage === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${stage === 'preview' ? 'border-blue-600 bg-blue-50' : stage === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="ml-2 text-sm font-medium">Review & Publish</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderCurrentStage()}
      </div>
    </div>
  );
}
