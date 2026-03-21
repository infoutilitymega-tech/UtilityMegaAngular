import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RetirRow { age: number; corpus: number; monthly: number; real: number; }

@Component({
  selector: 'app-retirement-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ret-wrap">
      <div class="inp-grid">
        <div class="inp-field"><label>Current Age</label>
          <div class="inp-box"><input type="number" [(ngModel)]="currentAge" (input)="calc()" min="18" max="65" class="val-inp" /><span class="suf">yrs</span></div>
        </div>
        <div class="inp-field"><label>Retirement Age</label>
          <div class="inp-box"><input type="number" [(ngModel)]="retireAge" (input)="calc()" min="40" max="80" class="val-inp" /><span class="suf">yrs</span></div>
        </div>
        <div class="inp-field"><label>Life Expectancy</label>
          <div class="inp-box"><input type="number" [(ngModel)]="lifeExp" (input)="calc()" min="60" max="100" class="val-inp" /><span class="suf">yrs</span></div>
        </div>
        <div class="inp-field"><label>Current Monthly Expenses</label>
          <div class="inp-box"><span class="pre">₹</span><input type="number" [(ngModel)]="monthlyExp" (input)="calc()" min="1000" class="val-inp" /></div>
        </div>
        <div class="inp-field"><label>Current Savings</label>
          <div class="inp-box"><span class="pre">₹</span><input type="number" [(ngModel)]="currentSavings" (input)="calc()" min="0" class="val-inp" /></div>
        </div>
        <div class="inp-field"><label>Monthly Investment</label>
          <div class="inp-box"><span class="pre">₹</span><input type="number" [(ngModel)]="monthlyInvest" (input)="calc()" min="0" class="val-inp" /></div>
        </div>
        <div class="inp-field"><label>Expected Return (%)</label>
          <div class="inp-box"><input type="number" [(ngModel)]="returnRate" (input)="calc()" min="1" max="30" step="0.5" class="val-inp" /><span class="suf">%</span></div>
        </div>
        <div class="inp-field"><label>Inflation Rate (%)</label>
          <div class="inp-box"><input type="number" [(ngModel)]="inflation" (input)="calc()" min="1" max="20" step="0.5" class="val-inp" /><span class="suf">%</span></div>
        </div>
      </div>

      <!-- Key Results -->
      <div class="key-results" *ngIf="result()">
        <div class="kr-item goal">
          <div class="kr-icon">🎯</div>
          <div class="kr-body">
            <div class="kr-lbl">Retirement Corpus Needed</div>
            <div class="kr-val primary">₹{{ fmt(result()!.corpusNeeded) }}</div>
            <div class="kr-sub">In {{ retireAge - currentAge }} years (future value)</div>
          </div>
        </div>
        <div class="kr-item projected">
          <div class="kr-icon">📊</div>
          <div class="kr-body">
            <div class="kr-lbl">Projected Corpus (at {{ retireAge }})</div>
            <div class="kr-val" [class.green]="result()!.projected >= result()!.corpusNeeded" [class.red]="result()!.projected < result()!.corpusNeeded">
              ₹{{ fmt(result()!.projected) }}
            </div>
            <div class="kr-sub">{{ result()!.projected >= result()!.corpusNeeded ? '✅ On Track!' : '⚠️ Shortfall: ₹' + fmt(result()!.corpusNeeded - result()!.projected) }}</div>
          </div>
        </div>
        <div class="kr-item monthly">
          <div class="kr-icon">💰</div>
          <div class="kr-body">
            <div class="kr-lbl">Monthly Income at Retirement</div>
            <div class="kr-val accent">₹{{ fmt(result()!.monthlyIncome) }}</div>
            <div class="kr-sub">Using 4% safe withdrawal rate</div>
          </div>
        </div>
        <div class="kr-item shortfall">
          <div class="kr-icon">📈</div>
          <div class="kr-body">
            <div class="kr-lbl">Additional Monthly Needed</div>
            <div class="kr-val" [class.green]="result()!.additionalMonthly <= 0" [class.red]="result()!.additionalMonthly > 0">
              {{ result()!.additionalMonthly <= 0 ? '₹0 (Surplus!)' : '₹' + fmt(result()!.additionalMonthly) }}
            </div>
            <div class="kr-sub">To close the gap</div>
          </div>
        </div>
      </div>

      <!-- Milestones timeline -->
      <div class="timeline-section" *ngIf="result()">
        <div class="tl-title">🗓️ Retirement Milestones</div>
        <div class="tl-items">
          <div class="tl-item">
            <div class="tl-dot current"></div>
            <div class="tl-body">
              <div class="tl-age">Age {{ currentAge }} (Now)</div>
              <div class="tl-detail">Savings: ₹{{ fmt(currentSavings) }} | Monthly invest: ₹{{ fmt(monthlyInvest) }}</div>
            </div>
          </div>
          <div class="tl-item" *ngFor="let r of milestones()">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <div class="tl-age">Age {{ r.age }}</div>
              <div class="tl-detail">Corpus: ₹{{ fmt(r.corpus) }} | Monthly income: ₹{{ fmt(r.monthly) }}</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-dot retire"></div>
            <div class="tl-body">
              <div class="tl-age">Age {{ retireAge }} (Retirement)</div>
              <div class="tl-detail bold">Target: ₹{{ fmt(result()!.corpusNeeded) }} | Projected: ₹{{ fmt(result()!.projected) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth chart -->
      <div class="chart-section" *ngIf="result()">
        <div class="cs-title">📈 Corpus Growth Projection</div>
        <div class="bar-chart">
          <div class="bar-y">
            <span *ngFor="let l of chartYLabels()">{{ l }}</span>
          </div>
          <div class="bars-area">
            <div class="bar-col" *ngFor="let row of chartRows(); let i=index" [title]="'Age '+row.age+': ₹'+fmt(row.corpus)">
              <div class="bar-stack">
                <div class="bar-corp" [style.height.%]="barPct(row)" [style.animationDelay]="(i*25)+'ms'"></div>
              </div>
              <div class="bar-lbl">{{ row.age }}</div>
            </div>
          </div>
        </div>
        <!-- Target line indicator -->
        <div class="target-line-wrap">
          <div class="tl-needle" [style.left.%]="targetLinePct()"></div>
          <div class="tl-legend">
            <span><span class="ll-dot corp"></span>Projected corpus</span>
            <span class="tl-target-label">Target: ₹{{ fmt(result()!.corpusNeeded) }}</span>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="tips-section">
        <div class="tips-title">💡 Retirement Planning Tips</div>
        <div class="tips-grid">
          <div class="tip-item" *ngFor="let t of tips">
            <span class="tip-icon">{{ t.icon }}</span>
            <div class="tip-text">
              <div class="tip-title-t">{{ t.title }}</div>
              <div class="tip-desc">{{ t.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ret-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
    .inp-field{display:flex;flex-direction:column;gap:.4rem}
    .inp-field label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:9px;padding:.45rem .65rem;gap:.25rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .pre{font-size:.82rem;font-weight:700;color:var(--primary)}
    .suf{font-size:.75rem;font-weight:600;color:var(--text-muted)}
    .val-inp{border:none;outline:none;background:transparent;font-size:.92rem;font-weight:700;color:var(--text);width:70px;font-family:var(--font)}
    .key-results{display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem}
    .kr-item{display:flex;align-items:flex-start;gap:.65rem;padding:.9rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt)}
    .kr-item.goal{border-color:var(--primary);background:var(--primary-light)}
    .kr-icon{font-size:1.3rem;flex-shrink:0}
    .kr-body{display:flex;flex-direction:column;gap:.12rem;min-width:0}
    .kr-lbl{font-size:.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .kr-val{font-size:1rem;font-weight:800;color:var(--text)}
    .kr-val.primary{color:var(--primary)}
    .kr-val.green{color:var(--green)}
    .kr-val.red{color:var(--red)}
    .kr-val.accent{color:var(--accent)}
    .kr-sub{font-size:.68rem;color:var(--text-muted)}
    .timeline-section{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .tl-title,.cs-title,.tips-title{font-size:.85rem;font-weight:700;margin-bottom:.85rem}
    .tl-items{display:flex;flex-direction:column;gap:.65rem;position:relative;padding-left:1.5rem}
    .tl-items::before{content:'';position:absolute;left:.35rem;top:.5rem;bottom:.5rem;width:2px;background:var(--border)}
    .tl-item{display:flex;align-items:flex-start;gap:.75rem;position:relative}
    .tl-dot{width:12px;height:12px;border-radius:50%;background:var(--border);border:2px solid var(--card-bg);position:absolute;left:-1.07rem;top:.2rem;flex-shrink:0}
    .tl-dot.current{background:var(--primary)}
    .tl-dot.retire{background:var(--green);width:14px;height:14px;left:-1.17rem}
    .tl-age{font-size:.82rem;font-weight:700;color:var(--text)}
    .tl-detail{font-size:.75rem;color:var(--text-muted)}
    .tl-detail.bold{font-weight:700;color:var(--text)}
    .chart-section{border:1.5px solid var(--border);border-radius:14px;padding:1.1rem}
    .bar-chart{display:flex;gap:.5rem;align-items:flex-end;height:180px}
    .bar-y{display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:0 0 20px;font-size:.62rem;color:var(--text-muted);text-align:right;width:45px;flex-shrink:0}
    .bars-area{display:flex;gap:3px;align-items:flex-end;flex:1;height:100%;overflow-x:auto}
    .bar-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:18px;max-width:40px;height:100%}
    .bar-stack{display:flex;flex-direction:column-reverse;width:100%;flex:1;border-radius:4px 4px 0 0;overflow:hidden}
    .bar-corp{background:linear-gradient(180deg,var(--primary),#7c3aed);animation:growUp .5s ease both}
    @keyframes growUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1)}}
    .bar-lbl{font-size:.6rem;color:var(--text-muted);font-weight:600}
    .target-line-wrap{margin-top:.65rem;position:relative}
    .tl-needle{position:absolute;top:-185px;width:2px;height:180px;background:var(--red);border-top:2px dashed var(--red)}
    .tl-legend{display:flex;gap:1.25rem;justify-content:flex-end;font-size:.75rem;color:var(--text-muted)}
    .ll-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.3rem}
    .ll-dot.corp{background:var(--primary)}
    .tl-target-label{color:var(--red);font-weight:600}
    .tips-section{background:var(--bg-alt);border-radius:12px;padding:1rem 1.25rem;border:1px solid var(--border)}
    .tips-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.65rem}
    .tip-item{display:flex;gap:.6rem;align-items:flex-start}
    .tip-icon{font-size:1.1rem;flex-shrink:0}
    .tip-title-t{font-size:.82rem;font-weight:700;margin-bottom:.15rem}
    .tip-desc{font-size:.75rem;color:var(--text-muted);line-height:1.4}
    @media(max-width:768px){.inp-grid{grid-template-columns:repeat(2,1fr)}.key-results{grid-template-columns:repeat(2,1fr)}.tips-grid{grid-template-columns:1fr}}
    @media(max-width:480px){.inp-grid{grid-template-columns:1fr}.key-results{grid-template-columns:1fr}}
  `]
})
export class RetirementCalculatorComponent implements OnInit {
  currentAge = 30; retireAge = 60; lifeExp = 80;
  monthlyExp = 50000; currentSavings = 500000;
  monthlyInvest = 15000; returnRate = 12; inflation = 6;

  result = signal<any>(null);

  tips = [
    { icon: '⏰', title: 'Start Early', desc: 'Every decade of delay doubles the monthly savings needed.' },
    { icon: '📈', title: 'Equity Allocation', desc: 'Age 30: 70% equity, 30% debt. Reduce equity by 1% per year as you age.' },
    { icon: '🏛️', title: 'Use NPS', desc: 'NPS gives extra ₹50K tax deduction under 80CCD(1B) — pure retirement-focused.' },
    { icon: '💹', title: 'Step-Up SIP', desc: 'Increase monthly SIP by 10% every year to offset inflation.' },
    { icon: '🛡️', title: 'Adequate Insurance', desc: 'Term life cover = 15–20× annual income. Health cover = min ₹10 lakh family floater.' },
    { icon: '🔄', title: 'Review Annually', desc: 'Rebalance portfolio every year. Increase investment with every salary hike.' },
  ];

  ngOnInit() { this.calc(); }

  calc() {
    const years = this.retireAge - this.currentAge;
    const retYears = this.lifeExp - this.retireAge;
    if (years <= 0 || retYears <= 0) { this.result.set(null); return; }

    const r = this.returnRate / 100 / 12;
    const futureMonthlyExp = this.monthlyExp * Math.pow(1 + this.inflation / 100, years);
    const realReturn = ((1 + this.returnRate / 100) / (1 + this.inflation / 100) - 1);
    const corpusNeeded = realReturn > 0
      ? Math.round(futureMonthlyExp * 12 * ((1 - Math.pow(1 + realReturn, -retYears)) / realReturn))
      : futureMonthlyExp * 12 * retYears;

    const n = years * 12;
    const sipFV = this.monthlyInvest * (((1 + r) ** n - 1) / r) * (1 + r);
    const savingsFV = this.currentSavings * (1 + this.returnRate / 100) ** years;
    const projected = Math.round(sipFV + savingsFV);
    const monthlyIncome = Math.round(projected * 0.04 / 12);
    const shortfall = Math.max(0, corpusNeeded - projected);
    const additionalMonthly = shortfall > 0 ? Math.round(shortfall / (((1 + r) ** n - 1) / r * (1 + r))) : 0;

    this.result.set({ corpusNeeded, projected, monthlyIncome, additionalMonthly, years, retYears });

    // Build rows for chart
    const rows: RetirRow[] = [];
    let corpus = this.currentSavings;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) corpus = (corpus + this.monthlyInvest) * (1 + r);
      rows.push({ age: this.currentAge + y, corpus: Math.round(corpus), monthly: Math.round(corpus * 0.04 / 12), real: Math.round(corpus / Math.pow(1 + this.inflation / 100, y)) });
    }
    this._rows = rows;
  }

  private _rows: RetirRow[] = [];

  milestones() {
    const every = Math.max(1, Math.floor((this.retireAge - this.currentAge) / 4));
    return this._rows.filter((_, i) => (i + 1) % (every * 12) === 0).slice(0, 3);
  }

  chartRows() {
    const r = this._rows;
    if (r.length <= 15) return r;
    const step = Math.ceil(r.length / 15);
    return r.filter((_, i) => i % step === 0 || i === r.length - 1);
  }

  private maxCorpus() { return Math.max(...this._rows.map(r => r.corpus), this.result()?.corpusNeeded ?? 1); }
  barPct(row: RetirRow) { return (row.corpus / this.maxCorpus()) * 95; }

  chartYLabels(): string[] {
    const max = this.maxCorpus();
    return [this.fmt(max), this.fmt(max * .75), this.fmt(max * .5), this.fmt(max * .25), '0'].reverse();
  }

  targetLinePct() {
    const rows = this.chartRows();
    if (!rows.length) return 50;
    const targetAge = this.retireAge;
    const idx = rows.findIndex(r => r.age >= targetAge);
    return idx < 0 ? 95 : (idx / (rows.length - 1)) * 100;
  }

  fmt(n: number): string {
    if (!n) return '0';
    if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
  }
}
