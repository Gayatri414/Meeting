/**
 * MeetAI — centralised GSAP setup
 * Import this once (in Layout) to register all plugins & set defaults.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ── Custom eases ──────────────────────────────────────────────
CustomEase.create('meetai.in',      'M0,0 C0.4,0 0.2,1 1,1');          // smooth decelerate
CustomEase.create('meetai.out',     'M0,0 C0.8,0 0.6,1 1,1');          // fast start, soft land
CustomEase.create('meetai.spring',  'M0,0 C0.175,0.885 0.32,1.275 1,1'); // slight overshoot
CustomEase.create('meetai.bounce',  'M0,0 C0.22,1.2 0.36,1 1,1');      // bouncy settle

// ── Global GSAP defaults ──────────────────────────────────────
gsap.defaults({
  ease: 'meetai.in',
  overwrite: 'auto',
});

// ── ScrollTrigger defaults ────────────────────────────────────
ScrollTrigger.defaults({
  toggleActions: 'play none none none',
  once: true,
});

export { gsap, ScrollTrigger, CustomEase };
