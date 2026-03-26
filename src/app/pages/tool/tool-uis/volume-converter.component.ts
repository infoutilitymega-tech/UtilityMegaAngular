import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-volume-converter',
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
            <optgroup label="Metric">
              <option *ngFor="let u of metricUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
            <optgroup label="Imperial (US)">
              <option *ngFor="let u of usUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
            <optgroup label="Imperial (UK)">
              <option *ngFor="let u of ukUnits" [value]="u.key">{{ u.label }}</option>
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
            <div class="group-title">🧪 Metric</div>
            <div class="result-item" *ngFor="let u of metricUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🇺🇸 US Imperial</div>
            <div class="result-item" *ngFor="let u of usUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🇬🇧 UK Imperial</div>
            <div class="result-item" *ngFor="let u of ukUnits" [class.from-unit]="u.key===fromUnit">
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
            <thead><tr><th>Unit</th><th>= 1 Liter</th><th>= 1 US Gallon</th><th>= 1 US Cup</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of tableUnits()">
                <td><strong>{{ u.label }}</strong></td>
                <td>{{ fmtRef(1 / u.toLiters) }}</td>
                <td>{{ fmtRef(3.78541 / u.toLiters) }}</td>
                <td>{{ fmtRef(0.236588 / u.toLiters) }}</td>
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
export class VolumeConverterComponent {
  value: number | null = 1;
  fromUnit = 'l';
  copiedKey = signal('');
  results = signal<Record<string, number>>({});

  metricUnits = [
    { key: 'm3', label: 'Cubic Meter (m³)', toLiters: 1000 },
    { key: 'hl', label: 'Hectoliter (hL)', toLiters: 100 },
    { key: 'l', label: 'Liter (L)', toLiters: 1 },
    { key: 'dl', label: 'Deciliter (dL)', toLiters: 0.1 },
    { key: 'cl', label: 'Centiliter (cL)', toLiters: 0.01 },
    { key: 'ml', label: 'Milliliter (mL)', toLiters: 0.001 },
    { key: 'cm3', label: 'Cubic Cm (cm³)', toLiters: 0.001 },
  ];

  usUnits = [
    { key: 'usgal', label: 'US Gallon', toLiters: 3.78541 },
    { key: 'usqt', label: 'US Quart', toLiters: 0.946353 },
    { key: 'uspt', label: 'US Pint', toLiters: 0.473176 },
    { key: 'uscup', label: 'US Cup', toLiters: 0.236588 },
    { key: 'usfloz', label: 'US Fl. Oz.', toLiters: 0.0295735 },
    { key: 'ustbsp', label: 'US Tablespoon', toLiters: 0.0147868 },
    { key: 'ustsp', label: 'US Teaspoon', toLiters: 0.00492892 },
  ];

  ukUnits = [
    { key: 'ukgal', label: 'UK Gallon', toLiters: 4.54609 },
    { key: 'ukqt', label: 'UK Quart', toLiters: 1.13652 },
    { key: 'ukpt', label: 'UK Pint', toLiters: 0.568261 },
    { key: 'ukfloz', label: 'UK Fl. Oz.', toLiters: 0.0284131 },
  ];

  popularPairs = [
    { from: 'l', label: 'L → US Gal' },
    { from: 'usgal', label: 'US Gal → L' },
    { from: 'ml', label: 'mL → fl oz' },
    { from: 'usfloz', label: 'fl oz → mL' },
    { from: 'l', label: 'L → UK Gal' },
  ];

  tableUnits() { return [...this.metricUnits.slice(0, 4), ...this.usUnits.slice(0, 3)]; }
  allUnits() { return [...this.metricUnits, ...this.usUnits, ...this.ukUnits]; }
  unitLabel(key: string) { return this.allUnits().find(u => u.key === key)?.label ?? key; }

  convert() {
    if (this.value == null) return;
    const base = this.allUnits().find(u => u.key === this.fromUnit)!;
    const inLiters = this.value * base.toLiters;
    const out: Record<string, number> = {};
    this.allUnits().forEach(u => { out[u.key] = inLiters / u.toLiters; });
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
    const units = [...this.metricUnits.slice(0, 4), ...this.usUnits.slice(0, 3)];
    const vals = units.map(u => ({ ...u, val: Math.abs(r[u.key] || 0) }));
    const max = Math.max(...vals.map(v => Math.min(v.val, 1e10)));
    return vals.map(u => ({ ...u, pct: max > 0 ? Math.min((Math.min(u.val, 1e10) / max) * 100, 100) : 0 }));
  }

  copyVal(key: string) {
    const val = this.results()[key];
    navigator.clipboard.writeText(String(val)).then(() => { this.copiedKey.set(key); setTimeout(() => this.copiedKey.set(''), 2000); });
  }
}
