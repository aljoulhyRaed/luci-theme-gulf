/* ============================================================
   GULF UI Library v0.3.0 - https://github.com/knadh/gulf
   Full JS source concatenated from src/js/*.js
   ============================================================ */

// --- base.js ---
class OtBase extends HTMLElement {
 #initialized = false;

 connectedCallback() {
 if (this.#initialized) return;

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', () => this.#setup(), { once: true });
 } else {
 this.#setup();
 }
 }

 #setup() {
 if (this.#initialized) return;
 this.#initialized = true;
 this.init();
 }

 init() {}

 disconnectedCallback() {
 this.cleanup();
 }

 cleanup() {}

 handleEvent(event) {
 const handler = this[`on${event.type}`];
 if (handler) handler.call(this, event);
 }

 emit(name, detail = null) {
 return this.dispatchEvent(new CustomEvent(name, {
 bubbles: true,
 composed: true,
 cancelable: true,
 detail
 }));
 }

 getBool(name) {
 return this.hasAttribute(name);
 }

 setBool(name, value) {
 if (value) {
 this.setAttribute(name, '');
 } else {
 this.removeAttribute(name);
 }
 }

 $(selector) {
 return this.querySelector(selector);
 }

 $$(selector) {
 return Array.from(this.querySelectorAll(selector));
 }

 uid() {
 return Math.random().toString(36).slice(2, 10);
 }
}

if (typeof window !== 'undefined') {
 window.OtBase = OtBase;
}

if (!('commandForElement' in HTMLButtonElement.prototype)) {
 document.addEventListener('click', e => {
 const btn = e.target.closest('[commandfor]');
 if (!btn) return;

 const target = document.getElementById(btn.getAttribute('commandfor'));
 if (!target) return;

 const command = btn.getAttribute('command') || 'toggle';

 if (target instanceof HTMLDialogElement) {
 if (command === 'show-modal') target.showModal();
 else if (command === 'close') target.close();
 else target.open ? target.close() : target.showModal();
 }
 });
}

// --- tabs.js ---
class OtTabs extends OtBase {
 #tabs = [];
 #panels = [];

 init() {
 const tablist = this.$(':scope > [role="tablist"]');
 this.#tabs = tablist ? [...tablist.querySelectorAll('[role="tab"]')] : [];
 this.#panels = this.$$(':scope > [role="tabpanel"]');

 if (this.#tabs.length === 0 || this.#panels.length === 0) {
 console.warn('ot-tabs: Missing tab or tabpanel elements');
 return;
 }

 this.#tabs.forEach((tab, i) => {
 const panel = this.#panels[i];
 if (!panel) return;

 const tabId = tab.id || `ot-tab-${this.uid()}`;
 const panelId = panel.id || `ot-panel-${this.uid()}`;

 tab.id = tabId;
 panel.id = panelId;
 tab.setAttribute('aria-controls', panelId);
 panel.setAttribute('aria-labelledby', tabId);

 tab.addEventListener('click', this);
 tab.addEventListener('keydown', this);
 });

 const activeTab = this.#tabs.findIndex(t => t.ariaSelected === 'true');
 this.#activate(activeTab >= 0 ? activeTab : 0);
 }

 onclick(e) {
 const index = this.#tabs.indexOf(e.target.closest('[role="tab"]'));
 if (index >= 0) this.#activate(index);
 }

 onkeydown(e) {
 const { key } = e;
 const idx = this.activeIndex;
 let newIdx = idx;

 switch (key) {
 case 'ArrowLeft':
 e.preventDefault();
 newIdx = idx - 1;
 if (newIdx < 0) newIdx = this.#tabs.length - 1;
 break;
 case 'ArrowRight':
 e.preventDefault();
 newIdx = (idx + 1) % this.#tabs.length;
 break;
 default:
 return;
 }

 this.#activate(newIdx);
 this.#tabs[newIdx].focus();
 }

 #activate(idx) {
 this.#tabs.forEach((tab, i) => {
 const isActive = i === idx;
 tab.ariaSelected = String(isActive);
 tab.tabIndex = isActive ? 0 : -1;
 });

 this.#panels.forEach((panel, i) => {
 panel.hidden = i !== idx;
 });

 this.emit('ot-tab-change', { index: idx, tab: this.#tabs[idx] });
 }

 get activeIndex() {
 return this.#tabs.findIndex(t => t.ariaSelected === 'true');
 }

 set activeIndex(value) {
 if (value >= 0 && value < this.#tabs.length) {
 this.#activate(value);
 }
 }
}

customElements.define('ot-tabs', OtTabs);

// --- dropdown.js ---
class OtDropdown extends OtBase {
 #menu;
 #trigger;
 #position;

 init() {
 this.#menu = this.$('[popover]');
 this.#trigger = this.$('[popovertarget]');

 if (!this.#menu || !this.#trigger) return;

 this.#menu.addEventListener('toggle', this);
 this.#menu.addEventListener('keydown', this);

 this.#position = () => {
 const rect = this.#trigger.getBoundingClientRect();
 this.#menu.style.top = `${rect.bottom}px`;
 this.#menu.style.left = `${rect.left}px`;
 };
 }

