"use client";

import { useEffect, useRef, useState } from "react";
import { submitToWeb3Forms } from "@/lib/web3forms";

const REQUIREMENTS = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK / Duplex", "Modular Kitchen", "Wardrobe", "Other"];
const CITIES = ["Delhi", "Mumbai", "Pune", "Bengaluru"];

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ConsultForm() {
  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const phone = String(data.get("tel") || "");
    const email = String(data.get("email") || "");
    const requirement = data.getAll("requirement").map(String);

    if (!phone || !email || !city) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      await submitToWeb3Forms(
        `New Consultation Request — ${name || "Customer"} (${city})`,
        [
          `Name: ${name || "—"}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `City: ${city}`,
          `Requirement: ${requirement.length ? requirement.join(", ") : "—"}`
        ].join("\n"),
        "Duli Interiors — Consultation Form"
      );
      setStatus("sent");
      form.reset();
      setCity("");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <form className="consult-form" data-reveal="up" data-delay="100" onSubmit={onSubmit}>
      <p className="consult-form-eyebrow">Get Started</p>
      <h3 className="consult-form-title">Book A Free Visit</h3>

      <div className="consult-field">
        <label>Requirement</label>
        <div className="consult-checkbox-group">
          {REQUIREMENTS.map((r) => (
            <label className="consult-checkbox" key={r}>
              <input type="checkbox" name="requirement" value={r} />
              {r}
            </label>
          ))}
        </div>
      </div>

      <div className="consult-field">
        <label htmlFor="consult-name">Name</label>
        <input id="consult-name" name="name" type="text" autoComplete="name" placeholder="Your full name" />
      </div>

      <div className="consult-field">
        <label htmlFor="consult-phone">
          Phone No. <span className="consult-required">*</span>
        </label>
        <input id="consult-phone" name="tel" type="tel" autoComplete="tel" placeholder="Phone number" required />
      </div>

      <div className="consult-field">
        <label htmlFor="consult-email">
          Email <span className="consult-required">*</span>
        </label>
        <input id="consult-email" name="email" type="email" autoComplete="email" placeholder="Email address" required />
      </div>

      <div className="consult-field consult-field-city">
        <label htmlFor="consult-city-trigger">
          City <span className="consult-required">*</span>
        </label>
        <div className="consult-select" ref={selectRef}>
          <button
            id="consult-city-trigger"
            type="button"
            className={"consult-select-trigger" + (cityOpen ? " open" : "")}
            aria-haspopup="listbox"
            aria-expanded={cityOpen}
            onClick={() => setCityOpen((v) => !v)}
          >
            <span className={city ? "" : "consult-select-placeholder"}>{city || "Select your city"}</span>
            <ChevronDownIcon />
          </button>
          {cityOpen && (
            <ul className="consult-select-panel" role="listbox">
              {CITIES.map((c) => (
                <li
                  key={c}
                  role="option"
                  aria-selected={city === c}
                  className={"consult-select-option" + (city === c ? " selected" : "")}
                  onClick={() => {
                    setCity(c);
                    setCityOpen(false);
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button type="submit" className="btn-solid" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Submit Your Details"} <span aria-hidden="true">→</span>
      </button>
      {status === "sent" && <p className="consult-note">Thanks! A designer will call within 24 hours.</p>}
      {status === "error" && (
        <p className="consult-note" style={{ color: "#c0392b" }}>
          Please fill in phone, email and city, then try again.
        </p>
      )}
      {status === "idle" && <p className="consult-note">No spam. A designer will call within 24 hours.</p>}
    </form>
  );
}
