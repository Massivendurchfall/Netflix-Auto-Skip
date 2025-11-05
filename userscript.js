// ==UserScript==
// @name         Netflix Auto: Skip Intro, Recap + Next Episode
// @namespace    https://github.com/Massivendurchfall
// @version      1.4.1
// @description  Automatically clicks "Skip Intro", "Skip Recap" and "Next Episode" on Netflix whenever visible
// @match        https://www.netflix.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const textMatchers = [
        /Intro überspringen/i,
        /Vorspann überspringen/i,
        /Skip Intro/i,
        /Recap überspringen/i,
        /Skip Recap/i,
        /Nächste Folge/i,
        /Next Episode/i
    ];

    const selectors = [
        '[data-uia="player-skip-intro"]',
        '[data-uia="player-skip-recap"]',
        '[data-uia="next-episode-seamless-button"]'
    ];

    function isVisible(el) {
        if (!el) return false;
        const s = window.getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function canClick(el) {
        return isVisible(el) && !el.disabled && el.offsetParent !== null && el.dataset.autoClicked !== '1';
    }

    function collect() {
        const set = new Set();
        for (const sel of selectors) document.querySelectorAll(sel).forEach(n => set.add(n));
        document.querySelectorAll('button, a, div').forEach(n => {
            const t = (n.textContent || '').trim();
            if (!t) return;
            for (const re of textMatchers) {
                if (re.test(t)) { set.add(n); break; }
            }
        });
        return Array.from(set);
    }

    function clickAll() {
        for (const n of collect()) {
            if (canClick(n)) {
                try { n.click(); n.dataset.autoClicked = '1'; } catch (e) {}
            }
        }
    }

    const observer = new MutationObserver(clickAll);

    function start() {
        clickAll();
        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }

    const interval = setInterval(clickAll, 800);

    window.addEventListener('beforeunload', () => {
        clearInterval(interval);
        observer.disconnect();
    });
})();
