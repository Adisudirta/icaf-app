export type CaseData = {
  caseNumber: string;
  incidentDate: string;
  investigatingOfficer: string;
  incidentLocation: string;
  incidentType: string;
  threatLevel: string;
  victimAction: string;
  suspectCondition: string;
  victimCondition: string;
  context: string;
};

// Deterministic prefix — identical output for same chunks = OpenAI prompt cache hit (CAG)
export function buildLawContextPrefix(chunks: string[]): string {
  return [
    "You are a legal analysis assistant specializing in Indonesian criminal law (KUHP/KUHAP).",
    "Use the following Indonesian law excerpts as your primary reference.",
    "Only cite articles that directly apply to the facts presented.",
    "",
    "=== UNDANG-UNDANG REFERENCE ===",
    ...chunks.map((chunk, i) => `[Excerpt ${i + 1}]\n${chunk}`),
    "=== END REFERENCE ===",
  ].join("\n");
}

export function buildAnalysisPrompt(caseData: CaseData): string {
  return `Analyze this criminal case and identify applicable Indonesian law articles:

Case Number: ${caseData.caseNumber}
Incident Date: ${caseData.incidentDate}
Investigating Officer: ${caseData.investigatingOfficer}
Location: ${caseData.incidentLocation}
Incident Type: ${caseData.incidentType}
Threat Level: ${caseData.threatLevel}
Victim Action: ${caseData.victimAction}
Suspect Condition: ${caseData.suspectCondition}
Victim Condition: ${caseData.victimCondition}
Case Context: ${caseData.context}

Provide:
1. Applicable law articles with article numbers
2. Legal reasoning for each article
3. Overall legal assessment and recommended charges`;
}

export function buildDocumentPrompt(
  caseData: CaseData,
  analysisText: string
): string {
  return `Generate a formal BAP (Berita Acara Pemeriksaan) document in Indonesian based on:

CASE DATA:
- Nomor Perkara: ${caseData.caseNumber}
- Tanggal Kejadian: ${caseData.incidentDate}
- Penyidik: ${caseData.investigatingOfficer}
- Lokasi: ${caseData.incidentLocation}
- Jenis Kejadian: ${caseData.incidentType}
- Tingkat Ancaman: ${caseData.threatLevel}
- Tindakan Korban: ${caseData.victimAction}
- Kondisi Tersangka: ${caseData.suspectCondition}
- Kondisi Korban: ${caseData.victimCondition}
- Uraian Singkat: ${caseData.context}

HASIL ANALISIS HUKUM:
${analysisText}

Format the document as an official Indonesian police investigation report (BAP) with:
- Header (Kop Surat)
- Identitas perkara
- Uraian kejadian
- Dasar hukum yang berlaku
- Kesimpulan dan rekomendasi
- Footer dengan tanda tangan`;
}
