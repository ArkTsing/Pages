/* ============================================================
   共享公共脚本：主题切换 + 导航高亮
   ============================================================ */
(function () {
  'use strict';

  var THEME_KEY = 'mbti_theme';

  // 初始化主题
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      // 跟随系统
      var sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', sys);
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved);
  }

  // 渲染主题切换按钮
  function renderToggle() {
    var holder = document.getElementById('themeToggle');
    if (!holder) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    holder.innerHTML =
      '<button class="theme-toggle" id="themeBtn" aria-label="切换深浅主题" title="切换深浅主题">' +
        (isDark
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>')
      + '</button>';

    var btn = document.getElementById('themeBtn');
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      renderToggle();  // 刷新图标
    });
  }

  function init() {
    initTheme();
    renderToggle();
    // 系统主题变化时（未手动指定）跟随
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () {
        var saved = null;
        try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
        if (!saved) applyTheme(null);
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
