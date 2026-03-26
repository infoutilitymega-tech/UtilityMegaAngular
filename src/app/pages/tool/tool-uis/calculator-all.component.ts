// ppf-calculator.component.ts
import { Component, signal,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-ppf-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Annual Investment (₹)</label>
          <input type="number" [(ngModel)]="annualInvestment" (input)="calculate()" min="500" max="150000" step="500" />
          <input type="range" [(ngModel)]="annualInvestment" (input)="calculate()" min="500" max="150000" step="500" class="range" />
        </div>
        <div class="field">
          <label>Tenure (Years)</label>
          <input type="number" [(ngModel)]="tenure" (input)="calculate()" min="1" max="50" />
          <input type="range" [(ngModel)]="tenure" (input)="calculate()" min="1" max="50" class="range" />
        </div>
        <div class="field">
          <label>Interest Rate (%)</label>
          <input type="number" [(ngModel)]="rate" (input)="calculate()" min="4" max="12" step="0.1" />
          <input type="range" [(ngModel)]="rate" (input)="calculate()" min="4" max="12" step="0.1" class="range" />
        </div>
      </div>

      <div class="result-cards" *ngIf="maturityAmount() > 0">
        <div class="card">
          <div class="card-label">Total Investment</div>
          <div class="card-value">₹ {{ totalInvestment().toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Interest</div>
          <div class="card-value">₹ {{ totalInterest().toLocaleString() }}</div>
        </div>
        <div class="card highlight">
          <div class="card-label">Maturity Amount</div>
          <div class="card-value">₹ {{ maturityAmount().toLocaleString() }}</div>
        </div>
      </div>

      <div class="year-table">
        <div class="table-title">Year-wise Balance</div>
        <table>
          <thead>
            <tr><th>Year</th><th>Investment</th><th>Interest</th><th>Closing Balance</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of yearData()">
              <td>{{ row.year }}</td>
              <td>₹ {{ row.investment.toLocaleString() }}</td>
              <td>₹ {{ row.interest.toLocaleString() }}</td>
              <td>₹ {{ row.balance.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="note">
        💡 PPF has a 15-year lock-in period, extendable in 5-year blocks. Interest is compounded annually.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input[type="number"] { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .range { accent-color: var(--primary); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; }
    .year-table { border: 1px solid var(--border); border-radius: 10px; overflow: auto; max-height: 300px; }
    .table-title { padding: 0.75rem; font-weight: 700; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { padding: 0.6rem; text-align: right; border-bottom: 1px solid var(--border); }
    th:first-child, td:first-child { text-align: left; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class PpfCalculatorComponent {
  annualInvestment = 50000;
  tenure = 15;
  rate = 7.1;

  maturityAmount = signal(0);
  totalInvestment = signal(0);
  totalInterest = signal(0);
  yearData = signal<Array<{year: number; investment: number; interest: number; balance: number}>>([]);

  constructor() { this.calculate(); }

  calculate() {
    let balance = 0;
    const yearlyData = [];
    const totalInv = this.annualInvestment * this.tenure;
    
    for (let year = 1; year <= this.tenure; year++) {
      const interest = balance * (this.rate / 100);
      balance = balance + this.annualInvestment + interest;
      yearlyData.push({
        year,
        investment: this.annualInvestment * year,
        interest: Math.round(interest),
        balance: Math.round(balance)
      });
    }
    
    this.yearData.set(yearlyData);
    this.totalInvestment.set(totalInv);
    this.totalInterest.set(Math.round(balance - totalInv));
    this.maturityAmount.set(Math.round(balance));
  }
}

// vat-calculator.component.ts

@Component({
  selector: 'app-vat-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="mode-tabs">
        <button class="mode-btn" [class.active]="mode === 'add'" (click)="mode='add'; calculate()">Add VAT</button>
        <button class="mode-btn" [class.active]="mode === 'remove'" (click)="mode='remove'; calculate()">Remove VAT</button>
      </div>

      <div class="inputs-grid">
        <div class="field">
          <label>{{ mode === 'add' ? 'Net Amount (Excluding VAT)' : 'Gross Amount (Including VAT)' }} (₹)</label>
          <input type="number" [(ngModel)]="amount" (input)="calculate()" />
        </div>
        <div class="field">
          <label>VAT Rate (%)</label>
          <input type="number" [(ngModel)]="rate" (input)="calculate()" step="0.1" />
          <input type="range" [(ngModel)]="rate" (input)="calculate()" min="0" max="28" step="0.5" class="range" />
        </div>
      </div>

      <div class="result-cards" *ngIf="vatAmount() > 0">
        <div class="card">
          <div class="card-label">{{ mode === 'add' ? 'VAT Amount' : 'VAT Included' }}</div>
          <div class="card-value">₹ {{ vatAmount().toLocaleString() }}</div>
        </div>
        <div class="card highlight">
          <div class="card-label">{{ mode === 'add' ? 'Gross Amount' : 'Net Amount' }}</div>
          <div class="card-value">₹ {{ resultAmount().toLocaleString() }}</div>
        </div>
      </div>

      <div class="vat-table">
        <div class="table-title">Common VAT Rates</div>
        <div class="vat-row" *ngFor="let v of commonRates" (click)="rate=v.rate; calculate()">
          <span>{{ v.name }}</span><span>{{ v.rate }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .mode-tabs { display: flex; gap: 0.5rem; }
    .mode-btn { padding: 0.5rem 1rem; background: none; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .mode-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
    .inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .range { accent-color: var(--primary); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; }
    .vat-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .table-title { padding: 0.6rem; font-weight: 700; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    .vat-row { display: flex; justify-content: space-between; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; }
    .vat-row:hover { background: var(--bg-alt); }
  `]
})
export class VatCalculatorComponent {
  mode = 'add';
  amount = 10000;
  rate = 18;

  vatAmount = signal(0);
  resultAmount = signal(0);

  commonRates = [
    { name: 'Standard Rate', rate: 18 },
    { name: 'Reduced Rate', rate: 12 },
    { name: 'Essential Goods', rate: 5 },
    { name: 'Luxury Goods', rate: 28 },
    { name: 'Zero Rated', rate: 0 }
  ];

  constructor() { this.calculate(); }

  calculate() {
    if (this.mode === 'add') {
      const vat = this.amount * this.rate / 100;
      this.vatAmount.set(vat);
      this.resultAmount.set(this.amount + vat);
    } else {
      const net = this.amount / (1 + this.rate / 100);
      this.vatAmount.set(this.amount - net);
      this.resultAmount.set(net);
    }
  }
}

// tip-calculator.component.ts

@Component({
  selector: 'app-tip-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Bill Amount (₹)</label>
          <input type="number" [(ngModel)]="billAmount" (input)="calculate()" />
        </div>
        <div class="field">
          <label>Tip Percentage</label>
          <div class="tip-buttons">
            <button *ngFor="let p of tipPresets" [class.active]="tipPercent === p" (click)="tipPercent = p; calculate()">{{ p }}%</button>
            <input type="number" [(ngModel)]="tipPercent" (input)="calculate()" placeholder="Custom" class="custom-tip" />
          </div>
          <input type="range" [(ngModel)]="tipPercent" (input)="calculate()" min="0" max="50" step="1" class="range" />
        </div>
        <div class="field">
          <label>Number of People</label>
          <input type="number" [(ngModel)]="people" (input)="calculate()" min="1" />
        </div>
      </div>

      <div class="result-cards">
        <div class="card">
          <div class="card-label">Tip Amount</div>
          <div class="card-value">₹ {{ tipAmount().toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Bill</div>
          <div class="card-value">₹ {{ totalAmount().toLocaleString() }}</div>
        </div>
        <div class="card highlight">
          <div class="card-label">Per Person</div>
          <div class="card-value">₹ {{ perPerson().toLocaleString() }}</div>
        </div>
      </div>

      <div class="note">
        💡 Standard tipping: 10-15% for good service, 18-20% for excellent service.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input[type="number"] { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .range { accent-color: var(--primary); }
    .tip-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .tip-buttons button { padding: 0.4rem 0.8rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-alt); cursor: pointer; font-size: 0.8rem; }
    .tip-buttons button.active { background: var(--primary); color: white; border-color: var(--primary); }
    .custom-tip { width: 80px; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px; background: var(--input-bg); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class TipCalculatorComponent {
  billAmount = 1000;
  tipPercent = 15;
  people = 1;

  tipAmount = signal(0);
  totalAmount = signal(0);
  perPerson = signal(0);

  tipPresets = [10, 15, 18, 20, 25];

  constructor() { this.calculate(); }

  calculate() {
    const tip = this.billAmount * this.tipPercent / 100;
    const total = this.billAmount + tip;
    this.tipAmount.set(tip);
    this.totalAmount.set(total);
    this.perPerson.set(total / this.people);
  }
}

// currency-converter.component.ts


@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="loading-indicator" *ngIf="loading">
        <div class="spinner"></div>
        <span>Loading exchange rates...</span>
      </div>

      <div class="inputs-grid" *ngIf="!loading">
        <div class="field">
          <label>Amount</label>
          <input type="number" [(ngModel)]="amount" (input)="calculate()" />
        </div>
        <div class="field">
          <label>From Currency</label>
          <select [(ngModel)]="fromCurrency" (change)="loadRates(); calculate()">
            <option *ngFor="let c of currencies" [value]="c.code">{{ c.code }} - {{ c.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>To Currency</label>
          <select [(ngModel)]="toCurrency" (change)="calculate()">
            <option *ngFor="let c of currencies" [value]="c.code">{{ c.code }} - {{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="result-cards" *ngIf="!loading && convertedAmount() > 0">
        <div class="card highlight">
          <div class="card-label">{{ amount | number:'1.2-2' }} {{ fromCurrency }} =</div>
          <div class="card-value">{{ convertedAmount() | number:'1.2-2' }} {{ toCurrency }}</div>
          <div class="card-sub">Rate: 1 {{ fromCurrency }} = {{ exchangeRate() | number:'1.4-4' }} {{ toCurrency }}</div>
          <div class="card-sub text-muted">Last updated: {{ lastUpdated | date:'medium' }}</div>
        </div>
      </div>

      <div class="popular-rates" *ngIf="!loading">
        <div class="section-title">Popular Conversions</div>
        <div class="rates-grid">
          <button *ngFor="let conv of popularConversions" class="rate-btn" (click)="quickConvert(conv)">
            {{ conv.from }} → {{ conv.to }}
          </button>
        </div>
      </div>

      <div class="note">
        💡 Exchange rates are provided by free API. For exact rates, check with your bank or financial institution.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .loading-indicator { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 2rem; }
    .spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input, .field select { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); font-size: 1rem; }
    .result-cards { display: flex; justify-content: center; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1.5rem; text-align: center; border: 1px solid var(--border); min-width: 320px; }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem; }
    .card-value { font-size: 2rem; font-weight: 700; }
    .card-sub { font-size: 0.75rem; opacity: 0.8; margin-top: 0.5rem; }
    .text-muted { opacity: 0.7; }
    .popular-rates { border-top: 1px solid var(--border); padding-top: 1rem; }
    .section-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-muted); }
    .rates-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .rate-btn { padding: 0.5rem 1rem; background: var(--bg-alt); border: 1px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
    .rate-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; text-align: center; }
  `]
})
export class CurrencyConverterComponent implements OnInit {
  amount = 1000;
  fromCurrency = 'USD';
  toCurrency = 'INR';
  
  convertedAmount = signal(0);
  exchangeRate = signal(0);
  loading = true;
  lastUpdated: Date = new Date();
  
  // Static fallback rates (used if API fails)
  fallbackRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 150.2,
    CNY: 7.25,
    CAD: 1.36,
    AUD: 1.52,
    AED: 3.67,
    SGD: 1.34
  };
  
  liveRates: Record<string, number> = {};
  
  currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
    { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' }
  ];
  
  popularConversions = [
    { from: 'USD', to: 'INR' },
    { from: 'INR', to: 'USD' },
    { from: 'EUR', to: 'USD' },
    { from: 'GBP', to: 'INR' },
    { from: 'USD', to: 'EUR' },
    { from: 'AED', to: 'INR' },
    { from: 'SGD', to: 'INR' },
    { from: 'CAD', to: 'USD' }
  ];
  
  constructor() {}
  
  ngOnInit() {
    this.loadRates();
  }
  
  async loadRates() {
    this.loading = true;
    
    // Try multiple free APIs (fallback chain)
    const apis = [
      this.fetchFromExchangeRateAPI,
      this.fetchFromFrankfurterAPI,
      this.fetchFromCurrencyAPI
    ];
    
    for (const api of apis) {
      const success = await api.call(this);
      if (success) break;
    }
    
    // If all APIs failed, use fallback rates
    if (Object.keys(this.liveRates).length === 0) {
      console.warn('Using fallback rates');
      this.liveRates = { ...this.fallbackRates };
    }
    
    this.loading = false;
    this.calculate();
  }
  
  async fetchFromExchangeRateAPI(): Promise<boolean> {
    try {
      // Free API - ExchangeRate-API (requires API key for production)
      // For demo, using a public endpoint (limited requests)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      this.liveRates = data.rates;
      this.lastUpdated = new Date();
      console.log('Rates loaded from ExchangeRate-API');
      return true;
    } catch (error) {
      console.error('ExchangeRate-API failed:', error);
      return false;
    }
  }
  
  async fetchFromFrankfurterAPI(): Promise<boolean> {
    try {
      // Frankfurter API - free, no API key required
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      this.liveRates = data.rates;
      // Add USD base rate
      this.liveRates['USD'] = 1;
      this.lastUpdated = new Date(data.date);
      console.log('Rates loaded from Frankfurter API');
      return true;
    } catch (error) {
      console.error('Frankfurter API failed:', error);
      return false;
    }
  }
  
  async fetchFromCurrencyAPI(): Promise<boolean> {
    try {
      // CurrencyAPI - free tier, no API key required
      const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      // API returns rates for USD base
      this.liveRates = data.usd;
      this.lastUpdated = new Date(data.date);
      console.log('Rates loaded from Currency API');
      return true;
    } catch (error) {
      console.error('Currency API failed:', error);
      return false;
    }
  }
  
  calculate() {
    // Get rate for fromCurrency relative to USD
    const fromRate = this.getRate(this.fromCurrency);
    const toRate = this.getRate(this.toCurrency);
    
    if (fromRate && toRate) {
      const rate = toRate / fromRate;
      this.exchangeRate.set(rate);
      this.convertedAmount.set(this.amount * rate);
    }
  }
  
  getRate(currencyCode: string): number {
    // If we have live rates, use them
    if (this.liveRates[currencyCode]) {
      return this.liveRates[currencyCode];
    }
    // Fallback to static rates
    return this.fallbackRates[currencyCode] || 1;
  }
  
  quickConvert(conv: { from: string; to: string }) {
    this.fromCurrency = conv.from;
    this.toCurrency = conv.to;
    this.calculate();
  }
  
  refreshRates() {
    this.loadRates();
  }
}
// fuel-cost-calculator.component.ts

@Component({
  selector: 'app-fuel-cost-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Distance (km)</label>
          <input type="number" [(ngModel)]="distance" (input)="calculate()" />
        </div>
        <div class="field">
          <label>Fuel Efficiency (km/L)</label>
          <input type="number" [(ngModel)]="efficiency" (input)="calculate()" step="0.5" />
        </div>
        <div class="field">
          <label>Fuel Price (₹/L)</label>
          <input type="number" [(ngModel)]="price" (input)="calculate()" />
        </div>
        <div class="field">
          <label>Passengers</label>
          <input type="number" [(ngModel)]="passengers" (input)="calculate()" min="1" />
        </div>
      </div>

      <div class="result-cards">
        <div class="card">
          <div class="card-label">Fuel Required</div>
          <div class="card-value">{{ fuelRequired().toFixed(1) }} L</div>
        </div>
        <div class="card highlight">
          <div class="card-label">Total Fuel Cost</div>
          <div class="card-value">₹ {{ totalCost().toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Cost per km</div>
          <div class="card-value">₹ {{ costPerKm().toFixed(2) }}</div>
        </div>
        <div class="card" *ngIf="passengers > 1">
          <div class="card-label">Cost per Person</div>
          <div class="card-value">₹ {{ costPerPerson().toLocaleString() }}</div>
        </div>
      </div>

      <div class="note">
        💡 For electric vehicles, calculate based on electricity cost (approx ₹1-2 per km).
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.4rem; font-weight: 700; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class FuelCostCalculatorComponent {
  distance = 500;
  efficiency = 18;
  price = 105;
  passengers = 1;

  fuelRequired = signal(0);
  totalCost = signal(0);
  costPerKm = signal(0);
  costPerPerson = signal(0);

  constructor() { this.calculate(); }

  calculate() {
    const fuel = this.distance / this.efficiency;
    const cost = fuel * this.price;
    this.fuelRequired.set(fuel);
    this.totalCost.set(cost);
    this.costPerKm.set(cost / this.distance);
    this.costPerPerson.set(cost / this.passengers);
  }
}


// fd-calculator.component.ts


@Component({
  selector: 'app-fd-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Principal Amount (₹)</label>
          <input type="number" [(ngModel)]="principal" (input)="calculate()" min="1000" step="1000" />
          <input type="range" [(ngModel)]="principal" (input)="calculate()" min="1000" max="10000000" step="10000" class="range" />
        </div>
        <div class="field">
          <label>Tenure (Years)</label>
          <input type="number" [(ngModel)]="years" (input)="calculate()" min="0.5" max="10" step="0.5" />
          <input type="range" [(ngModel)]="years" (input)="calculate()" min="0.5" max="10" step="0.5" class="range" />
        </div>
        <div class="field">
          <label>Interest Rate (%)</label>
          <input type="number" [(ngModel)]="rate" (input)="calculate()" min="3" max="12" step="0.1" />
          <input type="range" [(ngModel)]="rate" (input)="calculate()" min="3" max="12" step="0.1" class="range" />
        </div>
        <div class="field">
          <label>Compounding Frequency</label>
          <select [(ngModel)]="frequency" (change)="calculate()">
            <option value="annual">Annual</option>
            <option value="halfyearly">Half-Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div class="result-cards">
        <div class="card">
          <div class="card-label">Total Interest</div>
          <div class="card-value">₹ {{ totalInterest().toLocaleString() }}</div>
        </div>
        <div class="card highlight">
          <div class="card-label">Maturity Amount</div>
          <div class="card-value">₹ {{ maturityAmount().toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Effective Yield</div>
          <div class="card-value">{{ effectiveYield().toFixed(2) }}%</div>
        </div>
      </div>

      <div class="note">
        💡 Senior citizens typically get 0.5% higher interest rates on FDs.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input, .field select { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .range { accent-color: var(--primary); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class FdCalculatorComponent {
  principal = 100000;
  years = 5;
  rate = 7.2;
  frequency = 'annual';

  maturityAmount = signal(0);
  totalInterest = signal(0);
  effectiveYield = signal(0);

  constructor() { this.calculate(); }

  calculate() {
    const periods: Record<string, number> = { annual: 1, halfyearly: 2, quarterly: 4, monthly: 12 };
    const n = periods[this.frequency];
    const r = this.rate / 100 / n;
    const t = this.years * n;
    const amount = this.principal * Math.pow(1 + r, t);
    const interest = amount - this.principal;
    const effYield = (Math.pow(1 + this.rate / 100 / n, n) - 1) * 100;
    
    this.maturityAmount.set(Math.round(amount));
    this.totalInterest.set(Math.round(interest));
    this.effectiveYield.set(effYield);
  }
}


// rd-calculator.component.ts

@Component({
  selector: 'app-rd-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="inputs-grid">
        <div class="field">
          <label>Monthly Deposit (₹)</label>
          <input type="number" [(ngModel)]="monthlyDeposit" (input)="calculate()" min="100" step="500" />
          <input type="range" [(ngModel)]="monthlyDeposit" (input)="calculate()" min="100" max="50000" step="500" class="range" />
        </div>
        <div class="field">
          <label>Tenure (Years)</label>
          <input type="number" [(ngModel)]="years" (input)="calculate()" min="0.5" max="10" step="0.5" />
          <input type="range" [(ngModel)]="years" (input)="calculate()" min="0.5" max="10" step="0.5" class="range" />
        </div>
        <div class="field">
          <label>Interest Rate (%)</label>
          <input type="number" [(ngModel)]="rate" (input)="calculate()" min="3" max="12" step="0.1" />
          <input type="range" [(ngModel)]="rate" (input)="calculate()" min="3" max="12" step="0.1" class="range" />
        </div>
      </div>

      <div class="result-cards">
        <div class="card">
          <div class="card-label">Total Deposits</div>
          <div class="card-value">₹ {{ totalDeposits().toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Interest</div>
          <div class="card-value">₹ {{ totalInterest().toLocaleString() }}</div>
        </div>
        <div class="card highlight">
          <div class="card-label">Maturity Amount</div>
          <div class="card-value">₹ {{ maturityAmount().toLocaleString() }}</div>
        </div>
      </div>

      <div class="note">
        💡 RD interest is compounded quarterly. The formula used: M = R × [(1+i)^n - 1] / (1 - (1+i)^(-1/3))
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .range { accent-color: var(--primary); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card.highlight { background: var(--primary); color: white; }
    .card-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class RdCalculatorComponent {
  monthlyDeposit = 5000;
  years = 5;
  rate = 7.2;

  maturityAmount = signal(0);
  totalDeposits = signal(0);
  totalInterest = signal(0);

  constructor() { this.calculate(); }

  calculate() {
    const n = this.years * 12;
    const totalDep = this.monthlyDeposit * n;
    const r = this.rate / 100 / 4;
    const quarters = this.years * 4;
    const amount = this.monthlyDeposit * ((Math.pow(1 + r, quarters) - 1) / (1 - Math.pow(1 + r, -1/3)));
    
    this.totalDeposits.set(totalDep);
    this.maturityAmount.set(Math.round(amount));
    this.totalInterest.set(Math.round(amount - totalDep));
  }
}


// cagr-calculator.component.ts

@Component({
  selector: 'app-cagr-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="mode-tabs">
        <button class="mode-btn" [class.active]="mode === 'cagr'" (click)="mode='cagr'; calculate()">Calculate CAGR</button>
        <button class="mode-btn" [class.active]="mode === 'future'" (click)="mode='future'; calculate()">Calculate Future Value</button>
        <button class="mode-btn" [class.active]="mode === 'initial'" (click)="mode='initial'; calculate()">Calculate Initial Value</button>
      </div>

      <div class="inputs-grid">
        <div class="field">
          <label>Initial Value (₹)</label>
          <input type="number" [(ngModel)]="initialValue" (input)="calculate()" [disabled]="mode === 'initial'" />
        </div>
        <div class="field">
          <label>Final Value (₹)</label>
          <input type="number" [(ngModel)]="finalValue" (input)="calculate()" [disabled]="mode === 'future'" />
        </div>
        <div class="field">
          <label>Number of Years</label>
          <input type="number" [(ngModel)]="years" (input)="calculate()" min="1" max="50" />
        </div>
        <div class="field" *ngIf="mode !== 'cagr'">
          <label>CAGR Rate (%)</label>
          <input type="number" [(ngModel)]="cagrRate" (input)="calculate()" step="0.1" />
        </div>
      </div>

      <div class="result-cards">
        <div class="card" *ngIf="mode === 'cagr'">
          <div class="card-label">Calculated CAGR</div>
          <div class="card-value">{{ cagrResult().toFixed(2) }}%</div>
          <div class="card-sub">Annualized Return</div>
        </div>
        <div class="card" *ngIf="mode === 'future'">
          <div class="card-label">Future Value</div>
          <div class="card-value">₹ {{ futureResult().toLocaleString() }}</div>
          <div class="card-sub">After {{ years }} years</div>
        </div>
        <div class="card" *ngIf="mode === 'initial'">
          <div class="card-label">Initial Value Needed</div>
          <div class="card-value">₹ {{ initialResult().toLocaleString() }}</div>
          <div class="card-sub">To reach ₹ {{ finalValue.toLocaleString() }}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Growth</div>
          <div class="card-value">{{ totalGrowth().toFixed(2) }}%</div>
        </div>
      </div>

      <div class="note">
        💡 CAGR (Compound Annual Growth Rate) smooths returns over time, ignoring volatility.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .mode-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .mode-btn { padding: 0.5rem 1rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-muted); border-radius: 8px; transition: all 0.2s; }
    .mode-btn.active { background: var(--primary); color: white; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
    .field input { padding: 0.6rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); }
    .field input:disabled { opacity: 0.6; background: var(--bg-alt); }
    .result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .card { background: var(--bg-alt); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border); }
    .card-label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .card-value { font-size: 1.6rem; font-weight: 700; color: var(--primary); }
    .card-sub { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; }
    .note { font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class CagrCalculatorComponent {
  mode = 'cagr';
  initialValue = 10000;
  finalValue = 25000;
  years = 5;
  cagrRate = 12;

  cagrResult = signal(0);
  futureResult = signal(0);
  initialResult = signal(0);
  totalGrowth = signal(0);

  constructor() { this.calculate(); }

  calculate() {
    if (this.mode === 'cagr') {
      const cagr = (Math.pow(this.finalValue / this.initialValue, 1 / this.years) - 1) * 100;
      this.cagrResult.set(isNaN(cagr) ? 0 : cagr);
      this.totalGrowth.set(((this.finalValue - this.initialValue) / this.initialValue) * 100);
    } else if (this.mode === 'future') {
      const future = this.initialValue * Math.pow(1 + this.cagrRate / 100, this.years);
      this.futureResult.set(Math.round(future));
      this.totalGrowth.set(((future - this.initialValue) / this.initialValue) * 100);
    } else {
      const initial = this.finalValue / Math.pow(1 + this.cagrRate / 100, this.years);
      this.initialResult.set(Math.round(initial));
      this.totalGrowth.set(((this.finalValue - initial) / initial) * 100);
    }
  }
}


// loan-comparison.component.ts

@Component({
  selector: 'app-loan-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="loan-a">
        <h3>Loan Option A</h3>
        <div class="inputs-grid">
          <div class="field"><label>Principal (₹)</label><input type="number" [(ngModel)]="loanA.principal" (input)="calculate()" /></div>
          <div class="field"><label>Rate (%)</label><input type="number" [(ngModel)]="loanA.rate" (input)="calculate()" step="0.1" /></div>
          <div class="field"><label>Tenure (Years)</label><input type="number" [(ngModel)]="loanA.tenure" (input)="calculate()" /></div>
          <div class="field"><label>Processing Fee (%)</label><input type="number" [(ngModel)]="loanA.processingFee" (input)="calculate()" step="0.1" /></div>
        </div>
      </div>

      <div class="loan-b">
        <h3>Loan Option B</h3>
        <div class="inputs-grid">
          <div class="field"><label>Principal (₹)</label><input type="number" [(ngModel)]="loanB.principal" (input)="calculate()" /></div>
          <div class="field"><label>Rate (%)</label><input type="number" [(ngModel)]="loanB.rate" (input)="calculate()" step="0.1" /></div>
          <div class="field"><label>Tenure (Years)</label><input type="number" [(ngModel)]="loanB.tenure" (input)="calculate()" /></div>
          <div class="field"><label>Processing Fee (%)</label><input type="number" [(ngModel)]="loanB.processingFee" (input)="calculate()" step="0.1" /></div>
        </div>
      </div>

      <div class="comparison-table">
        <table>
          <thead><tr><th></th><th>Option A</th><th>Option B</th><th>Difference</th></tr></thead>
          <tbody>
            <tr><td>Monthly EMI</td><td>₹ {{ loanA.emi.toLocaleString() }}</td><td>₹ {{ loanB.emi.toLocaleString() }}</td><td [class.better]="loanA.emi < loanB.emi">₹ {{ (loanA.emi - loanB.emi).toLocaleString() }}</td></tr>
            <tr><td>Total Interest</td><td>₹ {{ loanA.totalInterest.toLocaleString() }}</td><td>₹ {{ loanB.totalInterest.toLocaleString() }}</td><td [class.better]="loanA.totalInterest < loanB.totalInterest">₹ {{ (loanA.totalInterest - loanB.totalInterest).toLocaleString() }}</td></tr>
            <tr><td>Total Payment</td><td>₹ {{ loanA.totalPayment.toLocaleString() }}</td><td>₹ {{ loanB.totalPayment.toLocaleString() }}</td><td [class.better]="loanA.totalPayment < loanB.totalPayment">₹ {{ (loanA.totalPayment - loanB.totalPayment).toLocaleString() }}</td></tr>
            <tr><td>Processing Fee</td><td>₹ {{ loanA.feeAmount.toLocaleString() }}</td><td>₹ {{ loanB.feeAmount.toLocaleString() }}</td><td [class.better]="loanA.feeAmount < loanB.feeAmount">₹ {{ (loanA.feeAmount - loanB.feeAmount).toLocaleString() }}</td></tr>
            <tr class="total"><td>Total Cost</td><td>₹ {{ loanA.totalCost.toLocaleString() }}</td><td>₹ {{ loanB.totalCost.toLocaleString() }}</td><td [class.better]="loanA.totalCost < loanB.totalCost">₹ {{ (loanA.totalCost - loanB.totalCost).toLocaleString() }}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="recommendation" *ngIf="recommendation()">
        <strong>📊 Recommendation:</strong> {{ recommendation() }}
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .loan-a, .loan-b { background: var(--bg-alt); border-radius: 12px; padding: 1rem; border: 1px solid var(--border); }
    h3 { margin: 0 0 1rem 0; font-size: 1rem; }
    .inputs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    .field label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .field input { padding: 0.5rem; border: 1.5px solid var(--border); border-radius: 6px; background: var(--input-bg); color: var(--text); }
    .comparison-table { border: 1px solid var(--border); border-radius: 12px; overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: right; border-bottom: 1px solid var(--border); }
    th:first-child, td:first-child { text-align: left; font-weight: 600; }
    .total { font-weight: 700; background: var(--bg-alt); }
    .better { color: #16a34a; font-weight: 600; }
    .recommendation { padding: 0.75rem; background: var(--primary-light); border-radius: 8px; color: var(--primary); }
  `]
})
export class LoanComparisonComponent {
  loanA = { principal: 500000, rate: 8.5, tenure: 5, processingFee: 1, emi: 0, totalInterest: 0, totalPayment: 0, feeAmount: 0, totalCost: 0 };
  loanB = { principal: 500000, rate: 7.9, tenure: 5, processingFee: 0.5, emi: 0, totalInterest: 0, totalPayment: 0, feeAmount: 0, totalCost: 0 };

  recommendation = signal('');

  constructor() { this.calculate(); }

  calculate() {
    [this.loanA, this.loanB].forEach(loan => {
      const months = loan.tenure * 12;
      const monthlyRate = loan.rate / 12 / 100;
      const emi = loan.principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = emi * months;
      const totalInterest = totalPayment - loan.principal;
      const feeAmount = loan.principal * loan.processingFee / 100;
      const totalCost = totalInterest + feeAmount;
      
      loan.emi = Math.round(emi);
      loan.totalInterest = Math.round(totalInterest);
      loan.totalPayment = Math.round(totalPayment);
      loan.feeAmount = Math.round(feeAmount);
      loan.totalCost = Math.round(totalCost);
    });

    if (this.loanA.totalCost < this.loanB.totalCost) {
      this.recommendation.set('Option A has lower total cost (₹' + (this.loanB.totalCost - this.loanA.totalCost).toLocaleString() + ' savings).');
    } else if (this.loanB.totalCost < this.loanA.totalCost) {
      this.recommendation.set('Option B has lower total cost (₹' + (this.loanA.totalCost - this.loanB.totalCost).toLocaleString() + ' savings).');
    } else {
      this.recommendation.set('Both options have similar total cost. Consider other factors like flexibility and customer service.');
    }
  }
}