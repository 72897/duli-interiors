import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel, Pill, shortDate } from "@/components/app-ui";

export const metadata: Metadata = { title: "Projects — Admin — Duli Interiors" };

type Row = {
  id: string;
  code: string;
  name: string;
  status: string;
  city: string | null;
  created_at: string;
};

const TONE: Record<string, "neutral" | "brass" | "olive" | "terracotta"> = {
  draft: "neutral",
  submitted: "brass",
  in_design: "brass",
  concepts_ready: "olive",
  revision_requested: "terracotta",
  approved: "olive",
  completed: "olive",
};

export default async function AdminProjectsPage() {
  const supabase = createSupabaseServerClient();

  const { data } = supabase
    ? await supabase
        .from("projects")
        .select("id, code, name, status, city, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] as Row[] };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">Projects</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Every project across the platform, newest first.
      </p>

      <Panel className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <thead>
              <tr className="border-b border-ink/[0.07] text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">City</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No projects yet.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="border-b border-ink/[0.05] last:border-0">
                    <td className="px-5 py-3 font-mono text-[12px] text-muted">
                      {p.code}
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={`/projects/${p.id}`}
                        className="cursor-pointer text-olive underline underline-offset-2"
                      >
                        {p.name}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-muted">{p.city || "—"}</td>
                    <td className="px-3 py-3">
                      <Pill tone={TONE[p.status] ?? "neutral"}>
                        {p.status.replace(/_/g, " ")}
                      </Pill>
                    </td>
                    <td className="px-5 py-3 text-muted">{shortDate(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
