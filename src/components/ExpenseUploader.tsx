import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { DEFAULT_SAMPLE_CSV } from '../utils/csvParser';

interface ExpenseUploaderProps {
  onUpload: (csvContent: string) => Promise<void>;
  isLoading?: boolean;
}

export const ExpenseUploader: React.FC<ExpenseUploaderProps> = ({ onUpload, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (text) {
        await onUpload(text);
        setUploadedSuccess(true);
        setTimeout(() => setUploadedSuccess(false), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([DEFAULT_SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'finwise_sample_expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSamplePreset = async () => {
    setFileName('sample_finwise_quarterly_expenses.csv');
    await onUpload(DEFAULT_SAMPLE_CSV);
    setUploadedSuccess(true);
    setTimeout(() => setUploadedSuccess(false), 4000);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Upload Expense Statements (CSV)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-categorizes transactions and generates dynamic spending insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            id="download-sample-csv-btn"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={loadSamplePreset}
            id="load-sample-preset-btn"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Load Demo Data</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/50 dark:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            ) : uploadedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {fileName ? (
                <span className="text-emerald-500 flex items-center gap-1.5 justify-center">
                  <FileText className="w-3.5 h-3.5" /> {fileName}
                </span>
              ) : (
                <span>
                  Drop statement CSV here, or{' '}
                  <span className="text-emerald-500 underline underline-offset-2">browse files</span>
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Supported columns: <code>Date</code>, <code>Description</code>, <code>Amount</code>, <code>Category</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
