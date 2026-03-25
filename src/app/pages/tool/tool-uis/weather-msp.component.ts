import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Weather Crop Advisor ─────────────────────────────────────────────────────
@Component({
  selector: 'app-weather-crop-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#0c4a6e,#0369a1)">
        <span class="hb-icon">🌤</span>
        <div>
          <div class="hb-title">Weather-Based Crop Advisor</div>
          <div class="hb-sub">Get crop recommendations, sowing calendar & weather alerts for your region</div>
        </div>
      </div>

      <div class="location-bar">
        <div class="field-row">
          <div class="field">
            <label class="lbl">State</label>
            <select [(ngModel)]="state" (ngModelChange)="onStateChange()" class="sel">
              <option *ngFor="let s of states" [value]="s.name">{{s.name}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">District / Zone</label>
            <select [(ngModel)]="zone" (ngModelChange)="loadAdvice()" class="sel">
              <option *ngFor="let z of currentZones()" [value]="z">{{z}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Current Month</label>
            <select [(ngModel)]="month" (ngModelChange)="loadAdvice()" class="sel">
              <option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</option>
            </select>
          </div>
          <div class="field">
            <label class="lbl">Farm Size (Acres)</label>
            <input type="number" [(ngModel)]="farmSize" (ngModelChange)="loadAdvice()" class="inp" min="0.5" />
          </div>
        </div>
      </div>

      <!-- Weather forecast widget -->
      <div class="weather-widget">
        <div class="ww-title">🌡 Typical Weather — {{currentMonthName()}}, {{state}}</div>
        <div class="weather-cards">
          <div class="weather-card" *ngFor="let w of weatherData()">
            <div class="wc-icon">{{w.icon}}</div>
            <div class="wc-val">{{w.val}}</div>
            <div class="wc-label">{{w.label}}</div>
          </div>
        </div>
      </div>

      <!-- Crop recommendations -->
      <div class="recommendations-section">
        <div class="rec-title">🌾 Recommended Crops for {{currentMonthName()}} in {{state}}</div>
        <div class="rec-grid">
          <div class="rec-card" *ngFor="let c of recommendations()" [class.priority]="c.priority">
            <div class="rec-header">
              <span class="rec-icon">{{c.icon}}</span>
              <div>
                <div class="rec-name">{{c.name}}</div>
                <div class="rec-season">{{c.season}}</div>
              </div>
              <span class="rec-badge" *ngIf="c.priority">⭐ Best</span>
            </div>
            <div class="rec-details">
              <div class="rd-row"><span>Sowing Window</span><strong>{{c.sowing}}</strong></div>
              <div class="rd-row"><span>Duration</span><strong>{{c.duration}}</strong></div>
              <div class="rd-row"><span>Expected Yield</span><strong>{{c.yield}}</strong></div>
              <div class="rd-row"><span>Water Need</span><strong>{{c.water}}</strong></div>
            </div>
            <div class="rec-alert" *ngIf="c.alert">⚠️ {{c.alert}}</div>
          </div>
        </div>
      </div>

      <!-- Sowing calendar -->
      <div class="calendar-section">
        <div class="cal-title">📅 Annual Sowing Calendar — {{state}}</div>
        <div class="calendar-grid">
          <div class="cal-month" *ngFor="let m of calendarData(); let i=index" [class.current]="i+1===month">
            <div class="cm-label">{{months[i].slice(0,3)}}</div>
            <div class="cm-crops">
              <span *ngFor="let c of m.crops" class="cc-chip" [class]="'chip-'+c.type">{{c.name}}</span>
            </div>
          </div>
        </div>
        <div class="cal-legend">
          <span class="chip-kharif">Kharif</span>
          <span class="chip-rabi">Rabi</span>
          <span class="chip-zaid">Zaid</span>
          <span class="chip-harvest">Harvest</span>
        </div>
      </div>

      <!-- Seasonal alerts -->
      <div class="alerts-section">
        <div class="as-title">🚨 Seasonal Alerts & Advisory</div>
        <div class="alert-item" *ngFor="let a of seasonalAlerts()" [class]="'alert-'+a.level">
          <span class="ai-icon">{{a.icon}}</span>
          <div><strong>{{a.title}}</strong><div class="ai-desc">{{a.desc}}</div></div>
          <span class="ai-level">{{a.level.toUpperCase()}}</span>
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
    .location-bar{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .field-row{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
    @media(max-width:700px){.field-row{grid-template-columns:repeat(2,1fr)}}
    .field{display:flex;flex-direction:column;gap:.25rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .weather-widget{background:linear-gradient(135deg,#1e3a5f,#1e40af);border-radius:12px;padding:.85rem 1.25rem;margin-bottom:1rem;color:white}
    .ww-title{font-size:.72rem;font-weight:700;text-transform:uppercase;opacity:.7;margin-bottom:.65rem}
    .weather-cards{display:grid;grid-template-columns:repeat(5,1fr);gap:.5rem}
    @media(max-width:600px){.weather-cards{grid-template-columns:repeat(3,1fr)}}
    .weather-card{background:rgba(255,255,255,.1);border-radius:8px;padding:.5rem;text-align:center}
    .wc-icon{font-size:1.3rem;margin-bottom:.2rem}
    .wc-val{font-size:.88rem;font-weight:800;margin-bottom:.1rem}
    .wc-label{font-size:.6rem;opacity:.7;text-transform:uppercase}
    .recommendations-section{margin-bottom:1rem}
    .rec-title{font-size:.82rem;font-weight:800;color:#111827;margin-bottom:.65rem}
    .rec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.75rem}
    .rec-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.75rem .9rem}
    .rec-card.priority{border-color:#fbbf24;background:#fffbeb}
    .rec-header{display:flex;align-items:center;gap:.5rem;margin-bottom:.55rem}
    .rec-icon{font-size:1.5rem;flex-shrink:0}
    .rec-name{font-size:.88rem;font-weight:800;color:#111827}
    .rec-season{font-size:.68rem;color:#9ca3af}
    .rec-badge{background:#fef3c7;color:#d97706;font-size:.65rem;font-weight:700;padding:.15rem .45rem;border-radius:99px;margin-left:auto;flex-shrink:0}
    .rec-details{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.4rem}
    .rd-row{display:flex;justify-content:space-between;font-size:.75rem;padding:.15rem 0;border-bottom:1px solid #f3f4f6}
    .rd-row:last-child{border-bottom:none}
    .rd-row span{color:#9ca3af}
    .rec-alert{background:#fef3c7;border-radius:5px;padding:.25rem .5rem;font-size:.7rem;color:#92400e;font-weight:600;margin-top:.3rem}
    .calendar-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .cal-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .calendar-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:.2rem;margin-bottom:.5rem}
    @media(max-width:700px){.calendar-grid{grid-template-columns:repeat(6,1fr)}}
    .cal-month{border:1px solid #e5e7eb;border-radius:6px;padding:.3rem .2rem;text-align:center;min-height:60px;background:white;transition:all .1s}
    .cal-month.current{border-color:#0369a1;background:#eff6ff}
    .cm-label{font-size:.62rem;font-weight:700;color:#6b7280;margin-bottom:.25rem}
    .cm-crops{display:flex;flex-direction:column;gap:2px}
    .cc-chip{font-size:.5rem;font-weight:700;border-radius:3px;padding:.05rem .25rem;text-align:center}
    .chip-kharif{background:#dcfce7;color:#166534}
    .chip-rabi{background:#dbeafe;color:#1e40af}
    .chip-zaid{background:#fef3c7;color:#92400e}
    .chip-harvest{background:#f3e8ff;color:#6b21a8}
    .cal-legend{display:flex;gap:.5rem;font-size:.65rem;font-weight:700;flex-wrap:wrap}
    .cal-legend span{padding:.1rem .4rem;border-radius:4px}
    .alerts-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .as-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .alert-item{display:flex;align-items:flex-start;gap:.65rem;border-radius:8px;padding:.55rem .75rem;margin-bottom:.4rem;font-size:.8rem}
    .alert-item:last-child{margin-bottom:0}
    .alert-high{background:#fef2f2;border:1px solid #fecaca}
    .alert-medium{background:#fef3c7;border:1px solid #fcd34d}
    .alert-low{background:#f0fdf4;border:1px solid #bbf7d0}
    .ai-icon{font-size:1.1rem;flex-shrink:0}
    .ai-desc{font-size:.72rem;color:#6b7280;margin-top:.1rem}
    .ai-level{font-size:.6rem;font-weight:700;border-radius:99px;padding:.1rem .4rem;flex-shrink:0;margin-left:auto;align-self:center}
    .alert-high .ai-level{background:#fecaca;color:#991b1b}
    .alert-medium .ai-level{background:#fde68a;color:#92400e}
    .alert-low .ai-level{background:#bbf7d0;color:#065f46}
  `]
})
export class WeatherCropAdvisorComponent implements OnInit {
  state = 'Maharashtra'; zone = 'Pune'; month = new Date().getMonth() + 1; farmSize = 2;
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  states = [
    {name:'Maharashtra',zones:['Pune','Nashik','Aurangabad','Nagpur','Konkan']},
    {name:'Punjab',zones:['Ludhiana','Amritsar','Patiala','Bathinda']},
    {name:'Uttar Pradesh',zones:['Lucknow','Agra','Varanasi','Allahabad']},
    {name:'Madhya Pradesh',zones:['Bhopal','Indore','Jabalpur','Gwalior']},
    {name:'Rajasthan',zones:['Jaipur','Jodhpur','Kota','Bikaner']},
    {name:'Gujarat',zones:['Ahmedabad','Surat','Rajkot','Vadodara']},
    {name:'Karnataka',zones:['Bangalore','Hubli','Mysore','Belgaum']},
    {name:'Andhra Pradesh',zones:['Hyderabad','Visakhapatnam','Kurnool','Tirupati']},
    {name:'Bihar',zones:['Patna','Muzaffarpur','Bhagalpur','Gaya']},
    {name:'West Bengal',zones:['Kolkata','Siliguri','Bardhaman','Howrah']},
  ];

  currentZones() { return this.states.find(s=>s.name===this.state)?.zones || []; }
  currentMonthName() { return this.months[this.month-1]; }

  ngOnInit() { this.onStateChange(); }
  onStateChange() { this.zone = this.currentZones()[0] || ''; this.loadAdvice(); }
  loadAdvice() {}

  weatherData() {
    const m = this.month;
    const isSummer = m >= 3 && m <= 5; const isMonsoon = m >= 6 && m <= 9; const isWinter = m <= 2 || m === 12;
    const temp = isSummer ? '38–42°C' : isMonsoon ? '28–34°C' : '15–25°C';
    const rain = isMonsoon ? '150–300mm' : isSummer ? '0–20mm' : '5–40mm';
    return [
      {icon:'🌡',val:temp,label:'Temperature'},{icon:'💧',val:rain,label:'Rainfall'},{icon:'💨',val:isMonsoon?'60–80%':'30–50%',label:'Humidity'},{icon:'☀️',val:isSummer?'12 hrs':'8–10 hrs',label:'Sunshine'},{icon:'🌬️',val:isMonsoon?'15–25 km/h':'5–15 km/h',label:'Wind'},
    ];
  }

  recommendations() {
    const m = this.month;
    const allRec: Record<number,any[]> = {
      1:[{name:'Wheat',icon:'🌾',season:'Rabi',sowing:'Oct–Nov (sown)',duration:'120–150 days',yield:'18–22 qtl/ac',water:'Low',priority:false,alert:'Top-dressing time: Apply 2nd dose of nitrogen'},{name:'Gram (Chana)',icon:'🌱',season:'Rabi',sowing:'Oct–Nov (sown)',duration:'90–110 days',yield:'6–8 qtl/ac',water:'Low',priority:true,alert:null}],
      6:[{name:'Rice (Paddy)',icon:'🌾',season:'Kharif',sowing:'June–July',duration:'120–150 days',yield:'16–22 qtl/ac',water:'Very High',priority:true,alert:'Nursery preparation time — sow paddy nursery now'},{name:'Soybean',icon:'🌱',season:'Kharif',sowing:'June–July',duration:'90–110 days',yield:'8–12 qtl/ac',water:'Medium',priority:false,alert:'Wait for adequate rainfall before sowing'}],
      11:[{name:'Wheat',icon:'🌾',season:'Rabi',sowing:'Nov 1–30',duration:'120–150 days',yield:'18–22 qtl/ac',water:'Low',priority:true,alert:null},{name:'Mustard',icon:'🌻',season:'Rabi',sowing:'Oct–Nov',duration:'100–120 days',yield:'5–8 qtl/ac',water:'Low',priority:false,alert:null},{name:'Potato',icon:'🥔',season:'Rabi',sowing:'Oct–Nov',duration:'75–90 days',yield:'60–90 qtl/ac',water:'Medium',priority:false,alert:null}],
    };
    const season = m >= 6 && m <= 9 ? 6 : m >= 10 || m <= 2 ? 11 : m >= 3 && m <= 5 ? 4 : 6;
    return allRec[season] || allRec[6];
  }

  calendarData() {
    const cropsByMonth: Record<number,{name:string,type:string}[]> = {
      1:[{name:'Wheat',type:'rabi'},{name:'Gram',type:'rabi'}],2:[{name:'Wheat',type:'rabi'}],3:[{name:'Harvest',type:'harvest'},{name:'Cucumber',type:'zaid'}],4:[{name:'Zaid',type:'zaid'},{name:'Melon',type:'zaid'}],5:[{name:'Zaid',type:'zaid'}],6:[{name:'Rice',type:'kharif'},{name:'Cotton',type:'kharif'}],7:[{name:'Rice',type:'kharif'},{name:'Maize',type:'kharif'}],8:[{name:'Kharif',type:'kharif'}],9:[{name:'Kharif',type:'kharif'}],10:[{name:'Harvest',type:'harvest'},{name:'Wheat',type:'rabi'}],11:[{name:'Wheat',type:'rabi'},{name:'Mustard',type:'rabi'}],12:[{name:'Rabi',type:'rabi'}],
    };
    return Array.from({length:12},(_,i)=>({crops:cropsByMonth[i+1]||[]}));
  }

  seasonalAlerts() {
    const m = this.month;
    const alerts: any[] = [];
    if (m >= 4 && m <= 6) alerts.push({icon:'🔥',level:'high',title:'Heat Wave Alert',desc:'Temperatures may exceed 42°C. Ensure adequate irrigation for standing crops. Avoid field work 12–3pm.'});
    if (m >= 6 && m <= 8) alerts.push({icon:'🌧',level:'medium',title:'Heavy Rainfall Expected',desc:'Ensure proper drainage channels are open. Waterlogging can damage roots. Delay top-dressing during rain.'});
    if (m === 11 || m === 12) alerts.push({icon:'❄️',level:'medium',title:'Winter Onset — Fog Risk',desc:'Dense fog may delay germination. Use fog-resistant varieties. Sow on time before mid-November.'});
    if (m >= 2 && m <= 4) alerts.push({icon:'🌿',level:'low',title:'Good Sowing Conditions',desc:'Optimal temperature for Rabi harvest and Zaid sowing. Monitor aphids and powdery mildew on wheat.'});
    if (!alerts.length) alerts.push({icon:'✅',level:'low',title:'Normal Conditions',desc:'Weather is favourable for crop growth. Maintain regular irrigation and watch for pest outbreaks.'});
    return alerts;
  }
}

// ─── MSP Calculator ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-msp-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner" style="background:linear-gradient(135deg,#14532d,#166534)">
        <span class="hb-icon">🏛</span>
        <div>
          <div class="hb-title">MSP Calculator (Minimum Support Price)</div>
          <div class="hb-sub">Calculate expected income at government MSP rates for Kharif & Rabi 2024–25</div>
        </div>
      </div>

      <div class="msp-notice">
        ℹ️ MSP rates are announced by CACP and approved by Cabinet. These are {{mspYear}} rates. Actual procurement depends on state government schemes and FCI availability.
      </div>

      <div class="form-grid">
        <div class="field-group">
          <div class="fg-title">🌾 Crop & Quantity</div>
          <div class="field"><label class="lbl">Select Crop</label>
            <select [(ngModel)]="selectedCrop" (ngModelChange)="calculate()" class="sel">
              <optgroup *ngFor="let g of mspGroups" [label]="g.label">
                <option *ngFor="let c of g.crops" [value]="c.name">{{c.name}} — ₹{{c.msp.toLocaleString('en-IN')}}/qtl</option>
              </optgroup>
            </select></div>
          <div class="field"><label class="lbl">Land Area (Acres)</label>
            <input type="number" [(ngModel)]="area" (ngModelChange)="calculate()" class="inp" min="0.5" step="0.5" /></div>
          <div class="field"><label class="lbl">Expected Yield (qtl/acre)</label>
            <input type="number" [(ngModel)]="yield_qtl" (ngModelChange)="calculate()" class="inp" min="1" step="0.5" /></div>
          <div class="field"><label class="lbl">Actual Market Price (₹/qtl)</label>
            <div class="input-row">
              <input type="number" [(ngModel)]="marketPrice" (ngModelChange)="calculate()" class="inp" placeholder="Optional" />
              <button class="msp-btn" (click)="useMSP()">Use MSP</button>
            </div></div>
          <div class="field"><label class="lbl">Input Cost (₹/acre)</label>
            <input type="number" [(ngModel)]="inputCost" (ngModelChange)="calculate()" class="inp" /></div>
        </div>
        <div class="field-group">
          <div class="fg-title">📊 Calculation Results</div>
          <div class="result-items" *ngIf="result()">
            <div class="ri-item" *ngFor="let r of result()!.items">
              <span class="ri-label">{{r.label}}</span>
              <span class="ri-val" [class.positive]="r.positive" [class.negative]="r.negative">{{r.val}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MSP vs Market comparison -->
      <div class="comparison-section" *ngIf="result() && marketPrice && marketPrice!==mspForCrop()">
        <div class="cs-title">MSP vs Market Price Comparison</div>
        <div class="comparison-bars">
          <div class="cb-item">
            <span class="cbi-label">At MSP (₹{{mspForCrop()?.toLocaleString('en-IN')}}/qtl)</span>
            <div class="cbi-bar"><div class="cbb-fill msp" [style.width.%]="100"></div></div>
            <span class="cbi-val">₹{{(result()?.mspIncome||0).toLocaleString('en-IN')}}</span>
          </div>
          <div class="cb-item">
            <span class="cbi-label">At Market (₹{{marketPrice?.toLocaleString('en-IN')}}/qtl)</span>
            <div class="cbi-bar"><div class="cbb-fill market" [style.width.%]="marketPct()"></div></div>
            <span class="cbi-val">₹{{(result()?.marketIncome||0).toLocaleString('en-IN')}}</span>
          </div>
        </div>
        <div class="diff-row" [class.positive]="marketPrice>mspForCrop()!" [class.negative]="marketPrice<mspForCrop()!">
          {{marketPrice>mspForCrop()!?'✅ Market is':'⚠️ Market is'}} ₹{{Math.abs(marketPrice-(mspForCrop()||0)).toLocaleString('en-IN')}}/qtl {{marketPrice>mspForCrop()!?'above':'below'}} MSP.
          You {{marketPrice>mspForCrop()!?'gain':'lose'}} ₹{{Math.abs((marketPrice-(mspForCrop()||0))*(result()?.totalYieldQtl||0)).toLocaleString('en-IN')}} compared to selling at MSP.
        </div>
      </div>

      <!-- Full MSP table -->
      <div class="msp-table">
        <div class="mt-title">MSP Rates {{mspYear}} (CACP Recommended)</div>
        <div class="mt-grid">
          <div class="mt-group" *ngFor="let g of mspGroups">
            <div class="mtg-title">{{g.label}}</div>
            <div class="mtg-row" *ngFor="let c of g.crops" (click)="selectedCrop=c.name;calculate()" [class.active]="selectedCrop===c.name">
              <span class="mtgr-name">{{c.name}}</span>
              <span class="mtgr-msp">₹{{c.msp.toLocaleString('en-IN')}}/qtl</span>
              <span class="mtgr-hike" *ngIf="c.hike">+{{c.hike}}%</span>
            </div>
          </div>
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
    .msp-notice{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.45rem .85rem;font-size:.75rem;color:#1e40af;margin-bottom:1rem}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:680px){.form-grid{grid-template-columns:1fr}}
    .field-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .fg-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid #e5e7eb}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp,.sel{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:white}
    .input-row{display:flex;gap:.3rem}
    .input-row .inp{flex:1;width:auto}
    .msp-btn{background:#166534;color:white;border:none;border-radius:7px;padding:.38rem .7rem;cursor:pointer;font-size:.72rem;font-weight:700;flex-shrink:0;white-space:nowrap}
    .result-items{display:flex;flex-direction:column;gap:.35rem}
    .ri-item{display:flex;justify-content:space-between;align-items:center;background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .75rem;font-size:.82rem}
    .ri-label{color:#6b7280}.ri-val{font-weight:800;color:#111827}
    .ri-val.positive{color:#059669}.ri-val.negative{color:#dc2626}
    .comparison-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem;margin-bottom:1rem}
    .cs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .comparison-bars{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.65rem}
    .cb-item{display:flex;align-items:center;gap.65rem;gap:.65rem}
    .cbi-label{font-size:.72rem;min-width:200px;color:#374151;flex-shrink:0}
    .cbi-bar{flex:1;height:12px;background:#e5e7eb;border-radius:99px;overflow:hidden}
    .cbb-fill{height:100%;border-radius:99px;transition:width .4s}
    .cbb-fill.msp{background:#166534}
    .cbb-fill.market{background:#3b82f6}
    .cbi-val{font-size:.8rem;font-weight:700;min-width:90px;text-align:right;flex-shrink:0}
    .diff-row{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.45rem .85rem;font-size:.8rem;font-weight:600}
    .diff-row.positive{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
    .diff-row.negative{background:#fef2f2;border-color:#fecaca;color:#991b1b}
    .msp-table{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .mt-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .mt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
    .mt-group{}
    .mtg-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.35rem;padding-bottom:.2rem;border-bottom:1px solid #e5e7eb}
    .mtg-row{display:flex;align-items:center;gap:.4rem;padding:.3rem .4rem;border-radius:5px;cursor:pointer;font-size:.78rem;transition:all .1s}
    .mtg-row:hover,.mtg-row.active{background:#ecfdf5}
    .mtgr-name{flex:1;font-weight:600}
    .mtgr-msp{font-weight:700;color:#166534;font-size:.75rem}
    .mtgr-hike{background:#dcfce7;color:#166534;font-size:.62rem;font-weight:700;padding:.05rem .35rem;border-radius:99px}
  `]
})
export class MspCalculatorComponent implements OnInit {
  Math = Math;
  mspYear = '2024–25'; selectedCrop = 'Rice (Common)'; area = 2; yield_qtl = 18;
  marketPrice = 0; inputCost = 12000;
  result = signal<any>(null);

  mspGroups = [
    {label:'Kharif Crops 2024',crops:[
      {name:'Rice (Common)',msp:2300,hike:5},{name:'Rice (Grade A)',msp:2320,hike:5},{name:'Jowar (Hybrid)',msp:3371,hike:7},{name:'Bajra (Pearl Millet)',msp:2625,hike:5},{name:'Maize',msp:2090,hike:5},{name:'Tur / Arhar (Pigeonpea)',msp:7550,hike:7},{name:'Moong (Green Gram)',msp:8682,hike:7},{name:'Urad (Black Gram)',msp:7400,hike:6},{name:'Groundnut (Shell)',msp:6783,hike:6},{name:'Sunflower Seed',msp:7280,hike:7},{name:'Soybean (Yellow)',msp:4892,hike:5},{name:'Sesame (Til)',msp:9267,hike:5},{name:'Cotton (Medium Staple)',msp:7121,hike:5},{name:'Cotton (Long Staple)',msp:7521,hike:5},
    ]},
    {label:'Rabi Crops 2024',crops:[
      {name:'Wheat',msp:2275,hike:7},{name:'Barley',msp:1735,hike:5},{name:'Gram (Chana)',msp:5440,hike:5},{name:'Masur (Red Lentil)',msp:6425,hike:6},{name:'Mustard / Rapeseed',msp:5950,hike:6},{name:'Safflower',msp:5800,hike:5},
    ]},
    {label:'Other Crops',crops:[
      {name:'Sugarcane (FRP)',msp:340,hike:8},{name:'Copra (Milling)',msp:11160,hike:5},{name:'Copra (Ball)',msp:12000,hike:5},{name:'Jute',msp:5335,hike:7},
    ]},
  ];

  ngOnInit() { this.calculate(); }

  mspForCrop(): number|null {
    for (const g of this.mspGroups) { const c = g.crops.find(x=>x.name===this.selectedCrop); if(c) return c.msp; }
    return null;
  }

  calculate() {
    const msp = this.mspForCrop() || 0;
    const totalYieldQtl = this.yield_qtl * this.area;
    const mspIncome = Math.round(totalYieldQtl * msp);
    const price = this.marketPrice || msp;
    const marketIncome = Math.round(totalYieldQtl * price);
    const totalInputCost = Math.round(this.inputCost * this.area);
    const netProfit = marketIncome - totalInputCost;
    const roi = totalInputCost > 0 ? (netProfit/totalInputCost*100).toFixed(1) : 0;

    this.result.set({totalYieldQtl,mspIncome,marketIncome,totalInputCost,netProfit,roi,items:[
      {label:`MSP Rate (${this.selectedCrop})`,val:`₹${msp.toLocaleString('en-IN')}/qtl`,positive:false,negative:false},
      {label:'Total Yield',val:`${totalYieldQtl.toFixed(1)} qtl (${(totalYieldQtl*100).toLocaleString('en-IN')} kg)`,positive:false,negative:false},
      {label:'Income at MSP',val:`₹${mspIncome.toLocaleString('en-IN')}`,positive:true,negative:false},
      {label:'Income at Market',val:`₹${marketIncome.toLocaleString('en-IN')}`,positive:true,negative:false},
      {label:'Total Input Cost',val:`₹${totalInputCost.toLocaleString('en-IN')}`,positive:false,negative:false},
      {label:`Net ${netProfit>=0?'Profit':'Loss'}`,val:`₹${Math.abs(netProfit).toLocaleString('en-IN')}`,positive:netProfit>=0,negative:netProfit<0},
      {label:'Return on Investment',val:`${roi}%`,positive:netProfit>=0,negative:netProfit<0},
    ]});
  }

  useMSP() { this.marketPrice = this.mspForCrop() || 0; this.calculate(); }
  marketPct(): number {
    const msp = this.mspForCrop() || 1;
    return Math.min(100, (this.marketPrice / msp) * 100);
  }
}
