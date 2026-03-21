NEU VirtuLib: Digital Visitor Management System
NEU VirtuLib is an elite, real-time visitor tracking and facility management platform designed exclusively for New Era University. This system replaces traditional paper logbooks with a secure, digital gateway for students, faculty, and administrators, optimizing campus traffic and resource management.

🚀 Key Features
🏛️ For Visitors (Students & Faculty)
Instant Check-in: A seamless digital entry system for the University Library and various Dean’s Offices.

Institutional Verification: Secure SSO-style access restricted exclusively to official @neu.edu.ph email domains.

Role-Based Profiles: Automated identity designation (Student, Teacher, or Staff) based on institutional credentials.

Aesthetic User Interface: A modern, tactile experience featuring high-contrast "Bento-style" cards and glassmorphism effects.

🛡️ For Administrators (Staff Portal)
Real-time Analytics Dashboard: A centralized command center providing live visualizations of facility usage and visitor demographics.

Granular Data Filtering: Advanced filtering capabilities allowing administrators to sort statistics by College Department, Visitor Type, and Reason for Visit.

Active Session Monitoring: Real-time tracking of currently logged-in users across mobile and desktop platforms powered by Firestore onSnapshot.

Comprehensive Audit Logs: A searchable and exportable history of all campus check-ins for security and reporting.

🤖 Intelligence & Security
AI-Powered Insights: Integrated with Google Genkit (Gemini 2.5 Flash) to automatically generate usage reports and identify peak traffic patterns.

Administrative RBAC: Hardcoded administrative privileges for authorized personnel, specifically configured for jcesperanza@neu.edu.ph.

Secure Authentication: Enhanced two-step verification for staff members to ensure data integrity.

🛠️ Tech Stack
Framework: Next.js 15 (App Router with Turbopack)

UI & Styling: React, Tailwind CSS, ShadCN UI

Backend & Database: Firebase Firestore (Real-time synchronization)

Authentication: Firebase Authentication

Generative AI: Google Genkit (Gemini 2.5 Flash)

Icons: Lucide React

📁 Project Structure
src/app: Next.js App Router containing portal-specific layouts and page logic.

src/ai: Genkit flows and AI prompt definitions for automated data analysis.

src/firebase: Client-side Firebase configuration and custom hooks (useCollection, useDoc).

src/lib: Shared utilities, TypeScript interfaces, and global state management.

src/components: Reusable UI components, including the dashboard stat cards and check-in forms.

🔗 Live Development Demo Check out the live environment here: https://sampolkoeto.vercel.app/
                                               Alternate link: https://sl1nk.com/qek0M
