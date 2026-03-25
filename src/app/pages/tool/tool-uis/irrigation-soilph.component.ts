import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Irrigation Calculator ────────────────────────────────────────────────────
@Component({
  selector: 'app-irrigation-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#1e40af,#0284c7)">
        <span class="hb-icon">💧</span>
        <div>
          <div class="hb-title">Irrigation Water Calculator</div>
          <div class="hb-sub">Calculate water requirements, pump capacity & irrigation schedule</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🌱 Crop & Field</div>
          <div class="field">
            <label class="lbl">Crop</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="onCropChange()" class="sel">
              <option *ngFor="let c of crops" [value]="c.name">{{c.name}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Growth Stage</label>
            <select [(ngModel)]="stage" (ngModelChange)="calculate()" class="sel">
              <option *ngFor="let s of stages" [value]="s.key">{{s.label}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Field Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" step="0.5" />
          </div>
          <div class="field">
            <label class="lbl">Soil Type</label>
            <select [(ngModel)]="soilType" (ngModelChange)="calculate()" class="sel">
              <option value="sandy">Sandy (high drainage, water every 2-3 days)</option>
              <option value="loamy">Loamy (best, water every 4-5 days)</option>
              <option value="clay">Clay (holds water, every 6-7 days)</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Irrigation Method</label>
            <select [(ngModel)]="method" (ngModelChange)="calculate()" class="sel">
              <option value="flood">Flood Irrigation (60% efficiency)</option>
              <option value="furrow">Furrow Irrigation (70% efficiency)</option>
              <option value="sprinkler">Sprinkler (80% efficiency)</option>
              <option value="drip">Drip Irrigation (95% efficiency)</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <div class="fg-title">☀️ Climate & Source</div>
          <div class="field">
            <label class="lbl">Season / Temperature</label>
            <select [(ngModel)]="tempZone" (ngModelChange)="calculate()" class="sel">
              <option value="cool">Cool (Winter, 15–25°C)</option>
              <option value="moderate">Moderate (Spring/Autumn, 25–30°C)</option>
              <option value="hot">Hot (Summer, 30–40°C)</option>
              <option value="very_hot">Very Hot (>40°C)</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Rainfall (mm/week)</label>
            <input type="number" [(ngModel)]="rainfall" (ngModelChange)="calculate()" class="inp" min="0" step="5" placeholder="0" />
          </div>
          <div class="field">
            <label class="lbl">Water Source</label>
            <select [(ngModel)]="waterSource" class="sel">
              <option value="borewell">Borewell / Tubewell</option>
              <option value="canal">Canal Irrigation</option>
              <option value="pond">Farm Pond / Reservoir</option>
              <option value="river">River / Nala</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Pump Discharge (litres/min)</label>
            <input type="number" [(ngModel)]="pumpLPM" (ngModelChange)="calculate()" class="inp" min="50" step="50" placeholder="1000" />
          </div>
        </div>
      </div>

      <div class="results-section" *ngIf="result()">
        <div class="rs-title">💧 Irrigation Requirements</div>
        <div class="results-grid">
          <div class="result-card blue">
            <div class="rc-icon">💧</div>
            <div class="rc-val">{{result()!.waterPerIrrigation.toLocaleString('en-IN')}} L</div>
            <div class="rc-label">Water per Irrigation</div>
            <div class="rc-sub">{{(result()!.waterPerIrrigation/1000).toFixed(1)}} KL per event</div>
          </div>
          <div class="result-card green">
            <div class="rc-icon">⏱</div>
            <div class="rc-val">{{result()!.pumpHours}} hrs</div>
            <div class="rc-label">Pump Run Time</div>
            <div class="rc-sub">At {{pumpLPM}} L/min</div>
          </div>
          <div class="result-card accent">
            <div class="rc-icon">📅</div>
            <div class="rc-val">{{result()!.irrigationsPerWeek}}/week</div>
            <div class="rc-label">Irrigations/Week</div>
            <div class="rc-sub">Every {{result()!.daysBetween}} days</div>
          </div>
          <div class="result-card">
            <div class="rc-icon">🌊</div>
            <div class="rc-val">{{result()!.weeklyWater.toLocaleString('en-IN')}} L</div>
            <div class="rc-label">Weekly Total Water</div>
            <div class="rc-sub">{{(result()!.weeklyWater/1000).toFixed(0)}} KL/week</div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="schedule-card">
          <div class="sc-title">📅 Recommended Irrigation Schedule</div>
          <div class="schedule-grid">
            <div class="sg-item" *ngFor="let s of result()!.schedule">
              <div class="sgi-day">{{s.day}}</div>
              <div class="sgi-action" [class.irrigate]="s.irrigate">{{s.irrigate?'💧 Irrigate':'☀️ Dry'}}</div>
              <div class="sgi-note">{{s.note}}</div>
            </div>
          </div>
        </div>

        <!-- Water saving tips -->
        <div class="tips-section">
          <div class="ts-title">💡 Water Saving Tips for {{selectedCrop}}</div>
          <div class="tip-item" *ngFor="let t of cropTips()">{{t}}</div>
        </div>
      </div>

      <!-- Crop water needs reference -->
      <div class="ref-section">
        <div class="ref-title">Crop Water Requirements (mm per season)</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let c of crops">
            <span class="ri-name">{{c.name}}</span>
            <span class="ri-water">{{c.minWater}}–{{c.maxWater}} mm</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;border-radius:14px;padding:1rem 1.25rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.8}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .results-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem 1.25rem;margin-bottom:1.25rem}
    .rs-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.85rem}
    .results-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-bottom:.85rem}
    @media(max-width:700px){.results-grid{grid-template-columns:repeat(2,1fr)}}
    .result-card{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:.75rem .85rem;text-align:center}
    .result-card.accent{border-color:#fbbf24;background:#fffbeb}
    .result-card.green{border-color:#86efac;background:#f0fdf4}
    .result-card.blue{border-color:#93c5fd;background:#eff6ff}
    .rc-icon{font-size:1.5rem;margin-bottom:.3rem}
    .rc-val{font-size:1.05rem;font-weight:800;color:#111827;margin-bottom:.1rem}
    .rc-label{font-size:.63rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.15rem}
    .rc-sub{font-size:.68rem;color:#6b7280}
    .schedule-card{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .sc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .schedule-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.3rem}
    @media(max-width:600px){.schedule-grid{grid-template-columns:repeat(4,1fr)}}
    .sg-item{border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .3rem;text-align:center}
    .sgi-day{font-size:.62rem;font-weight:700;color:#9ca3af;margin-bottom:.15rem}
    .sgi-action{font-size:.7rem;font-weight:700;margin-bottom:.1rem}
    .sgi-action.irrigate{color:#0284c7}
    .sgi-note{font-size:.58rem;color:#9ca3af}
    .tips-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:.65rem .85rem}
    .ts-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#1d4ed8;margin-bottom:.4rem}
    .tip-item{font-size:.78rem;color:#1e40af;padding:.2rem 0;border-bottom:1px solid #dbeafe}
    .tip-item:last-child{border-bottom:none}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.35rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .6rem;display:flex;justify-content:space-between;align-items:center;font-size:.75rem}
    .ri-name{font-weight:600}.ri-water{color:#0284c7;font-weight:600;font-size:.68rem}
  `]
})
export class IrrigationCalculatorComponent implements OnInit {
  selectedCrop = 'Rice (Paddy)'; area = 2; soilType = 'loamy';
  method = 'flood'; tempZone = 'moderate'; rainfall = 0; pumpLPM = 1000;
  stage = 'vegetative'; waterSource = 'borewell';
  result = signal<any>(null);

  crops = [
    {name:'Rice (Paddy)',etcMm:5,minWater:900,maxWater:2000,tips:['Maintain 5cm standing water during tillering','Drain field 7 days before harvest to save 30% water','Use Alternate Wetting and Drying (AWD) technique']},
    {name:'Wheat',etcMm:3.5,minWater:400,maxWater:650,tips:['Critical stages: CRI, tillering, jointing, grain filling','Avoid irrigation during raining','Use moisture meter to avoid over-irrigation']},
    {name:'Maize',etcMm:4,minWater:500,maxWater:800,tips:['Critical: tasseling, silking, grain filling','Drip irrigation saves 40% water vs flood','Mulching reduces evaporation by 25%']},
    {name:'Cotton',etcMm:4.5,minWater:700,maxWater:1200,tips:['Critical: bud formation to boll development','Avoid waterlogging — cotton is sensitive','Drip + fertigation increases yield 20%']},
    {name:'Sugarcane',etcMm:5.5,minWater:1500,maxWater:2500,tips:['Use drip irrigation to save 50% water','Critical: germination, tillering, grand growth','Trash mulching conserves soil moisture']},
    {name:'Soybean',etcMm:3.5,minWater:500,maxWater:700,tips:['Pod formation is most critical stage','Avoid excess water — causes root rot','1 irrigation before sowing for good germination']},
    {name:'Onion',etcMm:3,minWater:350,maxWater:550,tips:['Shallow roots — frequent light irrigation','Stop irrigation 10 days before harvest','Drip irrigation reduces bulb diseases']},
    {name:'Tomato',etcMm:4,minWater:400,maxWater:600,tips:['Consistent moisture prevents blossom end rot','Drip irrigation reduces leaf wetness diseases','Mulch to maintain soil moisture']},
  ];

  stages = [{key:'germination',label:'Germination (0.4 factor)',kc:0.4},{key:'vegetative',label:'Vegetative (0.7 factor)',kc:0.7},{key:'flowering',label:'Flowering (1.0 factor)',kc:1.0},{key:'grain_fill',label:'Grain Filling (1.1 factor)',kc:1.1},{key:'maturity',label:'Maturity / Harvest (0.6 factor)',kc:0.6}];

  ngOnInit() { this.calculate(); }
  onCropChange() { this.calculate(); }

  calculate() {
    const crop = this.crops.find(c => c.name === this.selectedCrop)!;
    const stg = this.stages.find(s => s.key === this.stage)!;

    // ETo by temperature zone
    const etoMap: Record<string,number> = {cool:3,moderate:5,hot:7,very_hot:9};
    const eto = etoMap[this.tempZone];
    const etc = eto * stg.kc * crop.etcMm / 5;

    // Net irrigation (subtract rainfall)
    const rainfallMmDay = this.rainfall / 7;
    const netWaterMmDay = Math.max(0, etc - rainfallMmDay);

    // Soil holding capacity
    const soilHold: Record<string,number> = {sandy:20,loamy:40,clay:60};
    const holdMm = soilHold[this.soilType];

    // Irrigation frequency
    const daysBetween = Math.max(1, Math.round(holdMm / netWaterMmDay));
    const irrigMmEvent = netWaterMmDay * daysBetween;

    // Method efficiency
    const effMap: Record<string,number> = {flood:0.60,furrow:0.70,sprinkler:0.80,drip:0.95};
    const eff = effMap[this.method];

    const areaM2 = this.area * 4047;
    const waterPerIrrigation = Math.round((irrigMmEvent / 1000) * areaM2 / eff);
    const pumpHours = (waterPerIrrigation / (this.pumpLPM * 60)).toFixed(1);
    const irrigationsPerWeek = Math.round(7 / daysBetween * 10) / 10;
    const weeklyWater = Math.round(waterPerIrrigation * irrigationsPerWeek);

    // Generate 7-day schedule
    const schedule = Array.from({length:7}, (_,i) => {
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const irrigate = i % daysBetween === 0;
      return {day:days[i],irrigate,note:irrigate?`${pumpHours}hrs`:'Rest'};
    });

    this.result.set({waterPerIrrigation,pumpHours,daysBetween,irrigationsPerWeek,weeklyWater,schedule});
  }

  cropTips(): string[] {
    return this.crops.find(c => c.name === this.selectedCrop)?.tips || [];
  }
}

// ─── Soil pH Calculator ───────────────────────────────────────────────────────
@Component({
  selector: 'app-soil-ph-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#713f12,#a16207)">
        <span class="hb-icon">🧱</span>
        <div>
          <div class="hb-title">Soil pH Calculator & Corrector</div>
          <div class="hb-sub">Test soil acidity/alkalinity and calculate lime or sulphur amendments needed</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🧪 Soil Test</div>
          <div class="ph-slider-section">
            <label class="lbl">Current Soil pH: <strong>{{currentPH}}</strong></label>
            <input type="range" [(ngModel)]="currentPH" min="3" max="10" step="0.1" (ngModelChange)="calculate()" class="ph-slider" [style.background]="phGradient()" />
            <div class="ph-scale">
              <span *ngFor="let p of [3,4,5,6,7,8,9,10]" class="ps-mark">{{p}}</span>
            </div>
            <div class="ph-indicator" [style.background]="phColor()">
              pH {{currentPH}} — <strong>{{phCategory()}}</strong>
            </div>
          </div>
          <div class="field">
            <label class="lbl">Target pH (for your crop)</label>
            <input type="number" [(ngModel)]="targetPH" (ngModelChange)="calculate()" class="inp" min="4" max="9" step="0.1" />
          </div>
          <div class="field">
            <label class="lbl">Soil Texture</label>
            <select [(ngModel)]="soilTexture" (ngModelChange)="calculate()" class="sel">
              <option value="sandy">Sandy (low buffer capacity)</option>
              <option value="loamy">Loamy (medium buffer)</option>
              <option value="clay">Clay / Black soil (high buffer)</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" />
          </div>
          <div class="field">
            <label class="lbl">Crop (for ideal pH range)</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="onCropChange()" class="sel">
              <option *ngFor="let c of crops" [value]="c.name">{{c.name}} (pH {{c.minPH}}–{{c.maxPH}})</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <div class="fg-title">🌱 Crop pH Requirements</div>
          <div class="crop-ph-display">
            <div class="cpd-crop">{{selectedCrop}}</div>
            <div class="ph-range-bar">
              <div class="prb-fill" [style.left.%]="idealLeft()" [style.width.%]="idealWidth()"></div>
              <div class="prb-marker" [style.left.%]="currentLeft()" [title]="'Current: '+currentPH">▼</div>
            </div>
            <div class="prb-labels"><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span></div>
            <div class="ph-status" [class.good]="isIdeal()" [class.warn]="!isIdeal()">
              {{isIdeal()?'✅ pH is ideal for '+selectedCrop:'⚠️ pH needs correction for '+selectedCrop}}
            </div>
          </div>

          <div class="nutrients-section">
            <div class="ns-title">Nutrient Availability at pH {{currentPH}}</div>
            <div class="nutrient-bars">
              <div class="nb-row" *ngFor="let n of nutrientAvailability()">
                <span class="nr-name">{{n.name}}</span>
                <div class="nr-bar"><div class="nrb-fill" [style.width.%]="n.avail" [style.background]="n.color"></div></div>
                <span class="nr-pct">{{n.avail}}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Amendment recommendation -->
      <div class="amendment-section" *ngIf="result()">
        <div class="am-header">
          <div class="am-icon">{{result()!.direction==='raise'?'🪨':'🔥'}}</div>
          <div>
            <div class="am-title">{{result()!.amendmentName}}</div>
            <div class="am-sub">To {{result()!.direction==='raise'?'raise':'lower'}} pH from {{currentPH}} to {{targetPH}}</div>
          </div>
        </div>

        <div class="amendment-results">
          <div class="ar-card" *ngFor="let r of result()!.cards">
            <div class="arc-val">{{r.val}}</div>
            <div class="arc-label">{{r.label}}</div>
          </div>
        </div>

        <div class="application-steps">
          <div class="as-title">Application Steps</div>
          <div class="as-step" *ngFor="let s of result()!.steps; let i=index">
            <span class="ass-num">{{i+1}}</span>
            <span>{{s}}</span>
          </div>
        </div>
      </div>

      <!-- Crop pH reference -->
      <div class="crop-ref">
        <div class="cr-title">Crop pH Preferences</div>
        <div class="cr-grid">
          <div class="cr-item" *ngFor="let c of crops">
            <span class="cri-name">{{c.name}}</span>
            <div class="cri-bar">
              <div class="crib-fill" [style.left.%]="(c.minPH-3)*14.3" [style.width.%]="(c.maxPH-c.minPH)*14.3"></div>
            </div>
            <span class="cri-range">{{c.minPH}}–{{c.maxPH}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;border-radius:14px;padding:1rem 1.25rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.8}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .ph-slider-section{margin-bottom:.75rem}
    .ph-slider{width:100%;height:8px;cursor:pointer;margin:.5rem 0;border-radius:99px;border:none;outline:none}
    .ph-scale{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af;margin-bottom:.4rem}
    .ps-mark{flex:1;text-align:center}
    .ph-indicator{border-radius:7px;padding:.35rem .75rem;font-size:.82rem;font-weight:700;color:white;margin-bottom:.4rem;text-align:center;transition:background .3s}
    .crop-ph-display{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem .85rem;margin-bottom:.75rem}
    .cpd-crop{font-size:.88rem;font-weight:800;margin-bottom:.5rem;color:#111827}
    .ph-range-bar{position:relative;height:16px;background:#f3f4f6;border-radius:99px;overflow:visible;margin-bottom:.3rem}
    .prb-fill{position:absolute;top:0;height:100%;background:#86efac;border-radius:99px}
    .prb-marker{position:absolute;top:-10px;font-size:.7rem;color:#dc2626;transform:translateX(-50%);transition:left .3s}
    .prb-labels{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af;margin-bottom:.4rem}
    .ph-status{font-size:.78rem;font-weight:700;padding:.3rem .65rem;border-radius:6px}
    .ph-status.good{background:#ecfdf5;color:#059669}
    .ph-status.warn{background:#fef3c7;color:#d97706}
    .nutrients-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .85rem}
    .ns-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.5rem}
    .nutrient-bars{display:flex;flex-direction:column;gap:.25rem}
    .nb-row{display:flex;align-items:center;gap:.4rem;font-size:.72rem}
    .nr-name{min-width:40px;font-weight:600;color:#374151}
    .nr-bar{flex:1;height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden}
    .nrb-fill{height:100%;border-radius:99px;transition:width .3s}
    .nr-pct{min-width:28px;text-align:right;font-size:.65rem;color:#6b7280}
    .amendment-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem;margin-bottom:1.25rem}
    .am-header{display:flex;align-items:center;gap.85rem;margin-bottom:.85rem;gap:.85rem}
    .am-icon{font-size:2rem;flex-shrink:0}
    .am-title{font-size:.95rem;font-weight:800;color:#111827}
    .am-sub{font-size:.75rem;color:#6b7280}
    .amendment-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.6rem;margin-bottom:.85rem}
    .ar-card{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem .75rem;text-align:center}
    .arc-val{font-size:1rem;font-weight:800;color:#111827;margin-bottom:.1rem}
    .arc-label{font-size:.63rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .application-steps{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:.65rem .85rem}
    .as-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#1d4ed8;margin-bottom:.4rem}
    .as-step{display:flex;gap:.4rem;font-size:.8rem;color:#1e40af;padding:.2rem 0}
    .ass-num{font-weight:800;flex-shrink:0}
    .crop-ref{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .cr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .cr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.4rem}
    .cr-item{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .65rem;display:flex;align-items:center;gap:.4rem}
    .cri-name{font-size:.72rem;font-weight:600;min-width:75px;flex-shrink:0}
    .cri-bar{flex:1;height:8px;background:#e5e7eb;border-radius:99px;position:relative;overflow:hidden}
    .crib-fill{position:absolute;top:0;height:100%;background:#86efac;border-radius:99px}
    .cri-range{font-size:.65rem;color:#6b7280;flex-shrink:0}
  `]
})
export class SoilPhCalculatorComponent implements OnInit {
  currentPH = 6.2; targetPH = 6.5; soilTexture = 'loamy'; area = 2;
  selectedCrop = 'Rice (Paddy)';
  result = signal<any>(null);

  crops = [
    {name:'Rice (Paddy)',minPH:5.5,maxPH:7.0},{name:'Wheat',minPH:6.0,maxPH:7.5},{name:'Maize',minPH:5.5,maxPH:7.0},{name:'Cotton',minPH:5.8,maxPH:8.0},{name:'Sugarcane',minPH:6.0,maxPH:7.5},{name:'Soybean',minPH:6.0,maxPH:7.0},{name:'Groundnut',minPH:5.5,maxPH:7.0},{name:'Mustard',minPH:6.0,maxPH:7.5},{name:'Onion',minPH:6.0,maxPH:7.0},{name:'Tomato',minPH:5.5,maxPH:7.0},{name:'Potato',minPH:5.0,maxPH:6.5},{name:'Banana',minPH:5.5,maxPH:7.0},
  ];

  ngOnInit() { this.calculate(); }
  onCropChange() { const c = this.crops.find(x=>x.name===this.selectedCrop); if(c) this.targetPH=+((c.minPH+c.maxPH)/2).toFixed(1); this.calculate(); }

  phColor(): string {
    const p = this.currentPH;
    if (p < 5) return '#dc2626'; if (p < 6) return '#f97316'; if (p < 6.5) return '#eab308';
    if (p <= 7.5) return '#22c55e'; if (p <= 8.5) return '#3b82f6'; return '#7c3aed';
  }
  phGradient(): string { return 'linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e, #22c55e, #3b82f6, #7c3aed)'; }
  phCategory(): string {
    const p = this.currentPH;
    if (p < 4.5) return 'Extremely Acidic'; if (p < 5.5) return 'Strongly Acidic'; if (p < 6.0) return 'Moderately Acidic';
    if (p < 6.5) return 'Slightly Acidic'; if (p <= 7.5) return 'Neutral (Ideal)'; if (p <= 8.5) return 'Slightly Alkaline'; return 'Strongly Alkaline';
  }
  isIdeal(): boolean { const c = this.crops.find(x=>x.name===this.selectedCrop); return c ? this.currentPH >= c.minPH && this.currentPH <= c.maxPH : false; }
  idealLeft(): number { return (Math.min(...this.crops.map(c=>c.minPH)) - 3) / 7 * 100; }
  idealWidth(): number {
    const c = this.crops.find(x=>x.name===this.selectedCrop);
    return c ? (c.maxPH - c.minPH) / 7 * 100 : 10;
  }
  idealLeftForCrop(): number {
    const c = this.crops.find(x=>x.name===this.selectedCrop);
    return c ? (c.minPH - 3) / 7 * 100 : 0;
  }
  currentLeft(): number { return (this.currentPH - 3) / 7 * 100; }

  nutrientAvailability() {
    const p = this.currentPH;
    const calc = (min:number,max:number,opt:number) => {
      if (p < min || p > max) return Math.max(0, 100 - Math.abs(p - opt) * 40);
      return Math.min(100, 100 - Math.abs(p - opt) * 15);
    };
    return [
      {name:'N',avail:Math.round(calc(5,8,6.5)),color:'#22c55e'},
      {name:'P',avail:Math.round(calc(6,7.5,6.5)),color:'#3b82f6'},
      {name:'K',avail:Math.round(calc(5,9,6.5)),color:'#f59e0b'},
      {name:'Fe',avail:Math.round(calc(4,6.5,5.5)),color:'#ef4444'},
      {name:'Zn',avail:Math.round(calc(5,7,6)),color:'#8b5cf6'},
      {name:'Ca',avail:Math.round(calc(6.5,9,7.5)),color:'#14b8a6'},
    ];
  }

  calculate() {
    const diff = this.targetPH - this.currentPH;
    if (Math.abs(diff) < 0.1) { this.result.set(null); return; }

    const bufferFactors: Record<string,number> = {sandy:1.0,loamy:1.5,clay:2.2};
    const bf = bufferFactors[this.soilTexture];
    const areaHa = this.area * 0.4047;

    if (diff > 0) {
      // Need to raise pH — add lime (agricultural lime / CaCO3)
      const limeKgHa = Math.abs(diff) * bf * 2500;
      const totalLime = Math.round(limeKgHa * areaHa);
      this.result.set({
        direction:'raise', amendmentName:'Agricultural Lime (CaCO₃) Recommended',
        cards:[
          {val:`${Math.round(limeKgHa)} kg/ha`,label:'Lime per Hectare'},
          {val:`${Math.round(limeKgHa*0.4047)} kg/acre`,label:'Lime per Acre'},
          {val:`${totalLime} kg`,label:`Total for ${this.area} acres`},
          {val:`₹${(totalLime*8).toLocaleString('en-IN')}`,label:'Approx Cost (₹8/kg)'},
        ],
        steps:[
          'Broadcast lime evenly across the field before tillage.',
          'Mix into top 15–20 cm of soil by deep ploughing.',
          'Allow 2–4 weeks for reaction before sowing.',
          'Re-test soil pH after 3–4 months.',
          'Avoid applying lime and ammonia fertilizer together.',
        ],
      });
    } else {
      // Need to lower pH — add sulphur
      const sulphurKgHa = Math.abs(diff) * bf * 120;
      const totalSulphur = Math.round(sulphurKgHa * areaHa);
      this.result.set({
        direction:'lower', amendmentName:'Elemental Sulphur (S) Recommended',
        cards:[
          {val:`${Math.round(sulphurKgHa)} kg/ha`,label:'Sulphur per Hectare'},
          {val:`${Math.round(sulphurKgHa*0.4047)} kg/acre`,label:'Sulphur per Acre'},
          {val:`${totalSulphur} kg`,label:`Total for ${this.area} acres`},
          {val:`₹${(totalSulphur*55).toLocaleString('en-IN')}`,label:'Approx Cost (₹55/kg)'},
        ],
        steps:[
          'Apply elemental sulphur uniformly to the field.',
          'Incorporate into soil by ploughing or rotavation.',
          'Sulphur oxidises slowly — apply 6–8 weeks before planting.',
          'Ensure soil moisture for sulphur oxidation to work.',
          'Re-test soil pH after one crop season.',
        ],
      });
    }
  }
}
