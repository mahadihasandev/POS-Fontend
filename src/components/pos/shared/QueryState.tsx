import { AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { errorMessage } from "@/lib/pos";
import { ModernSpinner } from "@/components/ui/ModernSpinner";

export function QueryState({
  error,
  loading,
  retry,
  message,
}: {
  error?: unknown;
  loading?: boolean;
  retry?: () => void;
  message?: string;
}) {
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="panel my-6 flex flex-col items-center justify-center gap-4 p-10 text-center max-w-lg mx-auto bg-white/95 backdrop-blur border border-slate-200/80 shadow-sm rounded-2xl"
      >
        <ModernSpinner size="lg" glow={true} />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800 tracking-tight">
            {message || "Loading your workspace…"}
          </p>
          <p className="text-xs text-slate-500">
            Retrieving records from the cloud database
          </p>
        </div>
        {/* Shimmer progress beam */}
        <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden relative mt-1">
          <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full animate-shimmer" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="panel my-6 flex flex-col items-center gap-3 p-8 text-center max-w-lg mx-auto border border-rose-200 bg-rose-50/40 rounded-2xl shadow-sm"
      >
        <div className="p-3 bg-rose-100/80 rounded-xl text-rose-600 shadow-sm">
          <AlertCircle size={24} />
        </div>
        <p className="text-sm font-semibold text-rose-950">
          Something went wrong
        </p>
        <p className="text-xs text-rose-700 max-w-sm">
          {errorMessage(error, "Could not load this page.")}
        </p>
        {retry && (
          <button
            className="pos-button mt-2 inline-flex items-center gap-2 !bg-rose-600 hover:!bg-rose-700 shadow-sm"
            onClick={retry}
          >
            <RefreshCw size={14} />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="panel my-6 flex flex-col items-center gap-3 p-10 text-center max-w-lg mx-auto rounded-2xl border border-slate-200"
    >
      <div className="p-3 bg-slate-100 rounded-xl text-slate-400">
        <Inbox size={24} />
      </div>
      <p className="text-sm font-medium text-slate-600">
        {message || "No records found yet."}
      </p>
    </div>
  );
}

export function Pagination({
  page,
  lastPage,
  onChange,
}: {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-600">
      <span>
        Page {page} of {Math.max(1, lastPage)}
      </span>
      <div className="flex gap-2">
        <button
          className="pos-button-secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="pos-button-secondary"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
