// Import Progress Component

import { ImportProgress as ImportProgressType } from '../../types/smart-import';

interface ImportProgressProps {
  progress: ImportProgressType;
  onCancel?: () => void;
}

export default function ImportProgress({ progress, onCancel }: ImportProgressProps) {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'parsing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'formatting':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'uploading':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'complete':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'parsing':
        return 'Extracting Content';
      case 'processing':
        return 'AI Processing';
      case 'formatting':
        return 'Formatting Content';
      case 'uploading':
        return 'Creating Post';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4 ${getStageColor(progress.stage)}`}>
            {progress.stage === 'processing' || progress.stage === 'parsing' || progress.stage === 'formatting' ? (
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              getStageIcon(progress.stage)
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-sans">
            {getStageTitle(progress.stage)}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6 font-sans">
            {progress.message}
          </p>

          {/* Details */}
          {progress.details && (
            <p className="text-sm text-gray-500 mb-6">
              {progress.details}
            </p>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.stage === 'error' ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-gray-500 mb-6">
            {progress.progress}% complete
          </p>

          {/* Cancel Button */}
          {onCancel && progress.stage !== 'complete' && progress.stage !== 'error' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Processing Steps */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Processing Steps:</h3>
          <div className="space-y-3">
            {[
              { stage: 'parsing', title: 'Extract content from source', progress: progress.stage === 'parsing' ? progress.progress : progress.progress > 25 ? 100 : 0 },
              { stage: 'processing', title: 'AI analysis and enhancement', progress: progress.stage === 'processing' ? progress.progress : progress.progress > 50 ? 100 : 0 },
              { stage: 'formatting', title: 'Format for Sanity CMS', progress: progress.stage === 'formatting' ? progress.progress : progress.progress > 75 ? 100 : 0 },
              { stage: 'uploading', title: 'Create blog post', progress: progress.stage === 'uploading' ? progress.progress : progress.progress === 100 ? 100 : 0 },
            ].map((step, index) => (
              <div key={step.stage} className="flex items-center">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  step.progress === 100 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : step.progress > 0 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step.progress === 100 ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.progress > 0 ? (
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm ${
                    step.progress === 100 
                      ? 'text-green-700 font-medium' 
                      : step.progress > 0 
                        ? 'text-blue-700 font-medium' 
                        : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  {step.progress > 0 && step.progress < 100 && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
