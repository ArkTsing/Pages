/* ============================================================
 * 星轨塔罗 · 深浅主题切换
 * 默认浅色，localStorage 记住偏好，全站共享
 * ============================================================ */
(function () {
  'use strict';

  var KEY = 'tarot_theme';
  var root = document.documentElement;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var icon = btn.querySelector('.theme-toggle__icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色' : '切换到深色');
    }
  }

  function current() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // 默认浅色
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    apply(next);
  }

  // 初始化：尽早应用，避免闪屏
  apply(current());

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.theme-toggle');
    if (t) { e.preventDefault(); toggle(); }
  });
})();
