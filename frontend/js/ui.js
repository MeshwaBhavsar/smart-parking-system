(() => {
  document.querySelectorAll('[data-toggle-password]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const target = document.getElementById(toggle.dataset.togglePassword);
      if (!target) return;
      const visible = target.type === 'text';
      target.type = visible ? 'password' : 'text';
      toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
      toggle.innerHTML = visible ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });
  });
  document.querySelectorAll('[data-confirm]').forEach((el) => {
    el.addEventListener('click', (event) => {
      if (!window.confirm(el.dataset.confirm)) event.preventDefault();
    });
  });
  document.querySelectorAll('.alert[data-dismissible]').forEach((alert) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn-close'; button.setAttribute('aria-label','Dismiss');
    button.addEventListener('click', () => alert.remove());
    alert.appendChild(button);
  });
  document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    if (button && !button.dataset.noLoading) { button.dataset.originalText = button.innerHTML; button.dataset.loading = 'true'; button.disabled = true; button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing…'; }
  }));
})();
