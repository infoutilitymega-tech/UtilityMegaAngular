import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Crop Yield Calculator ────────────────────────────────────────────────────
@Component({
  selector: 'app-crop-yield-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🌾</span>
        <div>
          <div class="hb-title">Crop Yield Calculator</div>
          <div class="hb-sub">Estimate yield, income & profit for your farm — in Indian units</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🌱 Crop & Land</div>
          <div class="field">
            <label class="lbl">Select Crop</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="onCropChange()" class="sel">
              <option *ngFor="let c of crops" [value]="c.name">{{c.name}} ({{c.nameHi}})</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Land Area</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.1" step="0.1" placeholder="1.0" />
              <select [(ngModel)]="areaUnit" (ngModelChange)="calculate()" class="sel-sm">
                <option value="acres">Acres</option>
                <option value="hectare">Hectares</option>
                <option value="bigha">Bigha</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="lbl">Soil Type</label>
            <select [(ngModel)]="soilType" (ngModelChange)="calculate()" class="sel">
              <option *ngFor="let s of soilTypes" [value]="s.key">{{s.label}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Irrigation Type</label>
            <select [(ngModel)]="irrigation" (ngModelChange)="calculate()" class="sel">
              <option value="canal">Canal / Bore well (Full)</option>
              <option value="drip">Drip Irrigation (+15%)</option>
              <option value="rain">Rain-fed only (−25%)</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Farming Season</label>
            <select [(ngModel)]="season" (ngModelChange)="calculate()" class="sel">
              <option value="kharif">Kharif (June–October)</option>
              <option value="rabi">Rabi (November–March)</option>
              <option value="zaid">Zaid / Summer (April–June)</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <div class="fg-title">💰 Economics</div>
          <div class="field">
            <label class="lbl">Expected Yield (kg/acre)</label>
            <input type="number" [(ngModel)]="yieldPerAcre" (ngModelChange)="calculate()" class="inp" min="100" placeholder="Auto from crop" />
            <div class="field-hint">Typical for {{selectedCrop}}: {{cropYieldRange()}}</div>
          </div>
          <div class="field">
            <label class="lbl">Market Price (₹/quintal)</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="pricePerQtl" (ngModelChange)="calculate()" class="inp" placeholder="Auto from MSP" />
              <button class="msp-btn" (click)="loadMSP()" title="Load MSP">MSP</button>
            </div>
            <div class="field-hint">MSP {{currentYear}}: ₹{{cropMSP()?.toLocaleString('en-IN') || '—'}}/qtl</div>
          </div>
          <div class="field">
            <label class="lbl">Input Cost (₹/acre)</label>
            <input type="number" [(ngModel)]="costPerAcre" (ngModelChange)="calculate()" class="inp" placeholder="Seed+Fertilizer+Labor" />
            <div class="field-hint">Typical: ₹{{typicalCost()?.toLocaleString('en-IN') || '—'}}/acre</div>
          </div>
          <div class="field">
            <label class="lbl">Seed Cost (₹)</label>
            <input type="number" [(ngModel)]="seedCost" (ngModelChange)="calculate()" class="inp" placeholder="Total seed cost" />
          </div>
        </div>
      </div>

      <div class="results-section" *ngIf="result()">
        <div class="rs-title">📊 Yield & Income Forecast</div>
        <div class="results-grid">
          <div class="result-card accent">
            <div class="rc-icon">🌾</div>
            <div class="rc-val">{{result()!.totalYieldQtl.toFixed(1)}} qtl</div>
            <div class="rc-label">Total Yield</div>
            <div class="rc-sub">{{result()!.totalYieldKg.toLocaleString('en-IN')}} kg</div>
          </div>
          <div class="result-card green">
            <div class="rc-icon">💵</div>
            <div class="rc-val">₹{{result()!.grossIncome.toLocaleString('en-IN')}}</div>
            <div class="rc-label">Gross Income</div>
            <div class="rc-sub">₹{{result()!.incomePerAcre.toLocaleString('en-IN')}}/acre</div>
          </div>
          <div class="result-card blue">
            <div class="rc-icon">📦</div>
            <div class="rc-val">₹{{result()!.totalCost.toLocaleString('en-IN')}}</div>
            <div class="rc-label">Total Input Cost</div>
            <div class="rc-sub">₹{{result()!.costPerAcre.toLocaleString('en-IN')}}/acre</div>
          </div>
          <div class="result-card" [class.profit]="result()!.netProfit>0" [class.loss]="result()!.netProfit<0">
            <div class="rc-icon">{{result()!.netProfit>0?'📈':'📉'}}</div>
            <div class="rc-val">₹{{Math.abs(result()!.netProfit).toLocaleString('en-IN')}}</div>
            <div class="rc-label">Net {{result()!.netProfit>=0?'Profit':'Loss'}}</div>
            <div class="rc-sub">ROI: {{result()!.roi.toFixed(1)}}%</div>
          </div>
        </div>

        <!-- Breakeven -->
        <div class="breakeven-row">
          <div class="bre-item">
            <span class="bre-label">Breakeven Yield</span>
            <span class="bre-val">{{result()!.breakevenYield.toFixed(0)}} kg/acre</span>
          </div>
          <div class="bre-item">
            <span class="bre-label">Breakeven Price</span>
            <span class="bre-val">₹{{result()!.breakevenPrice.toFixed(0)}}/qtl</span>
          </div>
          <div class="bre-item">
            <span class="bre-label">Area in Acres</span>
            <span class="bre-val">{{result()!.areaInAcres.toFixed(2)}} acres</span>
          </div>
          <div class="bre-item">
            <span class="bre-label">Profit Margin</span>
            <span class="bre-val">{{result()!.margin.toFixed(1)}}%</span>
          </div>
        </div>
      </div>

      <!-- Crop cards -->
      <div class="crop-cards">
        <div class="cc-title">Quick Crop Reference</div>
        <div class="cc-grid">
          <div class="crop-card" *ngFor="let c of crops.slice(0,8)" (click)="selectedCrop=c.name;onCropChange()">
            <span class="crop-icon">{{c.icon}}</span>
            <div class="crop-name">{{c.name}}</div>
            <div class="crop-yield">{{c.minYield}}–{{c.maxYield}} kg/ac</div>
            <div class="crop-msp">MSP ₹{{c.msp?.toLocaleString('en-IN')||'—'}}/qtl</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#166534,#15803d);border-radius:14px;padding:1rem 1.25rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.8}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.88rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .sel-sm{padding:.4rem .5rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;background:white;outline:none;min-width:90px}
    .input-row{display:flex;gap:.35rem}
    .input-row .inp{flex:1;width:auto}
    .msp-btn{background:#166534;color:white;border:none;border-radius:7px;padding:.38rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700;flex-shrink:0;white-space:nowrap}
    .field-hint{font-size:.68rem;color:#9ca3af}
    .results-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem 1.25rem;margin-bottom:1.25rem}
    .rs-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.85rem}
    .results-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-bottom:.85rem}
    @media(max-width:700px){.results-grid{grid-template-columns:repeat(2,1fr)}}
    .result-card{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:.75rem .85rem;text-align:center}
    .result-card.accent{border-color:#fbbf24;background:#fffbeb}
    .result-card.green{border-color:#86efac;background:#f0fdf4}
    .result-card.blue{border-color:#93c5fd;background:#eff6ff}
    .result-card.profit{border-color:#86efac;background:#f0fdf4}
    .result-card.loss{border-color:#fca5a5;background:#fef2f2}
    .rc-icon{font-size:1.5rem;margin-bottom:.3rem}
    .rc-val{font-size:1.1rem;font-weight:800;color:#111827;margin-bottom:.1rem}
    .rc-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.15rem}
    .rc-sub{font-size:.7rem;color:#6b7280}
    .breakeven-row{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}
    @media(max-width:600px){.breakeven-row{grid-template-columns:repeat(2,1fr)}}
    .bre-item{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .75rem;display:flex;flex-direction:column;gap:.1rem}
    .bre-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .bre-val{font-size:.88rem;font-weight:800;color:#111827}
    .crop-cards{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .cc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .cc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.5rem}
    .crop-card{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem .7rem;text-align:center;cursor:pointer;transition:all .15s}
    .crop-card:hover{border-color:#15803d;transform:translateY(-1px)}
    .crop-icon{font-size:1.5rem;display:block;margin-bottom:.25rem}
    .crop-name{font-size:.78rem;font-weight:700;color:#111827;margin-bottom:.1rem}
    .crop-yield{font-size:.62rem;color:#6b7280;margin-bottom:.1rem}
    .crop-msp{font-size:.62rem;color:#15803d;font-weight:600}
  `]
})
export class CropYieldCalculatorComponent implements OnInit {
  Math = Math;
  currentYear = new Date().getFullYear();
  selectedCrop = 'Rice (Paddy)'; area = 2; areaUnit = 'acres';
  soilType = 'medium'; irrigation = 'canal'; season = 'kharif';
  yieldPerAcre = 0; pricePerQtl = 0; costPerAcre = 0; seedCost = 0;
  result = signal<any>(null);

  crops = [
    {name:'Rice (Paddy)',nameHi:'धान',icon:'🌾',minYield:1600,maxYield:2800,avgYield:2000,msp:2183,typicalCost:12000},
    {name:'Wheat',nameHi:'गेहूँ',icon:'🌾',minYield:1400,maxYield:2400,avgYield:1800,msp:2275,typicalCost:10000},
    {name:'Maize (Corn)',nameHi:'मक्का',icon:'🌽',minYield:1200,maxYield:2200,avgYield:1600,msp:2090,typicalCost:9000},
    {name:'Cotton',nameHi:'कपास',icon:'🌿',minYield:400,maxYield:800,avgYield:600,msp:7020,typicalCost:18000},
    {name:'Sugarcane',nameHi:'गन्ना',icon:'🎋',minYield:25000,maxYield:45000,avgYield:35000,msp:3400,typicalCost:20000},
    {name:'Soybean',nameHi:'सोयाबीन',icon:'🌱',minYield:600,maxYield:1200,avgYield:900,msp:4600,typicalCost:9000},
    {name:'Mustard',nameHi:'सरसों',icon:'🌻',minYield:400,maxYield:800,avgYield:600,msp:5650,typicalCost:8000},
    {name:'Groundnut',nameHi:'मूंगफली',icon:'🥜',minYield:600,maxYield:1400,avgYield:900,msp:6377,typicalCost:14000},
    {name:'Onion',nameHi:'प्याज',icon:'🧅',minYield:4000,maxYield:8000,avgYield:6000,msp:null,typicalCost:20000},
    {name:'Tomato',nameHi:'टमाटर',icon:'🍅',minYield:5000,maxYield:12000,avgYield:8000,msp:null,typicalCost:22000},
  ];

  soilTypes = [{key:'rich',label:'Rich Black / Alluvial (+10%)'},{key:'medium',label:'Medium Loamy (Standard)'},{key:'sandy',label:'Sandy / Light (−15%)'},{key:'clay',label:'Heavy Clay (−5%)'}];

  ngOnInit() { this.onCropChange(); }

  onCropChange() {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    if (c) {
      this.yieldPerAcre = c.avgYield;
      this.pricePerQtl = c.msp || Math.round(c.avgYield * 0.5);
      this.costPerAcre = c.typicalCost;
      this.seedCost = Math.round(c.typicalCost * 0.12);
    }
    this.calculate();
  }

  areaToAcres(): number {
    const conv: Record<string,number> = {acres:1,hectare:2.471,bigha:0.619,guntha:0.0247};
    return this.area * (conv[this.areaUnit] || 1);
  }

  calculate() {
    const acres = this.areaToAcres();
    let yld = this.yieldPerAcre;

    // Soil modifier
    const soilMod: Record<string,number> = {rich:1.10,medium:1.0,sandy:0.85,clay:0.95};
    yld *= soilMod[this.soilType] || 1;

    // Irrigation modifier
    if (this.irrigation === 'drip') yld *= 1.15;
    if (this.irrigation === 'rain') yld *= 0.75;

    const totalYieldKg = Math.round(yld * acres);
    const totalYieldQtl = totalYieldKg / 100;
    const grossIncome = Math.round(totalYieldQtl * this.pricePerQtl);
    const totalCost = Math.round((this.costPerAcre * acres) + this.seedCost);
    const netProfit = grossIncome - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const margin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
    const breakevenYield = this.pricePerQtl > 0 ? (totalCost / acres / this.pricePerQtl) * 100 : 0;
    const breakevenPrice = totalYieldQtl > 0 ? totalCost / totalYieldQtl : 0;

    this.result.set({totalYieldKg,totalYieldQtl,grossIncome,totalCost,netProfit,roi,margin,breakevenYield,breakevenPrice,areaInAcres:acres,incomePerAcre:Math.round(grossIncome/acres),costPerAcre:Math.round(totalCost/acres)});
  }

  loadMSP() {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    if (c?.msp) this.pricePerQtl = c.msp;
    this.calculate();
  }

  cropYieldRange(): string {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    return c ? `${c.minYield}–${c.maxYield} kg/acre` : '—';
  }
  cropMSP(): number|null {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    return c?.msp || null;
  }
  typicalCost(): number|null {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    return c?.typicalCost || null;
  }
}

// ─── Fertilizer Calculator ────────────────────────────────────────────────────
@Component({
  selector: 'app-fertilizer-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🧪</span>
        <div>
          <div class="hb-title">Fertilizer (NPK) Calculator</div>
          <div class="hb-sub">Calculate exact fertilizer quantities for your crop & soil requirements</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🌱 Crop & Land</div>
          <div class="field">
            <label class="lbl">Crop</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="onCropChange()" class="sel">
              <option *ngFor="let c of crops" [value]="c.name">{{c.name}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.1" step="0.5" />
          </div>
          <div class="field">
            <label class="lbl">Soil Test Result</label>
            <div class="soil-npk">
              <div class="snpk-item">
                <label class="snpk-lbl">N (kg/ha)</label>
                <input type="number" [(ngModel)]="soilN" (ngModelChange)="calculate()" class="inp-sm" placeholder="280" />
              </div>
              <div class="snpk-item">
                <label class="snpk-lbl">P (kg/ha)</label>
                <input type="number" [(ngModel)]="soilP" (ngModelChange)="calculate()" class="inp-sm" placeholder="22" />
              </div>
              <div class="snpk-item">
                <label class="snpk-lbl">K (kg/ha)</label>
                <input type="number" [(ngModel)]="soilK" (ngModelChange)="calculate()" class="inp-sm" placeholder="280" />
              </div>
            </div>
            <div class="soil-rating">
              <span class="sr-item" [class.active]="soilNRating()==='Low'">N:{{soilNRating()}}</span>
              <span class="sr-item" [class.active]="soilPRating()==='Low'">P:{{soilPRating()}}</span>
              <span class="sr-item" [class.active]="soilKRating()==='Low'">K:{{soilKRating()}}</span>
            </div>
          </div>
        </div>

        <div class="field-group">
          <div class="fg-title">📋 Crop NPK Requirements</div>
          <div class="field">
            <label class="lbl">Nitrogen required (kg/ha)</label>
            <input type="number" [(ngModel)]="reqN" (ngModelChange)="calculate()" class="inp" />
          </div>
          <div class="field">
            <label class="lbl">Phosphorus required (kg/ha)</label>
            <input type="number" [(ngModel)]="reqP" (ngModelChange)="calculate()" class="inp" />
          </div>
          <div class="field">
            <label class="lbl">Potassium required (kg/ha)</label>
            <input type="number" [(ngModel)]="reqK" (ngModelChange)="calculate()" class="inp" />
          </div>
          <div class="field">
            <label class="lbl">Organic matter available?</label>
            <select [(ngModel)]="organicMatter" (ngModelChange)="calculate()" class="sel">
              <option value="none">None</option>
              <option value="fym">FYM (Farmyard Manure) — 5 tonne/ha</option>
              <option value="compost">Compost — 3 tonne/ha</option>
              <option value="vermi">Vermicompost — 2 tonne/ha</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="results-section" *ngIf="result()">
        <div class="rs-title">🧮 Fertilizer Recommendation</div>
        <div class="fertilizer-table">
          <div class="ft-header"><span>Fertilizer</span><span>NPK%</span><span>Per Acre</span><span>Total ({{area}} acres)</span><span>Cost (approx)</span></div>
          <div class="ft-row" *ngFor="let f of result()!.fertilizers">
            <span class="fr-name">{{f.name}}</span>
            <span class="fr-npk">{{f.npk}}</span>
            <span class="fr-qty">{{f.perAcre}} kg</span>
            <span class="fr-total">{{f.total}} kg</span>
            <span class="fr-cost">₹{{f.cost.toLocaleString('en-IN')}}</span>
          </div>
        </div>

        <!-- NPK summary -->
        <div class="npk-summary">
          <div class="npk-card" *ngFor="let n of result()!.npkSummary" [class]="'npk-'+n.element.toLowerCase()">
            <div class="nc-element">{{n.element}}</div>
            <div class="nc-req">Required: {{n.required}} kg/ha</div>
            <div class="nc-from-soil">From soil: {{n.fromSoil}} kg/ha</div>
            <div class="nc-to-apply">To Apply: <strong>{{n.toApply}} kg/ha</strong></div>
            <div class="nc-bar"><div class="ncb-fill" [style.width.%]="n.pct" [style.background]="n.color"></div></div>
          </div>
        </div>

        <!-- Total cost -->
        <div class="cost-summary">
          <div class="cs-item"><span>Total Fertilizer Cost</span><strong>₹{{result()!.totalCost.toLocaleString('en-IN')}}</strong></div>
          <div class="cs-item"><span>Cost per Acre</span><strong>₹{{result()!.costPerAcre.toLocaleString('en-IN')}}</strong></div>
          <div class="cs-item" *ngIf="organicMatter!=='none'"><span>Organic supplement</span><strong>{{result()!.organicNote}}</strong></div>
        </div>

        <!-- Application schedule -->
        <div class="schedule-section">
          <div class="ss-title">📅 Application Schedule</div>
          <div class="schedule-item" *ngFor="let s of result()!.schedule">
            <span class="si-when">{{s.when}}</span>
            <span class="si-what">{{s.what}}</span>
            <span class="si-pct">{{s.pct}}</span>
          </div>
        </div>
      </div>

      <!-- Fertilizer reference -->
      <div class="ref-section">
        <div class="ref-title">Common Fertilizer NPK Reference</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of fertRef">
            <span class="ri-name">{{r.name}}</span>
            <span class="ri-npk">{{r.npk}}</span>
            <span class="ri-price">₹{{r.price}}/50kg</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#78350f,#b45309);border-radius:14px;padding:1rem 1.25rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.8}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.88rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .inp-sm{padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;outline:none;width:70px;text-align:center}
    .soil-npk{display:flex;gap:.5rem}
    .snpk-item{display:flex;flex-direction:column;gap:.2rem;align-items:center}
    .snpk-lbl{font-size:.65rem;font-weight:700;color:#6b7280}
    .soil-rating{display:flex;gap:.35rem;margin-top:.25rem}
    .sr-item{font-size:.65rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:.1rem .5rem;font-weight:600;color:#9ca3af}
    .sr-item.active{background:#fef3c7;border-color:#fcd34d;color:#d97706}
    .results-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem 1.25rem;margin-bottom:1.25rem}
    .rs-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.85rem}
    .fertilizer-table{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:.85rem}
    .ft-header{display:grid;grid-template-columns:1.5fr 80px 90px 100px 100px;gap:.4rem;background:#e5e7eb;padding:.45rem .75rem;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .ft-row{display:grid;grid-template-columns:1.5fr 80px 90px 100px 100px;gap:.4rem;padding:.45rem .75rem;background:white;border-bottom:1px solid #f3f4f6;font-size:.8rem;align-items:center}
    .ft-row:last-child{border-bottom:none}
    .fr-name{font-weight:700}.fr-npk{font-family:monospace;font-size:.72rem;color:#6b7280}.fr-qty,.fr-total{font-weight:600}.fr-cost{color:#15803d;font-weight:600}
    .npk-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem;margin-bottom:.85rem}
    @media(max-width:600px){.npk-summary{grid-template-columns:1fr}}
    .npk-card{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .npk-n{border-color:#86efac}.npk-p{border-color:#93c5fd}.npk-k{border-color:#fcd34d}
    .nc-element{font-size:1.2rem;font-weight:800;margin-bottom:.3rem}
    .nc-req,.nc-from-soil,.nc-to-apply{font-size:.72rem;color:#6b7280;margin-bottom:.15rem}
    .nc-to-apply strong{color:#111827}
    .nc-bar{height:6px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.4rem}
    .ncb-fill{height:100%;border-radius:99px}
    .cost-summary{display:flex;gap:1rem;flex-wrap:wrap;background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem 1rem;margin-bottom:.85rem}
    .cs-item{display:flex;flex-direction:column;gap:.1rem;flex:1;min-width:120px}
    .cs-item span{font-size:.68rem;color:#9ca3af;text-transform:uppercase;font-weight:700}
    .cs-item strong{font-size:.95rem;font-weight:800;color:#111827}
    .schedule-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:.65rem .85rem}
    .ss-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#1d4ed8;margin-bottom:.5rem}
    .schedule-item{display:flex;gap.5rem;align-items:center;padding:.25rem 0;border-bottom:1px solid #dbeafe;font-size:.8rem;gap:.5rem}
    .schedule-item:last-child{border-bottom:none}
    .si-when{font-weight:700;min-width:90px;color:#1d4ed8;flex-shrink:0}
    .si-what{flex:1}.si-pct{font-weight:700;color:#2563eb;flex-shrink:0}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.4rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .65rem;display:flex;flex-direction:column;gap:.1rem}
    .ri-name{font-size:.78rem;font-weight:700;color:#111827}
    .ri-npk{font-size:.68rem;font-family:monospace;color:#6b7280}
    .ri-price{font-size:.68rem;color:#15803d;font-weight:600}
  `]
})
export class FertilizerCalculatorComponent implements OnInit {
  selectedCrop = 'Rice (Paddy)'; area = 2;
  soilN = 280; soilP = 22; soilK = 280;
  reqN = 120; reqP = 60; reqK = 60;
  organicMatter = 'none';
  result = signal<any>(null);

  crops = [
    {name:'Rice (Paddy)',N:120,P:60,K:60},{name:'Wheat',N:120,P:60,K:40},{name:'Maize',N:150,P:75,K:75},{name:'Cotton',N:150,P:75,K:75},{name:'Sugarcane',N:250,P:85,K:105},{name:'Soybean',N:25,P:60,K:40},{name:'Groundnut',N:25,P:50,K:50},{name:'Mustard',N:100,P:40,K:40},{name:'Onion',N:100,P:60,K:100},{name:'Tomato',N:120,P:80,K:100},
  ];

  fertRef = [
    {name:'Urea',npk:'46-0-0',price:280},{name:'DAP',npk:'18-46-0',price:1350},{name:'MOP (Potash)',npk:'0-0-60',price:800},{name:'SSP',npk:'0-16-0',price:280},{name:'NPK 12:32:16',npk:'12-32-16',price:1200},{name:'NPK 10:26:26',npk:'10-26-26',price:1150},{name:'Ammonium Sulphate',npk:'21-0-0',price:480},{name:'Calcium Ammonium Nitrate',npk:'26-0-0',price:650},
  ];

  ngOnInit() { this.onCropChange(); }

  onCropChange() {
    const c = this.crops.find(x => x.name === this.selectedCrop);
    if (c) { this.reqN = c.N; this.reqP = c.P; this.reqK = c.K; }
    this.calculate();
  }

  soilNRating() { return this.soilN < 280 ? 'Low' : this.soilN < 560 ? 'Med' : 'High'; }
  soilPRating() { return this.soilP < 11 ? 'Low' : this.soilP < 22 ? 'Med' : 'High'; }
  soilKRating() { return this.soilK < 110 ? 'Low' : this.soilK < 280 ? 'Med' : 'High'; }

  calculate() {
    // Soil availability factors (ICAR standards)
    const nAvail = Math.min(this.soilN * 0.02, this.reqN * 0.3);
    const pAvail = Math.min(this.soilP * 0.25, this.reqP * 0.3);
    const kAvail = Math.min(this.soilK * 0.02, this.reqK * 0.5);

    // Organic matter credits
    const orgCredits = {none:{n:0,p:0,k:0},fym:{n:25,p:10,k:25},compost:{n:15,p:8,k:15},vermi:{n:20,p:12,k:10}};
    const org = orgCredits[this.organicMatter as keyof typeof orgCredits] || orgCredits.none;

    const netN = Math.max(0, this.reqN - nAvail - org.n);
    const netP = Math.max(0, this.reqP - pAvail - org.p);
    const netK = Math.max(0, this.reqK - kAvail - org.k);

    const ha = this.area * 0.4047;

    // Calculate fertilizer quantities
    const ureaKgHa = Math.round(netN / 0.46);
    const dapKgHa = Math.round(netP / 0.46);
    const mokKgHa = Math.round(netK / 0.60);

    const fertilizers = [
      {name:'Urea (यूरिया)',npk:'46-0-0',perAcre:Math.round(ureaKgHa*0.4047),total:Math.round(ureaKgHa*ha),cost:Math.round(ureaKgHa*ha/50*280)},
      {name:'DAP (डीएपी)',npk:'18-46-0',perAcre:Math.round(dapKgHa*0.4047),total:Math.round(dapKgHa*ha),cost:Math.round(dapKgHa*ha/50*1350)},
      {name:'MOP / Potash (पोटाश)',npk:'0-0-60',perAcre:Math.round(mokKgHa*0.4047),total:Math.round(mokKgHa*ha),cost:Math.round(mokKgHa*ha/50*800)},
    ].filter(f => f.perAcre > 0);

    const totalCost = fertilizers.reduce((s,f)=>s+f.cost,0);

    const npkSummary = [
      {element:'N',required:this.reqN,fromSoil:Math.round(nAvail),toApply:Math.round(netN),pct:Math.min(100,(netN/this.reqN)*100),color:'#22c55e'},
      {element:'P',required:this.reqP,fromSoil:Math.round(pAvail),toApply:Math.round(netP),pct:Math.min(100,(netP/this.reqP)*100),color:'#3b82f6'},
      {element:'K',required:this.reqK,fromSoil:Math.round(kAvail),toApply:Math.round(netK),pct:Math.min(100,(netK/this.reqK)*100),color:'#f59e0b'},
    ];

    this.result.set({
      fertilizers, npkSummary, totalCost, costPerAcre: Math.round(totalCost/this.area),
      organicNote: this.organicMatter !== 'none' ? `Apply ${this.organicMatter.toUpperCase()} before sowing` : '',
      schedule: [
        {when:'At Sowing',what:'DAP + 1/3 Urea + MOP (full)',pct:'Basal'},
        {when:'30 DAS',what:'1/3 Urea top-dressing',pct:'1st split'},
        {when:'60 DAS',what:'1/3 Urea top-dressing',pct:'2nd split'},
      ],
    });
  }
}
