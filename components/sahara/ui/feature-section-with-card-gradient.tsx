import {
  FileText,
  MapPin,
  LayoutDashboard,
  Bell,
  Users,
  Shield,
  ClipboardList,
  Globe
} from "lucide-react";

import { BackgroundRippleEffect } from "@/components/sahara/ui/background-ripple-effect";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

export function FeaturesSectionWithCardGradient() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative group bg-neutral-50 p-4 rounded-xl overflow-hidden border border-neutral-200 transition-all duration-300 hover:shadow-xl hover:border-neutral-300 h-full flex flex-col items-start text-left"
            >
              <div className="absolute inset-0 z-0">
                <BackgroundRippleEffect
                  rows={8}
                  cols={8}
                  cellSize={40}
                />
              </div>

              <div className="relative z-20 pointer-events-none">
                <div className="mb-3 text-neutral-900 group-hover:scale-110 transition-transform duration-300">
                  <div className="h-6 w-6">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-md font-bold text-neutral-900 leading-tight">
                  <TranslatedText>{feature.title}</TranslatedText>
                </p>
                <p className="text-xs font-semibold text-orange-600 mt-1">
                  <TranslatedText>{feature.subtitle}</TranslatedText>
                </p>
                <p className="text-neutral-600 mt-2 text-[11px] font-normal leading-relaxed">
                  <TranslatedText>{feature.description}</TranslatedText>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Issue Reporting",
    subtitle: "File a complaint in seconds.",
    description: "Citizens can report civic issues — potholes, broken streetlights, garbage overflow, water supply failures — with a location, description, category, and priority level. No bureaucracy.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Live Location Tracking",
    subtitle: "Know exactly where the problem is.",
    description: "Each issue is pinned to a precise location. Municipal staff can navigate directly to the site. Admins see a full geographic view of all active civic complaints across their jurisdiction.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Admin Dashboard",
    subtitle: "Full control. Zero chaos.",
    description: "Administrators manage multiple organizations, triage incoming issues, invite staff members with role-based access, and track issue resolution rates — all from one clean interface.",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    title: "Real-Time Status Updates",
    subtitle: "Citizens are never left in the dark.",
    description: "Every status change — from Open to In Progress to Resolved — is instantly visible to the citizen who filed the report. Transparency built into every step of the resolution process.",
    icon: <Bell className="h-6 w-6" />,
  },
  {
    title: "Role-Based Access",
    subtitle: "Right people, right permissions.",
    description: "Admins, staff, and citizens each have clearly scoped roles. Staff only see their assigned issues. Admins control the entire organization. Citizens track only their own reports.",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Staff Assignment",
    subtitle: "Issues land on the right desk.",
    description: "Admins assign issues directly to qualified staff members. Staff receive their workload cleanly, add field notes and progress updates, and close issues when work is complete.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Activity Logs",
    subtitle: "Full audit trail. Full accountability.",
    description: "Every action on an issue — assignment, status change, note, resolution — is logged with a timestamp and actor. Municipal accountability has never been this clear.",
    icon: <ClipboardList className="h-6 w-6" />,
  },
  {
    title: "Multi-Organization Support",
    subtitle: "One platform, many municipalities.",
    description: "Parvah supports multiple civic organizations under a single admin. Whether it's Water Supply, Road Maintenance, or Cleanliness — each department operates independently with its own pipeline.",
    icon: <Globe className="h-6 w-6" />,
  },
];
