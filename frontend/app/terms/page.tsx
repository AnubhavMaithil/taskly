import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "../../components/legal-page-shell";
import { Button } from "../../components/ui/button";

export const metadata: Metadata = {
  title: "Terms | Taskly",
  description: "Terms of service for using Taskly."
};

const sections = [
  {
    heading: "Using Taskly",
    paragraphs: [
      "Taskly is provided to help you create, organize, and manage your work. By using the application, you agree to use it in a lawful and responsible way.",
      "You are responsible for the accuracy of the information you store in your account and for the activity that happens under your credentials."
    ]
  },
  {
    heading: "Accounts and Access",
    paragraphs: [
      "You must provide accurate signup details and keep your login credentials secure. You should not share your account with other people or attempt to access data that does not belong to you.",
      "We may suspend or restrict access if we detect abuse, unauthorized access attempts, or activity that puts the service or other users at risk."
    ]
  },
  {
    heading: "Your Content",
    paragraphs: [
      "You keep ownership of the task content you create. By using the service, you allow Taskly to store, process, and display that content so the product can function as intended.",
      "You should avoid storing content that is unlawful, harmful, or unrelated to the intended use of the application."
    ]
  },
  {
    heading: "Availability and Changes",
    paragraphs: [
      "We may update, improve, or discontinue parts of the product over time. We may also update these terms when the service changes.",
      "Taskly is provided on an as-available basis. While we aim for reliability, uninterrupted availability cannot be guaranteed."
    ]
  },
  {
    heading: "Limits of Liability",
    paragraphs: [
      "Taskly is intended as a productivity tool. You are responsible for how you use the information stored in the app and for maintaining your own backups or business continuity where required.",
      "To the maximum extent allowed by law, we are not liable for indirect, incidental, or consequential losses arising from use of the service."
    ]
  }
] as const;

const highlights = [
  "Use the app lawfully and keep your credentials secure.",
  "You retain ownership of your task content.",
  "Service features may evolve over time as the product improves.",
  "The app is provided as available, without guaranteed uninterrupted uptime."
] as const;

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms of Service"
      title="Clear expectations for using Taskly."
      intro="These terms explain the basic rules for using the app, how account access works, and what responsibilities stay with the user."
      updatedAt="April 9, 2026"
      sections={sections}
      highlights={highlights}
    >
      <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-[#dbe3e7] bg-[#f9fbfc] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-manrope text-xl font-bold text-on-surface">Questions before you continue?</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Review the privacy policy as well so you understand how account and task data are handled.
          </p>
        </div>
        <Button asChild className="rounded-full px-5">
          <Link href="/privacy">Read Privacy Policy</Link>
        </Button>
      </div>
    </LegalPageShell>
  );
}
