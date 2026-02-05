import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScriptDisplayProps {
  script: string;
  scriptSource?: string;
  diagnosis?: {
    gate?: string;
    line?: string;
    theme?: string;
  };
  severity?: string;
}

export function ScriptDisplay({
  script,
  scriptSource = "deterministic",
  diagnosis,
  severity,
}: ScriptDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Inversion Script</CardTitle>
          <div className="flex gap-2">
            {scriptSource === "ai-generated" && (
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                AI-Generated
              </Badge>
            )}
            {severity && (
              <Badge variant="outline">{severity}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnosis && (
          <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
            <h4 className="font-semibold">Diagnosis</h4>
            {diagnosis.gate && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Gate:</span>
                <span className="font-medium">{diagnosis.gate}</span>
              </div>
            )}
            {diagnosis.line && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Line:</span>
                <span className="font-medium">{diagnosis.line}</span>
              </div>
            )}
            {diagnosis.theme && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Theme:</span>
                <span className="font-medium">{diagnosis.theme}</span>
              </div>
            )}
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {script}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
