import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FertResult { name: string; icon: string; nutrient: string; kgPerAcre: number; bags50kg: number; cost: number; }

@Component({
  selector: 'app-fertilizer-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="fc-wrap">
      <div class="inp-grid">
        <div class="inp-field">
          <label>Crop</label>
          <select [(ngModel)]="cropKey" (change)="onCropChange()" class="sel">
            <option *ngFor="let c of crops" [value]="c.key">{{ c.icon }} {{ c.name }}</option>
          </select>
        </div>
        <div class="inp-field">
          <label>Field Area (Acres)</label>
          <div class="inp-box"><input type="number" [(ngModel)]="area" (input)="calc()" min="0.1" step="0.1" class="val-inp" /><span class="suf">Acres</span></div>
        </div>
        <div class="inp-field">
          <label>Target Yield (Q/acre)</label>
          <div class="inp-box"><input type="number" [(ngModel)]="targetYield" (input)="calc()" min="1" class="val-inp" /><span class="suf">Q</span></div>
        </div>
      </div>

      <!-- Soil test values -->
      <div class="soil-section">
        <div class="soil-title">🧪 Soil Test Values (Optional — leave 0 if unknown)</div>
        <div class="soil-grid">
          <div class="inp-field">
            <label>Nitrogen (N) - kg/ha</label>
            <div class="inp-box"><input type="number" [(ngModel)]="soilN" (input)="calc()" min="0" class="val-inp" /><span class="suf">kg/ha</span></div>
          </div>
          <div class="inp-field">
            <label>Phosphorus (P) - kg/ha</label>
            <div class="inp-box"><input type="number" [(ngModel)]="soilP" (input)="calc()" min="0" class="val-inp" /><span class="suf">kg/ha</span></div>
          </div>
          <div class="inp-field">
            <label>Potassium (K) - kg/ha</label>
            <div class="inp-box"><input type="number" [(ngModel)]="soilK" (input)="calc()" min="0" class="val-inp" /><span class="suf">kg/ha</span></div>
          </div>
        </div>
      </div>

      <!-- NPK Required -->
      <div class="npk-section" *ngIf="npkRequired()">
        <div class="npk-title">🌿 NPK Requirement for {{ area }} Acres</div>
        <div class="npk-cards">
          <div class="npk-card nitrogen">
            <div class="nc-symbol">N</div>
            <div class="nc-val">{{ npkRequired()!.n | number:'1.0-0' }} kg</div>
            <div class="nc-lbl">Nitrogen Required</div>
            <div class="nc-sub">{{ npkPerAcre()!.n | number:'1.1-1' }} kg/acre</div>
          </div>
          <div class="npk-card phosphorus">
            <div class="nc-symbol">P</div>
            <div class="nc-val">{{ npkRequired()!.p | number:'1.0-0' }} kg</div>
            <div class="nc-lbl">Phosphorus Required</div>
            <div class="nc-sub">{{ npkPerAcre()!.p | number:'1.1-1' }} kg/acre</div>
          </div>
          <div class="npk-card potassium">
            <div class="nc-symbol">K</div>
            <div class="nc-val">{{ npkRequired()!.k | number:'1.0-0' }} kg</div>
            <div class="nc-lbl">Potassium Required</div>
            <div class="nc-sub">{{ npkPerAcre()!.k | number:'1.1-1' }} kg/acre</div>
          </div>
        </div>

        <!-- NPK ratio bar -->
        <div class="npk-bar">
          <div class="npk-n" [style.width.%]="npkPct()!.n" [title]="'N: '+npkPct()!.n.toFixed(0)+'%'"></div>
          <div class="npk-p" [style.width.%]="npkPct()!.p" [title]="'P: '+npkPct()!.p.toFixed(0)+'%'"></div>
          <div class="npk-k" [style.width.%]="npkPct()!.k" [title]="'K: '+npkPct()!.k.toFixed(0)+'%'"></div>
        </div>
        <div class="npk-legend">
          <span><span class="nl n-dot"></span>N {{ npkPct()!.n.toFixed(0) }}%</span>
          <span><span class="nl p-dot"></span>P {{ npkPct()!.p.toFixed(0) }}%</span>
          <span><span class="nl k-dot"></span>K {{ npkPct()!.k.toFixed(0) }}%</span>
        </div>
      </div>

      <!-- Fertilizer Recommendations -->
      <div class="fert-recs" *ngIf="fertResults().length">
        <div class="fr-title">🛒 Fertilizer Recommendation</div>
        <div class="fr-cards">
          <div class="fr-card" *ngFor="let f of fertResults()">
            <div class="frc-header">
              <span class="frc-icon">{{ f.icon }}</span>
              <span class="frc-name">{{ f.name }}</span>
              <span class="frc-nutrient">{{ f.nutrient }}</span>
            </div>
            <div class="frc-main">
              <div class="frc-kg">{{ f.kgPerAcre | number:'1.0-0' }} <span class="frc-unit">kg/acre</span></div>
              <div class="frc-total">Total: {{ (f.kgPerAcre * area) | number:'1.0-0' }} kg</div>
            </div>
            <div class="frc-bags">
              <span class="bags-count">{{ f.bags50kg | number:'1.1-1' }}</span>
              <span class="bags-label">bags (50kg)</span>
            </div>
            <div class="frc-bar">
              <div class="frcb-fill" [style.width.%]="(f.kgPerAcre/60)*100"></div>
            </div>
            <div class="frc-cost">Est. cost: ₹{{ f.cost | number:'1.0-0' }}</div>
          </div>
        </div>

        <!-- Application timing -->
        <div class="timing-section">
          <div class="ts-title">⏰ Application Schedule</div>
          <div class="ts-items">
            <div class="ts-item" *ngFor="let t of currentCropData()?.timing">
              <div class="ti-phase">{{ t.phase }}</div>
              <div class="ti-apply">{{ t.apply }}</div>
              <div class="ti-when">{{ t.when }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fertilizer reference -->
      <div class="fert-ref">
        <div class="fref-title">📋 Common Fertilizers & Nutrient Content</div>
        <table class="fref-table">
          <thead><tr><th>Fertilizer</th><th>N%</th><th>P%</th><th>K%</th><th>Approx Price/bag</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fertRef">
              <td><strong>{{ f.name }}</strong></td>
              <td>{{ f.n }}%</td><td>{{ f.p }}%</td><td>{{ f.k }}%</td>
              <td>₹{{ f.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .fc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .inp-field{display:flex;flex-direction:column;gap:.4rem}
    .inp-field label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .sel{padding:.5rem .65rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.85rem;outline:none;font-family:var(--font);width:100%}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:8px;padding:.45rem .65rem;gap:.25rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .val-inp{border:none;outline:none;background:transparent;font-size:.9rem;font-weight:700;color:var(--text);width:65px;font-family:var(--font)}
    .suf{font-size:.72rem;color:var(--text-muted)}
    .soil-section{padding:.85rem 1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .soil-title{font-size:.8rem;font-weight:700;margin-bottom:.75rem}
    .soil-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .npk-section{display:flex;flex-direction:column;gap:.75rem}
    .npk-title{font-size:.82rem;font-weight:700}
    .npk-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .npk-card{padding:1rem;border-radius:12px;text-align:center;border:2px solid var(--border)}
    .npk-card.nitrogen{border-color:#3b82f6;background:#3b82f611}
    .npk-card.phosphorus{border-color:#f59e0b;background:#f59e0b11}
    .npk-card.potassium{border-color:#10b981;background:#10b98111}
    .nc-symbol{font-size:1.5rem;font-weight:900;margin-bottom:.3rem}
    .nitrogen .nc-symbol{color:#3b82f6} .phosphorus .nc-symbol{color:#f59e0b} .potassium .nc-symbol{color:#10b981}
    .nc-val{font-size:1.1rem;font-weight:800;color:var(--text)}
    .nc-lbl{font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin:.15rem 0}
    .nc-sub{font-size:.7rem;color:var(--text-muted)}
    .npk-bar{display:flex;height:16px;border-radius:10px;overflow:hidden}
    .npk-n{background:#3b82f6;transition:width .4s} .npk-p{background:#f59e0b;transition:width .4s} .npk-k{background:#10b981;transition:width .4s}
    .npk-legend{display:flex;gap:1.25rem;font-size:.75rem;color:var(--text-muted)}
    .nl{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.3rem}
    .n-dot{background:#3b82f6} .p-dot{background:#f59e0b} .k-dot{background:#10b981}
    .fr-title,.ts-title,.fref-title{font-size:.82rem;font-weight:700;margin-bottom:.65rem}
    .fr-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem;margin-bottom:1rem}
    .fr-card{padding:1rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);display:flex;flex-direction:column;gap:.4rem}
    .frc-header{display:flex;align-items:center;gap:.4rem}
    .frc-icon{font-size:1.1rem}
    .frc-name{font-size:.82rem;font-weight:700;flex:1}
    .frc-nutrient{font-size:.68rem;color:var(--text-muted);background:var(--card-bg);padding:.15rem .4rem;border-radius:4px}
    .frc-main{display:flex;flex-direction:column;gap:.1rem}
    .frc-kg{font-size:1.1rem;font-weight:900;color:var(--primary)}
    .frc-unit{font-size:.7rem;font-weight:400;color:var(--text-muted)}
    .frc-total{font-size:.72rem;color:var(--text-muted)}
    .frc-bags{display:flex;align-items:baseline;gap:.3rem}
    .bags-count{font-size:.95rem;font-weight:800;color:var(--green)}
    .bags-label{font-size:.7rem;color:var(--text-muted)}
    .frc-bar{height:6px;background:var(--border);border-radius:99px;overflow:hidden}
    .frcb-fill{height:100%;background:linear-gradient(90deg,var(--primary),var(--green));border-radius:99px;transition:width .4s}
    .frc-cost{font-size:.72rem;color:var(--text-muted)}
    .timing-section{padding:.85rem 1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .ts-items{display:flex;flex-direction:column;gap:.4rem}
    .ts-item{display:grid;grid-template-columns:130px 1fr 130px;gap:.75rem;padding:.45rem .6rem;background:var(--card-bg);border-radius:8px;border:1px solid var(--border);align-items:center}
    .ti-phase{font-size:.78rem;font-weight:700;color:var(--primary)}
    .ti-apply{font-size:.75rem;color:var(--text)}
    .ti-when{font-size:.72rem;color:var(--text-muted);text-align:right}
    .fert-ref{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .fref-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .fref-table th{padding:.5rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .fref-table th:first-child{text-align:left}
    .fref-table td{padding:.45rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .fref-table td:first-child{text-align:left}
    @media(max-width:768px){.inp-grid,.soil-grid,.npk-cards,.fr-cards{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.inp-grid,.soil-grid,.npk-cards,.fr-cards{grid-template-columns:1fr}.ts-item{grid-template-columns:1fr 1fr}}
  `]
})
export class FertilizerCalculatorComponent implements OnInit {
  cropKey = 'wheat'; area = 1; targetYield = 18;
  soilN = 0; soilP = 0; soilK = 0;
  npkRequired = signal<any>(null);
  npkPerAcre = signal<any>(null);
  npkPct = signal<any>(null);
  fertResults = signal<FertResult[]>([]);

  crops = [
    { key: 'wheat', icon: '🌾', name: 'Wheat', npkPerQTotalAcre: { n: 120, p: 60, k: 40 }, timing: [
      { phase: 'Basal (Sowing)', apply: 'Full P + Full K + 1/3 N', when: 'At or before sowing' },
      { phase: 'First Top Dress', apply: '1/3 Nitrogen (Urea)', when: 'Crown root stage (21 days)' },
      { phase: 'Second Top Dress', apply: '1/3 Nitrogen (Urea)', when: 'Jointing stage (45 days)' },
    ]},
    { key: 'rice', icon: '🌾', name: 'Rice', npkPerQTotalAcre: { n: 100, p: 50, k: 50 }, timing: [
      { phase: 'Basal (Transplant)', apply: 'Full P + Full K + 1/3 N', when: 'At transplanting' },
      { phase: 'First Top Dress', apply: '1/3 Nitrogen', when: 'Tillering stage (20 days)' },
      { phase: 'Second Top Dress', apply: '1/3 Nitrogen', when: 'Panicle initiation (45 days)' },
    ]},
    { key: 'maize', icon: '🌽', name: 'Maize', npkPerQTotalAcre: { n: 120, p: 60, k: 40 }, timing: [
      { phase: 'Basal', apply: 'Full P + Full K + 1/3 N', when: 'At sowing' },
      { phase: 'Top Dress 1', apply: '1/3 Nitrogen', when: 'V6 stage (30 days)' },
      { phase: 'Top Dress 2', apply: '1/3 Nitrogen', when: 'Tasseling (50 days)' },
    ]},
    { key: 'cotton', icon: '☁️', name: 'Cotton', npkPerQTotalAcre: { n: 180, p: 80, k: 60 }, timing: [
      { phase: 'Basal', apply: 'Full P + Full K + 1/3 N', when: 'At sowing' },
      { phase: 'Square stage', apply: '1/3 Nitrogen', when: '30-40 days' },
      { phase: 'Boll development', apply: '1/3 Nitrogen', when: '60-75 days' },
    ]},
  ];

  fertRef = [
    { name: 'Urea (46-0-0)', n: 46, p: 0, k: 0, price: '₹260–280' },
    { name: 'DAP (18-46-0)', n: 18, p: 46, k: 0, price: '₹1200–1350' },
    { name: 'MOP / Potash (0-0-60)', n: 0, p: 0, k: 60, price: '₹800–950' },
    { name: 'SSP (0-16-0)', n: 0, p: 16, k: 0, price: '₹350–420' },
    { name: 'NPK 10-26-26', n: 10, p: 26, k: 26, price: '₹1000–1150' },
  ];

  ngOnInit() { this.calc(); }

  currentCropData() { return this.crops.find(c => c.key === this.cropKey); }
  onCropChange() { const c = this.currentCropData(); if (c) this.targetYield = Math.round(c.npkPerQTotalAcre.n / 6); this.calc(); }

  calc() {
    const crop = this.currentCropData(); if (!crop) return;
    const acresPerHa = 2.47;
    const reqNha = Math.max(0, (crop.npkPerQTotalAcre.n * this.targetYield / 18) - this.soilN);
    const reqPha = Math.max(0, (crop.npkPerQTotalAcre.p * this.targetYield / 18) - this.soilP);
    const reqKha = Math.max(0, (crop.npkPerQTotalAcre.k * this.targetYield / 18) - this.soilK);
    const nAcre = reqNha / acresPerHa; const pAcre = reqPha / acresPerHa; const kAcre = reqKha / acresPerHa;
    const tot = nAcre + pAcre + kAcre || 1;

    this.npkPerAcre.set({ n: nAcre, p: pAcre, k: kAcre });
    this.npkRequired.set({ n: nAcre * this.area, p: pAcre * this.area, k: kAcre * this.area });
    this.npkPct.set({ n: (nAcre / tot) * 100, p: (pAcre / tot) * 100, k: (kAcre / tot) * 100 });

    const ureaNeed = (nAcre * this.area) / 0.46;
    const dapNeed = (pAcre * this.area) / 0.46;
    const mokNeed = (kAcre * this.area) / 0.60;

    this.fertResults.set([
      { name: 'Urea', icon: '⚗️', nutrient: '46% N', kgPerAcre: ureaNeed / this.area, bags50kg: ureaNeed / 50, cost: (ureaNeed / 50) * 270 },
      { name: 'DAP', icon: '🧪', nutrient: '18N-46P', kgPerAcre: dapNeed / this.area, bags50kg: dapNeed / 50, cost: (dapNeed / 50) * 1275 },
      { name: 'MOP (Potash)', icon: '🌿', nutrient: '60% K', kgPerAcre: mokNeed / this.area, bags50kg: mokNeed / 50, cost: (mokNeed / 50) * 875 },
    ]);
  }
}
