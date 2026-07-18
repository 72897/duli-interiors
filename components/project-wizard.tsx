"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/projects/actions";
import {
  PROPERTY_TYPES,
  ROOM_TYPES,
  BUDGET_LEVELS,
  type CreateProjectValues,
} from "@/lib/projects/schema";

const CITIES = [
  "Delhi",
  "Mumbai",
  "Pune",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Gurugram",
  "Ahmedabad",
  "Kolkata",
  "Jaipur",
  "Other",
];

const STEPS = ["Property", "Rooms", "Budget", "Review"];

type Room = { room_type: string; room_name?: string };

const roomLabel = (v: string) =>
  ROOM_TYPES.find((r) => r.value === v)?.label ?? v;

const field =
  "h-11 w-full rounded-[9px] border border-stone bg-bg px-3 text-sm text-ink transition-colors duration-200 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";
const labelCls = "mb-1.5 block text-[13px] font-medium";
const alertCls =
  "mt-4 rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2.5 text-[13px] text-terracotta";

export function ProjectWizard({ initialSpace }: { initialSpace?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    property_type: "apartment",
    city: "",
    bhk: "",
    total_area: "",
    area_unit: "sqft",
    address_line: "",
    pincode: "",
    budget_level: "",
    rooms: (initialSpace
      ? [{ room_type: initialSpace, room_name: "" }]
      : []) as Room[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addRoom = (type: string) =>
    set("rooms", [...form.rooms, { room_type: type, room_name: "" }]);
  const removeRoom = (i: number) =>
    set(
      "rooms",
      form.rooms.filter((_, idx) => idx !== i),
    );
  const nameRoom = (i: number, name: string) =>
    set(
      "rooms",
      form.rooms.map((r, idx) => (idx === i ? { ...r, room_name: name } : r)),
    );

  const fail = (m: string) => {
    setStepError(m);
    return false;
  };
  const validateStep = (): boolean => {
    setStepError(null);
    if (step === 0) {
      if (form.name.trim().length < 2) return fail("Give your project a name.");
      if (!form.city) return fail("Select a city.");
      if (form.pincode && !/^\d{6}$/.test(form.pincode))
        return fail("Pincode must be 6 digits.");
    }
    if (step === 1 && form.rooms.length === 0)
      return fail("Add at least one room.");
    if (step === 2 && !form.budget_level) return fail("Choose a budget level.");
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createProject(form as unknown as CreateProjectValues);
      if (res.error) return setError(res.error);
      if (res.fieldErrors)
        return setError("Please review your details and try again.");
      router.push("/projects?created=" + (res.code ?? "1"));
      router.refresh();
    });
  };

  return (
    <div className="max-w-[760px]">
      {/* Stepper */}
      <ol className="my-6 flex flex-wrap gap-x-4 gap-y-2">
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={label}
              className={
                "flex items-center gap-2 text-[13px] " +
                (active
                  ? "font-semibold text-ink"
                  : done
                    ? "text-ink"
                    : "text-[#9a968d]")
              }
            >
              <span
                className={
                  "grid h-[26px] w-[26px] place-items-center rounded-full border text-xs " +
                  (active
                    ? "border-ink bg-ink text-bg"
                    : done
                      ? "border-olive bg-olive text-bg"
                      : "border-stone")
                }
              >
                {done ? "✓" : i + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="rounded-[14px] border border-stone bg-surface p-6 sm:p-8">
        {step === 0 && (
          <>
            <h2 className="text-xl">Property details</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Tell us about the home or space you’re designing.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="pw-name" className={labelCls}>
                  Project name
                </label>
                <input
                  id="pw-name"
                  className={field}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Our Bengaluru apartment"
                />
              </div>
              <div>
                <label htmlFor="pw-ptype" className={labelCls}>
                  Property type
                </label>
                <select
                  id="pw-ptype"
                  className={field}
                  value={form.property_type}
                  onChange={(e) => set("property_type", e.target.value)}
                >
                  {PROPERTY_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pw-city" className={labelCls}>
                  City
                </label>
                <select
                  id="pw-city"
                  className={field}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                >
                  <option value="">Select a city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pw-bhk" className={labelCls}>
                  Configuration
                </label>
                <input
                  id="pw-bhk"
                  className={field}
                  value={form.bhk}
                  onChange={(e) => set("bhk", e.target.value)}
                  placeholder="e.g. 3 BHK"
                />
              </div>
              <div>
                <label htmlFor="pw-area" className={labelCls}>
                  Approx. area
                </label>
                <input
                  id="pw-area"
                  className={field}
                  value={form.total_area}
                  onChange={(e) => set("total_area", e.target.value)}
                  placeholder="e.g. 1200"
                  inputMode="decimal"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pw-addr" className={labelCls}>
                  Address (optional)
                </label>
                <input
                  id="pw-addr"
                  className={field}
                  value={form.address_line}
                  onChange={(e) => set("address_line", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pw-pin" className={labelCls}>
                  Pincode (optional)
                </label>
                <input
                  id="pw-pin"
                  className={field}
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl">Rooms</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Add the rooms you want designed. You can name them.
            </p>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className="cursor-pointer rounded-full border border-stone bg-bg px-3.5 py-2 text-[13px] transition-colors duration-200 hover:border-olive"
                  onClick={() => addRoom(r.value)}
                >
                  + {r.label}
                </button>
              ))}
            </div>
            <div className="mt-[18px] flex flex-col gap-2.5">
              {form.rooms.map((room, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-[10px] border border-stone py-2 pl-3.5 pr-2"
                >
                  <span className="min-w-[120px] text-[13.5px] font-medium">
                    {roomLabel(room.room_type)}
                  </span>
                  <input
                    className="h-[38px] flex-1 rounded-lg border border-stone bg-bg px-2.5 text-[13.5px] focus:border-olive focus:outline-none"
                    value={room.room_name}
                    onChange={(e) => nameRoom(i, e.target.value)}
                    placeholder="Optional label (e.g. Master bedroom)"
                  />
                  <button
                    type="button"
                    className="cursor-pointer px-2.5 py-1.5 text-[13px] text-terracotta"
                    onClick={() => removeRoom(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {form.rooms.length === 0 && (
                <p className="text-sm text-muted">
                  No rooms added yet — pick from above.
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl">Budget</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Choose a level so we can tailor materials and estimates.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
              {BUDGET_LEVELS.map((b) => {
                const sel = form.budget_level === b.value;
                return (
                  <div
                    key={b.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => set("budget_level", b.value)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      set("budget_level", b.value)
                    }
                    className={
                      "cursor-pointer rounded-xl border p-4 transition-[border-color,box-shadow] duration-200 hover:border-olive " +
                      (sel
                        ? "border-olive ring-2 ring-olive/20"
                        : "border-stone")
                    }
                  >
                    <div className="font-semibold">{b.label}</div>
                    <div className="mt-1 text-[12.5px] text-muted">{b.hint}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl">Review</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Check everything looks right, then create your project.
            </p>
            <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2.5 text-sm">
              <dt className="text-muted">Project</dt>
              <dd>{form.name || "—"}</dd>
              <dt className="text-muted">Property</dt>
              <dd>
                {PROPERTY_TYPES.find((p) => p.value === form.property_type)
                  ?.label}
                {form.bhk ? ` · ${form.bhk}` : ""}
              </dd>
              <dt className="text-muted">City</dt>
              <dd>{form.city || "—"}</dd>
              <dt className="text-muted">Rooms</dt>
              <dd>
                {form.rooms.length
                  ? form.rooms
                      .map(
                        (r) =>
                          roomLabel(r.room_type) +
                          (r.room_name ? ` (${r.room_name})` : ""),
                      )
                      .join(", ")
                  : "—"}
              </dd>
              <dt className="text-muted">Budget</dt>
              <dd>
                {BUDGET_LEVELS.find((b) => b.value === form.budget_level)
                  ?.label ?? "—"}
              </dd>
            </dl>
            {error && <div className={alertCls}>{error}</div>}
          </>
        )}

        {stepError && step < 3 && <div className={alertCls}>{stepError}</div>}

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-full border border-stone px-[22px] py-2.5 text-sm transition-colors duration-200 hover:border-olive disabled:cursor-not-allowed disabled:opacity-40"
            onClick={back}
            disabled={step === 0 || pending}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-solid" onClick={next}>
              Continue <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-solid"
              onClick={submit}
              disabled={pending}
            >
              {pending ? "Creating…" : "Create project"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
