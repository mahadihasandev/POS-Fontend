export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const value = error as {
    data?: { message?: string; errors?: Record<string, string[]> };
    message?: string;
    error?: string;
  };
  const field =
    value?.data?.errors && Object.values(value.data.errors).flat()[0];
  return (
    field || value?.data?.message || value?.message || value?.error || fallback
  );
}
export function money(value: string | number): string {
  return Number(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function downloadCsv(
  filename: string,
  rows: Record<string, unknown>[],
): void {
  if (!rows.length) return;
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const cell = (value: unknown) => {
    const raw =
      value == null
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    const safe = /^[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const content = [
    headers.map(cell).join(","),
    ...rows.map((row) => headers.map((key) => cell(row[key])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
