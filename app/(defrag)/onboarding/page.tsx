"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { createBlueprint } from "@/app/(defrag)/actions";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const steps = [
  { id: 1, title: "Your Name", description: "What should we call you?" },
  { id: 2, title: "Birth Date & Time", description: "When were you born?" },
  { id: 3, title: "Birth Location", description: "Where were you born?" },
  { id: 4, title: "Timezone", description: "Confirm your birth timezone" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  const progress = (currentStep / steps.length) * 100;

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return birthDate && birthTime;
      case 3:
        return latitude && longitude;
      case 4:
        return timezone;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const birthDateTime = `${birthDate}T${birthTime}`;

      const result = await createBlueprint({
        name,
        birthDate: birthDateTime,
        birthLatitude: parseFloat(latitude),
        birthLongitude: parseFloat(longitude),
        birthTimezone: timezone,
        birthLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });

      if (result.success && result.blueprintId) {
        router.push(`/defrag/blueprint/${result.blueprintId}`);
      } else {
        throw new Error("Failed to create blueprint");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-muted/50">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Birth Date & Time */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthTime">Birth Time</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If you don't know your exact birth time, use noon (12:00)
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Birth Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="40.7128"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-74.0060"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can find coordinates using Google Maps or similar services
                </p>
              </div>
            )}

            {/* Step 4: Timezone */}
            {currentStep === 4 && (
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time (US)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (US)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (US)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (US)
                    </SelectItem>
                    <SelectItem value="America/Anchorage">
                      Alaska Time (US)
                    </SelectItem>
                    <SelectItem value="Pacific/Honolulu">
                      Hawaii Time (US)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      London (GMT/BST)
                    </SelectItem>
                    <SelectItem value="Europe/Paris">
                      Central Europe (CET)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">
                      Sydney (AEDT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={!validateStep()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Blueprint...
                    </>
                  ) : (
                    <>
                      Create Blueprint
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
