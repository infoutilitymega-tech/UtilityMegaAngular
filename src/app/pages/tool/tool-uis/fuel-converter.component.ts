import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fuel-converter',
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
            <option *ngFor="let u of allUnits" [value]="u.key">{{ u.label }}</option>
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

        <div class="fuel-cards">
          <div class="fuel-card" *ngFor="let u of allUnits" [class.from-unit]="u.key===fromUnit">
            <div class="fc-name">{{ u.label }}</div>
            <div class="fc-val">{{ fmt(results()[u.key]) }}</div>
            <div class="fc-symbol">{{ u.symbol }}</div>
            <button class="ri-copy" (click)="copyVal(u.key)" [class.copied]="copiedKey()===u.key">{{ copiedKey()===u.key?'✓':'📋' }}</button>
          </div>
        </div>

        <div class="scale-section">
          <div class="scale-title">🚗 Fuel Efficiency Reference</div>
          <div class="fuel-refs">
            <div class="fr-item" *ngFor="let ref of fuelRefs">
              <div class="fr-icon">{{ ref.icon }}</div>
              <div class="fr-desc">{{ ref.desc }}</div>
              <div class="fr-vals">
                <span>{{ ref.mpg }} mpg</span>
                <span>{{ ref.kml }} km/L</span>
                <span>{{ ref.l100k }} L/100km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Conversion Note</div>
        <div class="note-box">
          <p>⚠️ <strong>Important:</strong> Fuel consumption (L/100km, gal/100mi) is <em>inversely proportional</em> to fuel economy (km/L, mpg). Higher mpg = more efficient. Lower L/100km = more efficient.</p>
          <p>Formula: <code>L/100km = 235.215 / (mpg·US)</code> and <code>mpg·US = 235.215 / (L/100km)</code></p>
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
    .unit-sel{padding:.6rem 1rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.88rem;outline:none;font-family:var(--font);min-width:200px}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .results-title{font-size:.83rem;font-weight:700;color:var(--text-muted)}
    .fuel-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
    .fuel-card{display:flex;flex-direction:column;align-items:center;padding:.9rem .5rem;border:1.5px solid var(--border);border-radius:12px;gap:.2rem;transition:all .15s;background:var(--card-bg);text-align:center}
    .fuel-card.from-unit{border-color:var(--primary);background:var(--primary-light)}
    .fc-name{font-size:.7rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.04em}
    .fc-val{font-size:1.35rem;font-weight:900;color:var(--text)}
    .fuel-card.from-unit .fc-val{color:var(--primary)}
    .fc-symbol{font-size:.7rem;color:var(--text-muted)}
    .ri-copy{background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:var(--text-muted);font-size:.68rem;padding:.2rem .45rem;font-family:var(--font);transition:all .15s;margin-top:.2rem}
    .ri-copy:hover{color:var(--primary);border-color:var(--primary)}
    .ri-copy.copied{color:var(--green);border-color:var(--green)}
    .scale-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .scale-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .fuel-refs{display:flex;flex-direction:column}
    .fr-item{display:grid;grid-template-columns:2rem 1fr auto;align-items:center;gap:.75rem;padding:.5rem .9rem;border-bottom:1px solid var(--border)}
    .fr-item:last-child{border-bottom:none}
    .fr-icon{font-size:1rem}
    .fr-desc{font-size:.78rem;color:var(--text)}
    .fr-vals{display:flex;gap:.75rem;font-size:.72rem;font-weight:700;color:var(--text-muted)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .note-box{background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem;font-size:.8rem;color:var(--text);display:flex;flex-direction:column;gap:.5rem}
    .note-box code{background:var(--border);padding:.1rem .3rem;border-radius:4px;font-size:.76rem}
    @media(max-width:640px){.fuel-cards{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class FuelConverterComponent {
  value: number | null = 30;
  fromUnit = 'mpg_us';
  copiedKey = signal('');
  results = signal<Record<string, number>>({});

  allUnits = [
    { key: 'mpg_us', label: 'MPG (US)', symbol: 'mi/gal·US', toKml: (v: number) => v * 1.60934 / 3.78541 },
    { key: 'mpg_uk', label: 'MPG (UK)', symbol: 'mi/gal·UK', toKml: (v: number) => v * 1.60934 / 4.54609 },
    { key: 'kml', label: 'km/L', symbol: 'km/liter', toKml: (v: number) => v },
    { key: 'l100km', label: 'L/100km', symbol: 'L per 100 km', toKml: (v: number) => 100 / v },
    { key: 'mipl', label: 'Miles/Liter', symbol: 'mi/L', toKml: (v: number) => v * 1.60934 },
    { key: 'kmpg_us', label: 'km/gal·US', symbol: 'km/gal·US', toKml: (v: number) => v / 3.78541 },
  ];

  popularPairs = [
    { from: 'mpg_us', label: 'mpg → km/L' },
    { from: 'kml', label: 'km/L → mpg' },
    { from: 'l100km', label: 'L/100km → mpg' },
    { from: 'mpg_uk', label: 'mpg·UK → mpg·US' },
  ];

  fuelRefs = [
    { icon: '🏎️', desc: 'Sports car (avg)', mpg: 20, kml: 8.5, l100k: 11.8 },
    { icon: '🚗', desc: 'Regular sedan', mpg: 30, kml: 12.7, l100k: 7.8 },
    { icon: '🚌', desc: 'Hybrid car', mpg: 50, kml: 21.3, l100k: 4.7 },
    { icon: '🚛', desc: 'Truck / SUV', mpg: 18, kml: 7.7, l100k: 13 },
  ];

  unitLabel(key: string) { return this.allUnits.find(u => u.key === key)?.label ?? key; }

  convert() {
    if (this.value == null || this.value === 0) return;
    const base = this.allUnits.find(u => u.key === this.fromUnit)!;
    const inKml = base.toKml(this.value);
    const out: Record<string, number> = {};
    this.allUnits.forEach(u => {
      // invert from km/L to each unit
      switch (u.key) {
        case 'kml': out[u.key] = inKml; break;
        case 'mpg_us': out[u.key] = inKml * 3.78541 / 1.60934; break;
        case 'mpg_uk': out[u.key] = inKml * 4.54609 / 1.60934; break;
        case 'l100km': out[u.key] = 100 / inKml; break;
        case 'mipl': out[u.key] = inKml / 1.60934; break;
        case 'kmpg_us': out[u.key] = inKml * 3.78541; break;
        default: out[u.key] = inKml;
      }
    });
    this.results.set(out);
  }

  setConversion(from: string) { this.fromUnit = from; this.convert(); }

  fmt(n: number): string {
    if (n === undefined || n === null || !isFinite(n)) return '—';
    return n.toFixed(2);
  }

  copyVal(key: string) {
    const val = this.results()[key];
    navigator.clipboard.writeText(String(val)).then(() => { this.copiedKey.set(key); setTimeout(() => this.copiedKey.set(''), 2000); });
  }
}
