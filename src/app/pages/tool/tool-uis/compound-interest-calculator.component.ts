import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface YearRow { year: number; principal: number; interest: number; total: number; }

@Component({
  selector: 'app-compound-interest-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  template: `
    <div class="ci-wrap">
      <!-- Inputs -->
      <div class="inp-grid">
        <div class="inp-field">
          <div class="inp-header">
            <label>Principal Amount</label>
            <div class="inp-val-box"><span class="pre">₹</span>
              <input type="number" [(ngModel)]="principal" (input)="calc()" min="100" class="val-input" />
            </div>
          </div>
          <input type="range" [(ngModel)]="principal" (input)="calc()" min="1000" max="10000000" step="1000" class="slider" />
          <div class="slider-labels"><span>₹1K</span><span>₹1Cr</span></div>
        </div>

        <div class="inp-field">
          <div class="inp-header">
            <label>Annual Interest Rate</label>
            <div class="inp-val-box">
              <input type="number" [(ngModel)]="rate" (input)="calc()" min="0.1" max="50" step="0.1" class="val-input" />
              <span class="suf">%</span>
            </div>
          </div>
          <input type="range" [(ngModel)]="rate" (input)="calc()" min="1" max="30" step="0.5" class="slider" />
          <div class="slider-labels"><span>1%</span><span>30%</span></div>
        </div>

        <div class="inp-field">
          <div class="inp-header">
            <label>Time Period</label>
            <div class="inp-val-box">
              <input type="number" [(ngModel)]="years" (input)="calc()" min="1" max="50" class="val-input" />
              <span class="suf">Yr</span>
            </div>
          </div>
          <input type="range" [(ngModel)]="years" (input)="calc()" min="1" max="50" class="slider" />
          <div class="slider-labels"><span>1 Yr</span><span>50 Yrs</span></div>
        </div>

        <div class="inp-field">
          <div class="inp-header">
            <label>Compounding Frequency</label>
          </div>
          <div class="freq-tabs">
            <button *ngFor="let f of frequencies" class="freq-btn" [class.active]="freq===f.val" (click)="freq=f.val;calc()">{{ f.label }}</button>
          </div>
        </div>
      </div>

      <!-- Comparison: SI vs CI -->
      <div class="compare-banner">
        <div class="cmp-item">
          <span class="cmp-lbl">Simple Interest</span>
          <span class="cmp-val">₹{{ fmt(simpleInterest()) }}</span>
        </div>
        <div class="cmp-arrow">VS</div>
        <div class="cmp-item highlight">
          <span class="cmp-lbl">Compound Interest</span>
          <span class="cmp-val primary">₹{{ fmt(compoundInterest()) }}</span>
        </div>
        <div class="cmp-item">
          <span class="cmp-lbl">Extra Earned</span>
          <span class="cmp-val green">+₹{{ fmt(compoundInterest() - simpleInterest()) }}</span>
        </div>
      </div>

      <!-- Result Cards -->
      <div class="result-cards">
        <div class="rc">
          <div class="rc-icon">💰</div>
          <div class="rc-body">
            <div class="rc-label">Principal</div>
            <div class="rc-val">₹{{ fmt(principal) }}</div>
          </div>
        </div>
        <div class="rc">
          <div class="rc-icon">📈</div>
          <div class="rc-body">
            <div class="rc-label">Total Interest</div>
            <div class="rc-val green">₹{{ fmt(compoundInterest()) }}</div>
          </div>
        </div>
        <div class="rc total">
          <div class="rc-icon">🏆</div>
          <div class="rc-body">
            <div class="rc-label">Maturity Amount</div>
            <div class="rc-val primary">₹{{ fmt(maturity()) }}</div>
          </div>
        </div>
        <div class="rc">
          <div class="rc-icon">⚡</div>
          <div class="rc-body">
            <div class="rc-label">Effective Annual Rate</div>
            <div class="rc-val accent">{{ effectiveRate() }}%</div>
          </div>
        </div>
      </div>

      <!-- Extra stats -->
      <div class="extra-stats">
        <div class="es-item"><div class="es-label">Doubling Time (Rule of 72)</div><div class="es-val">{{ doublingTime() }} years</div></div>
        <div class="es-item"><div class="es-label">Wealth Multiple</div><div class="es-val">{{ (maturity()/principal).toFixed(2) }}x</div></div>
        <div class="es-item"><div class="es-label">Daily Earnings (avg)</div><div class="es-val">₹{{ fmt(Math.round(compoundInterest()/(years*365))) }}</div></div>
        <div class="es-item"><div class="es-label">Monthly Earnings (avg)</div><div class="es-val">₹{{ fmt(Math.round(compoundInterest()/(years*12))) }}</div></div>
      </div>

      <!-- Chart Tabs -->
      <div class="chart-section">
        <div class="chart-tabs">
          <button class="ctab" [class.active]="tab==='growth'" (click)="tab='growth'">📊 Growth Chart</button>
          <button class="ctab" [class.active]="tab==='compare'" (click)="tab='compare'">⚖️ SI vs CI</button>
          <button class="ctab" [class.active]="tab==='table'" (click)="tab='table'">📋 Year Table</button>
        </div>

        <!-- Growth Bar Chart -->
        <div class="chart-body" *ngIf="tab==='growth'">
          <div class="bar-chart">
            <div class="bar-y">
              <span *ngFor="let l of yLabels()">{{ l }}</span>
            </div>
            <div class="bars-area">
              <div class="bar-col" *ngFor="let row of yearRows(); let i=index"
                   [title]="'Year '+row.year+': ₹'+fmt(row.total)">
                <div class="bar-stack">
                  <div class="bar-interest" [style.height.%]="barIntPct(row)" [style.animationDelay]="(i*30)+'ms'"></div>
                  <div class="bar-principal" [style.height.%]="barPrinPct(row)" [style.animationDelay]="(i*30)+'ms'"></div>
                </div>
                <div class="bar-lbl">{{ row.year }}</div>
              </div>
            </div>
          </div>
          <div class="legend">
            <span><span class="ldot p-dot"></span>Principal</span>
            <span><span class="ldot i-dot"></span>Interest</span>
          </div>
        </div>

        <!-- SI vs CI Comparison Lines -->
        <div class="chart-body" *ngIf="tab==='compare'">
          <div class="compare-chart">
            <div class="cc-y">
              <span *ngFor="let l of yLabels()">{{ l }}</span>
            </div>
            <div class="cc-area">
              <svg [attr.viewBox]="'0 0 400 200'" preserveAspectRatio="none" class="cc-svg">
                <!-- CI line -->
                <polyline [attr.points]="ciPoints()" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- SI line -->
                <polyline [attr.points]="siPoints()" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6,3" stroke-linejoin="round"/>
                <!-- CI area fill -->
                <polygon [attr.points]="ciAreaPoints()" fill="url(#ciGrad)" opacity="0.3"/>
                <defs>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div class="legend">
            <span><span class="ldot ci-dot"></span>Compound Interest</span>
            <span><span class="ldot si-dot"></span>Simple Interest</span>
          </div>
        </div>

        <!-- Year Table -->
        <div class="chart-body" *ngIf="tab==='table'">
          <div class="table-scroll">
            <table class="year-table">
              <thead>
                <tr><th>Year</th><th>Principal (₹)</th><th>Interest (₹)</th><th>Total (₹)</th><th>Growth</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of yearRows()">
                  <td>{{ row.year }}</td>
                  <td>{{ fmt(row.principal) }}</td>
                  <td class="green">{{ fmt(row.interest) }}</td>
                  <td class="primary bold">{{ fmt(row.total) }}</td>
                  <td>
                    <div class="g-bar-wrap">
                      <div class="g-bar" [style.width.%]="(row.interest/row.total)*100"></div>
                      <span>{{ ((row.interest/row.total)*100).toFixed(0) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="ci-note">ℹ️ Formula: A = P × (1 + r/n)^(n×t) where P=Principal, r=Rate, n=Frequency, t=Time</div>
    </div>
  `,
  styles: [`
    .ci-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem}
    .inp-field{display:flex;flex-direction:column;gap:.5rem}
    .inp-header{display:flex;justify-content:space-between;align-items:center}
    .inp-header label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .inp-val-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:8px;padding:.3rem .6rem;gap:.25rem}
    .pre,.suf{font-size:.82rem;font-weight:700;color:var(--primary)}
    .val-input{width:80px;border:none;outline:none;background:transparent;font-size:.92rem;font-weight:700;color:var(--text);text-align:right;font-family:var(--font)}
    .slider{width:100%;accent-color:var(--primary);cursor:pointer}
    .slider-labels{display:flex;justify-content:space-between;font-size:.68rem;color:var(--text-muted)}
    .freq-tabs{display:flex;gap:.35rem;flex-wrap:wrap}
    .freq-btn{padding:.35rem .7rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .freq-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .compare-banner{display:grid;grid-template-columns:1fr auto 1fr 1fr;gap:1rem;padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border);align-items:center}
    .cmp-item{display:flex;flex-direction:column;gap:.2rem}
    .cmp-item.highlight{padding:.5rem .75rem;background:var(--primary-light);border-radius:10px;border:1px solid var(--primary)44}
    .cmp-lbl{font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .cmp-val{font-size:1.05rem;font-weight:800;color:var(--text)}
    .cmp-val.primary{color:var(--primary)}
    .cmp-val.green{color:var(--green)}
    .cmp-arrow{font-size:.85rem;font-weight:800;color:var(--text-muted);text-align:center}
    .result-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem}
    .rc{display:flex;align-items:flex-start;gap:.7rem;padding:1rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt)}
    .rc.total{border-color:var(--primary);background:var(--primary-light)}
    .rc-icon{font-size:1.3rem;flex-shrink:0}
    .rc-body{display:flex;flex-direction:column;gap:.15rem}
    .rc-label{font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .rc-val{font-size:1.05rem;font-weight:800;color:var(--text)}
    .rc-val.green{color:var(--green)}
    .rc-val.primary{color:var(--primary)}
    .rc-val.accent{color:var(--accent)}
    .extra-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.65rem}
    .es-item{padding:.7rem .85rem;background:var(--bg-alt);border-radius:10px;border:1px solid var(--border)}
    .es-label{font-size:.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:.2rem}
    .es-val{font-size:.95rem;font-weight:800;color:var(--text)}
    .chart-section{border:1.5px solid var(--border);border-radius:14px;overflow:hidden}
    .chart-tabs{display:flex;border-bottom:1px solid var(--border)}
    .ctab{flex:1;padding:.65rem .5rem;border:none;background:none;cursor:pointer;font-size:.8rem;font-weight:600;color:var(--text-muted);font-family:var(--font);transition:all .15s;border-bottom:2px solid transparent}
    .ctab.active{color:var(--primary);border-bottom-color:var(--primary);background:var(--primary-light)}
    .chart-body{padding:1.25rem}
    .bar-chart{display:flex;gap:.5rem;align-items:flex-end;height:200px}
    .bar-y{display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:0 0 20px;font-size:.62rem;color:var(--text-muted);text-align:right;width:45px;flex-shrink:0}
    .bars-area{display:flex;gap:3px;align-items:flex-end;flex:1;height:100%;overflow-x:auto}
    .bar-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:20px;max-width:44px;height:100%}
    .bar-stack{display:flex;flex-direction:column-reverse;width:100%;flex:1;border-radius:4px 4px 0 0;overflow:hidden}
    .bar-principal{background:var(--primary);opacity:.7;animation:growUp .5s ease both}
    .bar-interest{background:var(--green);opacity:.85;animation:growUp .5s ease both}
    @keyframes growUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1)}}
    .bar-lbl{font-size:.62rem;color:var(--text-muted);font-weight:600}
    .legend{display:flex;gap:1.25rem;margin-top:.75rem;font-size:.78rem;color:var(--text-muted)}
    .ldot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.3rem}
    .p-dot{background:var(--primary);opacity:.7}
    .i-dot{background:var(--green);opacity:.85}
    .ci-dot{background:var(--primary)}
    .si-dot{background:#94a3b8}
    .compare-chart{display:flex;gap:.5rem;height:200px}
    .cc-y{display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:0 0 4px;font-size:.62rem;color:var(--text-muted);text-align:right;width:45px;flex-shrink:0}
    .cc-area{flex:1;height:100%}
    .cc-svg{width:100%;height:100%}
    .table-scroll{overflow-x:auto}
    .year-table{width:100%;border-collapse:collapse;font-size:.82rem}
    .year-table th{padding:.55rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.72rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .year-table th:first-child{text-align:left}
    .year-table td{padding:.5rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .year-table td:first-child{text-align:left;font-weight:700}
    .year-table tr:hover td{background:var(--primary-light)}
    .green{color:var(--green)}
    .primary{color:var(--primary)}
    .bold{font-weight:800}
    .g-bar-wrap{display:flex;align-items:center;gap:.4rem}
    .g-bar{height:6px;background:linear-gradient(90deg,var(--primary),var(--green));border-radius:99px}
    .g-bar-wrap span{font-size:.72rem;color:var(--text-muted);white-space:nowrap}
    .ci-note{font-size:.78rem;color:var(--text-muted);padding:.6rem .9rem;background:var(--bg-alt);border-radius:8px;border-left:3px solid var(--primary)}
    @media(max-width:768px){.inp-grid{grid-template-columns:1fr}.result-cards{grid-template-columns:repeat(2,1fr)}.extra-stats{grid-template-columns:repeat(2,1fr)}.compare-banner{grid-template-columns:1fr 1fr}}
    @media(max-width:480px){.result-cards{grid-template-columns:1fr}.extra-stats{grid-template-columns:1fr}}
  `]
})
export class CompoundInterestCalculatorComponent implements OnInit {
  principal = 100000;
  rate = 10;
  years = 10;
  freq = 1;
  tab = 'growth';
  Math = Math;

  maturity = signal(0);
  compoundInterest = signal(0);
  yearRows = signal<YearRow[]>([]);

  frequencies = [
    { label: 'Annual', val: 1 },
    { label: 'Half-Yearly', val: 2 },
    { label: 'Quarterly', val: 4 },
    { label: 'Monthly', val: 12 },
    { label: 'Daily', val: 365 },
  ];

  ngOnInit() { this.calc(); }

  calc() {
    const rows: YearRow[] = [];
    for (let y = 1; y <= this.years; y++) {
      const total = Math.round(this.principal * Math.pow(1 + this.rate / 100 / this.freq, this.freq * y));
      rows.push({ year: y, principal: this.principal, interest: total - this.principal, total });
    }
    this.yearRows.set(rows);
    const last = rows[rows.length - 1];
    this.maturity.set(last?.total ?? this.principal);
    this.compoundInterest.set(last ? last.total - this.principal : 0);
  }

  simpleInterest() { return Math.round(this.principal * this.rate / 100 * this.years); }
  effectiveRate() { return ((Math.pow(1 + this.rate / 100 / this.freq, this.freq) - 1) * 100).toFixed(3); }
  doublingTime() { return (72 / this.rate).toFixed(1); }

  fmt(n: number): string {
    if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
  }

  private maxTotal() { return Math.max(...this.yearRows().map(r => r.total), 1); }
  barPrinPct(row: YearRow) { return (row.principal / this.maxTotal()) * 100; }
  barIntPct(row: YearRow) { return (row.interest / this.maxTotal()) * 100; }

  yLabels(): string[] {
    const max = this.maxTotal();
    return [this.fmt(max), this.fmt(max * .75), this.fmt(max * .5), this.fmt(max * .25), '0'].reverse();
  }

  ciPoints(): string {
    const rows = this.yearRows(); const max = this.maxTotal();
    return rows.map((r, i) => `${(i / (rows.length - 1)) * 400},${200 - (r.total / max) * 190}`).join(' ');
  }

  siPoints(): string {
    const rows = this.yearRows(); const max = this.maxTotal();
    return rows.map((r, i) => {
      const si = this.principal + (this.principal * this.rate / 100 * r.year);
      return `${(i / (rows.length - 1)) * 400},${200 - (si / max) * 190}`;
    }).join(' ');
  }

  ciAreaPoints(): string {
    const rows = this.yearRows(); const max = this.maxTotal();
    const top = rows.map((r, i) => `${(i / (rows.length - 1)) * 400},${200 - (r.total / max) * 190}`).join(' ');
    return `0,200 ${top} 400,200`;
  }
}
