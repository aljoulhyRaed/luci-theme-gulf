'use strict';
'require view';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });

var SVG = {
	dns: '<svg viewBox="0 0 24 24"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.83 8.5 7 8.5z"/></svg>',
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	add: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
	del: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
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

return view.extend({
	load: function() {
		return uci.load('dhcp');
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function() {
		var self = this;

		var dnsmasqSect = null;
		uci.sections('dhcp', 'dnsmasq', function(s) { if (!dnsmasqSect) dnsmasqSect = s; });
		var dnsName = dnsmasqSect ? dnsmasqSect['.name'] : '@dnsmasq[0]';

		var rebind = dnsmasqSect ? (dnsmasqSect.rebind_protection !== '0') : true;
		var dnsForward = dnsmasqSect ? (dnsmasqSect.noresolv === '1') : false;
		var servers = dnsmasqSect && dnsmasqSect.server ? (Array.isArray(dnsmasqSect.server) ? dnsmasqSect.server : [dnsmasqSect.server]) : [];

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = icon(SVG.dns, 40, '#fff');
		iconDiv.style.background = 'rgba(16,185,129,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(16,185,129,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Custom DNS'));
		hero.appendChild(el('div', 'tg-status-sub', 'Configure DNS servers and security options'));
		root.appendChild(hero);

		/* ── DNS Rebinding Protection ── */
		var rebindCard = el('div', 'tg-config stor-card');
		var rebindHdr = el('div', 'stor-card-hdr');
		rebindHdr.innerHTML = icon(SVG.shield, 20, 'var(--simple-accent)');
		rebindHdr.appendChild(el('span', 'stor-card-title', 'DNS Security'));
		rebindCard.appendChild(rebindHdr);

		var rebindBody = el('div', 'stor-share-body');
		var rebindRow = el('div', 'stor-share-row');
		var rebindLeft = el('div', 'stor-share-info');
		rebindLeft.appendChild(el('div', 'stor-share-name', 'DNS Rebinding Protection'));
		rebindLeft.appendChild(el('div', 'stor-share-desc', 'Prevents DNS rebinding attacks by discarding upstream responses containing private IP ranges'));
		rebindRow.appendChild(rebindLeft);
		var rebindToggle = el('label', 'dev-toggle');
		var rebindInput = E('input', { type: 'checkbox' });
		rebindInput.checked = rebind;
		rebindToggle.appendChild(rebindInput);
		rebindToggle.appendChild(el('span', 'dev-toggle-slider'));
		rebindRow.appendChild(rebindToggle);
		rebindBody.appendChild(rebindRow);

		var overrideRow = el('div', 'stor-share-row');
		var overrideLeft = el('div', 'stor-share-info');
		overrideLeft.appendChild(el('div', 'stor-share-name', 'Override DNS for All Clients'));
		overrideLeft.appendChild(el('div', 'stor-share-desc', 'Force all LAN clients to use the router\'s DNS settings instead of their own'));
		overrideRow.appendChild(overrideLeft);
		var overrideToggle = el('label', 'dev-toggle');
		var overrideInput = E('input', { type: 'checkbox' });
		overrideInput.checked = dnsForward;
		overrideToggle.appendChild(overrideInput);
		overrideToggle.appendChild(el('span', 'dev-toggle-slider'));
		overrideRow.appendChild(overrideToggle);
		rebindBody.appendChild(overrideRow);

		rebindCard.appendChild(rebindBody);
		root.appendChild(rebindCard);

		/* ── DNS Servers Card ── */
		var dnsCard = el('div', 'tg-config stor-card');
		var dnsHdr = el('div', 'stor-card-hdr');
		dnsHdr.innerHTML = icon(SVG.dns, 20, 'var(--simple-accent)');
		dnsHdr.appendChild(el('span', 'stor-card-title', 'DNS Servers'));
		dnsCard.appendChild(dnsHdr);

		var dnsBody = el('div', 'sys-card-body');

		var hint = el('div', 'fw-hint');
		hint.style.margin = '0 0 16px';
		hint.style.borderRadius = '10px';
		hint.innerHTML = icon(SVG.info, 14, 'var(--simple-accent)') + ' Set custom upstream DNS servers. Leave empty to use the ones provided by your ISP. Common options: <strong>1.1.1.1</strong> (Cloudflare), <strong>8.8.8.8</strong> (Google), <strong>9.9.9.9</strong> (Quad9).';
		dnsBody.appendChild(hint);

		/* Quick-pick buttons */
		var presets = [
			{ name: 'Cloudflare', dns: ['1.1.1.1', '1.0.0.1'] },
			{ name: 'Google', dns: ['8.8.8.8', '8.8.4.4'] },
			{ name: 'Quad9', dns: ['9.9.9.9', '149.112.112.112'] },
			{ name: 'OpenDNS', dns: ['208.67.222.222', '208.67.220.220'] }
		];
		var presetRow = el('div', 'dns-preset-row');
		presets.forEach(function(p) {
			var btn = el('button', 'dns-preset-btn', p.name);
			btn.addEventListener('click', function() {
				while (serverList.firstChild) serverList.removeChild(serverList.firstChild);
				p.dns.forEach(function(ip) { addServerRow(ip); });
			});
			presetRow.appendChild(btn);
		});
		dnsBody.appendChild(presetRow);

		var serverList = el('div', 'dns-server-list');

		function addServerRow(val) {
			var row = el('div', 'dns-server-row');
			var input = E('input', { type: 'text', 'class': 'fw-form-input', placeholder: 'DNS server IP', value: val || '' });
			row.appendChild(input);
			var rmBtn = el('button', 'dns-rm-btn');
			rmBtn.innerHTML = icon(SVG.del, 16, '#ef4444');
			rmBtn.addEventListener('click', function() { row.remove(); });
			row.appendChild(rmBtn);
			serverList.appendChild(row);
		}

		servers.forEach(function(s) { addServerRow(s); });
		if (servers.length === 0) { addServerRow(''); addServerRow(''); }

		dnsBody.appendChild(serverList);

		var addBtn = el('button', 'dns-add-btn');
		addBtn.innerHTML = icon(SVG.add, 14) + ' Add DNS Server';
		addBtn.addEventListener('click', function() { addServerRow(''); });
		dnsBody.appendChild(addBtn);

		dnsCard.appendChild(dnsBody);

		var dnsActions = el('div', 'sys-card-actions');
		var saveBtn = el('button', 'fw-save-btn');
		saveBtn.innerHTML = icon(SVG.save, 14, '#fff') + ' Save & Apply';
		saveBtn.addEventListener('click', function() {
			uci.set('dhcp', dnsName, 'rebind_protection', rebindInput.checked ? '1' : '0');
			uci.set('dhcp', dnsName, 'noresolv', overrideInput.checked ? '1' : '0');

			var newServers = [];
			serverList.querySelectorAll('input').forEach(function(inp) {
				var v = inp.value.trim();
				if (v) newServers.push(v);
			});
			if (newServers.length > 0) {
				uci.set('dhcp', dnsName, 'server', newServers);
			} else {
				uci.unset('dhcp', dnsName, 'server');
			}

			uci.save().then(function() { return uci.apply(); }).then(function() {
				L.resolveDefault(callFileExec('/etc/init.d/dnsmasq', ['restart']), {});
				self.showToast('DNS settings saved and applied!');
			});
		});
		dnsActions.appendChild(saveBtn);
		dnsCard.appendChild(dnsActions);
		root.appendChild(dnsCard);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
