"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SeveritySlider } from "./SeveritySlider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Severity level mapping
function numericToSeverity(numeric: number): "signal" | "friction" | "breakpoint" | "distortion" | "anomaly" {
  if (numeric <= 2) return "signal";
  if (numeric <= 4) return "friction";
  if (numeric <= 6) return "breakpoint";
  if (numeric <= 8) return "distortion";
  return "anomaly";
}

interface EventFormProps {
  blueprintId: string;
  onSubmit: (data: {
    blueprintId: string;
    severity: "signal" | "friction" | "breakpoint" | "distortion" | "anomaly";
    severityNumeric: number;
    context: string;
    keywords?: string[];
  }) => Promise<void>;
  onSuccess?: () => void;
}

export function EventForm({ blueprintId, onSubmit, onSuccess }: EventFormProps) {
  const [severity, setSeverity] = useState(5);
  const [context, setContext] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const keywordArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      await onSubmit({
        blueprintId,
        severity: numericToSeverity(severity),
        severityNumeric: severity,
        context,
        keywords: keywordArray.length > 0 ? keywordArray : undefined,
      });

      // Reset form
      setContext("");
      setKeywords("");
      setSeverity(5);
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <SeveritySlider value={severity} onChange={setSeverity} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">What happened?</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the event in detail. Include emotions, circumstances, and any relevant context..."
              required
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">
              Keywords (optional)
              <span className="text-muted-foreground text-sm ml-2">
                Comma-separated
              </span>
            </Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="work, relationship, health, family..."
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Log Event"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
