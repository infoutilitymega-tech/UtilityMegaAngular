import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface YearRow { year: number; invested: number; returns: number; total: number; growth: number; }

@Component({
  selector: 'app-sip-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="sip-wrap">

      <!-- ── Inputs ── -->
      <div class="inputs-section">
        <div class="inp-grid">
          <div class="inp-field">
            <div class="inp-header">
              <label>Monthly Investment</label>
              <div class="inp-val-box">
                <span class="inp-prefix">₹</span>
                <input type="number" [(ngModel)]="monthly" (input)="calc()" min="100" max="1000000" class="val-input" />
              </div>
            </div>
            <input type="range" [(ngModel)]="monthly" (input)="calc()" min="500" max="100000" step="500" class="slider" />
            <div class="slider-labels"><span>₹500</span><span>₹1L</span></div>
          </div>

          <div class="inp-field">
            <div class="inp-header">
              <label>Expected Return (p.a.)</label>
              <div class="inp-val-box">
                <input type="number" [(ngModel)]="rate" (input)="calc()" min="1" max="30" step="0.5" class="val-input" />
                <span class="inp-suffix">%</span>
              </div>
            </div>
            <input type="range" [(ngModel)]="rate" (input)="calc()" min="1" max="30" step="0.5" class="slider" />
            <div class="slider-labels"><span>1%</span><span>30%</span></div>
          </div>

          <div class="inp-field">
            <div class="inp-header">
              <label>Time Period</label>
              <div class="inp-val-box">
                <input type="number" [(ngModel)]="years" (input)="calc()" min="1" max="40" class="val-input" />
                <span class="inp-suffix">Yr</span>
              </div>
            </div>
            <input type="range" [(ngModel)]="years" (input)="calc()" min="1" max="40" class="slider" />
            <div class="slider-labels"><span>1 Yr</span><span>40 Yrs</span></div>
          </div>
        </div>

        <!-- Step-up option -->
        <div class="stepup-row">
          <label class="toggle-label">
            <input type="checkbox" [(ngModel)]="stepUp" (change)="calc()" class="toggle-chk" />
            <span class="toggle-pill"></span>
            Step-Up SIP (annual increase)
          </label>
          <div class="stepup-pct" *ngIf="stepUp">
            <span>Increase by</span>
            <input type="number" [(ngModel)]="stepUpPct" (input)="calc()" min="1" max="50" class="tiny-inp" />
            <span>% / year</span>
          </div>
        </div>
      </div>

      <!-- ── Results ── -->
      <div class="results-section">
        <div class="result-cards">
          <div class="rc invested">
            <div class="rc-icon">💰</div>
            <div class="rc-body">
              <div class="rc-label">Total Invested</div>
              <div class="rc-val">₹{{ formatNum(invested()) }}</div>
              <div class="rc-sub">{{ years }} yrs × ₹{{ formatNum(monthly) }}/mo</div>
            </div>
          </div>
          <div class="rc returns">
            <div class="rc-icon">📈</div>
            <div class="rc-body">
              <div class="rc-label">Est. Returns</div>
              <div class="rc-val green">₹{{ formatNum(returns()) }}</div>
              <div class="rc-sub">{{ returnPct() }}% of total value</div>
            </div>
          </div>
          <div class="rc total">
            <div class="rc-icon">🏆</div>
            <div class="rc-body">
              <div class="rc-label">Total Value</div>
              <div class="rc-val primary">₹{{ formatNum(maturity()) }}</div>
              <div class="rc-sub">{{ wealthMultiple() }}x wealth gained</div>
            </div>
          </div>
          <div class="rc xirr">
            <div class="rc-icon">⚡</div>
            <div class="rc-body">
              <div class="rc-label">Effective CAGR</div>
              <div class="rc-val accent">{{ rate }}%</div>
              <div class="rc-sub">Annualised return</div>
            </div>
          </div>
        </div>

        <!-- Extra stats row -->
        <div class="extra-stats">
          <div class="es-item">
            <span class="es-label">Monthly Income at Maturity</span>
            <span class="es-val">₹{{ formatNum(monthlyIncome()) }}</span>
          </div>
          <div class="es-item">
            <span class="es-label">Daily Return (avg)</span>
            <span class="es-val">₹{{ formatNum(dailyReturn()) }}</span>
          </div>
          <div class="es-item">
            <span class="es-label">Break-even Month</span>
            <span class="es-val">Month {{ breakevenMonth() }}</span>
          </div>
          <div class="es-item">
            <span class="es-label">Inflation-adj. Value (6%)</span>
            <span class="es-val">₹{{ formatNum(realValue()) }}</span>
          </div>
        </div>
      </div>

      <!-- ── Chart Tabs ── -->
      <div class="chart-section">
        <div class="chart-tabs">
          <button class="ctab" [class.active]="chartTab==='growth'" (click)="chartTab='growth'">📊 Growth Chart</button>
          <button class="ctab" [class.active]="chartTab==='donut'" (click)="chartTab='donut'">🍩 Breakdown</button>
          <button class="ctab" [class.active]="chartTab==='table'" (click)="chartTab='table'">📋 Year-wise</button>
        </div>

        <!-- Growth Bar Chart -->
        <div class="chart-body" *ngIf="chartTab==='growth'">
          <div class="bar-chart">
            <div class="bar-y-labels">
              <span *ngFor="let l of yLabels()">{{ l }}</span>
            </div>
            <div class="bars-area">
              <div class="bar-col" *ngFor="let row of chartRows(); let i = index"
                   [title]="'Year ' + row.year + ': ₹' + formatNum(row.total)">
                <div class="bar-stack">
                  <div class="bar-returns" [style.height.%]="barReturnsPct(row)"
                    [style.animationDelay]="(i * 30) + 'ms'"></div>
                  <div class="bar-invested" [style.height.%]="barInvestedPct(row)"
                    [style.animationDelay]="(i * 30) + 'ms'"></div>
                </div>
                <div class="bar-label">{{ row.year }}</div>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <span><span class="leg-dot invested-dot"></span>Invested</span>
            <span><span class="leg-dot returns-dot"></span>Returns</span>
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="chart-body donut-tab" *ngIf="chartTab==='donut'">
          <div class="donut-area">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <circle cx="80" cy="80" r="62" fill="none" stroke="var(--border)" stroke-width="22"/>
              <circle cx="80" cy="80" r="62" fill="none" stroke="var(--primary)" stroke-width="22"
                [attr.stroke-dasharray]="donutDash()" stroke-dashoffset="0"
                stroke-linecap="round"
                style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .6s ease;"/>
              <circle cx="80" cy="80" r="62" fill="none" stroke="#10b981" stroke-width="22"
                [attr.stroke-dasharray]="donutDash2()" [attr.stroke-dashoffset]="donutOffset2()"
                stroke-linecap="round"
                style="transform:rotate(-90deg);transform-origin:50% 50%;transition:all .6s ease;"/>
            </svg>
            <div class="donut-center">
              <div class="dc-num">{{ returnPct() }}%</div>
              <div class="dc-lbl">Returns</div>
            </div>
          </div>
          <div class="donut-details">
            <div class="dd-row invested-row">
              <div class="dd-color"></div>
              <div>
                <div class="dd-label">Total Invested</div>
                <div class="dd-val">₹{{ formatNum(invested()) }}</div>
                <div class="dd-pct">{{ 100 - returnPct() }}% of total</div>
              </div>
            </div>
            <div class="dd-row returns-row">
              <div class="dd-color green-color"></div>
              <div>
                <div class="dd-label">Est. Returns</div>
                <div class="dd-val">₹{{ formatNum(returns()) }}</div>
                <div class="dd-pct">{{ returnPct() }}% of total</div>
              </div>
            </div>
            <div class="dd-total">
              <div class="dd-label">Total Corpus</div>
              <div class="dd-val big">₹{{ formatNum(maturity()) }}</div>
            </div>
          </div>
        </div>

        <!-- Year-wise Table -->
        <div class="chart-body" *ngIf="chartTab==='table'">
          <div class="table-scroll">
            <table class="year-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Invested (₹)</th>
                  <th>Returns (₹)</th>
                  <th>Total (₹)</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of yearRows()">
                  <td>{{ row.year }}</td>
                  <td>{{ formatNum(row.invested) }}</td>
                  <td class="green">{{ formatNum(row.returns) }}</td>
                  <td class="primary bold">{{ formatNum(row.total) }}</td>
                  <td>
                    <div class="growth-bar-wrap">
                      <div class="growth-bar" [style.width.%]="row.growth"></div>
                      <span>{{ row.growth.toFixed(0) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="sip-note">ℹ️ Results are estimates. Actual returns vary based on market conditions and fund performance.</div>
    </div>
  `,
  styles: [`
    .sip-wrap { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

    /* Inputs */
    .inputs-section { display: flex; flex-direction: column; gap: 1.25rem; }
    .inp-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
    .inp-field { display: flex; flex-direction: column; gap: .5rem; }
    .inp-header { display: flex; justify-content: space-between; align-items: center; }
    .inp-header label { font-size: .8rem; font-weight: 600; color: var(--text-muted); }
    .inp-val-box { display: flex; align-items: center; background: var(--bg-alt); border: 1.5px solid var(--border); border-radius: 8px; padding: .3rem .6rem; gap: .25rem; }
    .inp-prefix, .inp-suffix { font-size: .82rem; font-weight: 700; color: var(--primary); }
    .val-input { width: 80px; border: none; outline: none; background: transparent; font-size: .92rem; font-weight: 700; color: var(--text); text-align: right; font-family: var(--font); }
    .slider { width: 100%; accent-color: var(--primary); height: 4px; cursor: pointer; }
    .slider-labels { display: flex; justify-content: space-between; font-size: .68rem; color: var(--text-muted); }

    /* Step-up */
    .stepup-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; padding: .75rem 1rem; background: var(--bg-alt); border-radius: 10px; border: 1px solid var(--border); }
    .toggle-label { display: flex; align-items: center; gap: .55rem; cursor: pointer; font-size: .85rem; font-weight: 500; }
    .toggle-chk { display: none; }
    .toggle-pill { width: 36px; height: 20px; background: var(--border); border-radius: 99px; position: relative; transition: background .2s; flex-shrink: 0; }
    .toggle-pill::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform .2s; }
    .toggle-chk:checked + .toggle-pill { background: var(--primary); }
    .toggle-chk:checked + .toggle-pill::after { transform: translateX(16px); }
    .stepup-pct { display: flex; align-items: center; gap: .35rem; font-size: .83rem; color: var(--text-muted); }
    .tiny-inp { width: 48px; padding: .25rem .4rem; border: 1.5px solid var(--border); border-radius: 6px; background: var(--input-bg); color: var(--text); font-size: .85rem; font-weight: 700; text-align: center; outline: none; font-family: var(--font); }

    /* Results */
    .result-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: .85rem; }
    .rc { display: flex; align-items: flex-start; gap: .75rem; padding: 1rem; border-radius: 12px; border: 1.5px solid var(--border); background: var(--bg-alt); transition: transform .2s, box-shadow .2s; }
    .rc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .rc.total { border-color: var(--primary); background: var(--primary-light); }
    .rc-icon { font-size: 1.4rem; flex-shrink: 0; }
    .rc-body { display: flex; flex-direction: column; gap: .15rem; min-width: 0; }
    .rc-label { font-size: .72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
    .rc-val { font-size: 1.1rem; font-weight: 800; color: var(--text); white-space: nowrap; }
    .rc-val.green { color: var(--green); }
    .rc-val.primary { color: var(--primary); }
    .rc-val.accent { color: var(--accent); }
    .rc-sub { font-size: .7rem; color: var(--text-muted); }

    /* Extra stats */
    .extra-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: .65rem; }
    .es-item { display: flex; flex-direction: column; gap: .2rem; padding: .7rem .85rem; background: var(--bg-alt); border-radius: 10px; border: 1px solid var(--border); }
    .es-label { font-size: .68rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
    .es-val { font-size: .95rem; font-weight: 800; color: var(--text); }

    /* Chart section */
    .chart-section { border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; }
    .chart-tabs { display: flex; border-bottom: 1px solid var(--border); }
    .ctab { flex: 1; padding: .65rem .5rem; border: none; background: none; cursor: pointer; font-size: .8rem; font-weight: 600; color: var(--text-muted); font-family: var(--font); transition: all .15s; border-bottom: 2px solid transparent; }
    .ctab.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--primary-light); }
    .ctab:hover:not(.active) { background: var(--bg-alt); }
    .chart-body { padding: 1.25rem; }

    /* Bar chart */
    .bar-chart { display: flex; gap: .5rem; align-items: flex-end; height: 200px; }
    .bar-y-labels { display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 0 0 20px; font-size: .62rem; color: var(--text-muted); text-align: right; width: 45px; flex-shrink: 0; }
    .bars-area { display: flex; gap: 4px; align-items: flex-end; flex: 1; height: 100%; overflow-x: auto; }
    .bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 24px; max-width: 40px; height: 100%; }
    .bar-stack { display: flex; flex-direction: column-reverse; width: 100%; flex: 1; border-radius: 4px 4px 0 0; overflow: hidden; position: relative; }
    .bar-invested { background: var(--primary); opacity: .7; animation: growUp .5s ease both; }
    .bar-returns { background: var(--green); opacity: .85; animation: growUp .5s ease both; }
    @keyframes growUp { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); } }
    .bar-label { font-size: .62rem; color: var(--text-muted); font-weight: 600; }
    .chart-legend { display: flex; gap: 1.25rem; margin-top: .75rem; font-size: .78rem; color: var(--text-muted); }
    .leg-dot { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: .3rem; }
    .invested-dot { background: var(--primary); opacity: .7; }
    .returns-dot { background: var(--green); opacity: .85; }

    /* Donut */
    .donut-tab { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
    .donut-area { position: relative; width: 180px; height: 180px; flex-shrink: 0; }
    .donut-svg { width: 100%; height: 100%; }
    .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .dc-num { font-size: 2rem; font-weight: 900; color: var(--green); line-height: 1; }
    .dc-lbl { font-size: .72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .donut-details { display: flex; flex-direction: column; gap: .85rem; flex: 1; }
    .dd-row { display: flex; align-items: flex-start; gap: .75rem; }
    .dd-color { width: 14px; height: 14px; border-radius: 4px; background: var(--primary); opacity: .75; flex-shrink: 0; margin-top: .25rem; }
    .dd-color.green-color { background: var(--green); }
    .dd-label { font-size: .75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .dd-val { font-size: 1.1rem; font-weight: 800; color: var(--text); }
    .dd-pct { font-size: .72rem; color: var(--text-muted); }
    .dd-total { padding-top: .75rem; border-top: 1px solid var(--border); }
    .dd-total .dd-val.big { font-size: 1.4rem; color: var(--primary); }

    /* Table */
    .table-scroll { overflow-x: auto; }
    .year-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    .year-table th { padding: .55rem .75rem; text-align: right; font-weight: 700; color: var(--text-muted); font-size: .72rem; text-transform: uppercase; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    .year-table th:first-child { text-align: left; }
    .year-table td { padding: .5rem .75rem; text-align: right; border-bottom: 1px solid var(--border); }
    .year-table td:first-child { text-align: left; font-weight: 700; }
    .year-table tr:hover td { background: var(--primary-light); }
    .year-table tr:last-child td { border-bottom: none; }
    .green { color: var(--green); }
    .primary { color: var(--primary); }
    .bold { font-weight: 800; }
    .growth-bar-wrap { display: flex; align-items: center; gap: .4rem; }
    .growth-bar { height: 6px; background: linear-gradient(90deg, var(--primary), var(--green)); border-radius: 99px; transition: width .3s; }
    .growth-bar-wrap span { font-size: .72rem; color: var(--text-muted); white-space: nowrap; }

    .sip-note { font-size: .78rem; color: var(--text-muted); padding: .6rem .9rem; background: var(--bg-alt); border-radius: 8px; border-left: 3px solid var(--primary); }

    @media(max-width: 768px) {
      .inp-grid { grid-template-columns: 1fr; }
      .result-cards { grid-template-columns: repeat(2,1fr); }
      .extra-stats { grid-template-columns: repeat(2,1fr); }
      .donut-tab { flex-direction: column; }
    }
    @media(max-width: 480px) {
      .result-cards { grid-template-columns: 1fr; }
      .extra-stats { grid-template-columns: 1fr; }
    }
  `]
})
export class SipCalculatorComponent implements OnInit {
  monthly = 5000;
  rate = 12;
  years = 10;
  stepUp = false;
  stepUpPct = 10;
  chartTab = 'growth';

  invested = signal(0);
  returns = signal(0);
  maturity = signal(0);
  yearRows = signal<YearRow[]>([]);

  ngOnInit() { this.calc(); }

  calc() {
    let inv = 0, corpus = 0;
    const rows: YearRow[] = [];
    let monthlyAmt = this.monthly;

    for (let y = 1; y <= this.years; y++) {
      if (this.stepUp && y > 1) monthlyAmt *= (1 + this.stepUpPct / 100);
      const r = this.rate / 100 / 12;
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + monthlyAmt) * (1 + r);
        inv += monthlyAmt;
      }
      rows.push({
        year: y, invested: Math.round(inv), returns: Math.round(corpus - inv),
        total: Math.round(corpus),
        growth: Math.min(((corpus - inv) / inv) * 100, 100)
      });
    }

    this.invested.set(Math.round(inv));
    this.maturity.set(Math.round(corpus));
    this.returns.set(Math.round(corpus - inv));
    this.yearRows.set(rows);
  }

  returnPct() {
    const t = this.maturity();
    return t ? Math.round((this.returns() / t) * 100) : 0;
  }

  wealthMultiple() {
    const i = this.invested();
    return i ? (this.maturity() / i).toFixed(2) : '1.00';
  }

  monthlyIncome() { return Math.round(this.maturity() * 0.04 / 12); }
  dailyReturn() { return Math.round(this.returns() / (this.years * 365)); }

  breakevenMonth() {
    let corpus = 0, inv = 0;
    const r = this.rate / 100 / 12;
    for (let m = 1; m <= this.years * 12; m++) {
      corpus = (corpus + this.monthly) * (1 + r);
      inv += this.monthly;
      if (corpus > inv * 1.1) return m;
    }
    return this.years * 12;
  }

  realValue() {
    const inflationRate = 0.06;
    return Math.round(this.maturity() / Math.pow(1 + inflationRate, this.years));
  }

  formatNum(n: number): string {
    if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
  }

  chartRows() {
    const rows = this.yearRows();
    if (rows.length <= 12) return rows;
    return rows.filter((_, i) => i % Math.ceil(rows.length / 12) === 0 || i === rows.length - 1);
  }

  private maxTotal() { return Math.max(...this.yearRows().map(r => r.total)) || 1; }

  barInvestedPct(row: YearRow) { return (row.invested / this.maxTotal()) * 100; }
  barReturnsPct(row: YearRow) { return (row.returns / this.maxTotal()) * 100; }

  yLabels(): string[] {
    const max = this.maxTotal();
    return [this.formatNum(max), this.formatNum(max * .75), this.formatNum(max * .5), this.formatNum(max * .25), '0'].reverse();
  }

  donutDash(): string {
    const c = 2 * Math.PI * 62;
    const pct = (100 - this.returnPct()) / 100;
    return `${c * pct} ${c}`;
  }

  donutDash2(): string {
    const c = 2 * Math.PI * 62;
    const pct = this.returnPct() / 100;
    return `${c * pct} ${c}`;
  }

  donutOffset2(): number {
    const c = 2 * Math.PI * 62;
    const pct = (100 - this.returnPct()) / 100;
    return -(c * pct);
  }
}
