import {
  Backdrop,
  Badge,
  buttonVariants,
  Card,
  ThemeToggle,
  Timeline,
  TimelineItem,
  cx,
  useCopyToClipboard,
} from "@rinzai/zen";
import { useEffect, useRef, useState } from "react";
import NameTyper from "./NameTyper";
import { useReducedMotion } from "./useReducedMotion";
import {
  DiscordIcon,
  EnvelopeIcon,
  ExternalIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  SteamIcon,
  XIcon,
} from "./icons";

const EMAIL = "me@rinzai.dev";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/r1nzai", Icon: GitHubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/parameswar-kishan/", Icon: LinkedInIcon },
  { label: "X (Twitter)", href: "https://x.com/R1nzai", Icon: XIcon },
  { label: "Instagram", href: "https://www.instagram.com/r1nzai/", Icon: InstagramIcon },
];

const STEAM = "https://steamcommunity.com/id/Rinzai/";
/** Discord has no profile URLs for usernames, so the button copies it. */
const DISCORD = "rinzai";

/** What I'm building now; the first is featured full width. `href` is left out for projects without a public home. */
const PROJECTS = [
  {
    name: "Zen",
    href: "https://zen.rinzai.dev",
    tagline: "React components in dark glass",
    body: "My open-source component library: translucent surfaces, borders that catch a pointer light, and one accent colour, built on native platform features with no runtime dependencies. This site is made with it.",
    stack: ["React 19", "Tailwind v4", "TypeScript", "OKLCH theming", "Playwright"],
  },
  {
    name: "Sora",
    href: "https://sora.rinzai.dev",
    tagline: "An end-to-end encrypted money planner",
    body: "Plans a household's money month by month. Every figure is encrypted in the browser, so the server never sees your data.",
    stack: ["React Router 8", "Supabase", "WebCrypto", "Docker"],
  },
  {
    name: "Streamemo",
    href: "https://streamemo.rinzai.dev",
    tagline: "Viewer challenges for streamers",
    body: "A dashboard to track the challenges viewers set, and an OBS overlay that shows them live.",
    stack: ["React Router 8", "Supabase", "Postgres RLS", "Playwright"],
  },
  {
    name: "Yatagarasu",
    tagline: "A companion app for Kick streamers",
    body: "A Rust relay and a Tauri desktop app that turn chat events into live OBS overlays.",
    stack: ["Rust", "Tauri", "WebSockets", "libSQL"],
  },
];

/** All at Veritas Prime Labs, Hyderabad, newest first (from LinkedIn). */
const ROLES = [
  { title: "Prime Technology Senior Analyst", when: "Sep 2025 – Present" },
  { title: "Prime Senior Software Development Engineer", when: "Jan 2025 – Sep 2025" },
  { title: "Prime Consultant", when: "Jun 2023 – Mar 2025" },
  { title: "Prime Member", when: "Apr 2022 – Jun 2023" },
  { title: "Prime Associate Member", when: "Sep 2021 – Mar 2022" },
];

const CERTIFICATIONS = [
  "Meta Front-End Developer Specialization",
  "Full-Stack Web Development with React Specialization",
  "Front-End Web Development with React",
  "Front-End Web UI Frameworks and Tools: Bootstrap 4",
  "Generative AI at SAP",
];

const TOOLKIT = [
  "TypeScript",
  "React",
  "Node.js",
  "Rust",
  "Tailwind CSS",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "REST APIs",
  "Docker",
];

/** Small uppercase labels: card kickers. */
const label = "text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase";

/** Oversized section titles, two stacked words (SELECTED / PROJECTS). */
function Display({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <h2
      id={id}
      className="reveal text-[min(10vw,4.5rem)] leading-[0.85] font-bold tracking-[-0.05em] uppercase"
    >
      <span className="block">{top}</span>
      <span className="block text-muted-foreground">{bottom}</span>
    </h2>
  );
}

