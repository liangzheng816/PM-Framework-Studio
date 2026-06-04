/**
 * Static-HTML replica of components/layout/navbar.tsx for use inside
 * the standalone HTML pages under public/ai-learning/ and public/ai-weekly/.
 *
 * The React navbar can't render into static HTML, so we emit a small
 * self-contained block (one <style>, the <header>, and a tiny <script>
 * for the mobile toggle) and write it into each page between
 * <!-- AUTO-NAV:START --> and <!-- AUTO-NAV:END --> markers. The
 * inject-static-navbar.ts script rewrites the region on every prebuild.
 *
 * Behavior caveats vs. the React navbar:
 * - The search button is a plain link to /discover. It can't reach the
 *   React command palette from a static page.
 * - The "/" kbd hint is decorative on static pages (no global hotkey).
 * - Mobile menu is collapsed/expanded via a tiny inline script.
 */

export const NAV_MARK_START = "<!-- AUTO-NAV:START -->";
export const NAV_MARK_END = "<!-- AUTO-NAV:END -->";

type NavTarget = "/" | "/ai-learning/" | "/ai-weekly/";

const NAV_LINKS: { href: string; label: string; match: string }[] = [
  { href: "/", label: "Coach", match: "/" },
  { href: "/discover", label: "Discover", match: "/discover" },
  { href: "/map", label: "Map", match: "/map" },
  { href: "/compare", label: "Compare", match: "/compare" },
  { href: "/collections", label: "Saved", match: "/collections" },
  { href: "/ai-learning/", label: "AI Learning", match: "/ai-learning/" },
  { href: "/ai-weekly/index.html", label: "AI Weekly", match: "/ai-weekly/" },
  { href: "/about", label: "About", match: "/about" },
];

const NAV_STYLE = `<style data-fs-nav>
.fs-nav{position:sticky;top:0;left:0;right:0;z-index:200;background:rgba(244,241,234,.9);-webkit-backdrop-filter:saturate(180%) blur(14px);backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid #d8d2c4;font-family:"Newsreader",Georgia,serif;}
.fs-nav *{box-sizing:border-box;}
.fs-nav-inner{display:flex;align-items:center;justify-content:space-between;gap:18px;height:64px;max-width:1280px;margin:0 auto;padding:0 24px;}
.fs-nav a{text-decoration:none;color:inherit;}
.fs-nav-brand{display:flex;align-items:center;gap:10px;color:#1b1a17;}
.fs-nav-badge{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:#cc3b1d;color:#fff;font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:700;font-size:12px;letter-spacing:.04em;}
.fs-nav-name{font-family:"Fraunces",Georgia,serif;font-size:18px;font-weight:500;color:#1b1a17;letter-spacing:-.005em;}
.fs-nav-links{display:flex;align-items:center;gap:2px;}
.fs-nav-link{padding:8px 12px;font-size:14px;color:#4a463d;border-radius:8px;transition:background-color .15s ease,color .15s ease;line-height:1;}
.fs-nav-link:hover{background:#ece7db;color:#1b1a17;}
.fs-nav-link[aria-current="page"]{color:#cc3b1d;background:rgba(204,59,29,.10);}
.fs-nav-right{display:flex;align-items:center;gap:12px;}
.fs-nav-search{display:flex;align-items:center;gap:8px;padding:6px 12px 6px 12px;border:1px solid #d8d2c4;border-radius:8px;background:#fbf9f4;color:#4a463d;font-size:13px;line-height:1;transition:border-color .15s ease;}
.fs-nav-search:hover{border-color:#b8b0a0;}
.fs-nav-search svg{flex:none;}
.fs-nav-search kbd{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;background:rgba(27,26,23,.08);padding:1px 6px;border-radius:3px;color:#4a463d;}
.fs-nav-burger{display:none;align-items:center;justify-content:center;width:36px;height:32px;border:1px solid #d8d2c4;border-radius:8px;background:transparent;color:#1b1a17;cursor:pointer;}
.fs-nav-mobile{display:none;border-top:1px solid #d8d2c4;background:#f4f1ea;padding:8px 16px 14px;}
.fs-nav-mobile a{display:block;padding:10px 12px;font-size:15px;color:#4a463d;border-radius:8px;}
.fs-nav-mobile a[aria-current="page"]{color:#cc3b1d;background:rgba(204,59,29,.10);}
.fs-nav.fs-open .fs-nav-mobile{display:block;}
@media (max-width: 880px){
  .fs-nav-links,.fs-nav-search{display:none;}
  .fs-nav-burger{display:flex;}
}
</style>`;

