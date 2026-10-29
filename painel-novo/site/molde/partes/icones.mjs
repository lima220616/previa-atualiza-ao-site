// Os ícones do site (o <svg> escondido com os <symbol>, usados por <use href="#i-...">): parte fixa, igual ao site de
// hoje letra por letra.
import { h } from "../html.mjs";

const ICONES = h`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></symbol>
<symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></symbol>
<symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.6z"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-pix" viewBox="0 0 24 24"><path d="M12 3l4 4-4 4-4-4zM12 13l4 4-4 4-4-4zM3 12l4-4 4 4-4 4zM13 12l4-4 4 4-4 4z"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></symbol>
<symbol id="i-gift" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="4"/><path d="M5 13v8h14v-8M12 9v12M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-wave" viewBox="0 0 24 24"><path d="M3 8c3-2 6 2 9 0s6-2 9 0M3 13c3-2 6 2 9 0s6-2 9 0M3 18c3-2 6 2 9 0s6-2 9 0"/></symbol>
<symbol id="i-comb" viewBox="0 0 24 24"><path d="M4 9h16v3H4zM6 12v6M9 12v6M12 12v6M15 12v6M18 12v6"/></symbol>
<symbol id="i-sparkle" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></symbol>
<symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15zM5 19l8-8"/></symbol>
<symbol id="i-nose" viewBox="0 0 24 24"><path d="M12 4c0 6-3 9-3 12a3 3 0 0 0 6 0c0-3-3-6-3-12z"/><path d="M4 20L20 4"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="i-smoke" viewBox="0 0 24 24"><path d="M8 20c-2-3 2-4 0-7s2-4 0-7M14 20c-2-3 2-4 0-7s2-4 0-7"/><path d="M4 4l16 16"/></symbol>
<symbol id="i-palette" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5-1.5-2-1.5-3.5S14 13 16 13h2a3 3 0 0 0 3-3c0-4-4-7-9-7z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="9" r="1"/></symbol>
<symbol id="i-flask" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 15h9"/></symbol>
<symbol id="i-dryer" viewBox="0 0 24 24"><circle cx="8.5" cy="9" r="5.5"/><circle cx="8.5" cy="9" r="1.8"/><path d="M14 6.5h6.5v5H14M7 14.5L6 21h4.5l1-6.5"/></symbol>
<symbol id="i-bottle" viewBox="0 0 24 24"><path d="M9.5 3h5v3h-5zM8.5 6h7l1.5 3.5V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9.5z"/><path d="M7 13h10"/><circle cx="19.5" cy="4.5" r="1.3"/><circle cx="21" cy="8.5" r=".9"/></symbol>
<symbol id="i-straight" viewBox="0 0 24 24"><path d="M7 3v18M12 3v18M17 3v18"/><path d="M4 8h16"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3c3.5 4.2 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7.2 12 3z"/></symbol>
<symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 0-7.5z"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></symbol>
<symbol id="i-feather" viewBox="0 0 24 24"><path d="M20 4C12 4 6 10 6 18v2M20 4c0 8-5 13-12 13M6 14h7"/></symbol>
<symbol id="i-flower" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 6 10 3.5 12 3c2 .5 2 3 0 6.5zM12 14.5c2 3.5 2 6 0 6.5-2-.5-2-3 0-6.5zM9.5 12C6 14 3.5 14 3 12c.5-2 3-2 6.5 0zM14.5 12c3.5-2 6-2 6.5 0-.5 2-3 2-6.5 0z"/></symbol>
<symbol id="i-strong" viewBox="0 0 24 24"><path d="M5 12h3v6H5zM16 12h3v6h-3zM8 15h8M12 4v6M9 7h6"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.3 1.5 5 4"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></symbol>
<symbol id="i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></symbol>
<symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></symbol>
<symbol id="i-cam" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M8 6l2-3h4l2 3"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/></symbol>
<symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></symbol><symbol id="i-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.5-.5-3-1.5M12 6.5v11"/></symbol><symbol id="i-map" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></symbol><symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol><symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></symbol>
</svg>

`;

export default function icones() {
  return ICONES;
}