/** Opens in a new tab: say so with an arrow. */
function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cx("inline-flex items-center gap-1", className)}
    >
      {children}
      <ExternalIcon />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Socials() {
  return (
    <div className="flex items-center gap-2">
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${label} (opens in a new tab)`}
          title={label}
          className={buttonVariants({
            variant: "outline",
            size: "icon",
            className: "size-11 rounded-full",
          })}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

/** Where the name docks: the corner pill's text line (top-4 left-4, h-9, px-4) at text-sm. */
const DOCK = { left: 32, middle: 34, fontPx: 14 };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The hero's name docks in the top-left corner. The intro scrolls with the page untouched until the
 * name's letters reach the top of the screen; then it lifts out as one piece (fixed, its space in the
 * hero kept) and, over the next stretch of scrolling, the name shrinks into the corner on a curve, up
 * quickly, then across, while the tagline and icons fade. Docked, it's a fixed element that doesn't
 * move again until you scroll back. With reduced motion the name stays
 * in the hero, and the corner pill shows its own copy once it's out of view.
 */
function useDockedName(reduced: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState({ docked: false, width: 0 });
  useEffect(() => {
    const slot = ref.current;
    const intro = slot?.firstElementChild as HTMLElement | null;
    const heading = slot?.querySelector("h1");
    if (!slot || !intro || !heading) return;
    const fading = [...intro.querySelectorAll<HTMLElement>("[data-dock-fade]")];
    let frame = 0;
    let floating = false;
    const settle = () => {
      floating = false;
      intro.style.cssText = "";
      slot.style.height = "";
      for (const el of fading) el.style.cssText = "";
    };
    const update = () => {
      frame = 0;
      // The slot always stays in the page, so it tells us where the name would be.
      const box = slot.getBoundingClientRect();
      if (reduced) {
        const docked = box.bottom < 0;
        setDock((d) => (d.docked === docked ? d : { docked, width: 0 }));
        return;
      }
      const fontPx = parseFloat(getComputedStyle(heading).fontSize);
      const scale = DOCK.fontPx / fontPx;
      // The name sits mid-way down its two-line box (1.8em): its letters start 0.45em from the box's top.
      const pinTop = 16 - 0.45 * fontPx;
      const dockTop = DOCK.middle - 0.9 * DOCK.fontPx;
      const progress = clamp01((pinTop - box.top) / Math.max(160, 2.5 * fontPx));
      if (box.top > pinTop) {
        if (floating) settle();
      } else {
        if (!floating) {
          floating = true;
          slot.style.height = `${intro.getBoundingClientRect().height}px`;
          Object.assign(intro.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: `${box.width}px`,
            transformOrigin: "0 0",
            zIndex: "50",
          });
        }
        const across = easeInOut(progress);
        const x = box.left + (DOCK.left - box.left) * across;
        const y = pinTop + (dockTop - pinTop) * easeOut(progress);
        intro.style.transform = `translate(${x}px, ${y}px) scale(${1 + (scale - 1) * across})`;
        // The tagline and icons are gone within the first third, before the name gets small.
        const left = 1 - clamp01(progress * 3);
        for (const el of fading)
          Object.assign(el.style, { opacity: `${left}`, visibility: left === 0 ? "hidden" : "" });
      }
      const docked = progress >= 1;
      const text = heading.querySelector<HTMLElement>(".text-aurora");
      const width = Math.round((text?.offsetWidth ?? 0) * scale) + 2 * (DOCK.left - 16);
      setDock((d) => (d.docked === docked && d.width === width ? d : { docked, width }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    // The typer changes the name's width: keep the pill fitted while docked.
    const typing = new MutationObserver(schedule);
    typing.observe(heading, { subtree: true, characterData: true, childList: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      typing.disconnect();
      settle();
    };
  }, [reduced]);
  return [ref, dock] as const;
}

export default function App() {
  const [featured, ...projects] = PROJECTS;
  const reduced = useReducedMotion();
  const [nameRef, dock] = useDockedName(reduced);
  return (
    <>
      <Backdrop topoSrc="/topo.svg" />
      {/*
       * No header bar at first: the page is one scroll. Once the name has docked in the corner, this sits behind it and
       * takes you back up: on wide screens, where the name sits in the margin, just an invisible target fitted to it;
       * narrower, where content would scroll under the name, a full-width glass bar centred on the name's line.
       */}
      <a
        href="#top"
        aria-hidden={!dock.docked}
        tabIndex={dock.docked ? 0 : -1}
        style={reduced ? undefined : ({ "--pill-width": `${dock.width}px` } as React.CSSProperties)}
        className={cx(
          "fixed inset-x-0 top-0 z-40 flex h-[68px] items-center px-8 transition-opacity duration-300",
          // Under 1400px the content column (max-w-7xl, px-8) reaches the docked name, so give it a bar to sit on.
          "max-[1400px]:glass max-[1400px]:border-b max-[1400px]:border-tint/10",
          "min-[1400px]:inset-x-auto min-[1400px]:top-4 min-[1400px]:left-4 min-[1400px]:h-9 min-[1400px]:px-4",
          !reduced && "min-[1400px]:w-(--pill-width)",
          dock.docked ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {reduced && (
          <span className="text-aurora text-sm font-bold tracking-[0.18em] uppercase">Rinzai</span>
        )}
        <span className="sr-only">{reduced ? ", back to top" : "Rinzai, back to top"}</span>
      </a>
      <div className="glass fixed top-4 right-4 z-40 rounded-full border border-tint/10">
        <ThemeToggle />
      </div>

      <main id="top" className="overflow-x-clip">
        {/* Hero: who I am, not what I sell. The name, the one line, and Fern. */}
        <section className="rise mx-auto grid min-h-svh max-w-7xl content-center items-center gap-10 px-4 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="relative justify-self-start md:order-last md:justify-self-end">
            <div
              aria-hidden
              className="absolute inset-0 -m-12 rounded-full bg-[radial-gradient(closest-side,oklch(var(--glow)/0.45),transparent)] blur-2xl"
            />
            <img
              src="/fern.webp"
              alt=""
              width={288}
              height={288}
              className="relative size-36 rounded-full border border-tint/10 object-cover md:size-72"
            />
          </div>
          {/* The intro's slot in the hero. It lifts out as one piece (so nothing scrolls under the name), the tagline and
                        icons fading as the name docks. Above everything it travels over; clicks pass through to the corner once docked. */}
          <div ref={nameRef} className={cx("relative z-50", dock.docked && "pointer-events-none")}>
            <div className="flex flex-col gap-8">
              <NameTyper />
              <p
                data-dock-fade
                className="max-w-2xl text-[min(7vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-muted-foreground"
              >
                An <span className="text-foreground">adept learner</span> with a{" "}
                <span className="text-aurora">curious mind.</span>
              </p>
              <div data-dock-fade>
                <Socials />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 py-24 sm:px-8">
          <section aria-labelledby="work" className="flex flex-col gap-12">
            <Display id="work" top="Selected" bottom="Projects" />
            <div className="grid gap-4 md:grid-cols-3">
              <ProjectCard project={featured} number={1} className="md:col-span-3" featured />
              {projects.map((p, i) => (
                <ProjectCard key={p.name} project={p} number={i + 2} />
              ))}
            </div>
          </section>

          <section aria-labelledby="experience" className="flex flex-col gap-12">
            <Display id="experience" top="At" bottom="Work" />
            <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
              <Card className="reveal flex flex-col gap-6 p-6 md:p-8">
                <div className="flex flex-col gap-2">
                  <p className={label}>Hyderabad · since 2021</p>
                  <h3 className="text-3xl font-bold tracking-tight">Veritas Prime Labs</h3>
                </div>
                <p className="text-lg leading-8 text-muted-foreground">
                  I build <span className="text-foreground">payroll and onboarding apps</span>, and
                  I'm the <span className="text-foreground">tech lead for Prime UI</span>, the
                  company's internal component library. I specialise in simplifying and optimising
                  implementations: taking what's complex and making it simple, fast and dependable.
                </p>
                <Timeline>
                  {ROLES.map((r, i) => (
                    <TimelineItem key={r.title} title={r.title} active={i === 0} className="reveal">
                      <p className="text-[13px] text-muted-foreground">{r.when}</p>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Card>
              <div className="flex flex-col gap-4">
                <Card className="reveal flex flex-col gap-2 p-6 md:p-8">
                  <h3 className={label}>Education</h3>
                  <p className="text-xl font-semibold tracking-tight">B.Tech, Computer Science</p>
                  <p className="text-sm text-muted-foreground">
                    PRS College of Engineering and Technology, Neyyattinkara
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums">2017 – 2021</p>
                </Card>
                <Card className="reveal flex flex-col gap-3 p-6 md:p-8">
                  <h3 className={label}>Toolkit</h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {TOOLKIT.map((t) => (
                      <li key={t}>
                        <Badge variant="secondary">{t}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="reveal flex flex-1 flex-col gap-3 p-6 md:p-8">
                  <h3 className={label}>Certifications</h3>
                  <ul className="flex flex-col gap-2 text-sm">
                    {CERTIFICATIONS.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </section>
          {/* Off work: the person behind the projects. */}
          <section aria-labelledby="off-work" className="flex flex-col gap-12">
            <Display id="off-work" top="Off" bottom="Work" />
            <p className="reveal max-w-3xl text-[min(7vw,2.5rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-muted-foreground">
              I <span className="text-foreground">play games.</span> That world is where{" "}
              <span className="text-foreground">Streamemo</span> and{" "}
              <span className="text-foreground">Yatagarasu</span> come from.
            </p>
            <div className="reveal flex flex-wrap gap-3">
              <ExternalLink
                href={STEAM}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "gap-2 rounded-full",
                })}
              >
                <SteamIcon />
                Steam
              </ExternalLink>
              <DiscordButton />
            </div>
          </section>
        </div>

        {/* The sign-off: a last big line, then the way to reach me. */}
        <section
          aria-labelledby="contact"
          className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 sm:px-8"
        >
          <Display id="contact" top="Always" bottom="Learning." />
          <div className="reveal flex flex-wrap items-center justify-between gap-6 border-t border-tint/10 pt-8">
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 py-2 text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              <EnvelopeIcon className="size-7 text-primary sm:size-9" />
              <span className="underline decoration-tint/20 decoration-2 underline-offset-8 transition-colors group-hover:decoration-primary">
                {EMAIL}
              </span>
            </a>
            <Socials />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 pb-10 text-xs text-muted-foreground sm:px-8">
        <p>© {new Date().getFullYear()} Rinzai</p>
        <p>
          Built with{" "}
          <a
            href="https://zen.rinzai.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-block py-1 underline-offset-4 hover:underline"
          >
            Zen
          </a>
        </p>
      </footer>
    </>
  );
}

/** Copies my Discord username, and says so (visibly, and to screen readers). */
function DiscordButton() {
  const { copy, copied } = useCopyToClipboard({ resetAfter: 2000 });
  return (
    <button
      type="button"
      onClick={() => copy(DISCORD)}
      className={buttonVariants({
        variant: "outline",
        size: "lg",
        className: "gap-2 rounded-full",
      })}
    >
      <DiscordIcon />
      <span aria-hidden>{copied ? "Copied!" : DISCORD}</span>
      <span className="sr-only">Copy my Discord username, {DISCORD}</span>
      <span role="status" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

/**
 * A project: the whole card opens its site (the title's link stretches over it), and the
 * title lights up on hover. The card itself stays put.
 */
function ProjectCard({
  project: p,
  number,
  featured,
  className,
}: {
  project: (typeof PROJECTS)[number];
  number: number;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Card className={cx("reveal group relative flex flex-col gap-6 p-6 md:p-8", className)}>
      {/* A fixed-height row, so titles line up across cards whether the corner holds a pill or a badge. */}
      <div className="flex h-8 items-center justify-between gap-4">
        <span className="text-sm font-medium text-primary tabular-nums">
          {String(number).padStart(2, "0")}
        </span>
        {p.href ? (
          <span
            aria-hidden
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1 rounded-full group-hover:text-primary",
            })}
          >
            Visit
            <ExternalIcon />
          </span>
        ) : (
          <Badge variant="outline">Private</Badge>
        )}
      </div>
      <div
        className={cx(
          "flex flex-col gap-3",
          featured && "md:grid md:grid-cols-2 md:items-end md:gap-8",
        )}
      >
        <div className="flex flex-col gap-1">
          <h3
            className={cx(
              "font-bold tracking-[-0.04em] uppercase transition-colors group-hover:text-primary",
              featured ? "text-5xl sm:text-7xl" : "text-4xl",
            )}
          >
            {p.href ? (
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="outline-hidden after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/40"
              >
                {p.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              p.name
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{p.tagline}</p>
        </div>
        <p className="text-[15px] leading-7 text-muted-foreground">{p.body}</p>
      </div>
      <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Built with">
        {p.stack.map((s) => (
          <li key={s}>
            <Badge variant="secondary">{s}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
