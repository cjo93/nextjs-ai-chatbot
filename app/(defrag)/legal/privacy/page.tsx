import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              DEFRAG ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our Service.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Account Information</h3>
            <ul>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3>2.2 Blueprint Data</h3>
            <ul>
              <li>Birth date, time, and location (coordinates)</li>
              <li>Timezone information</li>
              <li>Generated Human Design and Gene Keys data</li>
              <li>Calculated ephemeris data</li>
            </ul>

            <h3>2.3 Event and Usage Data</h3>
            <ul>
              <li>Event logs (severity, context, keywords)</li>
              <li>Inversion scripts and feedback</li>
              <li>Experiment data and outcomes</li>
              <li>Vector state snapshots</li>
              <li>Relationship synastry data</li>
            </ul>

            <h3>2.4 Technical Information</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage analytics and performance metrics</li>
            </ul>

            <h3>2.5 Payment Information</h3>
            <ul>
              <li>
                Payment processing handled by Stripe (we do not store full
                credit card numbers)
              </li>
              <li>Billing address and transaction history</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide and maintain the Service</li>
              <li>Generate Human Design charts and inversion scripts</li>
              <li>Track vector states and life events</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications</li>
              <li>Improve and optimize the Service</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. AI and Data Processing</h2>
            <p>
              For high-severity events (breakpoint, distortion, anomaly), we may
              use AI services (such as OpenAI) to generate enhanced inversion
              scripts. When this occurs:
            </p>
            <ul>
              <li>Your event context is sent to the AI provider</li>
              <li>Data is processed according to the provider's policies</li>
              <li>We do not share personally identifiable information</li>
              <li>AI-generated content is stored with your event</li>
            </ul>

            <h2>5. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>

            <h3>5.1 Service Providers</h3>
            <ul>
              <li>Stripe for payment processing</li>
              <li>Database hosting providers</li>
              <li>AI service providers for script generation</li>
              <li>Analytics and monitoring services</li>
            </ul>

            <h3>5.2 Legal Requirements</h3>
            <p>We may disclose information if required by:</p>
            <ul>
              <li>Court order or subpoena</li>
              <li>Legal process or government request</li>
              <li>Protection of our rights or safety</li>
              <li>Fraud investigation or prevention</li>
            </ul>

            <h3>5.3 Aggregated Data</h3>
            <p>
              We may share anonymized, aggregated data that cannot identify you
              individually for research and analytics purposes.
            </p>

            <h2>6. Data Security</h2>
            <p>We implement security measures including:</p>
            <ul>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Encrypted password storage</li>
              <li>Secure database access controls</li>
              <li>Regular security audits</li>
              <li>Limited employee access to personal data</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100%
              secure. We cannot guarantee absolute security.
            </p>

            <h2>7. Data Retention</h2>
            <ul>
              <li>
                Account data: Retained while your account is active
              </li>
              <li>
                Blueprint and event data: Retained until account deletion
              </li>
              <li>
                Payment records: Retained for 7 years for tax compliance
              </li>
              <li>
                Analytics data: Aggregated data retained indefinitely
              </li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@defrag.app">privacy@defrag.app</a>
            </p>

            <h2>9. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain your session</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve Service performance</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>

            <h2>10. Children's Privacy</h2>
            <p>
              The Service is not intended for users under 18 years of age. We do
              not knowingly collect data from children. If you believe a child
              has provided us with personal information, please contact us.
            </p>

            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              for such transfers.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by email or through the Service.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, contact us at:{" "}
              <a href="mailto:privacy@defrag.app">privacy@defrag.app</a>
            </p>

            <h2>14. California Privacy Rights (CCPA)</h2>
            <p>California residents have additional rights under the CCPA:</p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access personal information</li>
              <li>Right to equal service and price</li>
            </ul>

            <h2>15. GDPR Compliance (EU Users)</h2>
            <p>If you are in the European Union, you have rights under GDPR:</p>
            <ul>
              <li>Right to access your data</li>
              <li>Right to rectification</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
