'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params', 'env'] });
var callUciGet = rpc.declare({ object: 'uci', method: 'get', params: ['config', 'section', 'option'] });

var SVG = {
	shield: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
	forward: '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
	openLock: '<svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5-2.28 0-4.27 1.54-4.84 3.75l1.94.49C9.56 3.91 10.68 3 12 3c1.65 0 3 1.35 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	add: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
	del: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	edit: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
	close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
};

function el(tag, cls, children) {
	if (arguments.length === 1 && typeof tag === 'string' && tag.charAt(0) === '<') {
		var w = document.createElement('span'); w.innerHTML = tag; return w.firstChild;
	}
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
	_activeTab: 'forwards',

	load: function() {
		return uci.load('firewall');
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	getRedirects: function() {
		var rules = [];
		uci.sections('firewall', 'redirect', function(s) {
			if ((s.target || 'DNAT') === 'DNAT') {
				rules.push({
					sid: s['.name'],
					name: s.name || '',
					proto: (s.proto || 'tcp udp').replace(/ /g, '/').toUpperCase().replace(/TCPUDP/,'TCP/UDP'),
					src: s.src || 'wan',
					src_dport: s.src_dport || '',
					dest: s.dest || 'lan',
					dest_ip: s.dest_ip || '',
					dest_port: s.dest_port || '',
					enabled: (s.enabled !== '0')
				});
			}
		});
		return rules;
	},

	getOpenPorts: function() {
		var rules = [];
		uci.sections('firewall', 'rule', function(s) {
			if (s.target === 'ACCEPT' && s.src === 'wan' && !s.dest) {
				rules.push({
					sid: s['.name'],
					name: s.name || '',
					proto: (s.proto || 'tcp udp').replace(/ /g, '/').toUpperCase().replace(/TCPUDP/,'TCP/UDP'),
					dest_port: s.dest_port || '',
					enabled: (s.enabled !== '0')
				});
			}
		});
		return rules;
	},

	getDMZ: function() {
		var dmz = { enabled: false, ip: '' };
		uci.sections('firewall', 'redirect', function(s) {
			if (s.name === 'DMZ' || s.name === 'dmz') {
				dmz.sid = s['.name'];
				dmz.enabled = (s.enabled !== '0');
				dmz.ip = s.dest_ip || '';
			}
		});
		return dmz;
	},

	getLanIPs: function() {
		return L.resolveDefault(callFileExec('/bin/sh', ['-c',
			"cat /tmp/dhcp.leases 2>/dev/null | awk '{print $3}' | sort -t. -k4 -n"
		]), {}).then(function(res) {
			var ips = [];
			(res && res.stdout || '').trim().split('\n').forEach(function(ip) {
				ip = ip.trim();
				if (ip.match(/^\d+\.\d+\.\d+\.\d+$/)) ips.push(ip);
			});
			return ips;
		});
	},

	saveAndApply: function() {
		var self = this;
		return uci.save().then(function() {
			return uci.apply();
		}).then(function() {
			self.showToast('Firewall rules saved and applied');
			return uci.load('firewall');
		}).then(function() {
			self.rerenderContent();
		});
	},

	addRedirect: function(name, proto, srcPort, destIp, destPort, enabled) {
		var sid = uci.add('firewall', 'redirect');
		uci.set('firewall', sid, 'target', 'DNAT');
		uci.set('firewall', sid, 'src', 'wan');
		uci.set('firewall', sid, 'dest', 'lan');
		uci.set('firewall', sid, 'name', name);
		uci.set('firewall', sid, 'proto', proto.toLowerCase().replace(/\//g, ' '));
		uci.set('firewall', sid, 'src_dport', srcPort);
		uci.set('firewall', sid, 'dest_ip', destIp);
		uci.set('firewall', sid, 'dest_port', destPort);
		uci.set('firewall', sid, 'enabled', enabled ? '1' : '0');
		return this.saveAndApply();
	},

	addOpenPort: function(name, port, proto, enabled) {
		var sid = uci.add('firewall', 'rule');
		uci.set('firewall', sid, 'name', name);
		uci.set('firewall', sid, 'target', 'ACCEPT');
		uci.set('firewall', sid, 'src', 'wan');
		uci.set('firewall', sid, 'proto', proto.toLowerCase().replace(/\//g, ' '));
		uci.set('firewall', sid, 'dest_port', port);
		uci.set('firewall', sid, 'enabled', enabled ? '1' : '0');
		return this.saveAndApply();
	},

	deleteRule: function(sid) {
		uci.remove('firewall', sid);
		return this.saveAndApply();
	},

	toggleRule: function(sid, enabled) {
		uci.set('firewall', sid, 'enabled', enabled ? '1' : '0');
		return this.saveAndApply();
	},

	setDMZ: function(enabled, ip) {
		var dmz = this.getDMZ();
		if (dmz.sid) {
			uci.set('firewall', dmz.sid, 'enabled', enabled ? '1' : '0');
			if (ip) uci.set('firewall', dmz.sid, 'dest_ip', ip);
		} else if (enabled && ip) {
			var sid = uci.add('firewall', 'redirect');
			uci.set('firewall', sid, 'target', 'DNAT');
			uci.set('firewall', sid, 'name', 'DMZ');
			uci.set('firewall', sid, 'src', 'wan');
			uci.set('firewall', sid, 'dest', 'lan');
			uci.set('firewall', sid, 'proto', 'all');
			uci.set('firewall', sid, 'src_dport', '1-65535');
			uci.set('firewall', sid, 'dest_ip', ip);
			uci.set('firewall', sid, 'enabled', '1');
		}
		return this.saveAndApply();
	},

	showDialog: function(title, fields, onSave) {
		var self = this;
		var overlay = el('div', 'dev-overlay');
		var dialog = el('div', 'dev-dialog fw-dialog');

		var hdr = el('div', 'dev-dialog-hdr');
		hdr.appendChild(el('span', 'dev-dialog-title', title));
		var closeBtn = el('button', 'dev-dialog-close', icon(SVG.close, 16));
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		dialog.appendChild(hdr);

		var body = el('div', 'dev-dialog-body');
		var inputs = {};

		fields.forEach(function(f) {
			var row = el('div', 'fw-form-row');
			row.appendChild(el('label', 'fw-form-label', f.label));
			var input;
			if (f.type === 'select') {
				input = document.createElement('select');
				input.className = 'fw-form-input';
				(f.options || []).forEach(function(o) {
					var opt = document.createElement('option');
					opt.value = typeof o === 'object' ? o.value : o;
					opt.textContent = typeof o === 'object' ? o.label : o;
					if (f.value && opt.value === f.value) opt.selected = true;
					input.appendChild(opt);
				});
			} else if (f.type === 'toggle') {
				var toggleWrap = el('div', 'fw-toggle-wrap');
				input = E('input', { type: 'checkbox' });
				input.checked = f.value !== false;
				var toggle = el('label', 'dev-toggle');
				toggle.appendChild(input);
				toggle.appendChild(el('span', 'dev-toggle-slider'));
				toggleWrap.appendChild(toggle);
				toggleWrap.appendChild(el('span', 'fw-toggle-label', input.checked ? 'Enabled' : 'Disabled'));
				input.addEventListener('change', function() {
					toggleWrap.querySelector('.fw-toggle-label').textContent = this.checked ? 'Enabled' : 'Disabled';
				});
				row.appendChild(toggleWrap);
				inputs[f.name] = input;
				body.appendChild(row);
				return;
			} else {
				input = E('input', { type: 'text', 'class': 'fw-form-input', placeholder: f.placeholder || '' });
				if (f.value) input.value = f.value;
			}
			row.appendChild(input);
			inputs[f.name] = input;
			body.appendChild(row);
		});

		dialog.appendChild(body);

		var actions = el('div', 'dev-dialog-actions');
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		actions.appendChild(cancelBtn);

		var saveBtn = el('button', 'fw-save-btn', icon(SVG.check, 14, '#fff') + ' Save');
		saveBtn.addEventListener('click', function() {
			var vals = {};
			for (var k in inputs) {
				vals[k] = inputs[k].type === 'checkbox' ? inputs[k].checked : inputs[k].value;
			}
			overlay.remove();
			onSave(vals);
		});
		actions.appendChild(saveBtn);
		dialog.appendChild(actions);

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
		overlay.style.display = 'flex';

		var firstInput = dialog.querySelector('input[type="text"], select');
		if (firstInput) setTimeout(function() { firstInput.focus(); }, 100);
	},

	rerenderContent: function() {
		var container = this._contentEl;
		if (!container) return;
		while (container.firstChild) container.removeChild(container.firstChild);

		if (this._activeTab === 'forwards') this.renderForwardsTab(container);
		else if (this._activeTab === 'openports') this.renderOpenPortsTab(container);
		else if (this._activeTab === 'dmz') this.renderDMZTab(container);
	},

	renderForwardsTab: function(container) {
		var self = this;
		var rules = this.getRedirects();

		var hint = el('div', 'fw-hint');
		hint.innerHTML = icon(SVG.info, 14, 'var(--simple-accent)') + ' Port forwarding allows remote access to a computer or service behind the firewall (e.g. web servers, game servers).';
		container.appendChild(hint);

		var addRow = el('div', 'fw-add-row');
		var addBtn = el('button', 'fw-add-btn', icon(SVG.add, 16, '#fff') + ' Add Port Forward');
		addBtn.addEventListener('click', function() {
			self.showDialog('Add Port Forward', [
				{ name: 'name', label: 'Name', placeholder: 'e.g. Web Server' },
				{ name: 'proto', label: 'Protocol', type: 'select', options: [
					{ value: 'tcp udp', label: 'TCP/UDP' }, { value: 'tcp', label: 'TCP' }, { value: 'udp', label: 'UDP' }
				]},
				{ name: 'src_dport', label: 'External Port', placeholder: 'e.g. 8080 or 8000-8010' },
				{ name: 'dest_ip', label: 'Internal IP', placeholder: 'e.g. 192.168.1.100' },
				{ name: 'dest_port', label: 'Internal Port', placeholder: 'e.g. 80' },
				{ name: 'enabled', label: 'Status', type: 'toggle', value: true }
			], function(vals) {
				if (!vals.name || !vals.src_dport || !vals.dest_ip) {
					self.showToast('Name, external port and internal IP are required');
					return;
				}
				self.addRedirect(vals.name, vals.proto, vals.src_dport, vals.dest_ip, vals.dest_port || vals.src_dport, vals.enabled);
			});
		});
		addRow.appendChild(addBtn);
		container.appendChild(addRow);

		if (rules.length === 0) {
			var empty = el('div', 'fw-empty');
			empty.innerHTML = icon(SVG.forward, 48, 'rgba(100,100,120,0.15)');
			empty.appendChild(el('div', 'fw-empty-title', 'No Port Forwards'));
			empty.appendChild(el('div', 'fw-empty-text', 'Click "Add Port Forward" to create a rule that routes incoming traffic to a device on your network.'));
			container.appendChild(empty);
			return;
		}

		var hdr = el('div', 'fw-table-hdr');
		hdr.appendChild(el('span', 'fw-col fw-col-name', 'Name'));
		hdr.appendChild(el('span', 'fw-col fw-col-proto', 'Protocol'));
		hdr.appendChild(el('span', 'fw-col fw-col-ext', 'External Port'));
		hdr.appendChild(el('span', 'fw-col fw-col-ip', 'Internal IP'));
		hdr.appendChild(el('span', 'fw-col fw-col-int', 'Internal Port'));
		hdr.appendChild(el('span', 'fw-col fw-col-status', 'Status'));
		hdr.appendChild(el('span', 'fw-col fw-col-actions', 'Action'));
		container.appendChild(hdr);

		rules.forEach(function(r) {
			var row = el('div', 'fw-table-row');

			row.appendChild(el('span', 'fw-col fw-col-name fw-rule-name', r.name || '\u2014'));

			var protoBadge = el('span', 'fw-proto-badge', r.proto);
			var protoCell = el('span', 'fw-col fw-col-proto');
			protoCell.appendChild(protoBadge);
			row.appendChild(protoCell);

			row.appendChild(el('span', 'fw-col fw-col-ext fw-mono', r.src_dport));
			row.appendChild(el('span', 'fw-col fw-col-ip fw-mono', r.dest_ip));
			row.appendChild(el('span', 'fw-col fw-col-int fw-mono', r.dest_port));

			var statusCell = el('span', 'fw-col fw-col-status');
			var badge = el('span', r.enabled ? 'fw-status-on' : 'fw-status-off', r.enabled ? 'Enabled' : 'Disabled');
			statusCell.appendChild(badge);
			row.appendChild(statusCell);

			var actCell = el('span', 'fw-col fw-col-actions');
			var toggleBtn = el('button', 'fw-icon-btn' + (r.enabled ? ' fw-btn-warn' : ' fw-btn-ok'),
				r.enabled ? 'Disable' : 'Enable');
			(function(sid, en) {
				toggleBtn.addEventListener('click', function() { self.toggleRule(sid, !en); });
			})(r.sid, r.enabled);
			actCell.appendChild(toggleBtn);

			var delBtn = el('button', 'fw-icon-btn fw-btn-danger', icon(SVG.del, 13) + ' Delete');
			(function(sid) {
				delBtn.addEventListener('click', function() {
					if (confirm('Delete this port forward rule?')) self.deleteRule(sid);
				});
			})(r.sid);
			actCell.appendChild(delBtn);

			row.appendChild(actCell);
			container.appendChild(row);
		});
	},

	renderOpenPortsTab: function(container) {
		var self = this;
		var rules = this.getOpenPorts();

		var hint = el('div', 'fw-hint');
		hint.innerHTML = icon(SVG.info, 14, 'var(--simple-accent)') + ' Open ports allow external access to services running directly on this router (e.g. web, SSH, FTP).';
		container.appendChild(hint);

		var addRow = el('div', 'fw-add-row');
		var addBtn = el('button', 'fw-add-btn', icon(SVG.add, 16, '#fff') + ' Open Port');
		addBtn.addEventListener('click', function() {
			self.showDialog('Open Port on Router', [
				{ name: 'name', label: 'Name', placeholder: 'e.g. SSH' },
				{ name: 'port', label: 'Port', placeholder: 'e.g. 22 or 80-90' },
				{ name: 'proto', label: 'Protocol', type: 'select', options: [
					{ value: 'tcp udp', label: 'TCP/UDP' }, { value: 'tcp', label: 'TCP' }, { value: 'udp', label: 'UDP' }
				]},
				{ name: 'enabled', label: 'Status', type: 'toggle', value: true }
			], function(vals) {
				if (!vals.name || !vals.port) {
					self.showToast('Name and port are required');
					return;
				}
				self.addOpenPort(vals.name, vals.port, vals.proto, vals.enabled);
			});
		});
		addRow.appendChild(addBtn);
		container.appendChild(addRow);

		if (rules.length === 0) {
			var empty = el('div', 'fw-empty');
			empty.innerHTML = icon(SVG.openLock, 48, 'rgba(100,100,120,0.15)');
			empty.appendChild(el('div', 'fw-empty-title', 'No Open Ports'));
			empty.appendChild(el('div', 'fw-empty-text', 'Click "Open Port" to allow external access to a service running on this router.'));
			container.appendChild(empty);
			return;
		}

		var hdr = el('div', 'fw-table-hdr fw-op-hdr');
		hdr.appendChild(el('span', 'fw-col fw-col-name', 'Name'));
		hdr.appendChild(el('span', 'fw-col fw-col-port', 'Port'));
		hdr.appendChild(el('span', 'fw-col fw-col-proto', 'Protocol'));
		hdr.appendChild(el('span', 'fw-col fw-col-status', 'Status'));
		hdr.appendChild(el('span', 'fw-col fw-col-actions', 'Action'));
		container.appendChild(hdr);

		rules.forEach(function(r) {
			var row = el('div', 'fw-table-row fw-op-row');
			row.appendChild(el('span', 'fw-col fw-col-name fw-rule-name', r.name || '\u2014'));
			row.appendChild(el('span', 'fw-col fw-col-port fw-mono', r.dest_port));

			var protoCell = el('span', 'fw-col fw-col-proto');
			protoCell.appendChild(el('span', 'fw-proto-badge', r.proto));
			row.appendChild(protoCell);

			var statusCell = el('span', 'fw-col fw-col-status');
			statusCell.appendChild(el('span', r.enabled ? 'fw-status-on' : 'fw-status-off', r.enabled ? 'Enabled' : 'Disabled'));
			row.appendChild(statusCell);

			var actCell = el('span', 'fw-col fw-col-actions');
			var toggleBtn = el('button', 'fw-icon-btn' + (r.enabled ? ' fw-btn-warn' : ' fw-btn-ok'),
				r.enabled ? 'Disable' : 'Enable');
			(function(sid, en) {
				toggleBtn.addEventListener('click', function() { self.toggleRule(sid, !en); });
			})(r.sid, r.enabled);
			actCell.appendChild(toggleBtn);

			var delBtn = el('button', 'fw-icon-btn fw-btn-danger', icon(SVG.del, 13) + ' Delete');
			(function(sid) {
				delBtn.addEventListener('click', function() {
					if (confirm('Delete this open port rule?')) self.deleteRule(sid);
				});
			})(r.sid);
			actCell.appendChild(delBtn);

			row.appendChild(actCell);
			container.appendChild(row);
		});
	},

	renderDMZTab: function(container) {
		var self = this;
		var dmz = this.getDMZ();

		var hint = el('div', 'fw-hint');
		hint.innerHTML = icon(SVG.warning, 14, '#f59e0b') + ' DMZ exposes one computer completely to the internet. All inbound traffic will be forwarded to the DMZ host. Port forward and open port rules will not apply when DMZ is active.';
		container.appendChild(hint);

		var dmzCard = el('div', 'fw-dmz-card');

		var statusRow = el('div', 'fw-dmz-row');
		statusRow.appendChild(el('span', 'fw-dmz-label', 'Enable DMZ'));
		var dmzToggle = el('label', 'dev-toggle');
		var dmzInput = E('input', { type: 'checkbox' });
		dmzInput.checked = dmz.enabled;
		dmzToggle.appendChild(dmzInput);
		dmzToggle.appendChild(el('span', 'dev-toggle-slider'));
		statusRow.appendChild(dmzToggle);
		dmzCard.appendChild(statusRow);

		var ipRow = el('div', 'fw-dmz-row');
		ipRow.appendChild(el('span', 'fw-dmz-label', 'DMZ Host IP'));
		var ipInput = E('input', { type: 'text', 'class': 'fw-form-input fw-dmz-ip', placeholder: 'e.g. 192.168.1.100' });
		if (dmz.ip) ipInput.value = dmz.ip;
		ipRow.appendChild(ipInput);
		dmzCard.appendChild(ipRow);

		var applyRow = el('div', 'fw-dmz-apply-row');
		var applyBtn = el('button', 'fw-save-btn', icon(SVG.check, 14, '#fff') + ' Apply');
		applyBtn.addEventListener('click', function() {
			var en = dmzInput.checked;
			var ip = ipInput.value.trim();
			if (en && !ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
				self.showToast('Please enter a valid IP address');
				return;
			}
			self.setDMZ(en, ip);
		});
		applyRow.appendChild(applyBtn);
		dmzCard.appendChild(applyRow);

		container.appendChild(dmzCard);
	},

	render: function() {
		var self = this;
		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var rules = this.getRedirects();
		var openPorts = this.getOpenPorts();
		var totalRules = rules.length + openPorts.length;

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #dc2626 100%)';

		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = icon(SVG.shield, 40, '#fff');
		iconDiv.style.background = 'rgba(239,68,68,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(239,68,68,0.4), 0 0 48px rgba(239,68,68,0.2)';
		hero.appendChild(iconDiv);

		hero.appendChild(el('div', 'tg-status-text', 'Firewall'));
		hero.appendChild(el('div', 'tg-status-sub',
			totalRules > 0 ? totalRules + ' active rule' + (totalRules !== 1 ? 's' : '') + ' configured'
			: 'No custom rules configured'));

		var stats = el('div', 'tg-stats');
		var s1 = el('div', 'tg-stat');
		s1.appendChild(el('div', 'tg-stat-val', String(rules.length)));
		s1.appendChild(el('div', 'tg-stat-label', 'Port Forwards'));
		stats.appendChild(s1);
		var s2 = el('div', 'tg-stat');
		s2.appendChild(el('div', 'tg-stat-val', String(openPorts.length)));
		s2.appendChild(el('div', 'tg-stat-label', 'Open Ports'));
		stats.appendChild(s2);
		var dmzInfo = this.getDMZ();
		var s3 = el('div', 'tg-stat');
		s3.appendChild(el('div', 'tg-stat-val', dmzInfo.enabled ? 'ON' : 'OFF'));
		s3.appendChild(el('div', 'tg-stat-label', 'DMZ'));
		stats.appendChild(s3);
		hero.appendChild(stats);

		root.appendChild(hero);

		/* ── Tab bar ── */
		var tabBar = el('div', 'fw-tab-bar');
		var tabs = [
			{ id: 'forwards', label: 'Port Forwards', icon: SVG.forward },
			{ id: 'openports', label: 'Open Ports', icon: SVG.openLock },
			{ id: 'dmz', label: 'DMZ', icon: SVG.globe }
		];

		tabs.forEach(function(t) {
			var tab = el('button', 'fw-tab' + (t.id === self._activeTab ? ' fw-tab-active' : ''));
			tab.innerHTML = icon(t.icon, 16) + ' ' + t.label;
			tab.addEventListener('click', function() {
				self._activeTab = t.id;
				tabBar.querySelectorAll('.fw-tab').forEach(function(b) { b.classList.remove('fw-tab-active'); });
				this.classList.add('fw-tab-active');
				self.rerenderContent();
			});
			tabBar.appendChild(tab);
		});
		root.appendChild(tabBar);

		/* ── Content area ── */
		var content = el('div', 'fw-content tg-config');
		this._contentEl = content;
		this.renderForwardsTab(content);
		root.appendChild(content);

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
