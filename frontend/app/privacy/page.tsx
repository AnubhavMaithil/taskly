import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "../../components/legal-page-shell";
import { Button } from "../../components/ui/button";

export const metadata: Metadata = {
  title: "Privacy | Taskly",
  description: "Privacy policy for using Taskly."
};

const sections = [
  {
    heading: "What We Collect",
    paragraphs: [
      "Taskly stores the information needed to operate your account and your workspace, including your name, email address, encrypted password, and the tasks you create.",
      "We also process technical information required to run the product securely, such as authentication tokens, request metadata, and cache entries used to improve performance."
    ]
  },
  {
    heading: "How Information Is Used",
    paragraphs: [
      "Your information is used to authenticate you, show you your own tasks, and support the day-to-day operation of the application.",
      "We may use operational data to monitor reliability, troubleshoot issues, and improve the quality and performance of the product."
    ]
  },
  {
    heading: "How Data Is Stored",
    paragraphs: [
      "Account and task data are stored in the application database. Redis may temporarily store cached task lists to improve response times, but cache entries are refreshed and invalidated when your tasks change.",
      "Authentication is handled using signed tokens and protected cookies or bearer tokens depending on the request flow."
    ]
  },
  {
    heading: "Sharing and Disclosure",
    paragraphs: [
      "We do not sell your personal information. Data may only be shared with infrastructure providers or service partners that are necessary to host, secure, and operate the application.",
      "We may also disclose information if required by law or to protect the security and integrity of the service."
    ]
  },
  {
    heading: "Your Choices",
    paragraphs: [
      "You can stop using the service at any time. If account deletion or data export workflows are later added, this policy should be updated to describe them clearly.",
      "If you believe information is inaccurate or you have a privacy concern, contact the team so the issue can be reviewed."
    ]
  }
] as const;

const highlights = [
  "We store the account and task data needed to run the product.",
  "Redis is used as a cache layer, not as the system of record.",
  "We do not sell your information.",
  "Operational data may be used for reliability and security monitoring."
] as const;

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy Policy"
      title="A readable overview of how Taskly handles data."
      intro="This page explains what information the app uses, why it is processed, and how infrastructure components such as MongoDB, Redis, and authentication tokens fit into the product."
      updatedAt="April 9, 2026"
      sections={[...sections]}
      highlights={[...highlights]}
    >
      <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-[#dbe3e7] bg-[#f9fbfc] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-manrope text-xl font-bold text-on-surface">Need the usage rules too?</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            The terms page explains account responsibilities, acceptable use, and service expectations.
          </p>
        </div>
        <Button asChild className="rounded-full px-5">
          <Link href="/terms">Read Terms</Link>
        </Button>
      </div>
    </LegalPageShell>
  );
}
