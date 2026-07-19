"use client";

import React from "react";
import { motion } from "motion/react";

type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    text: "We always knew what stage our home was at. No chasing, no surprises — the 3D previews matched the final rooms almost exactly.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Priya Nair",
    role: "Homeowner, Bengaluru"
  },
  {
    text: "Every material and cost was shared upfront. It felt honest from day one, which is rare for a home renovation.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Aarav Mehta",
    role: "Homeowner, Mumbai"
  },
  {
    text: "Delivered on the date they promised, down to the week. Our designer never once went quiet on us.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    name: "Rohan Kapoor",
    role: "Homeowner, Delhi"
  },
  {
    text: "Seeing our wardrobe and kitchen modeled in 3D before anything was cut saved us from at least two expensive mistakes.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    name: "Saman Malik",
    role: "Homeowner, Pune"
  },
  {
    text: "We have two dogs and a toddler — the finishes they recommended have held up beautifully through all of it.",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    name: "Zainab Hussain",
    role: "Homeowner, Hyderabad"
  },
  {
    text: "Our project manager was a single point of contact for everything. No juggling five different contractors ourselves.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    name: "Farhan Siddiqui",
    role: "Homeowner, Chennai"
  },
  {
    text: "The layout was planned around our parents living with us — wider walkways, safer surfaces, and it still looks elegant.",
    image: "https://randomuser.me/api/portraits/women/47.jpg",
    name: "Aliza Khan",
    role: "Homeowner, Ahmedabad"
  },
  {
    text: "Transparent pricing meant zero surprise invoices at handover. What we approved is exactly what we paid.",
    image: "https://randomuser.me/api/portraits/men/19.jpg",
    name: "Hassan Ali",
    role: "Homeowner, Kolkata"
  },
  {
    text: "From first sketch to final delivery, every decision was shown to us before it was built. That alone was worth it.",
    image: "https://randomuser.me/api/portraits/women/38.jpg",
    name: "Sana Sheikh",
    role: "Homeowner, Jaipur"
  }
];

const firstColumn = TESTIMONIALS.slice(0, 3);
const secondColumn = TESTIMONIALS.slice(3, 6);
const thirdColumn = TESTIMONIALS.slice(6, 9);

function TestimonialsColumn({
  className,
  testimonials,
  duration = 16
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={`testimonials-column ${className ?? ""}`}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="testimonials-track"
      >
        {[0, 1].map((dup) => (
          <React.Fragment key={dup}>
            {testimonials.map((t, i) => (
              <div className="testimonial-card-scroll" key={`${dup}-${i}`}>
                <p className="testimonial-quote-scroll">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author-row">
                  <img src={t.image} alt={t.name} className="testimonial-avatar" width={40} height={40} />
                  <div>
                    <p className="testimonial-author-name">{t.name}</p>
                    <p className="testimonial-author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="testimonials-columns-section">
      <div className="testimonials-head" data-reveal="up">
        <p className="testimonials-eyebrow">Testimonials</p>
        <h2 className="feature-heading">What Home Owners Say.</h2>
      </div>
      <div className="testimonials-columns-wrap" data-reveal="up" data-delay="120">
        <TestimonialsColumn testimonials={firstColumn} duration={18} />
        <TestimonialsColumn testimonials={secondColumn} className="testimonials-column-mid" duration={22} />
        <TestimonialsColumn testimonials={thirdColumn} className="testimonials-column-last" duration={20} />
      </div>
    </section>
  );
}
