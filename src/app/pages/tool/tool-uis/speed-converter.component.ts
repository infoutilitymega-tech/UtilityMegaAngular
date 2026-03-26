import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-speed-converter',
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
            <optgroup label="Scientific">
              <option *ngFor="let u of scientificUnits" [value]="u.key">{{ u.label }}</option>
            </optgroup>
            <optgroup label="Other">
              <option *ngFor="let u of otherUnits" [value]="u.key">{{ u.label }}</option>
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
            <div class="group-title">🚗 Common</div>
            <div class="result-item" *ngFor="let u of commonUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🔬 Scientific</div>
            <div class="result-item" *ngFor="let u of scientificUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🌐 Other</div>
            <div class="result-item" *ngFor="let u of otherUnits" [class.from-unit]="u.key===fromUnit">
              <span class="ri-unit">{{ u.label }}</span>
              <span class="ri-val">{{ fmt(results()[u.key]) }}</span>
              <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
            </div>
          </div>
        </div>

        <div class="scale-section">
          <div class="scale-title">🏎️ Speed Reference Points</div>
          <div class="speed-refs">
            <div class="sr-item" *ngFor="let ref of speedRefs">
              <div class="sr-icon">{{ ref.icon }}</div>
              <div class="sr-desc">{{ ref.desc }}</div>
              <div class="sr-vals">
                <span class="sr-kmh">{{ ref.kmh }} km/h</span>
                <span class="sr-mph">{{ ref.mph }} mph</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Quick Reference</div>
        <div class="table-scroll">
          <table class="conv-table">
            <thead><tr><th>Unit</th><th>= 1 km/h</th><th>= 1 mph</th><th>= 1 m/s</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of tableUnits()">
                <td><strong>{{ u.label }}</strong></td>
                <td>{{ fmtRef(1 / u.toMps * (1000/3600)) }}</td>
                <td>{{ fmtRef(1 / u.toMps * (1609.344/3600)) }}</td>
                <td>{{ fmtRef(1 / u.toMps) }}</td>
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
    .speed-refs{display:flex;flex-direction:column}
    .sr-item{display:grid;grid-template-columns:2rem 1fr auto;align-items:center;gap:.75rem;padding:.5rem .9rem;border-bottom:1px solid var(--border)}
    .sr-item:last-child{border-bottom:none}
    .sr-icon{font-size:1rem}
    .sr-desc{font-size:.78rem;color:var(--text)}
    .sr-vals{display:flex;gap:1rem;font-size:.75rem;font-weight:700;color:var(--text-muted)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .conv-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .conv-table th{padding:.5rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .conv-table th:first-child{text-align:left}
    .conv-table td{padding:.45rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .conv-table td:first-child{text-align:left}
    .conv-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.results-grid{grid-template-columns:1fr}}
  `]
})
export class SpeedConverterComponent {
  value: number | null = 1;
  fromUnit = 'kmh';
  copiedKey = signal('');
  results = signal<Record<string, number>>({});

  // toMps = to meters per second
  commonUnits = [
    { key: 'mps', label: 'Meter/sec (m/s)', toMps: 1 },
    { key: 'kmh', label: 'Kilometer/hr (km/h)', toMps: 1000 / 3600 },
    { key: 'mph', label: 'Mile/hr (mph)', toMps: 1609.344 / 3600 },
    { key: 'fps', label: 'Foot/sec (ft/s)', toMps: 0.3048 },
    { key: 'kn', label: 'Knot (kn)', toMps: 1852 / 3600 },
  ];

  scientificUnits = [
    { key: 'c', label: 'Speed of Light (c)', toMps: 299_792_458 },
    { key: 'mach', label: 'Mach (at sea level)', toMps: 340.29 },
    { key: 'cms', label: 'Centimeter/sec (cm/s)', toMps: 0.01 },
  ];

  otherUnits = [
    { key: 'mipm', label: 'Mile/minute', toMps: 26.8224 },
    { key: 'kmm', label: 'Kilometer/min', toMps: 1000 / 60 },
    { key: 'fpm', label: 'Foot/minute', toMps: 0.00508 },
  ];

  popularPairs = [
    { from: 'kmh', label: 'km/h → mph' },
    { from: 'mph', label: 'mph → km/h' },
    { from: 'mps', label: 'm/s → km/h' },
    { from: 'kn', label: 'knot → km/h' },
    { from: 'mach', label: 'Mach → km/h' },
  ];

  speedRefs = [
    { icon: '🚶', desc: 'Walking pace', kmh: 5, mph: 3.1 },
    { icon: '🚴', desc: 'Cycling speed', kmh: 25, mph: 15.5 },
    { icon: '🚗', desc: 'Highway driving', kmh: 120, mph: 74.6 },
    { icon: '✈️', desc: 'Passenger jet', kmh: 900, mph: 559 },
    { icon: '🚀', desc: 'Space Shuttle', kmh: 28_000, mph: 17_398 },
  ];

  tableUnits() { return [...this.commonUnits, ...this.scientificUnits.slice(0, 2)]; }
  allUnits() { return [...this.commonUnits, ...this.scientificUnits, ...this.otherUnits]; }
  unitLabel(key: string) { return this.allUnits().find(u => u.key === key)?.label ?? key; }

  convert() {
    if (this.value == null) return;
    const base = this.allUnits().find(u => u.key === this.fromUnit)!;
    const inMps = this.value * base.toMps;
    const out: Record<string, number> = {};
    this.allUnits().forEach(u => { out[u.key] = inMps / u.toMps; });
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

  copyVal(key: string) {
    const val = this.results()[key];
    navigator.clipboard.writeText(String(val)).then(() => { this.copiedKey.set(key); setTimeout(() => this.copiedKey.set(''), 2000); });
  }
}
