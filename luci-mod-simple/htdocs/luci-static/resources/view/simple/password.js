'use strict';
'require view';
'require rpc';

var callSetPassword = rpc.declare({
	object: 'luci',
	method: 'setPassword',
	params: ['username', 'password'],
	reject: true
});

var SVG = {
	lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	eyeOff: '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function icon(svg, size, color) {
	return svg.replace('<svg ', '<svg style="width:' + (size||14) + 'px;height:' + (size||14) + 'px;fill:' + (color||'currentColor') + '" ');
}

function makePasswordField(placeholder) {
	var wrap = el('div', 'pw-field-wrap');
	var input = E('input', { type: 'password', 'class': 'fw-form-input', placeholder: placeholder });
	wrap.appendChild(input);
	var eyeBtn = el('button', 'pw-eye-btn');
	eyeBtn.innerHTML = icon(SVG.eye, 18, 'var(--simple-text-sub)');
	eyeBtn.type = 'button';
	var showing = false;
	eyeBtn.addEventListener('click', function() {
		showing = !showing;
		input.type = showing ? 'text' : 'password';
		eyeBtn.innerHTML = icon(showing ? SVG.eyeOff : SVG.eye, 18, 'var(--simple-text-sub)');
	});
	wrap.appendChild(eyeBtn);
	return { wrap: wrap, input: input };
}

return view.extend({
	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function() {
		var self = this;
		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #4a1d96 0%, #6d28d9 50%, #8b5cf6 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = icon(SVG.lock, 40, '#fff');
		iconDiv.style.background = 'rgba(139,92,246,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(139,92,246,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Admin Password'));
		hero.appendChild(el('div', 'tg-status-sub', 'Change the password used to log in to this router'));
		root.appendChild(hero);

		/* ── Password Card ── */
		var card = el('div', 'tg-config stor-card');
		var hdr = el('div', 'stor-card-hdr');
		hdr.innerHTML = icon(SVG.lock, 20, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'stor-card-title', 'Change Password'));
		card.appendChild(hdr);

		var body = el('div', 'sys-card-body');

		var r1 = el('div', 'fw-form-row');
		r1.appendChild(el('label', 'fw-form-label', 'New Password'));
		var pw1 = makePasswordField('Enter new password');
		r1.appendChild(pw1.wrap);
		body.appendChild(r1);

		var r2 = el('div', 'fw-form-row');
		r2.appendChild(el('label', 'fw-form-label', 'Confirm Password'));
		var pw2 = makePasswordField('Re-enter new password');
		r2.appendChild(pw2.wrap);
		body.appendChild(r2);

		var strengthBar = el('div', 'pw-strength');
		var strengthFill = el('div', 'pw-strength-fill');
		var strengthText = el('span', 'pw-strength-text', '');
		strengthBar.appendChild(strengthFill);
		strengthBar.appendChild(strengthText);
		body.appendChild(strengthBar);

		pw1.input.addEventListener('input', function() {
			var v = pw1.input.value;
			var score = 0;
			if (v.length >= 8) score++;
			if (v.length >= 12) score++;
			if (/[A-Z]/.test(v)) score++;
			if (/[0-9]/.test(v)) score++;
			if (/[^A-Za-z0-9]/.test(v)) score++;
			var pct = Math.min(100, score * 20);
			var color = pct <= 20 ? '#ef4444' : pct <= 40 ? '#f59e0b' : pct <= 60 ? '#eab308' : '#10b981';
			var label = pct <= 20 ? 'Weak' : pct <= 40 ? 'Fair' : pct <= 60 ? 'Good' : 'Strong';
			strengthFill.style.width = pct + '%';
			strengthFill.style.background = color;
			strengthText.textContent = v ? label : '';
		});

		card.appendChild(body);

		var actions = el('div', 'sys-card-actions');
		var saveBtn = el('button', 'fw-save-btn');
		saveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Change Password';
		saveBtn.addEventListener('click', function() {
			var p1 = pw1.input.value;
			var p2 = pw2.input.value;
			if (!p1) { self.showToast('Password cannot be empty'); return; }
			if (p1.length < 6) { self.showToast('Password must be at least 6 characters'); return; }
			if (p1 !== p2) { self.showToast('Passwords do not match'); return; }
			callSetPassword('root', p1).then(function() {
				self.showToast('Password changed successfully!');
				pw1.input.value = '';
				pw2.input.value = '';
				strengthFill.style.width = '0';
				strengthText.textContent = '';
			}).catch(function(e) {
				self.showToast('Error: ' + (e.message || e));
			});
		});
		actions.appendChild(saveBtn);
		card.appendChild(actions);
		root.appendChild(card);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
