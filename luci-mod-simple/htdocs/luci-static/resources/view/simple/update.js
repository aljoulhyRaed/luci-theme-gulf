'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] });
var callSystemBoard = rpc.declare({ object: 'system', method: 'board', expect: {} });

var SVG = {
	update: '<svg viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.5-9.11 0-12.58 3.51-3.47 9.14-3.49 12.65-.06L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/></svg>',
	upload: '<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	flash: '<svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function ic(svg, size, color) {
	return svg.replace('<svg ', '<svg style="width:' + (size || 14) + 'px;height:' + (size || 14) + 'px;fill:' + (color || 'currentColor') + '" ');
}

return view.extend({
	load: function() {
		return Promise.all([
			callSystemBoard(),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'cat /proc/mtd 2>/dev/null | grep firmware | awk "{print \\$2}" | head -1; ' +
				'echo "---"; df -h /tmp 2>/dev/null | tail -1 | awk "{print \\$4}"'
			]), {})
		]);
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function(data) {
		var self = this;
		var board = data[0] || {};
		var release = board.release || {};
		var infoOut = (data[1] && data[1].stdout) || '';
		var infoParts = infoOut.split('---');
		var tmpFree = (infoParts[1] || '').trim() || '-';

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #22c55e 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = ic(SVG.update, 40, '#fff');
		iconDiv.style.background = 'rgba(34,197,94,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(34,197,94,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Firmware Update'));
		hero.appendChild(el('div', 'tg-status-sub', release.description || 'OpenWrt'));

		var stats = el('div', 'tg-stats');
		var s1 = el('div', 'tg-stat');
		s1.appendChild(el('div', 'tg-stat-val', release.revision || '-'));
		s1.appendChild(el('div', 'tg-stat-label', 'Revision'));
		stats.appendChild(s1);
		var s2 = el('div', 'tg-stat');
		s2.appendChild(el('div', 'tg-stat-val', board.system || '-'));
		s2.appendChild(el('div', 'tg-stat-label', 'Architecture'));
		stats.appendChild(s2);
		var s3 = el('div', 'tg-stat');
		s3.appendChild(el('div', 'tg-stat-val', tmpFree));
		s3.appendChild(el('div', 'tg-stat-label', 'Free /tmp'));
		stats.appendChild(s3);
		hero.appendChild(stats);
		root.appendChild(hero);

		/* Upload Card */
		var card = el('div', 'tg-config stor-card');
		var hdr = el('div', 'stor-card-hdr');
		hdr.innerHTML = ic(SVG.upload, 20, 'var(--simple-accent)');
		hdr.appendChild(el('span', 'stor-card-title', 'Upload Firmware Image'));
		card.appendChild(hdr);

		var body = el('div', 'sys-card-body');
		body.style.padding = '16px 20px';

		var warnBox = el('div', '');
		warnBox.style.cssText = 'background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--simple-text)';
		warnBox.innerHTML = ic(SVG.warning, 20, '#f59e0b');
		warnBox.appendChild(el('span', '', '<strong>Important:</strong> Upload a compatible firmware image (.bin or .img) for your device. Do not power off the router during the upgrade process.'));
		body.appendChild(warnBox);

		var fileRow = el('div', 'fw-form-row');
		fileRow.appendChild(el('label', 'fw-form-label', 'Firmware File'));
		var fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.bin,.img,.trx,.itb';
		fileInput.className = 'fw-form-input';
		fileInput.style.padding = '8px';
		fileRow.appendChild(fileInput);
		body.appendChild(fileRow);

		var resultArea = el('div', '');
		resultArea.style.display = 'none';
		body.appendChild(resultArea);

		var uploadActions = el('div', 'sys-card-actions');
		var uploadBtn = el('button', 'fw-save-btn');
		uploadBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Upload & Verify';
		uploadBtn.addEventListener('click', function() {
			if (!fileInput.files || !fileInput.files.length) {
				self.showToast('Please select a firmware file');
				return;
			}
			uploadBtn.disabled = true;
			uploadBtn.innerHTML = 'Uploading\u2026';
			resultArea.style.display = 'none';

			var file = fileInput.files[0];
			var formData = new FormData();
			formData.append('sessionid', L.env.sessionid || rpc.getSessionID());
			formData.append('filename', '/tmp/firmware.bin');
			formData.append('filedata', file);

			var xhr = new XMLHttpRequest();
			xhr.open('POST', L.env.cgi_base + '/cgi-upload', true);
			xhr.onload = function() {
				if (xhr.status === 200) {
					uploadBtn.innerHTML = 'Verifying\u2026';
					L.resolveDefault(callFileExec('/bin/sh', ['-c',
						'sysupgrade -T /tmp/firmware.bin 2>&1; echo "---EXIT:$?"'
					]), {}).then(function(res) {
						var out = (res && res.stdout) || '';
						var exitMatch = out.match(/---EXIT:(\d+)/);
						var exitCode = exitMatch ? parseInt(exitMatch[1]) : 1;
						var msg = out.replace(/---EXIT:\d+/, '').trim();

						resultArea.innerHTML = '';
						resultArea.style.display = 'block';

						if (exitCode === 0) {
							var okBox = el('div', '');
							okBox.style.cssText = 'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:10px;padding:16px;margin-top:12px';
							okBox.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:600;color:#22c55e">' +
								ic(SVG.check, 20, '#22c55e') + ' Firmware image is valid</div>' +
								'<div style="font-size:13px;color:var(--simple-text-dim)">' +
								'<strong>File:</strong> ' + file.name + '<br>' +
								'<strong>Size:</strong> ' + (file.size / 1048576).toFixed(1) + ' MB' +
								(msg ? '<br><strong>Details:</strong> ' + msg : '') + '</div>';

							var keepRow = el('div', '');
							keepRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px solid var(--simple-border)';
							keepRow.appendChild(el('span', '', '<strong>Keep current settings</strong><br><span style="font-size:12px;color:var(--simple-text-dim)">Preserve config, passwords, and network settings</span>'));
							var keepToggle = document.createElement('label');
							keepToggle.className = 'simple-switch';
							var keepCheck = document.createElement('input');
							keepCheck.type = 'checkbox';
							keepCheck.checked = true;
							keepToggle.appendChild(keepCheck);
							var slider = el('span', 'simple-switch-slider');
							keepToggle.appendChild(slider);
							keepRow.appendChild(keepToggle);
							okBox.appendChild(keepRow);

							var flashActions = el('div', '');
							flashActions.style.cssText = 'margin-top:16px;text-align:right';
							var flashBtn = el('button', 'fw-save-btn');
							flashBtn.style.background = '#22c55e';
							flashBtn.innerHTML = ic(SVG.flash, 16, '#fff') + ' Flash Firmware';
							flashBtn.addEventListener('click', function() {
								if (!confirm('Flash this firmware image?\n\nThe router will reboot during the process. Do not power off.')) return;
								flashBtn.disabled = true;
								flashBtn.innerHTML = 'Flashing\u2026';

								var keepSettings = keepCheck.checked;
								var cmd = keepSettings
									? 'sysupgrade /tmp/firmware.bin'
									: 'sysupgrade -n /tmp/firmware.bin';

								L.resolveDefault(callFileExec('/bin/sh', ['-c', cmd]), {});

								resultArea.innerHTML = '';
								var flashProgress = el('div', '');
								flashProgress.style.cssText = 'text-align:center;padding:32px 16px';
								flashProgress.innerHTML = '<div style="font-size:48px;margin-bottom:16px">' + ic(SVG.flash, 48, '#22c55e') + '</div>' +
									'<div style="font-size:18px;font-weight:700;color:var(--simple-text);margin-bottom:8px">Flashing Firmware\u2026</div>' +
									'<div style="font-size:14px;color:var(--simple-text-dim);margin-bottom:20px">Do not power off the router. This will take 1\u20133 minutes.</div>' +
									'<div id="flash-countdown" style="font-size:32px;font-weight:700;color:var(--simple-accent)">120</div>' +
									'<div style="font-size:12px;color:var(--simple-text-dim);margin-top:4px">seconds remaining</div>';
								resultArea.appendChild(flashProgress);

								card.querySelector('.sys-card-actions').style.display = 'none';

								var countdown = 120;
								var cdEl = document.getElementById('flash-countdown');
								var cdInterval = setInterval(function() {
									countdown--;
									if (cdEl) cdEl.textContent = countdown;
									if (countdown <= 0) {
										clearInterval(cdInterval);
										flashProgress.innerHTML = '<div style="font-size:48px;margin-bottom:16px">' + ic(SVG.check, 48, '#22c55e') + '</div>' +
											'<div style="font-size:18px;font-weight:700;color:var(--simple-text);margin-bottom:8px">Flash Complete</div>' +
											'<div style="font-size:14px;color:var(--simple-text-dim);margin-bottom:20px">Attempting to reconnect\u2026</div>';

										var attempts = 0;
										var reconnect = setInterval(function() {
											attempts++;
											var test = new XMLHttpRequest();
											test.open('GET', window.location.origin + '/cgi-bin/luci/', true);
											test.timeout = 3000;
											test.onload = function() {
												clearInterval(reconnect);
												window.location.href = window.location.origin + '/cgi-bin/luci/';
											};
											test.onerror = function() {};
											test.ontimeout = function() {};
											test.send();
											if (attempts > 30) {
												clearInterval(reconnect);
												flashProgress.innerHTML += '<div style="margin-top:16px"><a href="/" class="fw-save-btn" style="display:inline-block;text-decoration:none;padding:10px 24px">Reconnect Manually</a></div>';
											}
										}, 5000);
									}
								}, 1000);
							});
							flashActions.appendChild(flashBtn);
							okBox.appendChild(flashActions);
							resultArea.appendChild(okBox);
						} else {
							var failBox = el('div', '');
							failBox.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:16px;margin-top:12px';
							failBox.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:600;color:#ef4444">' +
								ic(SVG.warning, 20, '#ef4444') + ' Invalid firmware image</div>' +
								'<div style="font-size:13px;color:var(--simple-text-dim)">' + (msg || 'The uploaded file is not a valid firmware image for this device.') + '</div>';
							resultArea.appendChild(failBox);
						}

						uploadBtn.disabled = false;
						uploadBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Upload & Verify';
					});
				} else {
					self.showToast('Upload failed');
					uploadBtn.disabled = false;
					uploadBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Upload & Verify';
				}
			};
			xhr.onerror = function() {
				self.showToast('Upload error');
				uploadBtn.disabled = false;
				uploadBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Upload & Verify';
			};
			xhr.send(formData);
		});
		uploadActions.appendChild(uploadBtn);
		card.appendChild(body);
		card.appendChild(uploadActions);
		root.appendChild(card);

		/* Info Card */
		var infoCard = el('div', 'tg-config stor-card');
		var infoHdr = el('div', 'stor-card-hdr');
		infoHdr.innerHTML = ic(SVG.info, 20, 'var(--simple-accent)');
		infoHdr.appendChild(el('span', 'stor-card-title', 'Current System'));
		infoCard.appendChild(infoHdr);

		var infoBody = el('div', 'sys-card-body');
		infoBody.style.padding = '16px 20px';
		var rows = [
			['Firmware', release.description || '-'],
			['Version', release.version || '-'],
			['Revision', release.revision || '-'],
			['Kernel', board.kernel || '-'],
			['Model', board.model || '-'],
			['Architecture', board.system || '-'],
			['Target', (release.target || '-') + ' / ' + (release.board || '-')]
		];
		rows.forEach(function(r) {
			var row = el('div', '');
			row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--simple-border,rgba(255,255,255,0.06))';
			row.appendChild(el('span', '', '<span style="color:var(--simple-text-dim)">' + r[0] + '</span>'));
			row.appendChild(el('span', '', '<strong>' + r[1] + '</strong>'));
			infoBody.appendChild(row);
		});
		infoCard.appendChild(infoBody);
		root.appendChild(infoCard);

		return root;
	}
});
