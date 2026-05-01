"use client";

import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  errorMessage?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      file: f,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUpload() {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" } : f
      )
    );

    const formData = new FormData();
    pending.forEach((f) => formData.append("files", f.file));

    try {
      const res = await fetch("/api/rag/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" ? { ...f, status: "done" } : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", errorMessage: "Upload failed" }
            : f
        )
      );
    }
  }

  const hasPending = files.some((f) => f.status === "pending");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Document Upload</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload documents to be processed through the RAG pipeline.
        </p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors select-none ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-foreground/15 bg-card hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <Upload className="size-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            PDF, DOCX, TXT supported
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg bg-card ring-1 ring-foreground/10 px-4 py-3"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
              </div>
              {f.status === "uploading" && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Processing…
                </span>
              )}
              {f.status === "done" && (
                <CheckCircle className="size-4 text-green-500 shrink-0" />
              )}
              {f.status === "error" && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="size-4 text-destructive shrink-0" />
                  <span className="text-xs text-destructive">{f.errorMessage}</span>
                </div>
              )}
              {(f.status === "pending" || f.status === "error") && (
                <button
                  onClick={() => removeFile(f.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasPending && (
        <Button onClick={handleUpload} className="self-end">
          <Upload className="size-4" />
          Upload {files.filter((f) => f.status === "pending").length} file
          {files.filter((f) => f.status === "pending").length > 1 ? "s" : ""}
        </Button>
      )}
    </main>
  );
}
