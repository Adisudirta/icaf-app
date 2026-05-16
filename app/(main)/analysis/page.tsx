"use client";

import { Card, CardContent } from "@/components/ui/card";
import Stepper from "@/components/layout/stepper";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!caseId || startedRef.current) return;
    startedRef.current = true;
    setIsLoading(true);

    const run = async () => {
      try {
        const existing = await fetch(`/api/cases/${caseId}`);
        if (existing.ok) {
          const data = await existing.json();
          if (data.analysisText) {
            setContent(data.analysisText);
            setIsDone(true);
            return;
          }
        }

        const res = await fetch(`/api/cases/${caseId}/analysis`, {
          method: "POST",
        });

        if (!res.ok) {
          setError("Failed to start analysis. Please try again.");
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setContent((prev) => prev + chunk);
        }

        setIsDone(true);
      } catch {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [caseId]);

  if (!caseId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No case selected.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[36px] font-semibold text-[#191C1E] mb-6">
        AI Legal Analysis
      </h2>

      <Stepper currentStep={2} />

      <Card className="mt-6">
        <CardContent className="p-6">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : isLoading && !content ? (
            <div className="py-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative size-4 shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Menganalisis kasus, harap tunggu…</span>
              </div>
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-muted rounded-md w-2/5" />
                <div className="space-y-2.5">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-[96%]" />
                  <div className="h-3 bg-muted rounded w-[89%]" />
                  <div className="h-3 bg-muted rounded w-[93%]" />
                </div>
                <div className="h-4 bg-muted rounded-md w-1/3" />
                <div className="space-y-2.5 pl-4">
                  <div className="h-3 bg-muted rounded w-[85%]" />
                  <div className="h-3 bg-muted rounded w-[78%]" />
                  <div className="h-3 bg-muted rounded w-[81%]" />
                  <div className="h-3 bg-muted rounded w-[70%]" />
                </div>
                <div className="h-4 bg-muted rounded-md w-2/5" />
                <div className="space-y-2.5">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-[91%]" />
                  <div className="h-3 bg-muted rounded w-[64%]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-ol:list-decimal prose-ul:list-disc">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isLoading && (
                <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isDone && (
        <div className="mt-6 flex justify-end">
          <Button onClick={() => router.push(`/review?caseId=${caseId}`)}>
            Continue to Review →
          </Button>
        </div>
      )}
    </>
  );
}
