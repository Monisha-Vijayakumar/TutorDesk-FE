import {
  CalendarClock,
  History,
  KeyRound,
  LayoutDashboard,
  Layers,
  MessageCircle,
  ReceiptText,
  Smartphone,
  UserPlus,
  Users,
} from "lucide-react"
import type { LandingFaq, LandingFeature, LandingHighlight, LandingNavLink, LandingStep } from "@/interfaces/landing"

// Copy of the landing (home) page — REQUIREMENTS §5.1. It only promises what TutorDesk does today:
// no parent portal, automatic reminders, online payments or attendance until they ship. Nothing about
// student logins either while the student portal is on hold (the login code itself stays).

export const LANDING_SECTION_IDS = {
  DEMO: "demo",
  FEATURES: "features",
  HOW_IT_WORKS: "how-it-works",
  FAQ: "faq",
} as const

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { label: "Features", sectionId: LANDING_SECTION_IDS.FEATURES },
  { label: "How it works", sectionId: LANDING_SECTION_IDS.HOW_IT_WORKS },
  { label: "Demo", sectionId: LANDING_SECTION_IDS.DEMO },
  { label: "FAQ", sectionId: LANDING_SECTION_IDS.FAQ },
]

export const LANDING_PAIN_POINTS = [
  "A notebook or spreadsheet that's never quite up to date.",
  "\"Did Ravi's father pay the second half?\" — and no record to check.",
  "Awkward reminder messages, typed out one parent at a time.",
  "No clear picture of how much came in this month, and how much is still out there.",
]

export const LANDING_HIGHLIGHTS: LandingHighlight[] = [
  {
    title: "Fees and one-click WhatsApp reminders",
    description: "Every student gets a fee for every month, worked out for you — including a fair, pro-rated first month.",
    icon: MessageCircle,
    tone: "blue",
    points: [
      "Record each payment with its date and method — Cash, UPI, Bank Transfer or Card. Part payments add up on their own.",
      "Paid, Partially Paid, Pending or Overdue is worked out for you, so you see who's late at a glance.",
      "Tap Send Reminder: WhatsApp opens with the parent's number and a polite message with the amount and due date. You just press Send.",
      "Payment History keeps every payment and every reminder, so \"I already paid\" is settled in seconds.",
    ],
  },
  {
    title: "Your month at a glance",
    description: "Open TutorDesk in the morning and the answers are waiting.",
    icon: LayoutDashboard,
    tone: "green",
    points: [
      "Collected and outstanding this month, with the share of fees already in.",
      "Money coming in day by day this month, or month by month over any period up to two years.",
      "How much is paid, partly paid, pending and overdue — and how many students are in each.",
      "Students per batch, so you know which batches have room.",
    ],
  },
]

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: "Students",
    description: "Class, subjects, monthly fee and the parent's WhatsApp number — searchable by name or Student ID.",
    icon: Users,
    tone: "blue",
  },
  {
    title: "Batch Management",
    description: "Group students into batches with a start and end time. A student can be in more than one.",
    icon: Layers,
    tone: "magenta",
  },
  {
    title: "History you keep",
    description: "When a student leaves, they leave your lists — their payment history stays on record.",
    icon: History,
    tone: "orange",
  },
  {
    title: "Profile and password",
    description: "Keep your center's details up to date and change your password whenever you like.",
    icon: KeyRound,
    tone: "green",
  },
  {
    title: "Works on your phone",
    description: "Built for the phone in your hand between classes — and just as good on a laptop.",
    icon: Smartphone,
    tone: "blue",
  },
]

export const LANDING_STEPS: LandingStep[] = [
  {
    title: "Add your students",
    description: "Their class, subjects, monthly fee and the parent's WhatsApp number. Each one gets a Student ID automatically.",
    icon: UserPlus,
    tone: "blue",
  },
  {
    title: "Record payments as they come in",
    description: "TutorDesk works out each month's fee, what's been paid and what's still due — and marks who's overdue.",
    icon: ReceiptText,
    tone: "green",
  },
  {
    title: "Send reminders in one click",
    description: "Tap Send Reminder, check the message WhatsApp opens with, and press Send. Every reminder is logged.",
    icon: CalendarClock,
    tone: "orange",
  },
]

export const LANDING_FAQS: LandingFaq[] = [
  {
    question: "Does TutorDesk send WhatsApp messages automatically?",
    answer: "No — on purpose. TutorDesk opens WhatsApp with the reminder already written; you check it and press Send. Nothing reaches a parent without you seeing it first.",
  },
  {
    question: "Do I need the WhatsApp Business API or pay per message?",
    answer: "No. Reminders open in your own WhatsApp, so there are no message fees.",
  },
  {
    question: "Can parents pay online through TutorDesk?",
    answer: "Not yet. You record payments however they reach you — cash, UPI, bank transfer or card — and TutorDesk keeps the books.",
  },
  {
    question: "What's the difference between Pending and Overdue?",
    answer: "Both mean money is still due. Pending means the due date hasn't come yet; Overdue means it has passed.",
  },
  {
    question: "How do I get an account?",
    answer: "TutorDesk is set up for your center by us — there's no public sign-up.",
  },
]