 ontoggle(e) {
 if (e.newState === 'open') {
 this.#position();
 window.addEventListener('scroll', this.#position, true);
 this.$('[role="menuitem"]')?.focus();
 this.#trigger.ariaExpanded = 'true';
 } else {
 window.removeEventListener('scroll', this.#position, true);
 this.#trigger.ariaExpanded = 'false';
 this.#trigger.focus();
 }
 }

 onkeydown(e) {
 if (!e.target.matches('[role="menuitem"]')) return;

 const items = this.$$('[role="menuitem"]');
 const idx = items.indexOf(e.target);

 switch (e.key) {
 case 'ArrowDown':
 e.preventDefault();
 items[(idx + 1) % items.length]?.focus();
 break;
 case 'ArrowUp':
 e.preventDefault();
 items[idx - 1 < 0 ? items.length - 1 : idx - 1]?.focus();
 break;
 }
 }

 cleanup() {
 window.removeEventListener('scroll', this.#position, true);
 }
}

customElements.define('ot-dropdown', OtDropdown);

// --- toast.js ---
const ot = window.ot || (window.ot = {});

const containers = {};
const DEFAULT_DURATION = 4000;
const DEFAULT_PLACEMENT = 'top-right';

function getContainer(placement) {
 if (!containers[placement]) {
 const el = document.createElement('div');
 el.className = 'toast-container';
 el.setAttribute('popover', 'manual');
 el.setAttribute('data-placement', placement);
 document.body.appendChild(el);
 containers[placement] = el;
 }

 return containers[placement];
}

function show(toast, options = {}) {
 const { placement = DEFAULT_PLACEMENT, duration = DEFAULT_DURATION } = options;
 const container = getContainer(placement);

 toast.classList.add('toast');

 let timeout;

 toast.onmouseenter = () => clearTimeout(timeout);
 toast.onmouseleave = () => {
 if (duration > 0) {
 timeout = setTimeout(() => removeToast(toast, container), duration);
 }
 };

 toast.setAttribute('data-entering', '');
 container.appendChild(toast);
 container.showPopover();

 requestAnimationFrame(() => {
 requestAnimationFrame(() => {
 toast.removeAttribute('data-entering');
 });
 });

 if (duration > 0) {
 timeout = setTimeout(() => removeToast(toast, container), duration);
 }

 return toast;
}

ot.toast = function (message, title, options = {}) {
 const { variant = 'info', ...rest } = options;

 const toast = document.createElement('output');
 toast.setAttribute('data-variant', variant);

 if (title) {
 const titleEl = document.createElement('h6');
 titleEl.className = 'toast-title';
 titleEl.style.color = `var(--${variant})`;
 titleEl.textContent = title;
 toast.appendChild(titleEl);
 }

 if (message) {
 const msgEl = document.createElement('div');
 msgEl.className = 'toast-message';
 msgEl.textContent = message;
 toast.appendChild(msgEl);
 }

 return show(toast, rest);
};

ot.toastEl = function (el, options = {}) {
 let toast;

 if (el instanceof HTMLTemplateElement) {
 toast = el.content.firstElementChild.cloneNode(true);
 } else if (typeof el === 'string') {
 toast = document.querySelector(el).cloneNode(true);
 } else {
 toast = el.cloneNode(true);
 }

 toast.removeAttribute('id');

 return show(toast, options);
};

function removeToast(toast, container) {
 if (toast.hasAttribute('data-exiting')) {
 return;
 }
 toast.setAttribute('data-exiting', '');

 const cleanup = () => {
 toast.remove();
 if (!container.children.length) {
 container.hidePopover();
 }
 };

 toast.addEventListener('transitionend', cleanup, { once: true });
 setTimeout(cleanup, 200);
}

ot.toast.clear = function (placement) {
 if (placement && containers[placement]) {
 containers[placement].innerHTML = '';
 containers[placement].hidePopover();
 } else {
 Object.values(containers).forEach(c => {
 c.innerHTML = '';
 c.hidePopover();
 });
 }
};

// --- tooltip.js ---
document.addEventListener('DOMContentLoaded', () => {
 document.querySelectorAll('[title]').forEach(el => {
 const text = el.getAttribute('title');
 if (text) {
 el.setAttribute('data-tooltip', text);
 if (!el.hasAttribute('aria-label')) {
 el.setAttribute('aria-label', text);
 }
 el.removeAttribute('title');
 }
 });
});

// --- sidebar.js ---
document.addEventListener('click', (e) => {
 const toggle = e.target.closest('[data-sidebar-toggle]');
 if (toggle) {
 const layout = toggle.closest('[data-sidebar-layout]');
 layout?.toggleAttribute('data-sidebar-open');
 }
});
