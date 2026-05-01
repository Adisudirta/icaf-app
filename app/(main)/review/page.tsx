"use client";

import { Card, CardContent } from "@/components/ui/card";
import Stepper from "@/components/layout/stepper";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";

export default function ReviewPage() {
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
        const res = await fetch(`/api/cases/${caseId}/document`, {
          method: "POST",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to generate document.");
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith('0:"')) {
              const text = JSON.parse(line.slice(2));
              setContent((prev) => prev + text);
            }
          }
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
        Review Document
      </h2>

      <Stepper currentStep={3} />

      <Card className="mt-6">
        <CardContent className="p-6">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : isLoading && !content ? (
            <div className="border-card-foreground/10 h-64 rounded-md border bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--card-foreground)10%,transparent),color-mix(in_oklab,var(--card-foreground)10%,transparent)_1px,var(--card)_2px,var(--card)_15px)]" />
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed font-mono">
              {content}
              {isLoading && (
                <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isDone && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Document
          </Button>
        </div>
      )}
    </>
  );
}
