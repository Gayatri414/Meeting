import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/utils/gsapConfig';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { MeetingUserProvider } from '@/context/MeetingUserContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

const LayoutInner = () => {
  const { dark } = useTheme();
  const mainRef    = useRef(null);
  const sidebarRef = useRef(null);
  const navbarRef  = useRef(null);
  const orb1Ref    = useRef(null);
  const orb2Ref    = useRef(null);
  const orb3Ref    = useRef(null);
  const location   = useLocation();
  const prevPath   = useRef(location.pathname);

  useEffect(() => {
    // No auth — no-op kept for future use
  }, []);

  // ── Premium page-load entrance ──────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([sidebarRef.current, navbarRef.current, mainRef.current], {
        opacity: 0, willChange: 'transform, opacity',
      });
      gsap.set(sidebarRef.current, { x: -48 });
      gsap.set(navbarRef.current,  { y: -32 });
      gsap.set(mainRef.current,    { y: 28, scale: 0.99 });

      // Staggered entrance timeline
      const tl = gsap.timeline({ delay: 0.05 });

      tl.to(sidebarRef.current, {
          x: 0, opacity: 1,
          duration: 0.65,
          ease: 'meetai.spring',
        })
        .to(navbarRef.current, {
          y: 0, opacity: 1,
          duration: 0.5,
          ease: 'meetai.out',
        }, '-=0.45')
        .to(mainRef.current, {
          y: 0, scale: 1, opacity: 1,
          duration: 0.55,
          ease: 'meetai.in',
          clearProps: 'willChange,scale',
        }, '-=0.35');

      // Orbs drift in slowly
      gsap.fromTo([orb1Ref.current, orb2Ref.current, orb3Ref.current],
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1, scale: 1,
          duration: 1.8,
          stagger: 0.25,
          ease: 'power2.out',
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ── Route-change transition ─────────────────────────────────
  useEffect(() => {
    if (!mainRef.current) return;
    const isFirstLoad = prevPath.current === location.pathname;
    prevPath.current = location.pathname;
    if (isFirstLoad) return;

    // Scroll to top instantly
    mainRef.current.scrollTo({ top: 0 });

    // Clip-path wipe + fade
    const tl = gsap.timeline();
    tl.fromTo(mainRef.current,
      { opacity: 0, y: 16, clipPath: 'inset(0 0 8% 0)' },
      {
        opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
        duration: 0.42,
        ease: 'meetai.out',
        clearProps: 'clipPath',
      }
    );
  }, [location.pathname]);

  // ── Orb parallax on mouse move (desktop only) ───────────────
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const handleMove = (e) => {
      const xPct = (e.clientX / window.innerWidth  - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(orb1Ref.current, { x: xPct * 18, y: yPct * 12, duration: 2.5, ease: 'power1.out' });
      gsap.to(orb2Ref.current, { x: xPct * -14, y: yPct * -10, duration: 3,  ease: 'power1.out' });
      gsap.to(orb3Ref.current, { x: xPct * 10, y: yPct * 16, duration: 2,   ease: 'power1.out' });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const loggedInEmail = '';

  return (
    <MeetingUserProvider loggedInEmail={loggedInEmail}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        <div ref={orb1Ref} className="bg-orb w-[640px] h-[640px] -top-52 -left-36"
          style={{ background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 68%)' }} />
        <div ref={orb2Ref} className="bg-orb w-[520px] h-[520px] top-1/2 -right-52"
          style={{ background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 68%)' }} />
        <div ref={orb3Ref} className="bg-orb w-[420px] h-[420px] bottom-0 left-1/3"
          style={{ background: 'radial-gradient(circle, var(--orb-3) 0%, transparent 68%)' }} />
      </div>

      <div
        className="relative z-10 flex h-screen overflow-hidden theme-transition"
        style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
      >
        <div ref={sidebarRef} className="flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div ref={navbarRef}>
            <Navbar />
          </div>

          <main
            id="layout-main"
            ref={mainRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <MobileSidebar />
            <div className="p-4 sm:p-5 lg:p-6 xl:p-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </MeetingUserProvider>
  );
};

const Layout = () => (
  <ThemeProvider>
    <LayoutInner />
  </ThemeProvider>
);

export default Layout;
