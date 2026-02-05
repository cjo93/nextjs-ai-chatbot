import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlueprintCardProps {
  id: string;
  name: string;
  birthDate: Date;
  humanDesign: {
    type?: string;
    profile?: string;
    authority?: string;
  };
  fidelityScore: "HIGH" | "MEDIUM" | "LOW";
  eventCount?: number;
}

const fidelityColors = {
  HIGH: "bg-green-500/10 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  LOW: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function BlueprintCard({
  id,
  name,
  birthDate,
  humanDesign,
  fidelityScore,
  eventCount = 0,
}: BlueprintCardProps) {
  return (
    <Link href={`/blueprint/${id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                {new Date(birthDate).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={fidelityColors[fidelityScore]} variant="secondary">
              {fidelityScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {humanDesign.type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{humanDesign.type}</span>
              </div>
            )}
            {humanDesign.profile && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile:</span>
                <span className="font-medium">{humanDesign.profile}</span>
              </div>
            )}
            {humanDesign.authority && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authority:</span>
                <span className="font-medium">{humanDesign.authority}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Events:</span>
              <span className="font-medium">{eventCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
