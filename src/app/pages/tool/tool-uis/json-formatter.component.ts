import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="tb-btn primary" (click)="format()">✨ Format</button>
          <button class="tb-btn" (click)="minify()">📦 Minify</button>
          <button class="tb-btn" (click)="validate()">✅ Validate</button>
          <button class="tb-btn" (click)="clear()">🗑 Clear</button>
        </div>
        <div class="toolbar-right">
          <select [(ngModel)]="indent" class="select-sm">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
          <button class="tb-btn" (click)="copy()">{{ copied() ? '✓ Copied!' : '📋 Copy' }}</button>
        </div>
      </div>

      <div class="status-bar" *ngIf="status()" [class]="statusClass()">
        {{ status() }}
      </div>

      <div class="editor-pane">
        <div class="pane-label">Input JSON</div>
        <textarea
          class="json-editor"
          [(ngModel)]="input"
          placeholder='Paste your JSON here...&#10;&#10;Example:&#10;{"name":"UtilityMega","tools":100,"free":true}'
          spellcheck="false"
        ></textarea>
      </div>

      <div class="editor-pane" *ngIf="output()">
        <div class="pane-label">Formatted Output</div>
        <pre class="json-output" [innerHTML]="highlighted()"></pre>
      </div>

      <div class="json-stats" *ngIf="stats()">
        <span>📏 {{ stats()!.chars }} chars</span>
        <span>📦 {{ stats()!.size }}</span>
        <span>🔑 {{ stats()!.keys }} keys</span>
      </div>

      <!-- Sample buttons -->
      <div class="samples">
        <span class="samples-label">Try sample:</span>
        <button class="sample-btn" (click)="loadSample('person')">Person</button>
        <button class="sample-btn" (click)="loadSample('api')">API Response</button>
        <button class="sample-btn" (click)="loadSample('nested')">Nested</button>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
    .toolbar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }
    .toolbar-left, .toolbar-right { display: flex; gap: .4rem; flex-wrap: wrap; align-items: center; }
    .tb-btn { padding: .45rem .9rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text); font-size: .82rem; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; }
    .tb-btn:hover { border-color: var(--primary); color: var(--primary); }
    .tb-btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .tb-btn.primary:hover { background: var(--primary-dark); }
    .select-sm { padding: .4rem .6rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text); font-size: .82rem; outline: none; font-family: inherit; }
    .status-bar { padding: .5rem .9rem; border-radius: 8px; font-size: .82rem; font-weight: 600; }
    .status-bar.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .status-bar.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .status-bar.info { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary); }
    .editor-pane { display: flex; flex-direction: column; gap: .35rem; }
    .pane-label { font-size: .75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
    .json-editor { width: 100%; height: 220px; padding: .85rem; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Courier New', monospace; font-size: .82rem; line-height: 1.6; background: var(--input-bg); color: var(--text); resize: vertical; outline: none; box-sizing: border-box; }
    .json-editor:focus { border-color: var(--primary); }
    .json-output { margin: 0; padding: .85rem; background: var(--bg-alt); border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Courier New', monospace; font-size: .82rem; line-height: 1.7; overflow: auto; max-height: 300px; white-space: pre; }
    .json-stats { display: flex; gap: 1rem; flex-wrap: wrap; font-size: .78rem; color: var(--text-muted); padding: .4rem .2rem; }
    .samples { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .samples-label { font-size: .78rem; color: var(--text-muted); font-weight: 600; }
    .sample-btn { padding: .3rem .7rem; border-radius: 99px; border: 1px solid var(--border); background: var(--bg-alt); color: var(--text-muted); font-size: .78rem; cursor: pointer; transition: all .15s; font-family: inherit; }
    .sample-btn:hover { border-color: var(--primary); color: var(--primary); }
    /* Syntax highlighting */
    :host ::ng-deep .jk { color: #a855f7; }
    :host ::ng-deep .js { color: #16a34a; }
    :host ::ng-deep .jn { color: #0ea5e9; }
    :host ::ng-deep .jb { color: #f59e0b; }
    :host ::ng-deep .jl { color: var(--text-muted); }
  `]
})
export class JsonFormatterComponent {
  input = '';
  indent: string = '2';
  output = signal('');
  highlighted = signal('');
  status = signal('');
  statusClass = signal('info');
  copied = signal(false);
  stats = signal<{ chars: number; size: string; keys: number } | null>(null);

  readonly SAMPLES: Record<string, string> = {
    person: JSON.stringify({ id: 1, name: "John Doe", email: "john@example.com", age: 30, active: true, address: { city: "Mumbai", state: "Maharashtra", pin: "400001" }, tags: ["premium", "verified"] }, null, 2),
    api: JSON.stringify({ status: "success", code: 200, data: { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }], total: 2, page: 1 }, timestamp: new Date().toISOString() }, null, 2),
    nested: JSON.stringify({ company: "UtilityMega", tools: { calculators: ["SIP", "EMI", "BMI"], developer: ["JSON", "Base64", "Regex"] }, config: { adsense: true, ssr: true, darkMode: true }, version: "2.0.0" }, null, 2)
  };

  loadSample(key: string) { this.input = this.SAMPLES[key]; this.format(); }

  format() {
    try {
      const ind = this.indent === 'tab' ? '\t' : Number(this.indent);
      const parsed = JSON.parse(this.input);
      const fmt = JSON.stringify(parsed, null, ind);
      this.output.set(fmt);
      this.highlighted.set(this.highlight(fmt));
      this.setStats(fmt, parsed);
      this.status.set('✅ Valid JSON — formatted successfully');
      this.statusClass.set('success');
    } catch (e: any) {
      this.status.set('❌ Invalid JSON: ' + e.message);
      this.statusClass.set('error');
      this.output.set('');
      this.stats.set(null);
    }
  }

  minify() {
    try {
      const min = JSON.stringify(JSON.parse(this.input));
      this.output.set(min);
      this.highlighted.set(this.escapeHtml(min));
      this.status.set(`✅ Minified — ${min.length} chars`);
      this.statusClass.set('success');
    } catch (e: any) {
      this.status.set('❌ ' + e.message);
      this.statusClass.set('error');
    }
  }

  validate() {
    try {
      JSON.parse(this.input);
      this.status.set('✅ Valid JSON!');
      this.statusClass.set('success');
    } catch (e: any) {
      this.status.set('❌ ' + e.message);
      this.statusClass.set('error');
    }
  }

  clear() { this.input = ''; this.output.set(''); this.status.set(''); this.stats.set(null); }

  copy() {
    const text = this.output() || this.input;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  setStats(fmt: string, parsed: any) {
    const bytes = new Blob([fmt]).size;
    const size = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
    const keys = this.countKeys(parsed);
    this.stats.set({ chars: fmt.length, size, keys });
  }

  countKeys(obj: any, count = 0): number {
    if (typeof obj !== 'object' || obj === null) return count;
    for (const k in obj) { count++; count = this.countKeys(obj[k], count); }
    return count;
  }

  highlight(json: string): string {
    return this.escapeHtml(json)
      .replace(/"([^"]+)":/g, '<span class="jk">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="js">"$1"</span>')
      .replace(/: (-?\d+\.?\d*)/g, ': <span class="jn">$1</span>')
      .replace(/: (true|false)/g, ': <span class="jb">$1</span>')
      .replace(/: (null)/g, ': <span class="jl">$1</span>');
  }

  escapeHtml(s: string) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
}
