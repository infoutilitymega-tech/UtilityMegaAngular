import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Seed Rate Calculator ─────────────────────────────────────────────────────
@Component({
  selector: 'app-seed-rate-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#065f46,#047857)">
        <span class="hb-icon">🌱</span>
        <div>
          <div class="hb-title">Seed Rate Calculator</div>
          <div class="hb-sub">Calculate seed quantity, cost & optimal plant population</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🌿 Crop Details</div>
          <div class="field"><label class="lbl">Crop</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="onCropChange()" class="sel">
              <option *ngFor="let c of crops" [value]="c.name">{{c.name}}</option>
            </select></div>
          <div class="field"><label class="lbl">Field Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" step="0.5" /></div>
          <div class="field"><label class="lbl">Sowing Method</label>
            <select [(ngModel)]="sowingMethod" (ngModelChange)="calculate()" class="sel">
              <option value="broadcast">Broadcast (higher seed rate)</option>
              <option value="line">Line Sowing / Drilling</option>
              <option value="transplant">Transplanting (nursery)</option>
              <option value="dibbling">Dibbling (seed placement)</option>
            </select></div>
          <div class="field"><label class="lbl">Germination % (expected)</label>
            <input type="number" [(ngModel)]="germination" (ngModelChange)="calculate()" class="inp" min="50" max="100" step="5" /></div>
          <div class="field"><label class="lbl">Seed Price (₹/kg)</label>
            <input type="number" [(ngModel)]="seedPrice" (ngModelChange)="calculate()" class="inp" min="10" /></div>
          <div class="field"><label class="lbl">Spacing Row × Plant (cm)</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="rowSpacing" (ngModelChange)="calculate()" class="inp-half" placeholder="Row" />
              <span class="times">×</span>
              <input type="number" [(ngModel)]="plantSpacing" (ngModelChange)="calculate()" class="inp-half" placeholder="Plant" />
            </div></div>
        </div>
        <div class="field-group">
          <div class="fg-title">📊 Results</div>
          <div class="result-items" *ngIf="result()">
            <div class="ri-item" *ngFor="let r of result()!.items">
              <span class="ri-label">{{r.label}}</span>
              <span class="ri-val">{{r.val}}</span>
            </div>
          </div>
          <div class="tips-box" *ngIf="selectedCropData()">
            <div class="tb-title">{{selectedCrop}} Tips</div>
            <div class="tb-tip" *ngFor="let t of selectedCropData()!.tips">• {{t}}</div>
          </div>
        </div>
      </div>
      <div class="crop-table">
        <div class="ct-title">Seed Rate Quick Reference</div>
        <div class="ct-grid">
          <div class="ct-header"><span>Crop</span><span>Seed Rate</span><span>1000 Seed Wt</span><span>Spacing</span></div>
          <div class="ct-row" *ngFor="let c of crops">
            <span class="ctr-name">{{c.name}}</span>
            <span>{{c.seedRateMin}}–{{c.seedRateMax}} kg/ac</span>
            <span>{{c.tsw}} g</span>
            <span class="mono">{{c.rowSp}}×{{c.plantSp}} cm</span>
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
    .inp-half{flex:1;padding:.4rem .5rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;min-width:0}
    .input-row{display:flex;gap:.3rem;align-items:center}
    .times{color:#9ca3af;font-weight:700;flex-shrink:0}
    .result-items{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.75rem}
    .ri-item{display:flex;justify-content:space-between;align-items:center;background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .7rem;font-size:.82rem}
    .ri-label{color:#6b7280}.ri-val{font-weight:800;color:#065f46}
    .tips-box{background:#ecfdf5;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .85rem}
    .tb-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#065f46;margin-bottom:.4rem}
    .tb-tip{font-size:.75rem;color:#166534;padding:.1rem 0}
    .crop-table{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ct-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ct-grid{overflow-x:auto}
    .ct-header,.ct-row{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:.4rem;padding:.35rem .5rem;font-size:.75rem}
    .ct-header{background:#e5e7eb;border-radius:5px;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .ct-row{background:white;border-bottom:1px solid #f3f4f6}
    .ctr-name{font-weight:700}.mono{font-family:monospace;font-size:.68rem}
  `]
})
export class SeedRateCalculatorComponent implements OnInit {
  selectedCrop = 'Rice (Paddy)'; area = 2; sowingMethod = 'line';
  germination = 85; seedPrice = 60; rowSpacing = 20; plantSpacing = 15;
  result = signal<any>(null);

  crops = [
    {name:'Rice (Paddy)',seedRateMin:20,seedRateMax:25,avgRate:22,tsw:25,rowSp:20,plantSp:15,tips:['Use certified seeds for 15–20% higher germination','Pre-soak seeds 24 hrs before nursery sowing','100 g seed produces enough seedlings for 1 acre']},
    {name:'Wheat',seedRateMin:40,seedRateMax:50,avgRate:45,tsw:40,rowSp:22,plantSp:0,tips:['Line sowing saves 5–8 kg/acre over broadcasting','Treat seed with Bavistin @ 2g/kg before sowing','Optimum plant population: 200–250 plants/m²']},
    {name:'Maize',seedRateMin:7,seedRateMax:9,avgRate:8,tsw:280,rowSp:60,plantSp:25,tips:['Single cross hybrids: 8 kg/acre','Optimum plant population: 60,000–65,000/ha','Ridge sowing preferred in heavy rainfall areas']},
    {name:'Cotton',seedRateMin:1.5,seedRateMax:2.5,avgRate:2,tsw:100,rowSp:90,plantSp:60,tips:['Bt cotton: 450g/acre (small packet)','"Dibbling" saves 30% seed vs broadcasting','Seed treatment with Imidacloprid protects against early pests']},
    {name:'Soybean',seedRateMin:25,seedRateMax:30,avgRate:28,tsw:150,rowSp:45,plantSp:5,tips:['Rhizobium inoculation essential — saves 30 kg urea/ha','Use seeds from last crop if germination >85%','Avoid deep sowing >4cm']},
    {name:'Groundnut',seedRateMin:50,seedRateMax:70,avgRate:60,tsw:450,rowSp:30,plantSp:10,tips:['Shell seeds 24 hrs before sowing','Shell just before sowing to avoid seed coat damage','Treat with Thiram @3g/kg']},
    {name:'Onion',seedRateMin:3,seedRateMax:4,avgRate:3.5,tsw:4,rowSp:15,plantSp:10,tips:['Raise nursery — 500g seed/acre sufficient','Transplant at 6-week-old seedlings','Spacing varies: 15×10 cm for large bulbs']},
    {name:'Tomato',seedRateMin:0.1,seedRateMax:0.2,avgRate:0.15,tsw:3,rowSp:60,plantSp:45,tips:['Only 100–200g seed needed for 1 acre','Always raise nursery and transplant','Use hybrid varieties for disease resistance']},
  ];

  ngOnInit() { this.onCropChange(); }
  onCropChange() {
    const c = this.crops.find(x=>x.name===this.selectedCrop);
    if (c) { this.rowSpacing=c.rowSp; this.plantSpacing=c.plantSp||15; this.seedPrice = c.tsw < 10 ? 1800 : c.tsw < 50 ? 400 : 60; }
    this.calculate();
  }
  selectedCropData() { return this.crops.find(c=>c.name===this.selectedCrop); }

  calculate() {
    const c = this.selectedCropData();
    if (!c) return;
    const areaHa = this.area * 0.4047;
    let seedRatePerAcre = c.avgRate;
    if (this.sowingMethod === 'broadcast') seedRatePerAcre *= 1.2;
    if (this.sowingMethod === 'transplant') seedRatePerAcre *= 0.05;
    // Adjust for germination
    const adjRate = seedRatePerAcre * (100 / this.germination);
    const totalSeedKg = +(adjRate * this.area).toFixed(2);
    const totalCost = Math.round(totalSeedKg * this.seedPrice);
    const plantPop = this.rowSpacing && this.plantSpacing ? Math.round(10000 / (this.rowSpacing * this.plantSpacing / 10000) / 10000 * 10000) : 0;

    this.result.set({items:[
      {label:'Seed Rate per Acre',val:`${adjRate.toFixed(1)} kg/acre`},
      {label:`Total Seed (${this.area} acres)`,val:`${totalSeedKg} kg`},
      {label:'Estimated Seed Cost',val:`₹${totalCost.toLocaleString('en-IN')}`},
      {label:'Plant Population / ha',val:`${(plantPop*10000).toLocaleString('en-IN')} plants`},
      {label:'Seeds per packet needed',val:`${Math.ceil(totalSeedKg)} kg`},
    ]});
  }
}

// ─── Pesticide Calculator ─────────────────────────────────────────────────────
@Component({
  selector: 'app-pesticide-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#7f1d1d,#b91c1c)">
        <span class="hb-icon">🧴</span>
        <div>
          <div class="hb-title">Pesticide Dose Calculator</div>
          <div class="hb-sub">Calculate exact pesticide quantity, dilution & spray volume</div>
        </div>
      </div>
      <div class="safety-warning">
        <span>⚠️</span> Always read the pesticide label. Wear PPE (gloves, mask, goggles) during mixing and spraying. Keep children away.
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🧪 Pesticide Details</div>
          <div class="field"><label class="lbl">Pesticide Name</label>
            <select [(ngModel)]="selectedPest" (ngModelChange)="onPestChange()" class="sel">
              <option *ngFor="let p of pesticides" [value]="p.name">{{p.name}} ({{p.type}})</option>
            </select></div>
          <div class="field"><label class="lbl">Formulation</label>
            <select [(ngModel)]="formulation" (ngModelChange)="calculate()" class="sel">
              <option value="ec">EC (Emulsifiable Concentrate)</option>
              <option value="wp">WP (Wettable Powder)</option>
              <option value="sc">SC (Suspension Concentrate)</option>
              <option value="granule">Granule (soil application)</option>
            </select></div>
          <div class="field"><label class="lbl">Recommended Dose</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="doseValue" (ngModelChange)="calculate()" class="inp" />
              <select [(ngModel)]="doseUnit" (ngModelChange)="calculate()" class="sel-sm">
                <option value="ml_ha">ml/ha</option>
                <option value="g_ha">g/ha</option>
                <option value="ml_acre">ml/acre</option>
                <option value="g_acre">g/acre</option>
              </select>
            </div></div>
          <div class="field"><label class="lbl">Field Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" /></div>
          <div class="field"><label class="lbl">Spray Volume</label>
            <select [(ngModel)]="sprayVolume" (ngModelChange)="calculate()" class="sel">
              <option value="200">200 L/acre (knapsack)</option>
              <option value="400">400 L/acre (power sprayer)</option>
              <option value="100">100 L/acre (HV nozzle)</option>
              <option value="50">50 L/acre (drone spray)</option>
            </select></div>
        </div>
        <div class="field-group result-col">
          <div class="fg-title">📊 Calculation Results</div>
          <div class="result-cards" *ngIf="result()">
            <div class="result-card" *ngFor="let r of result()!.cards">
              <div class="rc-val">{{r.val}}</div>
              <div class="rc-label">{{r.label}}</div>
            </div>
          </div>
          <div class="mixing-guide" *ngIf="result()">
            <div class="mg-title">Mixing Guide (per tank)</div>
            <div class="mg-step" *ngFor="let s of result()!.mixing">
              <span class="ms-num">{{s.num}}</span><span>{{s.step}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="safety-section">
        <div class="ss-title">🛡 Safe Handling Guidelines</div>
        <div class="safety-grid">
          <div class="safety-item" *ngFor="let s of safetyTips"><span>{{s.icon}}</span><div>{{s.tip}}</div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;border-radius:14px;padding:1rem 1.25rem;color:white;margin-bottom:.75rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.8}
    .safety-warning{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.5rem .85rem;font-size:.78rem;color:#dc2626;font-weight:600;margin-bottom:1rem;display:flex;gap:.4rem;align-items:flex-start}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .sel-sm{padding:.35rem .4rem;border:1px solid #d1d5db;border-radius:6px;font-size:.78rem;background:white;outline:none}
    .input-row{display:flex;gap:.3rem}
    .input-row .inp{flex:1;width:auto}
    .result-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;margin-bottom:.75rem}
    .result-card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;text-align:center}
    .rc-val{font-size:.95rem;font-weight:800;color:#b91c1c}
    .rc-label{font-size:.63rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-top:.1rem}
    .mixing-guide{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.6rem .85rem}
    .mg-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#991b1b;margin-bottom:.4rem}
    .mg-step{display:flex;gap:.4rem;font-size:.78rem;color:#7f1d1d;padding:.2rem 0}
    .ms-num{font-weight:800;flex-shrink:0;color:#b91c1c}
    .safety-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ss-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .safety-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.4rem}
    .safety-item{display:flex;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.45rem .65rem;font-size:.75rem;line-height:1.35}
  `]
})
export class PesticideCalculatorComponent implements OnInit {
  selectedPest = 'Chlorpyrifos'; formulation = 'ec'; doseValue = 1500;
  doseUnit = 'ml_ha'; area = 2; sprayVolume = '200';
  result = signal<any>(null);

  pesticides = [
    {name:'Chlorpyrifos',type:'Insecticide',dose:1500,unit:'ml_ha'},{name:'Lambda-cyhalothrin',type:'Insecticide',dose:300,unit:'ml_ha'},{name:'Imidacloprid',type:'Insecticide',dose:125,unit:'ml_ha'},{name:'Mancozeb',type:'Fungicide',dose:2000,unit:'g_ha'},{name:'Carbendazim',type:'Fungicide',dose:500,unit:'g_ha'},{name:'Glyphosate',type:'Herbicide',dose:1500,unit:'ml_ha'},{name:'2,4-D Amine',type:'Herbicide',dose:1000,unit:'ml_ha'},{name:'Atrazine',type:'Herbicide',dose:1500,unit:'g_ha'},{name:'Propiconazole',type:'Fungicide',dose:500,unit:'ml_ha'},
  ];

  safetyTips = [
    {icon:'🧤',tip:'Always wear nitrile gloves, safety goggles and a mask when mixing pesticides.'},{icon:'🚫',tip:'Never eat, drink or smoke while handling pesticides. Wash hands thoroughly after.'},{icon:'⏰',tip:'Observe pre-harvest interval (PHI) — do not spray within specified days of harvest.'},{icon:'🌬️',tip:'Spray early morning or evening to avoid drift. Never spray in strong wind.'},{icon:'🗑️',tip:'Dispose of empty containers safely — triple-rinse and puncture. Never reuse.'},{icon:'🏥',tip:'In case of accidental poisoning, call Poison Control: 1800-11-6117 (India, toll-free).'},
  ];

  ngOnInit() { this.onPestChange(); }
  onPestChange() { const p = this.pesticides.find(x=>x.name===this.selectedPest); if(p){this.doseValue=p.dose;this.doseUnit=p.unit;} this.calculate(); }

  calculate() {
    const areaHa = this.area * 0.4047;
    let dosePerHa = this.doseValue;
    if (this.doseUnit === 'ml_acre' || this.doseUnit === 'g_acre') dosePerHa = this.doseValue / 0.4047;
    const totalPesticide = dosePerHa * areaHa;
    const totalWater = +this.sprayVolume * this.area;
    const tankSize = 16; // knapsack 16L
    const tanks = Math.ceil(totalWater / tankSize);
    const pesticidePerTank = +(totalPesticide / tanks).toFixed(1);
    const waterPerTank = Math.round(totalWater / tanks);
    const isLiquid = this.doseUnit.startsWith('ml') || this.formulation === 'ec' || this.formulation === 'sc';
    const unit = isLiquid ? 'ml' : 'g';

    this.result.set({
      cards:[
        {val:`${totalPesticide.toFixed(0)} ${unit}`,label:`Total Pesticide (${this.area} ac)`},
        {val:`${totalWater} L`,label:'Total Water'},
        {val:`${tanks} tanks`,label:`${tankSize}L Tanks Needed`},
        {val:`${pesticidePerTank} ${unit}`,label:'Per Tank'},
      ],
      mixing:[
        {num:'1',step:`Fill tank half with clean water (${Math.round(waterPerTank/2)} L).`},
        {num:'2',step:`Add ${pesticidePerTank} ${unit} of ${this.selectedPest} carefully.`},
        {num:'3',step:`Fill remaining water to ${waterPerTank} L. Stir gently.`},
        {num:'4',step:'Spray uniformly over the designated area.'},
        {num:'5',step:'Record: chemical used, dose, date, crop, pest.'},
      ],
    });
  }
}

// ─── Farm Income Calculator ───────────────────────────────────────────────────
@Component({
  selector: 'app-farm-income-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#1c1917,#44403c)">
        <span class="hb-icon">📊</span>
        <div>
          <div class="hb-title">Farm Income & Profit Calculator</div>
          <div class="hb-sub">Complete farm P&L — track all income and expenses per season</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">💰 Income Sources</div>
          <div class="income-row" *ngFor="let inc of incomes; let i=index">
            <input [(ngModel)]="inc.source" class="inp-sm-text" placeholder="Source" />
            <input type="number" [(ngModel)]="inc.amount" (ngModelChange)="calculate()" class="inp-num" placeholder="₹" />
            <button class="rm-btn" (click)="incomes.splice(i,1);calculate()">✕</button>
          </div>
          <button class="add-btn" (click)="incomes.push({source:'',amount:0})">+ Add Income</button>
        </div>
        <div class="field-group">
          <div class="fg-title">📦 Expenses</div>
          <div class="expense-row" *ngFor="let exp of expenses; let i=index">
            <input [(ngModel)]="exp.category" class="inp-sm-text" placeholder="Category" />
            <input type="number" [(ngModel)]="exp.amount" (ngModelChange)="calculate()" class="inp-num" placeholder="₹" />
            <button class="rm-btn" (click)="expenses.splice(i,1);calculate()">✕</button>
          </div>
          <button class="add-btn" (click)="expenses.push({category:'',amount:0})">+ Add Expense</button>
        </div>
      </div>
      <div class="land-row">
        <div class="lr-field"><label class="lbl">Land Area (Acres)</label><input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" /></div>
        <div class="lr-field"><label class="lbl">Season / Crop</label><input [(ngModel)]="cropName" class="inp" placeholder="e.g. Kharif 2024 - Rice" /></div>
      </div>
      <div class="pnl-section" *ngIf="result()">
        <div class="pnl-header">
          <div class="pnl-title">📋 Farm P&L Statement — {{cropName||'Season'}}</div>
        </div>
        <div class="pnl-grid">
          <div class="pnl-card green"><div class="pc-val">₹{{result()!.totalIncome.toLocaleString('en-IN')}}</div><div class="pc-label">Total Income</div></div>
          <div class="pnl-card red"><div class="pc-val">₹{{result()!.totalExpenses.toLocaleString('en-IN')}}</div><div class="pc-label">Total Expenses</div></div>
          <div class="pnl-card" [class.green]="result()!.netProfit>=0" [class.red]="result()!.netProfit<0">
            <div class="pc-val">₹{{Math.abs(result()!.netProfit).toLocaleString('en-IN')}}</div>
            <div class="pc-label">Net {{result()!.netProfit>=0?'Profit':'Loss'}}</div>
          </div>
          <div class="pnl-card blue"><div class="pc-val">{{result()!.margin.toFixed(1)}}%</div><div class="pc-label">Profit Margin</div></div>
          <div class="pnl-card"><div class="pc-val">₹{{result()!.incomePerAcre.toLocaleString('en-IN')}}</div><div class="pc-label">Income/Acre</div></div>
          <div class="pnl-card" [class.green]="result()!.profitPerAcre>=0" [class.red]="result()!.profitPerAcre<0"><div class="pc-val">₹{{Math.abs(result()!.profitPerAcre).toLocaleString('en-IN')}}</div><div class="pc-label">{{result()!.netProfit>=0?'Profit':'Loss'}}/Acre</div></div>
        </div>
        <div class="breakdown-row">
          <div class="br-col">
            <div class="br-title">Income Breakdown</div>
            <div class="br-item" *ngFor="let i of incomes" [style.opacity]="i.amount?1:.4">
              <span>{{i.source||'—'}}</span><span>₹{{(i.amount||0).toLocaleString('en-IN')}}</span>
            </div>
          </div>
          <div class="br-col">
            <div class="br-title">Expense Breakdown</div>
            <div class="br-item" *ngFor="let e of expenses" [style.opacity]="e.amount?1:.4">
              <span>{{e.category||'—'}}</span><span>₹{{(e.amount||0).toLocaleString('en-IN')}}</span>
            </div>
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
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:.85rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .income-row,.expense-row{display:flex;gap:.3rem;margin-bottom:.35rem;align-items:center}
    .inp-sm-text{flex:1.5;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;outline:none;min-width:0}
    .inp-num{flex:1;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;outline:none;text-align:right;min-width:0}
    .rm-btn{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:5px;padding:.25rem .45rem;cursor:pointer;font-size:.7rem;flex-shrink:0}
    .add-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:6px;padding:.3rem .75rem;cursor:pointer;font-size:.75rem;font-weight:700;margin-top:.25rem}
    .land-row{display:grid;grid-template-columns:1fr 2fr;gap:.85rem;margin-bottom:.85rem}
    @media(max-width:500px){.land-row{grid-template-columns:1fr}}
    .lr-field{display:flex;flex-direction:column;gap:.25rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.88rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .pnl-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem 1.25rem}
    .pnl-header{margin-bottom:.85rem}
    .pnl-title{font-size:.82rem;font-weight:800;color:#111827}
    .pnl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-bottom:.85rem}
    @media(max-width:500px){.pnl-grid{grid-template-columns:repeat(2,1fr)}}
    .pnl-card{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem;text-align:center}
    .pnl-card.green{border-color:#86efac;background:#f0fdf4}
    .pnl-card.red{border-color:#fca5a5;background:#fef2f2}
    .pnl-card.blue{border-color:#93c5fd;background:#eff6ff}
    .pc-val{font-size:.95rem;font-weight:800;color:#111827}
    .pc-label{font-size:.63rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-top:.1rem}
    .breakdown-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
    @media(max-width:500px){.breakdown-row{grid-template-columns:1fr}}
    .br-col{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .85rem}
    .br-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.4rem}
    .br-item{display:flex;justify-content:space-between;font-size:.78rem;padding:.2rem 0;border-bottom:1px solid #f3f4f6}
    .br-item:last-child{border-bottom:none}
  `]
})
export class FarmIncomeCalculatorComponent implements OnInit {
  Math = Math;
  cropName = 'Kharif 2024 - Rice'; area = 2;
  incomes = [{source:'Crop sale (Rice)',amount:85000},{source:'Straw sale',amount:4000},{source:'Government subsidy',amount:3000}];
  expenses = [{category:'Seeds',amount:3000},{category:'Fertilizer',amount:8500},{category:'Pesticide',amount:2500},{category:'Labour',amount:12000},{category:'Irrigation',amount:3000},{category:'Harvesting',amount:5000},{category:'Transport',amount:2000}];
  result = signal<any>(null);

  ngOnInit() { this.calculate(); }

  calculate() {
    const totalIncome = this.incomes.reduce((s,i)=>s+(+i.amount||0),0);
    const totalExpenses = this.expenses.reduce((s,e)=>s+(+e.amount||0),0);
    const netProfit = totalIncome - totalExpenses;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    this.result.set({totalIncome,totalExpenses,netProfit,margin,incomePerAcre:Math.round(totalIncome/this.area),profitPerAcre:Math.round(netProfit/this.area)});
  }
}

// ─── Livestock Feed Calculator ────────────────────────────────────────────────
@Component({
  selector: 'app-livestock-feed-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#4c1d95,#6d28d9)">
        <span class="hb-icon">🐄</span>
        <div>
          <div class="hb-title">Livestock Feed Calculator</div>
          <div class="hb-sub">Calculate daily feed requirements and monthly feed costs for your animals</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🐄 Animal Details</div>
          <div class="field"><label class="lbl">Animal Type</label>
            <select [(ngModel)]="animalType" (ngModelChange)="onAnimalChange()" class="sel">
              <option *ngFor="let a of animals" [value]="a.name">{{a.name}} ({{a.nameHi}})</option>
            </select></div>
          <div class="field"><label class="lbl">Number of Animals</label>
            <input type="number" [(ngModel)]="count" (ngModelChange)="calculate()" class="inp" min="1" /></div>
          <div class="field"><label class="lbl">Average Body Weight (kg)</label>
            <input type="number" [(ngModel)]="bodyWeight" (ngModelChange)="calculate()" class="inp" /></div>
          <div class="field"><label class="lbl">Production Purpose</label>
            <select [(ngModel)]="purpose" (ngModelChange)="calculate()" class="sel">
              <option value="maintenance">Maintenance only</option>
              <option value="milk">Milk Production (5L/day)</option>
              <option value="milk_high">High Milk Production (10L/day)</option>
              <option value="meat">Meat / Fattening</option>
              <option value="work">Draught / Work Animal</option>
              <option value="pregnant">Pregnant (last trimester)</option>
            </select></div>
          <div class="field"><label class="lbl">Season</label>
            <select [(ngModel)]="season" (ngModelChange)="calculate()" class="sel">
              <option value="normal">Normal</option>
              <option value="summer">Summer (increase 10%)</option>
              <option value="winter">Winter (increase 5%)</option>
            </select></div>
        </div>
        <div class="field-group">
          <div class="fg-title">📊 Feed Requirements</div>
          <div class="feed-results" *ngIf="result()">
            <div class="fr-section" *ngFor="let s of result()!.sections">
              <div class="frs-title">{{s.title}}</div>
              <div class="frs-item" *ngFor="let i of s.items">
                <span class="frsi-name">{{i.name}}</span>
                <span class="frsi-qty">{{i.daily}} kg/day</span>
                <span class="frsi-monthly">{{i.monthly}} kg/mo</span>
                <span class="frsi-cost">₹{{i.cost.toLocaleString('en-IN')}}/mo</span>
              </div>
            </div>
            <div class="total-feed">
              <span>Monthly Feed Cost ({{count}} animals)</span>
              <strong>₹{{result()!.totalMonthlyCost.toLocaleString('en-IN')}}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="nutrition-table">
        <div class="nt-title">Animal Nutrition Reference</div>
        <div class="nt-grid">
          <div class="nt-header"><span>Animal</span><span>DM/100kg BW</span><span>CP %</span><span>TDN %</span></div>
          <div class="nt-row" *ngFor="let a of animals">
            <span class="ntr-name">{{a.name}}</span><span>{{a.dm}}%</span><span>{{a.cp}}%</span><span>{{a.tdn}}%</span>
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
    .feed-results{display:flex;flex-direction:column;gap:.65rem}
    .fr-section{background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
    .frs-title{background:#f3f4f6;padding:.35rem .65rem;font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .frs-item{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:.3rem;padding:.35rem .65rem;border-bottom:1px solid #f3f4f6;font-size:.75rem;align-items:center}
    .frs-item:last-child{border-bottom:none}
    .frsi-name{font-weight:600}.frsi-qty{color:#059669;font-weight:600}.frsi-monthly{color:#6b7280}.frsi-cost{color:#dc2626;font-weight:600}
    .total-feed{display:flex;justify-content:space-between;align-items:center;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.55rem .85rem;font-size:.85rem}
    .total-feed strong{font-size:1rem;font-weight:800;color:#1d4ed8}
    .nutrition-table{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .nt-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .nt-header,.nt-row{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:.3rem;padding:.3rem .5rem;font-size:.75rem}
    .nt-header{background:#e5e7eb;border-radius:5px;font-size:.62rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .nt-row{background:white;border-bottom:1px solid #f3f4f6}
    .ntr-name{font-weight:700}
  `]
})
export class LivestockFeedCalculatorComponent implements OnInit {
  animalType = 'Cow (HF/Jersey)'; count = 2; bodyWeight = 450; purpose = 'milk'; season = 'normal';
  result = signal<any>(null);

  animals = [
    {name:'Cow (HF/Jersey)',nameHi:'गाय',dm:3.0,cp:14,tdn:65,weight:450,fodder:25,concentrate:4,mineral:75},
    {name:'Buffalo',nameHi:'भैंस',dm:2.8,cp:13,tdn:62,weight:500,fodder:28,concentrate:4,mineral:75},
    {name:'Goat',nameHi:'बकरी',dm:3.5,cp:16,tdn:70,weight:35,fodder:3,concentrate:0.3,mineral:10},
    {name:'Sheep',nameHi:'भेड़',dm:3.2,cp:14,tdn:65,weight:40,fodder:2.5,concentrate:0.3,mineral:10},
    {name:'Pig',nameHi:'सुअर',dm:4.0,cp:18,tdn:75,weight:60,fodder:0,concentrate:2,mineral:15},
    {name:'Poultry (Hen)',nameHi:'मुर्गी',dm:0,cp:20,tdn:80,weight:2,fodder:0,concentrate:0.12,mineral:3},
    {name:'Bullock / Ox',nameHi:'बैल',dm:2.5,cp:10,tdn:58,weight:400,fodder:20,concentrate:2,mineral:50},
  ];

  ngOnInit() { this.onAnimalChange(); }
  onAnimalChange() { const a = this.animals.find(x=>x.name===this.animalType); if(a) this.bodyWeight=a.weight; this.calculate(); }

  calculate() {
    const a = this.animals.find(x=>x.name===this.animalType);
    if (!a) return;

    const purposeMult: Record<string,number> = {maintenance:1,milk:1.25,milk_high:1.5,meat:1.3,work:1.2,pregnant:1.3};
    const seasonMult: Record<string,number> = {normal:1,summer:1.1,winter:1.05};
    const mult = (purposeMult[this.purpose]||1) * (seasonMult[this.season]||1);

    const fodderPerDay = +(a.fodder * (this.bodyWeight / a.weight) * mult).toFixed(1);
    const concPerDay = +(a.concentrate * (this.bodyWeight / a.weight) * mult).toFixed(2);
    const mineralPerDay = +(a.mineral / 1000).toFixed(3);
    const waterPerDay = +(this.bodyWeight * 0.08 * mult).toFixed(0);

    const feedItems = [
      {name:'Green Fodder',daily:fodderPerDay,price:2,monthly:+(fodderPerDay*30*this.count).toFixed(0)},
      {name:'Dry Fodder / Straw',daily:+(fodderPerDay*0.3).toFixed(1),price:3,monthly:+((fodderPerDay*0.3)*30*this.count).toFixed(0)},
      {name:'Concentrate Feed',daily:concPerDay,price:28,monthly:+(concPerDay*30*this.count).toFixed(1)},
      {name:'Mineral Mixture',daily:mineralPerDay,price:150,monthly:+(mineralPerDay*30*this.count).toFixed(2)},
    ].map(f=>({...f,cost:Math.round(f.monthly*(f.price))}));

    const sections = [{title:`Daily Ration per Animal (${this.animalType})`,items:feedItems}];
    const totalMonthlyCost = feedItems.reduce((s,f)=>s+f.cost,0);

    this.result.set({sections,totalMonthlyCost,waterPerDay});
  }
}
