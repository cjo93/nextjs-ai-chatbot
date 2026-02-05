import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/defrag">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using DEFRAG ("the Service"), you accept and
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              DEFRAG is a personal development platform that combines Human
              Design, Gene Keys, and physics-based modeling to provide
              personalized guidance for life challenges. The Service includes:
            </p>
            <ul>
              <li>Human Design chart generation from birth data</li>
              <li>Vector state tracking and visualization</li>
              <li>Event logging and inversion script generation</li>
              <li>Experiment tracking and relationship analysis</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must create an
              account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h2>4. Subscription and Payment</h2>
            <p>
              DEFRAG offers both free and paid subscription tiers. Paid
              subscriptions are billed monthly or annually. You agree to:
            </p>
            <ul>
              <li>Provide accurate billing information</li>
              <li>Pay all fees according to your chosen plan</li>
              <li>Accept that fees are non-refundable except as required by law</li>
              <li>
                Understand that we may change pricing with 30 days notice
              </li>
            </ul>

            <h2>5. User Content and Data</h2>
            <p>
              You retain ownership of any content you submit to the Service,
              including birth data, event logs, and personal information. By
              using the Service, you grant us a license to:
            </p>
            <ul>
              <li>Store and process your data to provide the Service</li>
              <li>
                Use aggregated, anonymized data for service improvement
              </li>
              <li>Generate inversion scripts and guidance based on your data</li>
            </ul>

            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Service for any illegal or unauthorized purpose
              </li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>
                Interfere with or disrupt the Service or servers
              </li>
              <li>
                Share your account credentials with others
              </li>
              <li>
                Scrape or extract data from the Service without permission
              </li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and content, is
              protected by intellectual property rights. You may not:
            </p>
            <ul>
              <li>Copy, modify, or distribute the Service</li>
              <li>Reverse engineer or decompile the Service</li>
              <li>Use our trademarks without permission</li>
            </ul>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              DEFRAG MAKES NO GUARANTEES ABOUT:
            </p>
            <ul>
              <li>The accuracy or completeness of guidance provided</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Fitness for any particular purpose</li>
              <li>Results from using inversion scripts or guidance</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEFRAG SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>

            <h2>10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any
              time for violation of these Terms. You may cancel your
              subscription at any time through your account settings.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the
              Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which
              DEFRAG operates, without regard to conflict of law provisions.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:{" "}
              <a href="mailto:legal@defrag.app">legal@defrag.app</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
