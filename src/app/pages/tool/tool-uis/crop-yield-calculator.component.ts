import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crop-yield-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="cyc-wrap">
      <div class="inp-grid">
        <div class="inp-field">
          <label>Crop Type</label>
          <select [(ngModel)]="cropKey" (change)="onCropChange()" class="sel">
            <option *ngFor="let c of crops" [value]="c.key">{{ c.icon }} {{ c.name }}</option>
          </select>
        </div>
        <div class="inp-field">
          <label>Field Area</label>
          <div class="inp-row">
            <div class="inp-box"><input type="number" [(ngModel)]="area" (input)="calc()" min="0.01" step="0.1" class="val-inp" /><span class="suf">{{ areaUnit }}</span></div>
            <select [(ngModel)]="areaUnit" (change)="calc()" class="unit-sel">
              <option>Acre</option><option>Hectare</option><option>Bigha</option><option>Guntha</option>
            </select>
          </div>
        </div>
        <div class="inp-field">
          <label>Seed Variety</label>
          <select [(ngModel)]="varietyKey" (change)="calc()" class="sel">
            <option *ngFor="let v of currentCrop()?.varieties" [value]="v.key">{{ v.name }}</option>
          </select>
        </div>
        <div class="inp-field">
          <label>Irrigation Type</label>
          <select [(ngModel)]="irrigation" (change)="calc()" class="sel">
            <option value="1">Fully Irrigated</option>
            <option value="0.75">Partially Irrigated</option>
            <option value="0.55">Rainfed</option>
          </select>
        </div>
        <div class="inp-field">
          <label>Soil Quality</label>
          <select [(ngModel)]="soilQuality" (change)="calc()" class="sel">
            <option value="1.1">Excellent (Loamy)</option>
            <option value="1.0">Good (Clay-Loam)</option>
            <option value="0.85">Average (Sandy)</option>
            <option value="0.7">Poor (Degraded)</option>
          </select>
        </div>
        <div class="inp-field">
          <label>Season</label>
          <select [(ngModel)]="season" (change)="calc()" class="sel">
            <option value="1">Rabi (Winter)</option>
            <option value="0.95">Kharif (Summer)</option>
            <option value="0.85">Zaid (Hot)</option>
          </select>
        </div>
      </div>

      <!-- Yield Results -->
      <div class="yield-results" *ngIf="result()">
        <div class="yr-cards">
          <div class="yrc main">
            <div class="yrc-icon">🌾</div>
            <div class="yrc-body">
              <div class="yrc-label">Estimated Yield</div>
              <div class="yrc-val">{{ result()!.yield | number:'1.1-1' }} Quintal</div>
              <div class="yrc-sub">{{ (result()!.yield * 100 | number:'1.0-0') }} kg total</div>
            </div>
          </div>
          <div class="yrc">
            <div class="yrc-icon">📊</div>
            <div class="yrc-body">
              <div class="yrc-label">Per Acre Yield</div>
              <div class="yrc-val green">{{ result()!.perAcre | number:'1.1-1' }} Q/acre</div>
              <div class="yrc-sub">National avg: {{ currentVariety()?.avgYield }} Q/acre</div>
            </div>
          </div>
          <div class="yrc">
            <div class="yrc-icon">💰</div>
            <div class="yrc-body">
              <div class="yrc-label">Est. Revenue (MSP)</div>
              <div class="yrc-val primary">₹{{ (result()!.yield * currentCrop()!.msp) | number:'1.0-0' }}</div>
              <div class="yrc-sub">MSP ₹{{ currentCrop()!.msp }}/quintal</div>
            </div>
          </div>
          <div class="yrc">
            <div class="yrc-icon">🎯</div>
            <div class="yrc-body">
              <div class="yrc-label">Yield vs Potential</div>
              <div class="yrc-val accent">{{ result()!.efficiency }}%</div>
              <div class="yrc-sub">{{ result()!.effLabel }}</div>
            </div>
          </div>
        </div>

        <!-- Yield comparison bars -->
        <div class="yield-chart">
          <div class="yc-title">📊 Yield Comparison</div>
          <div class="yc-bar-row">
            <span class="yc-lbl">Your Estimate</span>
            <div class="yc-track"><div class="yc-bar mine" [style.width.%]="(result()!.perAcre/currentCrop()!.maxYield)*100"></div></div>
            <span class="yc-val">{{ result()!.perAcre | number:'1.1-1' }} Q</span>
          </div>
          <div class="yc-bar-row">
            <span class="yc-lbl">National Avg</span>
            <div class="yc-track"><div class="yc-bar avg" [style.width.%]="(currentVariety()!.avgYield/currentCrop()!.maxYield)*100"></div></div>
            <span class="yc-val">{{ currentVariety()!.avgYield }} Q</span>
          </div>
          <div class="yc-bar-row">
            <span class="yc-lbl">Potential Max</span>
            <div class="yc-track"><div class="yc-bar max" style="width:100%"></div></div>
            <span class="yc-val">{{ currentCrop()!.maxYield }} Q</span>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations">
          <div class="rec-title">💡 Yield Improvement Tips</div>
          <div class="rec-list">
            <div class="rec-item" *ngFor="let r of result()!.tips">
              <span class="rec-icon">✅</span><span>{{ r }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Crop reference -->
      <div class="crop-ref">
        <div class="cr-title">📋 Crop Yield Reference (India)</div>
        <div class="table-scroll">
          <table class="cr-table">
            <thead><tr><th>Crop</th><th>Low (Q/ha)</th><th>Average (Q/ha)</th><th>High (Q/ha)</th><th>MSP (₹/Q)</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of crops" [class.active]="c.key===cropKey">
                <td><span class="crop-icon">{{ c.icon }}</span> {{ c.name }}</td>
                <td>{{ c.minYield * 2.47 | number:'1.0-0' }}</td>
                <td>{{ c.varieties[0].avgYield * 2.47 | number:'1.0-0' }}</td>
                <td>{{ c.maxYield * 2.47 | number:'1.0-0' }}</td>
                <td>₹{{ c.msp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cyc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .inp-field{display:flex;flex-direction:column;gap:.4rem}
    .inp-field label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .sel{padding:.5rem .65rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.85rem;outline:none;font-family:var(--font);width:100%}
    .inp-row{display:flex;gap:.4rem}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:8px;padding:.45rem .65rem;gap:.25rem;flex:1;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .val-inp{border:none;outline:none;background:transparent;font-size:.9rem;font-weight:700;color:var(--text);width:60px;font-family:var(--font)}
    .suf{font-size:.72rem;color:var(--text-muted)}
    .unit-sel{padding:.45rem .5rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.78rem;outline:none;font-family:var(--font)}
    .yr-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem}
    .yrc{display:flex;align-items:flex-start;gap:.65rem;padding:.9rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt)}
    .yrc.main{border-color:var(--primary);background:var(--primary-light)}
    .yrc-icon{font-size:1.3rem;flex-shrink:0}
    .yrc-body{display:flex;flex-direction:column;gap:.12rem}
    .yrc-label{font-size:.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .yrc-val{font-size:1rem;font-weight:800;color:var(--text)}
    .yrc-val.green{color:var(--green)} .yrc-val.primary{color:var(--primary)} .yrc-val.accent{color:var(--accent)}
    .yrc-sub{font-size:.68rem;color:var(--text-muted)}
    .yield-chart{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .yc-title{font-size:.82rem;font-weight:700;margin-bottom:.85rem}
    .yc-bar-row{display:grid;grid-template-columns:100px 1fr 55px;align-items:center;gap:.65rem;margin-bottom:.5rem}
    .yc-lbl{font-size:.75rem;color:var(--text-muted)}
    .yc-track{height:10px;background:var(--border);border-radius:99px;overflow:hidden}
    .yc-bar{height:100%;border-radius:99px;transition:width .4s}
    .yc-bar.mine{background:var(--primary)} .yc-bar.avg{background:var(--accent)} .yc-bar.max{background:var(--green)}
    .yc-val{font-size:.75rem;font-weight:700;text-align:right;color:var(--text)}
    .recommendations{padding:.85rem 1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .rec-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .rec-list{display:flex;flex-direction:column;gap:.4rem}
    .rec-item{display:flex;align-items:flex-start;gap:.5rem;font-size:.82rem;color:var(--text-muted)}
    .rec-icon{flex-shrink:0;color:var(--green)}
    .crop-ref{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .cr-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .table-scroll{overflow-x:auto}
    .cr-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .cr-table th{padding:.5rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .cr-table th:first-child{text-align:left}
    .cr-table td{padding:.45rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .cr-table td:first-child{text-align:left}
    .cr-table tr.active td{background:var(--primary-light)}
    .cr-table tr:hover td{background:var(--bg-alt)}
    .crop-icon{font-size:1rem}
    @media(max-width:768px){.inp-grid{grid-template-columns:repeat(2,1fr)}.yr-cards{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.inp-grid{grid-template-columns:1fr}.yr-cards{grid-template-columns:1fr}}
  `]
})
export class CropYieldCalculatorComponent implements OnInit {
  cropKey = 'wheat'; varietyKey = 'hyw'; irrigation = '1'; soilQuality = '1.0'; season = '1';
  area = 1; areaUnit = 'Acre';
  result = signal<any>(null);

  crops = [
    { key: 'wheat', icon: '🌾', name: 'Wheat', msp: 2275, minYield: 12, maxYield: 25,
      varieties: [{ key: 'hyw', name: 'HYV (HD-2967, PBW-343)', avgYield: 18, potential: 22 }, { key: 'trad', name: 'Traditional Varieties', avgYield: 12, potential: 15 }] },
    { key: 'rice', icon: '🌾', name: 'Rice', msp: 2183, minYield: 15, maxYield: 28,
      varieties: [{ key: 'hyb', name: 'Hybrid Rice', avgYield: 20, potential: 26 }, { key: 'ir', name: 'IR Varieties', avgYield: 16, potential: 22 }, { key: 'trad', name: 'Traditional', avgYield: 12, potential: 16 }] },
    { key: 'maize', icon: '🌽', name: 'Maize', msp: 1962, minYield: 18, maxYield: 35,
      varieties: [{ key: 'hyb', name: 'Hybrid Maize', avgYield: 25, potential: 32 }, { key: 'comp', name: 'Composite', avgYield: 18, potential: 24 }] },
    { key: 'cotton', icon: '☁️', name: 'Cotton', msp: 6620, minYield: 6, maxYield: 20,
      varieties: [{ key: 'bt', name: 'Bt Cotton', avgYield: 12, potential: 18 }, { key: 'desi', name: 'Desi Cotton', avgYield: 8, potential: 12 }] },
    { key: 'soybean', icon: '🫘', name: 'Soybean', msp: 4600, minYield: 8, maxYield: 22,
      varieties: [{ key: 'js', name: 'JS-335/9560', avgYield: 14, potential: 20 }] },
    { key: 'sugarcane', icon: '🎋', name: 'Sugarcane', msp: 315, minYield: 500, maxYield: 900,
      varieties: [{ key: 'co', name: 'CO/CoJ Varieties', avgYield: 680, potential: 850 }] },
  ];

  ngOnInit() { this.calc(); }

  currentCrop() { return this.crops.find(c => c.key === this.cropKey); }
  currentVariety() { return this.currentCrop()?.varieties.find(v => v.key === this.varietyKey); }

  onCropChange() { this.varietyKey = this.currentCrop()!.varieties[0].key; this.calc(); }

  toAcres() {
    switch (this.areaUnit) {
      case 'Hectare': return this.area * 2.47;
      case 'Bigha': return this.area * 0.625;
      case 'Guntha': return this.area / 40;
      default: return this.area;
    }
  }

  calc() {
    const crop = this.currentCrop(); const variety = this.currentVariety();
    if (!crop || !variety) return;
    const acres = this.toAcres();
    const baseYield = variety.avgYield;
    const adjusted = baseYield * Number(this.irrigation) * Number(this.soilQuality) * Number(this.season);
    const totalYield = adjusted * acres;
    const efficiency = Math.round((adjusted / variety.potential) * 100);

    const tips = [];
    if (Number(this.irrigation) < 1) tips.push('Install drip/sprinkler irrigation to increase yield by 20–30%');
    if (Number(this.soilQuality) < 1) tips.push('Improve soil health with organic matter and balanced NPK fertilizers');
    if (efficiency < 70) tips.push('Use certified HYV seeds from government-approved dealers');
    tips.push('Conduct soil testing before sowing for precise fertilizer application');
    tips.push('Timely pest management can prevent 15–40% yield losses');

    this.result.set({
      yield: totalYield,
      perAcre: adjusted,
      efficiency,
      effLabel: efficiency >= 85 ? '🏆 Excellent' : efficiency >= 70 ? '✅ Good' : efficiency >= 55 ? '⚠️ Average' : '📉 Below Average',
      tips,
    });
  }
}