const NAV_SCRIPT = `<script data-fs-nav>(function(){var n=document.currentScript&&document.currentScript.previousElementSibling;while(n&&!(n.classList&&n.classList.contains('fs-nav')))n=n.previousElementSibling;if(!n)return;var b=n.querySelector('.fs-nav-burger');if(!b)return;b.addEventListener('click',function(){n.classList.toggle('fs-open');b.setAttribute('aria-expanded',n.classList.contains('fs-open')?'true':'false');});})();</script>`;

function renderLinks(active: NavTarget, mobile: boolean): string {
  const cls = mobile ? "fs-nav-mlink" : "fs-nav-link";
  return NAV_LINKS.map((l) => {
    const isActive = l.match === active;
    const aria = isActive ? ' aria-current="page"' : "";
    return `<a class="${cls}" href="${l.href}"${aria}>${l.label}</a>`;
  }).join("");
}

function renderSearch(): string {
  // Anchor to /discover. The React command palette isn't available here.
  return [
    `<a class="fs-nav-search" href="/discover" aria-label="Search frameworks">`,
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5.2-5.2"/></svg>`,
    `<span>Search...</span>`,
    `<kbd>/</kbd>`,
    `</a>`,
  ].join("");
}

/**
 * Renders the navbar HTML block for a given page context.
 *
 * @param active Which top-level path to highlight. Pass "/ai-learning/" for
 *   any AI Learning page, "/ai-weekly/" for any AI Weekly page.
 */
export function renderNavbar(active: NavTarget): string {
  return [
    NAV_STYLE,
    `<header class="fs-nav" data-fs-nav>`,
    `  <nav class="fs-nav-inner" aria-label="Primary">`,
    `    <a class="fs-nav-brand" href="/">`,
    `      <span class="fs-nav-badge">PM</span>`,
    `      <span class="fs-nav-name">PM Studio</span>`,
    `    </a>`,
    `    <div class="fs-nav-links">${renderLinks(active, false)}</div>`,
    `    <div class="fs-nav-right">`,
    `      ${renderSearch()}`,
    `      <button class="fs-nav-burger" type="button" aria-label="Toggle menu" aria-expanded="false">`,
    `        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>`,
    `      </button>`,
    `    </div>`,
    `  </nav>`,
    `  <div class="fs-nav-mobile">${renderLinks(active, true)}</div>`,
    `</header>`,
    NAV_SCRIPT,
  ].join("\n");
}

/**
 * Returns the full marker-bracketed block to embed in a static HTML page.
 * Idempotent: a page that already has this exact block stays unchanged.
 */
export function renderNavbarBlock(active: NavTarget): string {
  return `${NAV_MARK_START}\n${renderNavbar(active)}\n${NAV_MARK_END}`;
}

/**
 * Pick which nav target to highlight based on the file's absolute path
 * under the framework-studio repo. Anything under public/ai-weekly/ →
 * "/ai-weekly/"; anything under public/ai-learning/ → "/ai-learning/";
 * otherwise default to "/".
 */
export function navTargetForPath(absPath: string): NavTarget {
  const norm = absPath.replace(/\\/g, "/");
  if (norm.includes("/public/ai-weekly/")) return "/ai-weekly/";
  if (norm.includes("/public/ai-learning/")) return "/ai-learning/";
  return "/";
}
