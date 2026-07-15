"use client";

import { useEffect, useState } from "react";
import { submitToWeb3Forms } from "@/lib/web3forms";

type RoomId = "bedroom" | "living" | "kitchen";

type Room = {
  id: RoomId;
  label: string;
  sub: string;
  images: { src: string; alt: string }[];
};

type FurnitureItem = {
  id: string;
  label: string;
  sub: string;
  stageImg: string;
  cardImg: string;
};

type FurnitureGroup = {
  id: string;
  label: string;
  items: FurnitureItem[];
};

const ROOMS: Room[] = [
  {
    id: "bedroom",
    label: "Bedroom",
    sub: "Rest, reimagined",
    images: [
      { src: "/assets/home%20page/Bedroom.webp", alt: "A warm, city-view bedroom suite designed by Duli" },
      { src: "/assets/images/bedroom%20with%20city%20view.webp", alt: "A luxury bedroom with emerald velvet accent wall" },
      { src: "/assets/home%20page/Wardrobe.webp", alt: "A bedroom suite walk-in wardrobe and dressing area" }
    ]
  },
  {
    id: "living",
    label: "Living Room",
    sub: "Where the day unwinds",
    images: [
      { src: "/assets/home%20page/Living%20Room.webp", alt: "A moody living room with a marble feature wall" },
      { src: "/assets/home%20page/extra.webp", alt: "A living room lounge with a dusk skyline view" },
      { src: "/before%20and%20after/s2,2.png", alt: "A bright, daylight living room with a fireplace" }
    ]
  },
  {
    id: "kitchen",
    label: "Kitchen",
    sub: "The heart of the home",
    images: [
      { src: "/assets/home%20page/Kitchen.webp", alt: "A minimalist kitchen with a marble waterfall island" },
      { src: "/assets/images/Modern%20kitchen.webp", alt: "A sage-green galley kitchen with brass pendant lights" },
      { src: "/before%20and%20after/s3,2.png", alt: "An open-plan sage kitchen with a marble island" }
    ]
  }
];

const WARDROBE_ITEMS: FurnitureItem[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 2;
  return {
    id: `w${n}`,
    label: `Style ${n}`,
    sub: "AI Generated Wardrobe Asset",
    stageImg: `/view/bedroom/wardrobe/w${n}.1.png`,
    cardImg: `/view/bedroom/wardrobe/w${n}.2.png`
  };
});

const BED_ITEMS: FurnitureItem[] = Array.from({ length: 4 }, (_, i) => {
  const n = i + 1;
  return {
    id: `b${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: n === 1 ? "New imported bed asset" : "AI Generated Bed Asset",
    stageImg: `/view/bedroom/bed/b${n}.1.png`,
    cardImg: `/view/bedroom/bed/b${n}.2.png`
  };
});

const BEDROOM_CHAIR_ITEMS: FurnitureItem[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `c${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: n === 1 ? "New imported chair asset" : "AI Generated Chair Asset",
    stageImg: `/view/bedroom/chair/c${n}1.png`,
    cardImg: `/view/bedroom/chair/c${n}2.png`
  };
});

const SOFA_ITEMS: FurnitureItem[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `s${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: n === 1 ? "New imported sofa asset" : "AI Generated Sofa Asset",
    stageImg: `/view/living%20room/sofa/s${n}.1.png`,
    cardImg: `/view/living%20room/sofa/s${n}.2.png`
  };
});

const COFFEE_TABLE_ITEMS: FurnitureItem[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `ce${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: n === 1 ? "New imported coffee table asset" : "AI Generated Coffee Table Asset",
    stageImg: `/view/living%20room/coffe/ce${n}1.png`,
    cardImg: `/view/living%20room/coffe/ce${n}2.png`
  };
});

