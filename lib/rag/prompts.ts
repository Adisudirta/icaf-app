export type CaseData = {
  caseName: string;
  incidentDate: string;
  investigatingOfficer: string;
  incidentLocation: string;
  incidentType: string;
  threatType: string;
  victimAction: string;
  outcome: string;
  context: string;
  analysisText?: string | null;
};

export const PROMPT_KEYS = [
  "law_context_prefix",
  "analysis_prompt",
  "document_prompt",
] as const;

export type PromptKey = (typeof PROMPT_KEYS)[number];

// ── Default templates ─────────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES: Record<PromptKey, string> = {
  law_context_prefix: `You are a legal analysis assistant specializing in Indonesian criminal law (KUHP/KUHAP).
Use the following Indonesian law excerpts as your primary reference.
Only cite articles that directly apply to the facts presented.

=== UNDANG-UNDANG REFERENCE ===
{{chunks}}
=== END REFERENCE ===`,

  analysis_prompt: `Analyze this criminal case and identify applicable Indonesian law articles:

Case Name: {{caseName}}
Incident Date: {{incidentDate}}
Investigating Officer: {{investigatingOfficer}}
Location: {{incidentLocation}}
Incident Type: {{incidentType}}
Threat Type: {{threatType}}
Victim Action: {{victimAction}}
Outcome: {{outcome}}
Case Context: {{context}}

Provide:
1. Applicable law articles with article numbers
2. Legal reasoning for each article
3. Overall legal assessment and recommended charges`,

  document_prompt: `Generate a formal BAP (Berita Acara Pemeriksaan) document in Indonesian based on:

CASE DATA:
- Nama Perkara: {{caseName}}
- Tanggal Kejadian: {{incidentDate}}
- Penyidik: {{investigatingOfficer}}
- Lokasi: {{incidentLocation}}
- Jenis Kejadian: {{incidentType}}
- Jenis Ancaman: {{threatType}}
- Tindakan Korban: {{victimAction}}
- Hasil: {{outcome}}
- Uraian Singkat: {{context}}

HASIL ANALISIS HUKUM:
{{analysisText}}

Format the document as an official Indonesian police investigation report (BAP) with:
- Header (Kop Surat)
- Identitas perkara
- Uraian kejadian
- Dasar hukum yang berlaku
- Kesimpulan dan rekomendasi
- Footer dengan tanda tangan`,
};

export const PROMPT_LABELS: Record<PromptKey, string> = {
  law_context_prefix: "System Prefix (Konteks Hukum)",
  analysis_prompt: "Prompt Analisis",
  document_prompt: "Prompt Dokumen BAP",
};

export const PROMPT_VARS: Record<PromptKey, string[]> = {
  law_context_prefix: ["{{chunks}}"],
  analysis_prompt: [
    "{{caseName}}", "{{incidentDate}}", "{{investigatingOfficer}}",
    "{{incidentLocation}}", "{{incidentType}}", "{{threatType}}",
    "{{victimAction}}", "{{outcome}}", "{{context}}",
  ],
  document_prompt: [
    "{{caseName}}", "{{incidentDate}}", "{{investigatingOfficer}}",
    "{{incidentLocation}}", "{{incidentType}}", "{{threatType}}",
    "{{victimAction}}", "{{outcome}}", "{{context}}", "{{analysisText}}",
  ],
};

// ── Interpolation ─────────────────────────────────────────────────────────────

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ── Builders (accept optional DB-fetched template, fall back to defaults) ──────

// Deterministic prefix — identical template + chunks = prompt cache hit (CAG)
export function buildLawContextPrefix(chunks: string[], template?: string | null): string {
  const tpl = template ?? DEFAULT_TEMPLATES.law_context_prefix;
  const formatted = chunks.map((c, i) => `[Excerpt ${i + 1}]\n${c}`).join("\n\n");
  return interpolate(tpl, { chunks: formatted });
}

export function buildAnalysisPrompt(caseData: CaseData, template?: string | null): string {
  const tpl = template ?? DEFAULT_TEMPLATES.analysis_prompt;
  return interpolate(tpl, {
    caseName: caseData.caseName,
    incidentDate: caseData.incidentDate,
    investigatingOfficer: caseData.investigatingOfficer,
    incidentLocation: caseData.incidentLocation,
    incidentType: caseData.incidentType,
    threatType: caseData.threatType,
    victimAction: caseData.victimAction,
    outcome: caseData.outcome,
    context: caseData.context,
  });
}

export function buildDocumentPrompt(
  caseData: CaseData,
  analysisText: string,
  template?: string | null
): string {
  const tpl = template ?? DEFAULT_TEMPLATES.document_prompt;
  return interpolate(tpl, {
    caseName: caseData.caseName,
    incidentDate: caseData.incidentDate,
    investigatingOfficer: caseData.investigatingOfficer,
    incidentLocation: caseData.incidentLocation,
    incidentType: caseData.incidentType,
    threatType: caseData.threatType,
    victimAction: caseData.victimAction,
    outcome: caseData.outcome,
    context: caseData.context,
    analysisText,
  });
}
