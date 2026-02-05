"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId?: string;
  currentTier?: boolean;
  popular?: boolean;
  onSubscribe?: (priceId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  priceId,
  currentTier = false,
  popular = false,
  onSubscribe,
  isLoading = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        popular && "border-primary shadow-lg"
      )}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {currentTier ? (
          <Button disabled className="w-full" variant="outline">
            Current Plan
          </Button>
        ) : priceId && onSubscribe ? (
          <Button
            onClick={() => onSubscribe(priceId)}
            disabled={isLoading}
            className="w-full"
            variant={popular ? "default" : "outline"}
          >
            {isLoading ? "Processing..." : "Subscribe"}
          </Button>
        ) : (
          <Button disabled className="w-full" variant="outline">
            Contact Sales
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
