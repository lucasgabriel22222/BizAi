"use client";

import Image from "next/image";
import type { PublicLandingData } from "@/lib/landing-types";
import { getInitials } from "@/lib/landing-defaults";
import { LandingBookingForm } from "./landing-booking-form";
import { ReviewForm } from "./review-form";
import { useLandingEffects } from "./use-landing-effects";
import "./psicologo-landing.css";

function NavIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

interface PsicologoLandingProps {
  data: PublicLandingData;
}

export function PsicologoLanding({ data }: PsicologoLandingProps) {
  const { name, specialty, slug, avatar, config, reviews, defaultDuration } = data;
  useLandingEffects();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";
  const ratingText = `${avgRating} · ${reviews.length} avaliação${reviews.length !== 1 ? "ões" : ""}`;

  const bookingDurationText = `${defaultDuration} minutos por sessão`;

  const customStyles = {
    "--purple": config.primaryColor || "#7C3AED",
    "--purple-light": config.secondaryColor || "#A78BFA",
    "--grad": `linear-gradient(135deg, ${config.primaryColor || "#7C3AED"} 0%, ${config.secondaryColor || "#3B82F6"} 100%)`,
  } as React.CSSProperties;

  const showHero = config.activeSections?.hero !== false;
  const showAbout = config.activeSections?.about !== false;
  const showSpecialties = config.activeSections?.specialties !== false;
  const showTestimonials = config.activeSections?.testimonials !== false;
  const showBooking = config.activeSections?.booking !== false;
  const showFooter = config.activeSections?.footer !== false;

  return (
    <div className="pl-root" style={customStyles} suppressHydrationWarning>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <div className="cursor" id="pl-cursor" />
      <div className="cursor-ring" id="pl-cursor-ring" />

      <nav>
        <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>
          <div className="nav-logo-icon"><NavIcon /></div>
          <span className="nav-logo-text">{name}</span>
        </a>
        <ul className="nav-links">
          {showAbout && <li><a href="#sobre" onClick={(e) => { e.preventDefault(); scrollTo("sobre"); }}>{config.nav.linkSobre}</a></li>}
          {showSpecialties && <li><a href="#especialidades" onClick={(e) => { e.preventDefault(); scrollTo("especialidades"); }}>{config.nav.linkEspecialidades}</a></li>}
          {showTestimonials && <li><a href="#depoimentos" onClick={(e) => { e.preventDefault(); scrollTo("depoimentos"); }}>{config.nav.linkDepoimentos}</a></li>}
        </ul>
        <button type="button" className="nav-cta" onClick={() => scrollTo("agendar")}>{config.nav.ctaText}</button>
      </nav>

      {showHero && (
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-left">
            <div className="hero-badge"><span className="badge-dot" />{config.hero.badge}</div>
            <h1 className="hero-title">
              {config.hero.titleLine1}<br />
              <span className="grad-text">{config.hero.titleHighlight}</span><br />
              {config.hero.titleLine3}
            </h1>
            <p className="hero-sub">{config.hero.subtitle}</p>
            <div className="hero-stats">
              {config.hero.stats.map((s, i) => (
                <div key={i} style={{ display: "contents" }}>
                  {i > 0 && <div className="stat-divider" />}
                  <div className="stat-item">
                    <span className="stat-num">{s.num}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <button type="button" className="btn-primary" onClick={() => scrollTo("agendar")}>{config.hero.ctaPrimary}</button>
              <button type="button" className="btn-outline" onClick={() => scrollTo("sobre")}>{config.hero.ctaSecondary}</button>
            </div>
          </div>

          <div className="hero-right">
            <div style={{ position: "relative" }}>
              <div className="profile-card">
                <div className="profile-photo">
                  {avatar ? (
                    <Image src={avatar} alt={name} fill className="object-cover" style={{ zIndex: 1 }} unoptimized />
                  ) : (
                    <>
                      <svg className="photo-icon" width="56" height="56" fill="none" stroke="white" strokeWidth="1" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      <span className="photo-label">Foto do profissional</span>
                    </>
                  )}
                </div>
                <div className="profile-body">
                  <div className="profile-name">{name}</div>
                  <div className="profile-specialty">{specialty} · {config.profileCard.crp}</div>
                  <div className="profile-tags">
                    {config.profileCard.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="profile-rating">
                    <span className="rating-stars">★★★★★</span>
                    <span className="rating-text">{reviews.length > 0 ? ratingText : config.profileCard.ratingText}</span>
                  </div>
                </div>
              </div>
              {config.floatBadges[0] && (
                <div className="float-badge float-badge-1">
                  <div className="fb-icon">
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div className="fb-text"><strong>{config.floatBadges[0].title}</strong><span>{config.floatBadges[0].subtitle}</span></div>
                </div>
              )}
              {config.floatBadges[1] && (
                <div className="float-badge float-badge-2">
                  <div className="fb-icon">
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </div>
                  <div className="fb-text"><strong>{config.floatBadges[1].title}</strong><span>{config.floatBadges[1].subtitle}</span></div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {showAbout && (
        <section className="section about" id="sobre">
          <div>
            <div className="section-chip reveal">{config.about.chip}</div>
            <h2 className="about-title reveal reveal-d1">
              {config.about.title} <span>{config.about.titleHighlight}</span>
              <br />{config.about.titleSuffix}
            </h2>
            {config.about.paragraphs.map((p, i) => (
              <p key={i} className="about-body reveal reveal-d2" style={i > 0 ? { marginTop: "0.8rem" } : undefined}>{p}</p>
            ))}
            <div className="about-pills reveal reveal-d3">
              {config.about.pills.map((pill) => (
                <span key={pill} className="pill">{pill}</span>
              ))}
            </div>
          </div>
          <div className="about-right">
            {config.credentials.map((cred, i) => (
              <div key={i} className={`cred-card reveal${i > 0 ? ` reveal-d${i}` : ""}`}>
                <div className="cred-icon">
                  <svg width="16" height="16" fill="none" stroke="var(--purple-light)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /></svg>
                </div>
                <div>
                  <div className="cred-label">{cred.label}</div>
                  <div className="cred-value">{cred.value}</div>
                  <div className="cred-sub">{cred.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showSpecialties && (
        <section className="section services" id="especialidades">
          <div className="services-head">
            <div>
              <div className="section-chip reveal">{config.services.chip}</div>
              <h2 className="services-title reveal reveal-d1">
                {config.services.title}<br /><span>{config.services.titleHighlight}</span>
              </h2>
            </div>
            <p className="services-sub reveal reveal-d2">{config.services.subtitle}</p>
          </div>
          <div className="services-grid">
            {config.services.items.map((item, i) => (
              <div key={item.num} className={`service-card reveal${i % 3 > 0 ? ` reveal-d${i % 3}` : ""}`}>
                <div className="service-num">{item.num}</div>
                <div className="service-name">{item.name}</div>
                <p className="service-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showTestimonials && (
        <section className="section testimonials" id="depoimentos">
          <div className="testi-head">
            <div className="section-chip reveal" style={{ display: "inline-flex" }}>{config.testimonials.chip}</div>
            <h2 className="testi-title reveal reveal-d1">{config.testimonials.title}</h2>
          </div>
          {reviews.length > 0 ? (
            <div className="testi-grid">
              {reviews.slice(0, 6).map((r, i) => (
                <div key={r.id} className={`testi-card reveal${i % 3 > 0 ? ` reveal-d${i % 3}` : ""}`}>
                  <div className="testi-quote-icon">&quot;</div>
                  <p className="testi-text">{r.comment}</p>
                  <div className="testi-author">
                    <div className="author-av">{getInitials(r.authorName)}</div>
                    <div className="author-info">
                      <strong>{r.authorName}</strong>
                      <span>Paciente verificado</span>
                      <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: "2rem" }}>
              Seja o primeiro a deixar seu feedback após uma consulta concluída.
            </p>
          )}
          <div style={{ maxWidth: 560, margin: "3rem auto 0" }}>
            <ReviewForm slug={slug} variant="landing" />
          </div>
        </section>
      )}

      {showBooking && (
        <section className="booking-wrap" id="agendar">
          <div className="booking-left">
            <div className="section-chip" style={{ marginBottom: "1.5rem" }}>{config.booking.chip}</div>
            <h2 className="booking-title">
              {config.booking.title.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="booking-sub">{config.booking.subtitle}</p>
            <div className="bk-info">
              {config.booking.info.map((item, i) => (
                <div key={i} className="bk-item">
                  <div className="bk-icon">
                    <svg width="16" height="16" fill="none" stroke="var(--purple-light)" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <div className="bk-text">
                    <strong>{item.title}</strong>
                    <span>{i === 2 ? bookingDurationText : item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="booking-right">
            <LandingBookingForm slug={slug} defaultDuration={defaultDuration} />
          </div>
        </section>
      )}

      {showFooter && (
        <footer>
          <div className="footer-logo">
            <div className="footer-logo-icon"><NavIcon /></div>
            <span className="footer-logo-text">{name} · {specialty}</span>
          </div>
          <span className="footer-copy">© {new Date().getFullYear()} · Todos os direitos reservados</span>
          <span className="footer-badge">Powered by BizAi</span>
        </footer>
      )}
    </div>
  );
}

