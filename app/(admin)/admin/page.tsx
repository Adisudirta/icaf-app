"use client";

import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Save,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_TEMPLATES,
  PROMPT_KEYS,
  PROMPT_LABELS,
  PROMPT_VARS,
  type PromptKey,
} from "@/lib/rag/prompts";

// ── Types ─────────────────────────────────────────────────────────────────────

type DocumentStatus = "pending" | "processing" | "ready" | "failed";

type CurrentDocument = {
  id: string;
  fileName: string;
  chunkCount: number;
  status: DocumentStatus;
  uploadedAt: string;
};

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "error"; message: string };

type SaveState = "idle" | "saving" | "saved" | "error";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  pending: "Menunggu",
  processing: "Memproses",
  ready: "Siap",
  failed: "Gagal",
};

const POLLING_INTERVAL = 3000;

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "documents" | "prompts";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {(["documents", "prompts"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab === "documents" ? "Dokumen Hukum" : "Template Prompt"}
          </button>
        ))}
      </div>

      {activeTab === "documents" ? <DocumentsTab /> : <PromptsTab />}
    </main>
  );
}

// ── Documents tab ─────────────────────────────────────────────────────────────

function DocumentsTab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ phase: "idle" });
  const [currentDoc, setCurrentDoc] = useState<CurrentDocument | null | undefined>(undefined);
  const [showReplace, setShowReplace] = useState(false);

  const fetchCurrentDoc = useCallback(async () => {
    try {
      const res = await fetch("/api/documents/current", { cache: "no-store" });
      const data = await res.json();
      setCurrentDoc(data);
    } catch {
      // keep previous state on transient errors
    }
  }, []);

  useEffect(() => { fetchCurrentDoc(); }, [fetchCurrentDoc]);

  useEffect(() => {
    if (currentDoc?.status === "pending" || currentDoc?.status === "processing") {
      const id = setInterval(fetchCurrentDoc, POLLING_INTERVAL);
      return () => clearInterval(id);
    }
  }, [currentDoc?.status, fetchCurrentDoc]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploadState({ phase: "uploading" });
    const formData = new FormData();
    formData.append("files", selectedFile);
    try {
      const res = await fetch("/api/rag/ingest", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }
      setSelectedFile(null);
      setShowReplace(false);
      setUploadState({ phase: "idle" });
      await fetchCurrentDoc();
    } catch (err) {
      setUploadState({
        phase: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  const isProcessing = currentDoc?.status === "pending" || currentDoc?.status === "processing";

  if (currentDoc === undefined) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Memuat…
      </div>
    );
  }

  const showUploadZone = !currentDoc || showReplace || currentDoc.status === "failed";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Dokumen Hukum</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hanya satu dokumen yang dapat aktif. Mengunggah dokumen baru akan menggantikan yang lama.
        </p>
      </div>

      {currentDoc && (
        <div className="rounded-xl border bg-card px-5 py-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <FileText className="size-5 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentDoc.fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Diunggah {formatDate(currentDoc.uploadedAt)}
              </p>
            </div>
            <StatusBadge status={currentDoc.status} />
          </div>
          {currentDoc.status === "ready" && (
            <p className="text-xs text-muted-foreground">{currentDoc.chunkCount} bagian teks terindeks</p>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3 animate-spin" />
              Dokumen sedang diproses di latar belakang. Halaman ini akan diperbarui otomatis.
            </div>
          )}
          {currentDoc.status === "failed" && (
            <p className="text-xs text-destructive">Pemrosesan gagal. Unggah ulang dokumen untuk mencoba lagi.</p>
          )}
          {currentDoc.status === "ready" && !showReplace && (
            <Button variant="outline" size="sm" className="self-start" onClick={() => setShowReplace(true)}>
              Ganti Dokumen
            </Button>
          )}
        </div>
      )}

      {showUploadZone && (
        <div className="flex flex-col gap-3">
          {showReplace && (
            <p className="text-sm text-muted-foreground">
              Pilih dokumen baru. Dokumen lama akan dihapus secara otomatis setelah dokumen baru selesai diproses.
            </p>
          )}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors select-none ${
              dragging ? "border-primary bg-primary/5" : "border-foreground/15 bg-card hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <Upload className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Letakkan file di sini atau klik untuk memilih</p>
              <p className="text-xs text-muted-foreground mt-0.5">PDF didukung</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setSelectedFile(f);
                e.target.value = "";
              }}
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-3 rounded-lg bg-card ring-1 ring-foreground/10 px-4 py-3">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
              </div>
              {uploadState.phase === "uploading" && (
                <span className="text-xs text-muted-foreground animate-pulse">Mengunggah…</span>
              )}
            </div>
          )}
          {uploadState.phase === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {uploadState.message}
            </div>
          )}
          <div className="flex gap-2 self-end">
            {showReplace && (
              <Button
                variant="outline"
                onClick={() => { setShowReplace(false); setSelectedFile(null); setUploadState({ phase: "idle" }); }}
                disabled={uploadState.phase === "uploading"}
              >
                Batal
              </Button>
            )}
            <Button onClick={handleUpload} disabled={!selectedFile || uploadState.phase === "uploading"}>
              <Upload className="size-4" />
              {uploadState.phase === "uploading" ? "Mengunggah…" : "Unggah Dokumen"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Prompts tab ───────────────────────────────────────────────────────────────

function PromptsTab() {
  const [bodies, setBodies] = useState<Record<PromptKey, string>>({ ...DEFAULT_TEMPLATES });
  const [saveStates, setSaveStates] = useState<Record<PromptKey, SaveState>>({
    law_context_prefix: "idle",
    analysis_prompt: "idle",
    document_prompt: "idle",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/prompts")
      .then((r) => r.json())
      .then((data) => {
        setBodies((prev) => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  async function handleSave(key: PromptKey) {
    setSaveStates((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, body: bodies[key] }),
      });
      if (!res.ok) throw new Error();
      setSaveStates((s) => ({ ...s, [key]: "saved" }));
      setTimeout(() => setSaveStates((s) => ({ ...s, [key]: "idle" })), 2000);
    } catch {
      setSaveStates((s) => ({ ...s, [key]: "error" }));
    }
  }

  function handleReset(key: PromptKey) {
    setBodies((b) => ({ ...b, [key]: DEFAULT_TEMPLATES[key] }));
    setSaveStates((s) => ({ ...s, [key]: "idle" }));
  }

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Memuat…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Template Prompt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sesuaikan prompt yang digunakan untuk analisis hukum dan pembuatan dokumen BAP.
        </p>
      </div>

      {PROMPT_KEYS.map((key) => (
        <PromptEditor
          key={key}
          promptKey={key}
          label={PROMPT_LABELS[key]}
          variables={PROMPT_VARS[key]}
          value={bodies[key]}
          saveState={saveStates[key]}
          onChange={(v) => setBodies((b) => ({ ...b, [key]: v }))}
          onSave={() => handleSave(key)}
          onReset={() => handleReset(key)}
        />
      ))}
    </div>
  );
}

function PromptEditor({
  label,
  variables,
  value,
  saveState,
  onChange,
  onSave,
  onReset,
}: {
  promptKey: PromptKey;
  label: string;
  variables: string[];
  value: string;
  saveState: SaveState;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{label}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
          <Button size="sm" onClick={onSave} disabled={saveState === "saving"} className="gap-1.5">
            {saveState === "saving" ? (
              <RefreshCw className="size-3 animate-spin" />
            ) : (
              <Save className="size-3" />
            )}
            {saveState === "saving" ? "Menyimpan…" : saveState === "saved" ? "Tersimpan" : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {variables.map((v) => (
          <code
            key={v}
            className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground"
          >
            {v}
          </code>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm font-mono leading-relaxed resize-y outline-none focus:ring-2 focus:ring-ring"
      />

      {saveState === "error" && (
        <p className="text-xs text-destructive">Gagal menyimpan. Coba lagi.</p>
      )}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DocumentStatus }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
  if (status === "ready")
    return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="size-3" />{STATUS_LABEL.ready}</span>;
  if (status === "failed")
    return <span className={`${base} bg-red-100 text-red-700`}><AlertCircle className="size-3" />{STATUS_LABEL.failed}</span>;
  return <span className={`${base} bg-amber-100 text-amber-700`}><Clock className="size-3" />{STATUS_LABEL[status]}</span>;
}
