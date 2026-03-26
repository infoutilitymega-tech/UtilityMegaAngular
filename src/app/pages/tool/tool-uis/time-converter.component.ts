import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lc-wrap">
      <div class="main-input">
        <div class="mi-val">
          <input type="number" [(ngModel)]="value" (input)="convert()" class="big-inp" placeholder="1" />
        </div>
        <div class="mi-unit">
          <select [(ngModel)]="fromUnit" (change)="convert()" class="unit-sel">
            <optgroup label="Common">
              <option *ngFor="let u of commonUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
            <optgroup label="Small">
              <option *ngFor="let u of smallUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
            <optgroup label="Large">
              <option *ngFor="let u of largeUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div class="popular-row">
        <button *ngFor="let p of popularPairs" class="pop-btn" (click)="setConversion(p.from)">
          {{ p.label }}
        </button>
      </div>

      <div class="results-section" *ngIf="value">
        <div class="results-title">Conversion Results for <strong>{{ value }} {{ unitLabel(fromUnit) }}</strong></div>
        <div class="results-grid">
          <div class="group-section">
            <div class="group-title">⏱️ Common</div>
            <div class="result-item" *ngFor="let u of commonUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🔬 Small</div>
            <div class="result-item" *ngFor="let u of smallUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">📅 Large</div>
            <div class="result-item" *ngFor="let u of largeUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
        </div>

        <div class="scale-section">
          <div class="scale-title">📊 Visual Scale Comparison</div>
          <div class="scale-bars">
            <div class="sb-item" *ngFor="let u of scaleUnits()">
              <span class="sb-unit">{{ u.label }}</span>
              <div class="sb-track">
                <div class="sb-fill" [style.width.%]="u.pct" [class.from-bar]="u.key===fromUnit"></div>
              </div>
              <span class="sb-val">{{ fmt(results()[u.key]) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Quick Reference</div>
        <div class="table-scroll">
          <table class="conv-table">
            <thead><tr><th>Unit</th><th>= 1 Second</th><th>= 1 Minute</th><th>= 1 Hour</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of tableUnits()">
                <td><strong>{{ u.label }}</strong></td>
                <td>{{ fmtRef(1 / u.toSeconds) }}</td>
                <td>{{ fmtRef(60 / u.toSeconds) }}</td>
                <td>{{ fmtRef(3600 / u.toSeconds) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .main-input{display:flex;gap:.85rem;align-items:center;padding:1.25rem;background:var(--primary-light);border-radius:14px;border:1.5px solid var(--primary)44}
    .mi-val{flex:1}
    .big-inp{width:100%;border:none;outline:none;background:transparent;font-size:2rem;font-weight:900;color:var(--primary);font-family:var(--font)}
    .mi-unit{flex-shrink:0}
    .unit-sel{padding:.6rem 1rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.88rem;outline:none;font-family:var(--font);min-width:180px}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .results-title{font-size:.83rem;font-weight:700;color:var(--text-muted)}
    .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .group-section{display:flex;flex-direction:column;gap:.3rem}
    .group-title{font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;padding:.2rem 0;border-bottom:1px solid var(--border);margin-bottom:.2rem}
    .result-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .55rem;border-radius:8px;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .result-item.from-unit{background:var(--primary-light);border:1px solid var(--primary)33}
    .ri-unit{font-size:.78rem;color:var(--text-muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ri-val{font-size:.85rem;font-weight:700;color:var(--text);white-space:nowrap}
    .result-item.from-unit .ri-val{color:var(--primary)}
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;flex-shrink:0;transition:color .15s}
    .ri-copy.copied{color:var(--green)}
    .scale-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .scale-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .scale-bars{display:flex;flex-direction:column;gap:.45rem;padding:.75rem .9rem}
    .sb-item{display:grid;grid-template-columns:100px 1fr 90px;align-items:center;gap:.65rem}
    .sb-unit{font-size:.75rem;color:var(--text-muted)}
    .sb-track{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .sb-fill{height:100%;background:var(--primary);border-radius:99px;opacity:.65;transition:width .4s}
    .sb-fill.from-bar{opacity:1}
    .sb-val{font-size:.75rem;font-weight:700;color:var(--text);text-align:right}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .conv-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .conv-table th{padding:.5rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .conv-table th:first-child{text-align:left}
    .conv-table td{padding:.45rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .conv-table td:first-child{text-align:left}
    .conv-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.results-grid{grid-template-columns:1fr}.sb-item{grid-template-columns:80px 1fr 70px}}
  `]
})
export class TimeConverterComponent {
  value: number | null = 1;
  fromUnit = 'hr';
  copiedKey = signal('');
  results = signal<Record<string, number>>({});

  commonUnits = [
    { key: 'wk', label: 'Week', toSeconds: 604800 },
    { key: 'day', label: 'Day', toSeconds: 86400 },
    { key: 'hr', label: 'Hour', toSeconds: 3600 },
    { key: 'min', label: 'Minute', toSeconds: 60 },
    { key: 's', label: 'Second', toSeconds: 1 },
  ];

  smallUnits = [
    { key: 'ms', label: 'Millisecond (ms)', toSeconds: 0.001 },
    { key: 'us', label: 'Microsecond (μs)', toSeconds: 0.000001 },
    { key: 'ns', label: 'Nanosecond (ns)', toSeconds: 1e-9 },
    { key: 'ps', label: 'Picosecond (ps)', toSeconds: 1e-12 },
  ];

  largeUnits = [
    { key: 'mo', label: 'Month (avg)', toSeconds: 2629800 },
    { key: 'yr', label: 'Year', toSeconds: 31557600 },
    { key: 'dec', label: 'Decade', toSeconds: 315576000 },
    { key: 'cent', label: 'Century', toSeconds: 3155760000 },
  ];

  popularPairs = [
    { from: 'hr', label: 'hr → min' },
    { from: 'day', label: 'day → hr' },
    { from: 'wk', label: 'wk → days' },
    { from: 'yr', label: 'yr → days' },
    { from: 'min', label: 'min → sec' },
  ];

  tableUnits() { return [...this.commonUnits, ...this.largeUnits.slice(0, 2)]; }
  allUnits() { return [...this.commonUnits, ...this.smallUnits, ...this.largeUnits]; }
  unitLabel(key: string) { return this.allUnits().find(u => u.key === key)?.label ?? key; }

  convert() {
    if (this.value == null) return;
    const base = this.allUnits().find(u => u.key === this.fromUnit)!;
    const inSeconds = this.value * base.toSeconds;
    const out: Record<string, number> = {};
    this.allUnits().forEach(u => { out[u.key] = inSeconds / u.toSeconds; });
    this.results.set(out);
  }

  setConversion(from: string) { this.fromUnit = from; this.convert(); }

  fmt(n: number): string {
    if (n === undefined || n === null) return '—';
    if (Math.abs(n) >= 1e12) return n.toExponential(3);
    if (Math.abs(n) >= 1e6) return n.toExponential(3);
    if (Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(3);
    if (Math.abs(n) < 0.001) return n.toFixed(8);
    if (Math.abs(n) < 1) return n.toFixed(6);
    if (Math.abs(n) >= 1000) return n.toLocaleString('en-IN', { maximumFractionDigits: 4 });
    return n.toFixed(6).replace(/\.?0+$/, '');
  }

  fmtRef(n: number) { return this.fmt(n); }

  scaleUnits() {
    const r = this.results();
    const units = [...this.commonUnits.slice(0, 4), ...this.largeUnits.slice(0, 2)];
    const vals = units.map(u => ({ ...u, val: Math.abs(r[u.key] || 0) }));
    const max = Math.max(...vals.map(v => Math.min(v.val, 1e10)));
    return vals.map(u => ({ ...u, pct: max > 0 ? Math.min((Math.min(u.val, 1e10) / max) * 100, 100) : 0 }));
  }

  copyVal(key: string) {
    const val = this.results()[key];
    navigator.clipboard.writeText(String(val)).then(() => { this.copiedKey.set(key); setTimeout(() => this.copiedKey.set(''), 2000); });
  }
}
