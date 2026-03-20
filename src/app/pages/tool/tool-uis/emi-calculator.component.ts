import { Component, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Loan Amount (₹)</label>
          <input type="number" [(ngModel)]="principal" (input)="calc()" min="10000" />
          <div class="range-row">
            <input type="range" [(ngModel)]="principal" (input)="calc()" min="10000" max="10000000" step="10000" />
            <span class="val-pill">₹{{ principal | number }}</span>
          </div>
        </div>
        <div class="field">
          <label>Annual Interest Rate (%)</label>
          <input type="number" [(ngModel)]="rate" (input)="calc()" min="1" max="30" step="0.1" />
          <div class="range-row">
            <input type="range" [(ngModel)]="rate" (input)="calc()" min="1" max="30" step="0.1" />
            <span class="val-pill">{{ rate }}%</span>
          </div>
        </div>
        <div class="field">
          <label>Loan Tenure (Years)</label>
          <input type="number" [(ngModel)]="tenure" (input)="calc()" min="1" max="30" />
          <div class="range-row">
            <input type="range" [(ngModel)]="tenure" (input)="calc()" min="1" max="30" />
            <span class="val-pill">{{ tenure }} yrs</span>
          </div>
        </div>
      </div>

      <div class="results-grid">
        <div class="result-card emi-card">
          <div class="rc-label">Monthly EMI</div>
          <div class="rc-val big">₹{{ emi() | number:'1.0-0' }}</div>
        </div>
        <div class="result-card">
          <div class="rc-label">Principal</div>
          <div class="rc-val">₹{{ principal | number:'1.0-0' }}</div>
        </div>
        <div class="result-card interest-card">
          <div class="rc-label">Total Interest</div>
          <div class="rc-val">₹{{ totalInterest() | number:'1.0-0' }}</div>
        </div>
        <div class="result-card total-card">
          <div class="rc-label">Total Payable</div>
          <div class="rc-val">₹{{ totalPayable() | number:'1.0-0' }}</div>
        </div>
      </div>

      <!-- Amortization bar -->
      <div class="amort-bar-wrap">
        <div class="amort-label">Payment Breakdown</div>
        <div class="amort-bar">
          <div class="amort-principal" [style.width.%]="principalPct()"></div>
          <div class="amort-interest" [style.width.%]="100 - principalPct()"></div>
        </div>
        <div class="amort-legend">
          <span><span class="dot p-dot"></span>Principal {{ principalPct() }}%</span>
          <span><span class="dot i-dot"></span>Interest {{ 100 - principalPct() }}%</span>
        </div>
      </div>

      <!-- Amortization table (first 5 years) -->
      <div class="amort-table-wrap">
        <div class="amort-table-title">Amortization Schedule (First 12 Months)</div>
        <div class="table-scroll">
          <table class="amort-table">
            <thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
            <tbody>
              <tr *ngFor="let row of schedule().slice(0,12)">
                <td>{{ row.month }}</td>
                <td>₹{{ row.emi | number:'1.0-0' }}</td>
                <td>₹{{ row.prin | number:'1.0-0' }}</td>
                <td>₹{{ row.int | number:'1.0-0' }}</td>
                <td>₹{{ row.bal | number:'1.0-0' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
    .field label { display: block; font-size: .82rem; font-weight: 600; color: var(--text-muted); margin-bottom: .4rem; }
    .field input[type=number] { width: 100%; padding: .6rem .75rem; border: 1.5px solid var(--border); border-radius: 8px; font-size: .95rem; background: var(--input-bg); color: var(--text); outline: none; font-family: inherit; box-sizing: border-box; }
    .field input[type=number]:focus { border-color: var(--primary); }
    .range-row { display: flex; align-items: center; gap: .5rem; margin-top: .4rem; }
    .range-row input[type=range] { flex: 1; accent-color: var(--primary); }
    .val-pill { font-size: .72rem; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: .2rem .5rem; border-radius: 6px; white-space: nowrap; }
    .results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; margin-bottom: 1.5rem; }
    .result-card { text-align: center; padding: .9rem; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg-alt); }
    .result-card.emi-card { background: var(--primary-light); border-color: var(--primary); grid-column: span 2; }
    .result-card.interest-card { background: #fff7ed; border-color: #fed7aa; }
    .result-card.total-card { background: #f0fdf4; border-color: #bbf7d0; }
    .rc-label { font-size: .72rem; font-weight: 600; color: var(--text-muted); margin-bottom: .3rem; }
    .rc-val { font-size: 1.05rem; font-weight: 800; color: var(--text); }
    .rc-val.big { font-size: 1.5rem; color: var(--primary); }
    .amort-bar-wrap { margin-bottom: 1.5rem; }
    .amort-label { font-size: .82rem; font-weight: 600; margin-bottom: .5rem; }
    .amort-bar { height: 12px; border-radius: 99px; overflow: hidden; display: flex; background: var(--border); }
    .amort-principal { background: var(--primary); transition: width .4s; }
    .amort-interest { background: #fb923c; transition: width .4s; }
    .amort-legend { display: flex; gap: 1rem; margin-top: .4rem; font-size: .78rem; color: var(--text-muted); }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: .3rem; }
    .p-dot { background: var(--primary); }
    .i-dot { background: #fb923c; }
    .amort-table-wrap { overflow: hidden; border-radius: 10px; border: 1px solid var(--border); }
    .amort-table-title { padding: .7rem 1rem; font-size: .82rem; font-weight: 600; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    .table-scroll { overflow-x: auto; }
    .amort-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    .amort-table th { padding: .5rem .75rem; background: var(--bg-alt); text-align: right; font-weight: 600; color: var(--text-muted); }
    .amort-table th:first-child { text-align: left; }
    .amort-table td { padding: .5rem .75rem; text-align: right; border-top: 1px solid var(--border); }
    .amort-table td:first-child { text-align: left; }
    .amort-table tr:hover td { background: var(--primary-light); }
    @media(max-width: 600px) { .results-grid { grid-template-columns: repeat(2,1fr); } .result-card.emi-card { grid-column: span 2; } }
  `]
})
export class EmiCalculatorComponent {
  principal = 3000000;
  rate = 8.5;
  tenure = 20;

  emi = signal(0);
  totalInterest = signal(0);
  totalPayable = signal(0);
  schedule = signal<any[]>([]);

  constructor() { this.calc(); }

  calc() {
    const n = this.tenure * 12;
    const r = this.rate / 100 / 12;
    const e = this.principal * r * (1 + r) ** n / ((1 + r) ** n - 1);
    this.emi.set(e);
    this.totalPayable.set(e * n);
    this.totalInterest.set(e * n - this.principal);

    const rows = [];
    let bal = this.principal;
    for (let m = 1; m <= Math.min(n, 12); m++) {
      const int = bal * r;
      const prin = e - int;
      bal -= prin;
      rows.push({ month: m, emi: e, prin, int, bal: Math.max(0, bal) });
    }
    this.schedule.set(rows);
  }

  principalPct() {
    const t = this.totalPayable();
    return t ? Math.round((this.principal / t) * 100) : 0;
  }
}
