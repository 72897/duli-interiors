"use client";

const PROJECTS = [
  { img: "/assets/home%20page/Living%20Room.webp", title: "Living Room", city: "Mumbai Apartment" },
  { img: "/assets/images/Sunset%20terrace%20with%20city%20skyline%20view.webp", title: "Terrace", city: "Hyderabad Skyline Residence" },
  { img: "/assets/home%20page/Kitchen.webp", title: "Kitchen", city: "Bengaluru Villa" },
  { img: "/assets/images/Elegant%20spa-like%20bathroom%20retreat.webp", title: "Bathroom", city: "Gurugram Villa" },
  { img: "/assets/home%20page/Bedroom.webp", title: "Bedroom", city: "Delhi Penthouse" },
  { img: "/assets/images/Opulent%20modern%20walk-in%20closet%20sanctuary.webp", title: "Walk-In Closet", city: "Chennai Residence" },
  { img: "/assets/home%20page/Wardrobe.webp", title: "Wardrobe", city: "Pune Residence" },
  { img: "/assets/images/dining%20room%20design.webp", title: "Dining Room", city: "Ahmedabad Home" },
  { img: "/assets/images/Luxurious%20home%20theater%20with%20ambient%20lighting.webp", title: "Home Theater", city: "Jaipur Estate" }
];

function GalleryCard({ p, hidden, eager }: { p: (typeof PROJECTS)[number]; hidden?: boolean; eager?: boolean }) {
  return (
    <div className="gallery-card" aria-hidden={hidden}>
      <img src={p.img} alt={hidden ? "" : `${p.title} — ${p.city}`} loading={eager ? "eager" : "lazy"} />
      <div className="gallery-card-overlay" />
      <div className="gallery-card-caption">
        <p className="gallery-card-city">{p.city}</p>
        <h3 className="gallery-card-title">{p.title}</h3>
      </div>
    </div>
  );
}

export function ProjectGallery() {
  return (
    <div className="gallery-track-wrap">
      <div className="gallery-track">
        {PROJECTS.map((p, i) => (
          <GalleryCard key={p.title} p={p} eager={i < 3} />
        ))}
        {PROJECTS.map((p) => (
          <GalleryCard key={`${p.title}-dup`} p={p} hidden />
        ))}
      </div>
    </div>
  );
}
