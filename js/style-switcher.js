// ═══════════════════════════════════════════════
//  OS STYLE SWITCHER — Ubuntu / Windows / macOS
//  Applies [data-os="..."] to <html> so all CSS
//  selectors in style.css take effect.
// ═══════════════════════════════════════════════

const OS_STYLES = ['ubuntu', 'windows', 'macos'];
let _currentStyle = 'ubuntu';

/**
 * Apply an OS style by name.
 * Sets data-os attribute on <html> and marks the
 * active option in the picker.
 */
function setStyle(name) {
  if (!OS_STYLES.includes(name)) name = 'ubuntu';
  _currentStyle = name;
  document.documentElement.setAttribute('data-os', name);
  // Update active state on all picker options
  document.querySelectorAll('.style-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.style === name);
  });
  // Persist preference
  try { localStorage.setItem('blowgorithm-os-style', name); } catch (e) {}
}

/**
 * Toggle the style picker panel open / closed.
 */
function toggleStylePicker() {
  const picker = document.getElementById('style-picker');
  if (!picker) return;
  picker.classList.toggle('open');
}

// ── Close picker on outside click ───────────────
document.addEventListener('mousedown', e => {
  const picker = document.getElementById('style-picker');
  const btn    = document.getElementById('style-toggle-btn');
  if (!picker) return;
  if (
    picker.classList.contains('open') &&
    !picker.contains(e.target) &&
    btn && !btn.contains(e.target)
  ) {
    picker.classList.remove('open');
  }
});

// ── Restore saved style on load ─────────────────
(function () {
  try {
    const saved = localStorage.getItem('blowgorithm-os-style');
    if (saved && OS_STYLES.includes(saved)) {
      setStyle(saved);
    } else {
      setStyle('ubuntu'); // default
    }
  } catch (e) {
    setStyle('ubuntu');
  }
})();
