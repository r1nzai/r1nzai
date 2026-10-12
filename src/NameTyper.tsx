import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** My two names: Rinzai online, Parameswar Kishan at home and at work. */
const NAMES = ["Rinzai", "Parameswar\nKishan"];

/** What screen readers hear, whichever way the names are shown. */
const label = NAMES.map((n) => n.replace("\n", " ")).join(", also known as ");

/** Display type: two lines tall, so the longer name fits and nothing below jumps while it types. */
const DISPLAY = "text-[min(10vw,6rem)] leading-[0.9] font-bold tracking-[-0.05em] uppercase";

/** Rinzai, then Parameswar Kishan, then back to Rinzai to stay: motion that ends on its own (WCAG 2.2.2). */
const SEQUENCE = [0, 1, 0];

const TYPE_MS = 75;
const DELETE_MS = 35;
const HOLD_MS = 2800;
const GAP_MS = 350;

/**
 * The page's title: types one name, holds it, deletes it, types the other, and settles on Rinzai.
 * Screen readers get both names once, as plain text; the typing is hidden from them.
 * With reduced motion, both names are shown still.
 */
export default function NameTyper() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const name = NAMES[SEQUENCE[step]];
  const settled = step === SEQUENCE.length - 1 && typed === name.length;

  useEffect(() => {
    if (reduced || settled) return;
    let next: () => void;
    let delay: number;
    if (!deleting && typed < name.length)
      [next, delay] = [() => setTyped(typed + 1), typed === 0 ? GAP_MS : TYPE_MS];
    else if (!deleting) [next, delay] = [() => setDeleting(true), HOLD_MS];
    else if (typed > 0) [next, delay] = [() => setTyped(typed - 1), DELETE_MS];
    else
      [next, delay] = [
        () => {
          setDeleting(false);
          setStep(step + 1);
        },
        GAP_MS,
      ];
    const timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [reduced, settled, name, step, typed, deleting]);

  if (reduced) {
    return (
      <h1 className={DISPLAY}>
        <span className="sr-only">{label}</span>
        <span aria-hidden className="text-aurora block">
          {NAMES[0]}
        </span>
        <span aria-hidden className="block text-[0.4em] leading-none text-foreground/80">
          {NAMES[1].replace("\n", " ")}
        </span>
      </h1>
    );
  }

  return (
    <h1 className={DISPLAY}>
      <span className="sr-only">{label}</span>
      {/* Centred in a fixed two-line box, so swapping names doesn't shift the page; the caret flows after the last letter. */}
      <span aria-hidden className="flex h-[1.8em] flex-col justify-center">
        <span className="whitespace-pre-line">
          <span className="text-aurora">{name.slice(0, typed)}</span>
          {!settled && (
            <span className="caret ml-[0.05em] inline-block h-[0.7em] w-[0.08em] bg-primary" />
          )}
        </span>
      </span>
    </h1>
  );
}
