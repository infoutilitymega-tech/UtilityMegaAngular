import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base64-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="mode-tabs">
        <button class="mode-tab" [class.active]="mode==='encode'" (click)="mode='encode';convert()">🔒 Encode</button>
        <button class="mode-tab" [class.active]="mode==='decode'" (click)="mode='decode';convert()">🔓 Decode</button>
        <button class="mode-tab" [class.active]="mode==='url'" (click)="mode='url';convert()">🔗 URL Encode</button>
        <button class="mode-tab" [class.active]="mode==='urldec'" (click)="mode='urldec';convert()">🔗 URL Decode</button>
      </div>

      <div class="editor-pane">
        <div class="pane-label">{{ mode === 'encode' || mode === 'url' ? 'Input Text' : 'Base64 / Encoded Input' }}</div>
        <textarea class="b64-area" [(ngModel)]="input" (input)="convert()"
          [placeholder]="placeholder()" rows="6" spellcheck="false"></textarea>
        <div class="char-count">{{ input.length }} characters</div>
      </div>

      <div class="convert-arrow">
        <button class="convert-btn" (click)="convert()">
          {{ arrowLabel() }}
        </button>
        <button class="swap-btn" (click)="swap()">⇅ Swap</button>
      </div>

      <div class="editor-pane">
        <div class="pane-label-row">
          <span class="pane-label">Output</span>
          <div class="output-actions">
            <button class="sm-btn" (click)="copy()">{{ copied() ? '✓ Copied' : '📋 Copy' }}</button>
            <button class="sm-btn" (click)="clear()">🗑 Clear</button>
          </div>
        </div>
        <textarea class="b64-area output" readonly [value]="output()" rows="6" spellcheck="false"></textarea>
        <div class="status-msg" [class]="statusClass()">{{ status() }}</div>
      </div>

      <!-- File to Base64 -->
      <div class="file-section">
        <div class="pane-label">File → Base64</div>
        <label class="file-drop">
          <input type="file" (change)="encodeFile($event)" class="file-hidden" />
          <span>📂 Drop file or click to encode as Base64</span>
        </label>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .mode-tabs { display: flex; gap: .35rem; flex-wrap: wrap; }
    .mode-tab { padding: .4rem .85rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: .8rem; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .mode-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .editor-pane { display: flex; flex-direction: column; gap: .3rem; }
    .pane-label { font-size: .75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
    .pane-label-row { display: flex; align-items: center; justify-content: space-between; }
    .output-actions { display: flex; gap: .35rem; }
    .b64-area { width: 100%; padding: .85rem; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Courier New', monospace; font-size: .82rem; line-height: 1.6; background: var(--input-bg); color: var(--text); resize: vertical; outline: none; box-sizing: border-box; }
    .b64-area:focus { border-color: var(--primary); }
    .b64-area.output { background: var(--bg-alt); }
    .char-count { font-size: .7rem; color: var(--text-muted); text-align: right; }
    .convert-arrow { display: flex; align-items: center; gap: .5rem; }
    .convert-btn { flex: 1; padding: .6rem; border-radius: 10px; border: none; background: var(--primary); color: #fff; font-size: .9rem; font-weight: 700; cursor: pointer; font-family: var(--font); transition: opacity .15s; }
    .convert-btn:hover { opacity: .88; }
    .swap-btn { padding: .6rem 1rem; border-radius: 10px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text); font-size: .82rem; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .swap-btn:hover { border-color: var(--primary); color: var(--primary); }
    .sm-btn { padding: .3rem .65rem; border-radius: 7px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: .75rem; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .sm-btn:hover { border-color: var(--primary); color: var(--primary); }
    .status-msg { font-size: .75rem; font-weight: 600; margin-top: .2rem; }
    .status-msg.success { color: #16a34a; }
    .status-msg.error { color: #ef4444; }
    .status-msg.info { color: var(--primary); }
    .file-section { display: flex; flex-direction: column; gap: .4rem; }
    .file-drop { display: flex; align-items: center; justify-content: center; padding: 1rem; border: 2px dashed var(--border); border-radius: 10px; cursor: pointer; color: var(--text-muted); font-size: .85rem; transition: all .15s; }
    .file-drop:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .file-hidden { display: none; }
  `]
})
export class Base64EncoderComponent {
  mode = 'encode';
  input = '';
  output = signal('');
  status = signal('');
  statusClass = signal('info');
  copied = signal(false);

  placeholder() {
    const m: Record<string,string> = { encode: 'Enter text to encode to Base64...', decode: 'Paste Base64 string to decode...', url: 'Enter text to URL encode...', urldec: 'Paste URL encoded string to decode...' };
    return m[this.mode];
  }

  arrowLabel() {
    const m: Record<string,string> = { encode: '🔒 Encode to Base64 →', decode: '🔓 Decode from Base64 →', url: '🔗 URL Encode →', urldec: '🔗 URL Decode →' };
    return m[this.mode];
  }

  convert() {
    if (!this.input) { this.output.set(''); this.status.set(''); return; }
    try {
      switch (this.mode) {
        case 'encode': this.output.set(btoa(unescape(encodeURIComponent(this.input)))); this.status.set(`✅ Encoded — ${this.output().length} chars`); this.statusClass.set('success'); break;
        case 'decode':
          const dec = decodeURIComponent(escape(atob(this.input)));
          this.output.set(dec); this.status.set(`✅ Decoded — ${dec.length} chars`); this.statusClass.set('success'); break;
        case 'url': this.output.set(encodeURIComponent(this.input)); this.status.set('✅ URL encoded'); this.statusClass.set('success'); break;
        case 'urldec': this.output.set(decodeURIComponent(this.input)); this.status.set('✅ URL decoded'); this.statusClass.set('success'); break;
      }
    } catch (e: any) {
      this.output.set(''); this.status.set('❌ Error: ' + e.message); this.statusClass.set('error');
    }
  }

  swap() { this.input = this.output(); this.convert(); }
  clear() { this.input = ''; this.output.set(''); this.status.set(''); }
  copy() { navigator.clipboard.writeText(this.output()).then(() => { this.copied.set(true); setTimeout(() => this.copied.set(false), 2000); }); }

  encodeFile(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      this.output.set(`data:${file.type};base64,${b64}`);
      this.status.set(`✅ ${file.name} encoded — ${(b64.length / 1024).toFixed(1)} KB`);
      this.statusClass.set('success');
    };
    reader.readAsDataURL(file);
  }
}
