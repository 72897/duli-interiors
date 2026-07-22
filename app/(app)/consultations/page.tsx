import type { Metadata } from "next";
import { getConsultations, getProjects, getMyRoles, isStaffRole } from "@/lib/services";
import { PageHead, Panel, SectionTitle } from "@/components/app-ui";
import { ConsultationForm } from "@/components/consultation-form";
import { ConsultationSchedule } from "@/components/consultation-schedule";

export const metadata: Metadata = { title: "Consultations — Duli Interiors" };

export default async function ConsultationsPage() {
  const [consultations, projects, roles] = await Promise.all([
    getConsultations(),
    getProjects(),
    getMyRoles(),
  ]);
  const staff = isStaffRole(roles);
  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <PageHead
        eyebrow="Sourcing"
        title="Consultations"
        intro="Calls and site visits with your designer — book one below, then track them as a list or on the calendar."
      />

      {/* Real booking — writes a 'requested' consultation a designer confirms. */}
      <Panel className="mb-8 p-6">
        <SectionTitle>Book a consultation</SectionTitle>
        <div className="mt-2">
          <ConsultationForm projects={projectOptions} />
        </div>
      </Panel>

      {staff && consultations.length > 0 && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brass/10 px-3.5 py-1.5 text-[12px] font-medium text-brass">
          Staff view — consultations across all clients
        </p>
      )}

      {consultations.length === 0 ? (
        <p className="text-[13px] text-muted">
          No consultations yet — request one above and we&apos;ll confirm a time.
        </p>
      ) : (
        <ConsultationSchedule consultations={consultations} staff={staff} />
      )}
    </div>
  );
}