const KITCHEN_TYPE_ITEMS: FurnitureItem[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    id: `kt${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: "AI Generated Kitchen",
    stageImg: `/view/kitchen/kitchen%20type/k${n}.png`,
    cardImg: `/view/kitchen/kitchen%20type/k${n}.png`
  };
});

const DINING_TABLE_ITEMS: FurnitureItem[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `dt${n}`,
    label: n === 1 ? "Modern" : `Style ${n}`,
    sub: "AI Generated Dining Table",
    stageImg: `/view/kitchen/dinning%20table/d${n}1.png`,
    cardImg: `/view/kitchen/dinning%20table/d${n}2.png`
  };
});

const ROOM_GROUPS: Record<RoomId, FurnitureGroup[]> = {
  bedroom: [
    { id: "bed", label: "Bed", items: BED_ITEMS },
    { id: "chair", label: "Chair", items: BEDROOM_CHAIR_ITEMS },
    { id: "wardrobe", label: "Wardrobe", items: WARDROBE_ITEMS }
  ],
  living: [
    { id: "sofa", label: "Sofa", items: SOFA_ITEMS },
    { id: "coffeetable", label: "Coffee Table", items: COFFEE_TABLE_ITEMS }
  ],
  kitchen: [
    { id: "kitchentype", label: "Kitchen Type", items: KITCHEN_TYPE_ITEMS },
    { id: "diningtable", label: "Dining Table", items: DINING_TABLE_ITEMS }
  ]
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function RoomRow({ room, active, onSelect }: { room: Room; active: boolean; onSelect: (id: RoomId) => void }) {
  return (
    <button type="button" className={"ai-room-row" + (active ? " active" : "")} onClick={() => onSelect(room.id)}>
      <img src={room.images[0].src} alt={room.images[0].alt} className="ai-room-row-thumb" loading="eager" />
      <span className="ai-room-row-text">
        <span className="ai-room-row-label">{room.label}</span>
        <span className="ai-room-row-sub">{room.sub}</span>
      </span>
      <span className="ai-room-row-check">{active && <CheckIcon className="ai-room-icon-sm" />}</span>
    </button>
  );
}

function FurnitureCard({ item, active, onSelect }: { item: FurnitureItem; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button type="button" className={"ai-fc-card" + (active ? " active" : "")} onClick={() => onSelect(item.id)}>
      <span className="ai-fc-card-imgwrap">
        <img src={item.cardImg} alt={item.label} className="ai-fc-card-img" />
      </span>
      <span className="ai-fc-card-label">{item.label}</span>
    </button>
  );
}

function firstStockedGroup(groups: FurnitureGroup[]): FurnitureGroup {
  return groups.find((g) => g.items.length > 0) ?? groups[0];
}

// Only furniture/step-2 images — room images are handled by <link rel="preload"> in the page and eager loading
const FURNITURE_IMAGE_URLS = Object.values(ROOM_GROUPS).flatMap((groups) =>
  groups.flatMap((g) => g.items.flatMap((item) => [item.stageImg, item.cardImg]))
);

export function AIDesignRoomPicker() {
  const [selected, setSelected] = useState<RoomId>(ROOMS[0].id);

  const room = ROOMS.find((r) => r.id === selected) ?? ROOMS[0];
  const groups = ROOM_GROUPS[selected];

  const [activeGroupId, setActiveGroupId] = useState<string>(() => firstStockedGroup(groups).id);
  const [activeItemId, setActiveItemId] = useState<string | null>(() => firstStockedGroup(groups).items[0]?.id ?? null);

  const [miniName, setMiniName] = useState("");
  const [miniPhone, setMiniPhone] = useState("");
  const [miniEmail, setMiniEmail] = useState("");
  const [miniStatus, setMiniStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0];
  const activeItem = activeGroup.items.find((it) => it.id === activeItemId) ?? activeGroup.items[0] ?? null;

  const stageImg = activeItem ? activeItem.stageImg : room.images[0].src;
  const stageAlt = activeItem ? activeItem.label : room.images[0].alt;

  const handleSelectRoom = (roomId: RoomId) => {
    setSelected(roomId);
    const newGroups = ROOM_GROUPS[roomId];
    const initial = firstStockedGroup(newGroups);
    setActiveGroupId(initial.id);
    setActiveItemId(initial.items[0]?.id ?? null);
  };

  const handleMiniSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMiniStatus("sending");
    try {
      await submitToWeb3Forms(
        `Free Consultation — ${miniName || "Customer"} (${room.label})`,
        [
          `Name: ${miniName || "—"}`,
          `Phone: ${miniPhone}`,
          `Email: ${miniEmail}`,
          `Room: ${room.label}`,
          `Style Group: ${activeGroup.label}`,
          `Selected Style: ${activeItem?.label ?? "—"}`
        ].join("\n"),
        "Duli Interiors — AI Room Picker"
      );
      setMiniStatus("sent");
    } catch {
      setMiniStatus("error");
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    const g = groups.find((x) => x.id === groupId);
    setActiveItemId(g?.items[0]?.id ?? null);
  };

  useEffect(() => {
    // Defer furniture image preloading until the browser is idle so it doesn't
    // compete with the critical room images that load on first paint
    const preload = () => {
      FURNITURE_IMAGE_URLS.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(preload, { timeout: 3000 });
      return () => (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
    }
    const t = setTimeout(preload, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="ai-room-picker">
      <div className="ai-room-picker-stage">
        <div className="ai-room-picker-stage-top">
          <div className="ai-room-picker-stage-heading-wrap">
            <p className="ai-room-picker-stage-eyebrow">AI Visualizer</p>
            <h2 className="ai-room-picker-stage-heading">Choose Your Space</h2>
          </div>
          <div className="ai-room-pill-group">
            {ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={"ai-room-pill" + (r.id === selected ? " active" : "")}
                onClick={() => handleSelectRoom(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ai-room-picker-stage-frame">
          <img src={stageImg} alt={stageAlt} className="ai-room-picker-stage-img" fetchPriority="high" loading="eager" />
        </div>
      </div>

      <div className="ai-room-picker-panel">
        <span className="ai-room-picker-panel-handle" aria-hidden="true" />
        <div className="ai-fc">
          {activeItem && (
            <div className="ai-fc-mobile-preview">
              <img src={activeItem.stageImg} alt={activeItem.label} className="ai-fc-mobile-preview-img" />
            </div>
          )}

          <div className="ai-fc-tabs">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={"ai-fc-tab" + (g.id === activeGroupId ? " active" : "")}
                onClick={() => handleSelectGroup(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="ai-fc-grid">
            {activeGroup.items.length > 0 ? (
              activeGroup.items.map((item) => (
                <FurnitureCard key={item.id} item={item} active={item.id === activeItemId} onSelect={setActiveItemId} />
              ))
            ) : (
              <p className="ai-fc-empty">More {activeGroup.label.toLowerCase()} designs are on the way.</p>
            )}
          </div>

          <div className="ai-fc-book">
            <div className="ai-fc-mini-card">
              <p className="ai-fc-mini-eyebrow">Free Consultation</p>
              <h4 className="ai-fc-mini-heading">Let our team bring it to life.</h4>

              {miniStatus === "sent" ? (
                <div className="ai-fc-mini-success">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>
                  <p>Thank you! A designer will reach out within 24 hours.</p>
                </div>
              ) : (
                <form className="ai-fc-mini-form" onSubmit={handleMiniSubmit}>
                  <div className="ai-fc-mini-field">
                    <label className="ai-fc-mini-label">Name</label>
                    <input
                      className="ai-fc-mini-input"
                      type="text"
                      placeholder="Your full name"
                      value={miniName}
                      onChange={(e) => setMiniName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="ai-fc-mini-row">
                    <div className="ai-fc-mini-field">
                      <label className="ai-fc-mini-label">Phone <span className="ai-fc-mini-req">*</span></label>
                      <input
                        className="ai-fc-mini-input"
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={miniPhone}
                        onChange={(e) => setMiniPhone(e.target.value)}
                        autoComplete="tel"
                        required
                      />
                    </div>
                    <div className="ai-fc-mini-field">
                      <label className="ai-fc-mini-label">Email <span className="ai-fc-mini-req">*</span></label>
                      <input
                        className="ai-fc-mini-input"
                        type="email"
                        placeholder="you@email.com"
                        value={miniEmail}
                        onChange={(e) => setMiniEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="ai-fc-mini-btn" disabled={miniStatus === "sending"}>
                    {miniStatus === "sending" ? "Sending…" : <>Book Free Consultation <ArrowRightIcon className="ai-room-icon-sm" /></>}
                  </button>
                  {miniStatus === "error" && (
                    <p className="ai-fc-mini-error">Something went wrong. Please try again.</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
