import { AlertCircle, LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/pos";
export function QueryState({
  error,
  loading,
  retry,
}: {
  error?: unknown;
  loading?: boolean;
  retry?: () => void;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className="panel flex flex-col items-center gap-3 p-12 text-center"
    >
      {error ? (
        <AlertCircle className="text-rose-600" />
      ) : (
        <LoaderCircle className="animate-spin text-teal-700" />
      )}
      <p className="text-sm text-slate-700">
        {error
          ? errorMessage(error, "Could not load this page.")
          : loading
            ? "Loading your workspace…"
            : "No records yet."}
      </p>
      {!!error && retry && (
        <button className="pos-button" onClick={retry}>
          Try again
        </button>
      )}
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
