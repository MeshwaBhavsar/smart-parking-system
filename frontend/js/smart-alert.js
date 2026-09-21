/* Replace browser-native alert() with one reusable Smart Parking dialog. */
(() => {
  const nativeAlert = window.alert;
  const queue = [];
  let active = null;
  let root;

  const classify = (message) => {
    const text = String(message).toLowerCase();
    if (/success|successful|added|updated|created|completed|thank you|found/.test(text)) return 'success';
    if (/invalid|failed|fail|error|wrong|unable|missing|expired|not found|cannot|incorrect|must|do not match/.test(text)) return 'error';
    if (/please|select|login|logged|enter|again|warning|already/.test(text)) return 'warning';
    return 'info';
  };

  const copyFor = (type, message) => {
    const text = String(message).toLowerCase();
    if (/invalid.*password|password.*incorrect/.test(text)) return 'The password you entered is incorrect. Please check your password and try again.';
    if (type === 'success') return 'Your request was completed successfully.';
    if (type === 'error') return 'Please review the message and try again.';
    if (type === 'warning') return 'Please review the information and continue.';
    return 'Here is an update from Smart Parking.';
  };

  const ensureRoot = () => {
    if (root) return root;
    root = document.createElement('div');
    root.id = 'sp-alert-root';
    root.hidden = true;
    document.body.appendChild(root);
    return root;
  };

  const close = () => {
    if (!active) return;
    const current = active;
    active = null;
    root.hidden = true;
    root.replaceChildren();
    document.removeEventListener('keydown', current.onKeydown);
    if (queue.length) show(queue.shift());
  };

  const show = (message) => {
    const text = String(message ?? '');
    const type = classify(text);
    const title = type === 'success' ? 'Success' : type === 'error' ? 'Something needs attention' : type === 'warning' ? 'Please check' : 'Smart Parking';
    ensureRoot();
    root.hidden = false;
    root.innerHTML = `<div class="sp-alert__backdrop"><section class="sp-alert__dialog sp-alert--${type}" role="dialog" aria-modal="true" aria-labelledby="sp-alert-title" aria-describedby="sp-alert-message"><button class="sp-alert__close" type="button" aria-label="Close">&times;</button><div class="sp-alert__content"><div class="sp-alert__icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i'}</div><h2 class="sp-alert__title" id="sp-alert-title">${title}</h2><p class="sp-alert__message" id="sp-alert-message"></p></div><div class="sp-alert__footer"><button class="sp-alert__ok" type="button">OK</button></div></section></div>`;
    root.querySelector('.sp-alert__message').textContent = text;
    const ok = root.querySelector('.sp-alert__ok');
    const onKeydown = (event) => { if (event.key === 'Escape') close(); };
    active = { onKeydown };
    root.querySelector('.sp-alert__close').addEventListener('click', close);
    ok.addEventListener('click', close);
    root.querySelector('.sp-alert__backdrop').addEventListener('click', (event) => { if (event.target === event.currentTarget) close(); });
    document.addEventListener('keydown', onKeydown);
    ok.focus();
  };

  window.smartAlert = (message) => {
    if (!document.body) { queue.push(message); return; }
    if (active) queue.push(message); else show(message);
  };
  window.alert = window.smartAlert;
  window.nativeAlert = nativeAlert;
  document.addEventListener('DOMContentLoaded', () => { if (!active && queue.length) show(queue.shift()); }, { once: true });
})();
