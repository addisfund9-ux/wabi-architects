/* Contact form — sends through FormSubmit; if the service is unavailable or
   not yet activated, falls back to the visitor's email app so no enquiry is lost. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var TO = 'wabiarchitects00@gmail.com';
  function mailto(d) {
    location.href = 'mailto:' + TO + '?subject=' +
      encodeURIComponent('Project inquiry — ' + (d.get('name') || '')) + '&body=' +
      encodeURIComponent('Name: ' + d.get('name') + '\nPhone: ' + d.get('phone') + '\nEmail: ' + d.get('email') +
        '\nNeed: ' + d.get('service') + '\n\n' + d.get('message'));
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      var bad = form.querySelector(':invalid'); if (bad) bad.focus();
      form.reportValidity && form.reportValidity(); return;
    }
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    var trap = form.querySelector('[name="_honey"]');
    if (trap && trap.value) { form.innerHTML = '<p class="form-msg">Thank you.</p>'; return; } /* bot */
    var data = new FormData(form);
    data.append('_subject', 'Website inquiry — ' + (data.get('name') || 'new message'));
    data.append('_template', 'table');
    data.append('_captcha', 'false');
    fetch('https://formsubmit.co/ajax/' + TO, { method: 'POST', headers: { 'Accept': 'application/json' }, body: data })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!(j && (j.success === true || j.success === 'true'))) throw j;
        form.innerHTML = '<p class="form-msg">Thank you — your message has been sent.</p>' +
          '<p>We’ll get back to you soon. For anything urgent, call or WhatsApp +251 920 526 598.</p>';
      })
      .catch(function () {
        btn.disabled = false; btn.innerHTML = label;
        mailto(data);
      });
  });
})();
