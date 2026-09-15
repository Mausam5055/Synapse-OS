'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function LegacyThemeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is a standalone clinical application
  const isAgentApp = 
    pathname?.includes('/orchestrator-agent') ||
    pathname?.includes('/symptom-triage-agent') ||
    pathname?.includes('/medical-scan-agent') ||
    pathname?.includes('/records') ||
    pathname?.includes('/vibrant') ||
    pathname?.includes('/interactive-body');

  // Standalone Auth & Session Management pages
  const isAuthApp =
    pathname?.includes('/login') ||
    pathname?.includes('/signup') ||
    pathname?.includes('/verify-mfa') ||
    pathname?.includes('/security') ||
    pathname?.includes('/sessions') ||
    pathname?.includes('/confirm-account') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/reset-password');

  const isNoLoaderPage = 
    pathname?.includes('/legal-notice') ||
    pathname?.includes('/privacy-policy') ||
    pathname?.includes('/cookie-policy');

  if (isAgentApp) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
        {children}
      </div>
    );
  }

  if (isAuthApp) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc' }}>
        {children}
      </div>
    );
  }


  const handleSkipSplash = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const splash = document.getElementById('video-splash');
    if (splash) {
      splash.classList.add('hide-splash');
      splash.style.display = 'none';
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
    }
    document.body.classList.remove('video-splash-active');
    document.documentElement.classList.remove('overflow-hidden');
    
    // Stop playing background videos
    const vDesktop = document.getElementById('splash-video-desktop') as HTMLVideoElement | null;
    const vMobile = document.getElementById('splash-video-mobile') as HTMLVideoElement | null;
    try { vDesktop?.pause(); } catch (_) {}
    try { vMobile?.pause(); } catch (_) {}

    // Trigger page animations if available
    if (typeof (window as any).init === 'function') {
      try { (window as any).init(); } catch (_) {}
    }
  };

  return (
    <>
      {/* Hunter Healthcare Page Loader Overlay */}
      {!isNoLoaderPage && (
        <div id="page-loader" aria-hidden="true" suppressHydrationWarning>
          <svg id="pre-loader-svg" width="710" height="2870" viewBox="0 0 710 2870" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path id="long" fillRule="evenodd" clipRule="evenodd" d="M476.34 1477.98C383.028 1477.98 309.347 1404.53 309.347 1311.5V0H399.716V1387.89H596.166V1477.98H476.34ZM90.3684 1169.5H0V1696.37H90.3684V1169.5ZM709.116 1169.5H618.747V1696.37H709.116V1169.5ZM399.716 1554.37C399.716 1461.35 326.035 1387.89 232.721 1387.89H112.949V1477.98H309.347V2870H399.716V1554.37Z" fill="black"/>
            <path id="short" fillRule="evenodd" clipRule="evenodd" d="M476.34 1480.06C383.028 1480.06 309.347 1406.47 309.347 1313.27V1171L399.716 1171V1389.8H596.166V1480.06H476.34ZM90.3684 1171H0V1698.86H90.3684V1171ZM709.116 1171H618.747V1698.86H709.116V1171ZM399.716 1556.6C399.716 1463.39 326.035 1389.8 232.721 1389.8H112.949V1480.06H309.347V1698.86H399.716V1556.6Z" fill="black"/>
          </svg>
        </div>
      )}

      {/* Hunter Healthcare Video Splash (Homepage Welcome Loader) */}
      {!isNoLoaderPage && (
        <section 
          className="animated-splash-page" 
          id="video-splash" 
          suppressHydrationWarning
          onClick={handleSkipSplash}
          style={{ cursor: 'pointer' }}
        >
          <video
            id="splash-video-desktop"
            className="splash-video-desktop animated-splash-page__video"
            playsInline
            autoPlay
            muted
            preload="auto"
          >
            <source src="/videos/hunter_splash_wide.mp4" type="video/mp4" />
          </video>
          <video
            id="splash-video-mobile"
            className="splash-video-mobile animated-splash-page__video"
            playsInline
            autoPlay
            muted
            preload="auto"
          >
            <source src="/videos/hunter_splash_tall.mp4" type="video/mp4" />
          </video>
          <button 
            id="splash-skip-btn" 
            className="splash-skip-btn" 
            type="button" 
            aria-label="Skip intro"
            onClick={handleSkipSplash}
            style={{
              position: 'absolute',
              top: '28px',
              right: '28px',
              zIndex: 999999,
              padding: '10px 24px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              color: '#0f172a',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              lineHeight: 1,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            }}
          >
            <span>SKIP</span>
            <span style={{ fontSize: '15px', fontWeight: 900 }}>&rarr;</span>
          </button>
        </section>
      )}

      <div className="grid wrapper">
        <div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div>
      </div>

      <div id="mouse" className="d-md-nonexx" suppressHydrationWarning><div><span className="f-izmir t-parrafo"></span></div></div>

      {/* Global Luxury Header */}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `<header>
		<div class="header wrapper">
			<div class="header__logo logo c-white" style="${isNoLoaderPage ? 'display: none !important;' : ''}" data-url="/">
				<div class="logo__normal link disabled">Sanjeevni</div>
				<div class="logo__group">
					<div class="logo__is">O</div>
					<div class="logo__boring">S<div class="reg">®</div></div>
				</div>
			</div>
			<a class="header__btn btn btn--menu btn--header btn--bg f-edit t-parrafo-l d-none">
				<span><span>Menu</span></span>
			</a>
			<a class="header__footer__btn btn--header btn btn--bg f-edit t-parrafo-l d-none">
				<span><span><span class="number f-edit t-italic t-parrafo-l"></span><span class="circle"></span><span class="name f-edit t-parrafo-l"></span></span></span>
			</a>
		</div>
		<div class="header__menu c-black d-none">
			<div class="header__menu__bg"></div>
			<ul id="menu-principal" class="header__menu__nav-site f-izmir t-titulo-l t-upper">
				<li class="link menu-item"><a href="/" data-no-swup="true">Home</a></li>
				<li class="link menu-item"><a href="/orchestrator-agent" data-no-swup="true">Orchestrator Swarm</a></li>
				<li class="link menu-item" style="margin-left: 2rem; font-size: 0.8em;"><a href="/orchestrator-agent?tab=swarm" data-no-swup="true" style="opacity: 0.8;">- Clinical Triage & ML</a></li>
				<li class="link menu-item" style="margin-left: 2rem; font-size: 0.8em;"><a href="/orchestrator-agent?tab=scan" data-no-swup="true" style="opacity: 0.8;">- Medical Scan AI</a></li>
				<li class="link menu-item" style="margin-left: 2rem; font-size: 0.8em;"><a href="/orchestrator-agent?tab=hospital" data-no-swup="true" style="opacity: 0.8;">- Global Surveillance</a></li>
				<li class="link menu-item" style="margin-left: 2rem; font-size: 0.8em;"><a href="/orchestrator-agent?tab=records" data-no-swup="true" style="color: #10b981; opacity: 0.9;">- ABHA & Records</a></li>
			</ul>
			<div class="header__menu__content">
				<div class="header__menu__media expand_mouse follow__wrap" data-text="Explore" data-url="/orchestrator-agent">
					<a href="/orchestrator-agent" data-no-swup="true" class="btn btn--circle follow__mouse--md f-izmir t-parrafo-l d-none d-md-flex"></a>
					<div class="header__menu__media__title f-medium t-titulo-xl t-upper" style="opacity: 0; position: absolute; pointer-events: none;">ORCHESTRATOR AGENT</div>
          <div class="media header__menu__media__image noAnimate no-general-anim noAspect" data-delay="" style="transform: scale(1.1); transform-origin: left center;"> 
            <div class="media__wrap-source image" style="border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">
              <img class="media__source w-100" src="/images/medical/abha_card.png" alt="ABHA Health Identification Card" style="display: block; border-radius: 16px; object-fit: contain;">
            </div>
          </div>
				</div>
				<nav class="header__menu__nav-single">
					<h5 class="header__menu__nav-single__title f-izmir t-titulo t-upper">Agents & Infrastructure</h5>
					<div class="header__menu__nav-single__proyectos">
						<div class="header__menu__nav-single__proyectos__item">
							<a href="/orchestrator-agent" data-no-swup="true">
								<div class="num-title t-titulo-l t-upper"><span class="num f-edit t-parrafo-xl t-normal">(1)</span><span class="title">Orchestrator Agent</span></div>
								<div class="place f-edit t-parrafo-xl t-italic">Active</div>
							</a>
						</div>
						<div class="header__menu__nav-single__proyectos__item">
							<a href="/orchestrator-agent?tab=scan" data-no-swup="true">
								<div class="num-title t-titulo-l t-upper"><span class="num f-edit t-parrafo-xl t-normal">(2)</span><span class="title">Medical Scan Agent</span></div>
								<div class="place f-edit t-parrafo-xl t-italic">Active</div>
							</a>
						</div>
						<div class="header__menu__nav-single__proyectos__item">
							<a href="/orchestrator-agent?tab=swarm" data-no-swup="true">
								<div class="num-title t-titulo-l t-upper"><span class="num f-edit t-parrafo-xl t-normal">(3)</span><span class="title">Symptom Triage Agent</span></div>
								<div class="place f-edit t-parrafo-xl t-italic">Active</div>
							</a>
						</div>
						<div class="header__menu__nav-single__proyectos__item">
							<a href="/vibrant" data-no-swup="true">
								<div class="num-title t-titulo-l t-upper"><span class="num f-edit t-parrafo-xl t-normal">(4)</span><span class="title">3D Body Explorer</span></div>
								<div class="place f-edit t-parrafo-xl t-italic" style="color: #38bdf8; font-weight: 600;">3D Live</div>
							</a>
						</div>
						<div class="header__menu__nav-single__proyectos__item">
							<a href="/orchestrator-agent?tab=records" data-no-swup="true">
								<div class="num-title t-titulo-l t-upper"><span class="num f-edit t-parrafo-xl t-normal">(5)</span><span class="title">ABHA & Health Passport</span></div>
								<div class="place f-edit t-parrafo-xl t-italic" style="color: #10b981; font-weight: 600; white-space: nowrap;">On-Chain</div>
							</a>
						</div>
					</div>
				</nav>
			</div>
			<a href="tel:hello@synapseos.com" class="header__menu__link-footer f-edit t-titulo link">hello@synapseos.com</a>
		</div>
	</header>` }} />

      {/* Smooth Wrapper for Marketing Homepage */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {children}
        </div>
      </div>

      {/* Modals required by marketing scripts */}
      <div id="wrap-modals">
        <div className="modal modal--contact d-none" data-lenis-prevent="true">
          <div className="modal__bg"></div>
          <div className="modal__content bg-white">
            <a className="modal__close close"><span></span><span></span></a>
            <div className="modal__content__pretitle f-edit t-parrafo-l">(CONNECT)</div>
            <div className="modal__content__title t-upper f-regular t-titulo-xl t-center">Test the <br/>Live Platform</div>
          </div>
        </div>
        <div className="modal modal--media d-none" data-lenis-prevent="true">
          <div className="modal__bg"></div>
          <div className="modal__content">
            <a className="modal__close close close--white"><span></span><span></span></a>
            <div className="modal__video"></div>
          </div>
        </div>
      </div>
    </>
  );
}
