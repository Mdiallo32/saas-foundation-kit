import { Users, Briefcase, AlertTriangle, FileWarning, DollarSign, Activity } from "lucide-react";

export const dashboardStats = [
  {
    label: "Total Clients",
    value: "128",
    change: "+4 this month",
    icon: Users,
  },
  {
    label: "Active Matters",
    value: "24",
    change: "3 pending review",
    icon: Briefcase,
  },
  {
    label: "Budget at Risk",
    value: "6",
    change: "2 critical",
    icon: AlertTriangle,
  },
  {
    label: "Unpaid Provisions",
    value: "9",
    change: "$31,200 outstanding",
    icon: FileWarning,
  },
  {
    label: "Revenue (MTD)",
    value: "$84,320",
    change: "+12% vs last month",
    icon: DollarSign,
  },
  {
    label: "Team Utilization",
    value: "74%",
    change: "Target: 80%",
    icon: Activity,
  },
];

export const recentActivity = [
  {
    id: "1",
    action: "New matter opened",
    detail: "Smith v. Acme Corp — Commercial Litigation",
    user: "Sarah Chen",
    time: "12 min ago",
  },
  {
    id: "2",
    action: "Invoice sent",
    detail: "INV-2026-0412 — $8,500 to Meridian Holdings",
    user: "James Okafor",
    time: "1 hr ago",
  },
  {
    id: "3",
    action: "Client onboarded",
    detail: "Greenfield Ventures — Corporate Advisory",
    user: "Sarah Chen",
    time: "2 hr ago",
  },
  {
    id: "4",
    action: "Budget alert triggered",
    detail: "Project Atlas exceeded 90% budget threshold",
    user: "System",
    time: "3 hr ago",
  },
  {
    id: "5",
    action: "Document uploaded",
    detail: "NDA_Final_v3.pdf — Lakeshore Partners matter",
    user: "Emily Tran",
    time: "5 hr ago",
  },
  {
    id: "6",
    action: "Time entry logged",
    detail: "4.5 hrs — Research & drafting, Rivera Estate",
    user: "David Kimura",
    time: "Yesterday",
  },
];
