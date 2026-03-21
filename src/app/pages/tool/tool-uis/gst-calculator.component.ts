import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gst-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="gst-wrap">
      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button class="m-btn" [class.active]="mode==='add'" (click)="mode='add';calc()">Add GST (Exclusive)</button>
        <button class="m-btn" [class.active]="mode==='remove'" (click)="mode='remove';calc()">Remove GST (Inclusive)</button>
      </div>

      <!-- Inputs -->
      <div class="inp-row">
        <div class="inp-field">
          <label>{{ mode==='add' ? 'Base Price (Before GST)' : 'Total Price (With GST)' }}</label>
          <div class="inp-box"><span class="pre">₹</span>
            <input type="number" [(ngModel)]="amount" (input)="calc()" min="0" class="val-input big" placeholder="0" />
          </div>
        </div>

        <div class="inp-field">
          <label>GST Rate</label>
          <div class="rate-grid">
            <button *ngFor="let r of rates" class="rate-btn" [class.active]="gstRate===r" (click)="gstRate=r;calc()">{{ r }}%</button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="gst-results" *ngIf="amount > 0">
        <div class="gst-card base">
          <div class="gc-label">{{ mode==='add' ? 'Base Price' : 'Original Price' }}</div>
          <div class="gc-val">₹{{ baseAmount() | number:'1.2-2' }}</div>
        </div>
        <div class="plus-sign">+</div>
        <div class="gst-card tax">
          <div class="gc-label">GST ({{ gstRate }}%)</div>
          <div class="gc-val green">₹{{ gstAmount() | number:'1.2-2' }}</div>
          <div class="gc-split" *ngIf="isIntraState">
            <span>CGST {{ gstRate/2 }}%: ₹{{ (gstAmount()/2) | number:'1.2-2' }}</span>
            <span>SGST {{ gstRate/2 }}%: ₹{{ (gstAmount()/2) | number:'1.2-2' }}</span>
          </div>
          <div class="gc-split" *ngIf="!isIntraState">
            <span>IGST {{ gstRate }}%: ₹{{ gstAmount() | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="eq-sign">=</div>
        <div class="gst-card total">
          <div class="gc-label">Total Amount</div>
          <div class="gc-val primary">₹{{ totalAmount() | number:'1.2-2' }}</div>
        </div>
      </div>

      <!-- Supply Type Toggle -->
      <div class="supply-toggle" *ngIf="amount > 0">
        <label class="sup-label">Supply Type:</label>
        <button class="sup-btn" [class.active]="isIntraState" (click)="isIntraState=true">Intra-State (CGST+SGST)</button>
        <button class="sup-btn" [class.active]="!isIntraState" (click)="isIntraState=false">Inter-State (IGST)</button>
      </div>

      <!-- GST Chart (visual bar) -->
      <div class="gst-chart" *ngIf="amount > 0">
        <div class="gc-title">Price Breakdown</div>
        <div class="gc-bar-row">
          <div class="gc-label-col">Base Price</div>
          <div class="gc-bar-track">
            <div class="gc-bar-fill base-fill" [style.width.%]="basePct()"></div>
          </div>
          <div class="gc-pct">{{ basePct().toFixed(1) }}%</div>
        </div>
        <div class="gc-bar-row">
          <div class="gc-label-col">GST Amount</div>
          <div class="gc-bar-track">
            <div class="gc-bar-fill gst-fill" [style.width.%]="gstPct()"></div>
          </div>
          <div class="gc-pct">{{ gstPct().toFixed(1) }}%</div>
        </div>

        <!-- Visual stacked bar -->
        <div class="stacked-bar">
          <div class="sb-base" [style.width.%]="basePct()">Base</div>
          <div class="sb-gst" [style.width.%]="gstPct()">GST</div>
        </div>
      </div>

      <!-- GST Rates Reference Table -->
      <div class="gst-ref">
        <div class="ref-title">📋 GST Slab Reference</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let item of gstSlabs">
            <div class="ref-rate">{{ item.rate }}%</div>
            <div class="ref-desc">{{ item.examples }}</div>
          </div>
        </div>
      </div>

      <!-- Bulk GST Table -->
      <div class="bulk-section">
        <div class="bulk-title">📊 Multi-Rate Comparison (₹{{ amount | number:'1.0-0' }})</div>
        <div class="table-scroll">
          <table class="gst-table">
            <thead><tr><th>GST Rate</th><th>GST Amount</th><th>Total Price</th><th>CGST</th><th>SGST</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of rates" [class.highlight]="r===gstRate">
                <td><strong>{{ r }}%</strong></td>
                <td class="green">₹{{ (amount * r / 100) | number:'1.2-2' }}</td>
                <td class="primary bold">₹{{ (amount * (1 + r/100)) | number:'1.2-2' }}</td>
                <td>₹{{ (amount * r / 200) | number:'1.2-2' }}</td>
                <td>₹{{ (amount * r / 200) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gst-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .mode-toggle{display:flex;gap:.5rem;background:var(--bg-alt);padding:.35rem;border-radius:10px;border:1px solid var(--border)}
    .m-btn{flex:1;padding:.55rem 1rem;border-radius:8px;border:none;background:none;cursor:pointer;font-size:.85rem;font-weight:600;color:var(--text-muted);font-family:var(--font);transition:all .2s}
    .m-btn.active{background:var(--card-bg);color:var(--primary);box-shadow:var(--shadow-sm)}
    .inp-row{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
    .inp-field{display:flex;flex-direction:column;gap:.45rem}
    .inp-field label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:2px solid var(--border);border-radius:12px;padding:.5rem .85rem;gap:.3rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .pre{font-size:1.1rem;font-weight:800;color:var(--primary)}
    .val-input.big{width:100%;border:none;outline:none;background:transparent;font-size:1.5rem;font-weight:800;color:var(--text);font-family:var(--font)}
    .rate-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem}
    .rate-btn{padding:.45rem .35rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.82rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s}
    .rate-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .gst-results{display:flex;align-items:center;gap:.75rem;padding:1.25rem;background:var(--bg-alt);border-radius:14px;flex-wrap:wrap}
    .gst-card{flex:1;min-width:140px;padding:1rem;background:var(--card-bg);border-radius:12px;border:1.5px solid var(--border)}
    .gst-card.total{border-color:var(--primary);background:var(--primary-light)}
    .gc-label{font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:.3rem}
    .gc-val{font-size:1.3rem;font-weight:900;color:var(--text)}
    .gc-val.green{color:var(--green)}
    .gc-val.primary{color:var(--primary)}
    .gc-split{margin-top:.5rem;display:flex;flex-direction:column;gap:.15rem;font-size:.72rem;color:var(--text-muted);border-top:1px solid var(--border);padding-top:.4rem}
    .plus-sign,.eq-sign{font-size:1.5rem;font-weight:300;color:var(--text-muted);flex-shrink:0}
    .supply-toggle{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
    .sup-label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .sup-btn{padding:.35rem .75rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .sup-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .gst-chart{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .gc-title{font-size:.82rem;font-weight:700;margin-bottom:.85rem}
    .gc-bar-row{display:grid;grid-template-columns:100px 1fr 45px;align-items:center;gap:.65rem;margin-bottom:.5rem}
    .gc-label-col{font-size:.78rem;color:var(--text-muted)}
    .gc-bar-track{background:var(--border);border-radius:99px;height:8px;overflow:hidden}
    .gc-bar-fill{height:100%;border-radius:99px;transition:width .4s}
    .base-fill{background:var(--primary)}
    .gst-fill{background:var(--green)}
    .gc-pct{font-size:.72rem;font-weight:700;color:var(--text-muted);text-align:right}
    .stacked-bar{display:flex;height:36px;border-radius:10px;overflow:hidden;margin-top:.85rem}
    .sb-base{background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;transition:width .4s;min-width:50px}
    .sb-gst{background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;transition:width .4s}
    .gst-ref{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .ref-title{padding:.65rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .ref-grid{display:grid;grid-template-columns:repeat(2,1fr)}
    .ref-item{display:flex;gap:.75rem;padding:.65rem .9rem;border-bottom:1px solid var(--border);border-right:1px solid var(--border);font-size:.8rem}
    .ref-item:nth-child(even){border-right:none}
    .ref-rate{font-size:.95rem;font-weight:800;color:var(--primary);flex-shrink:0;min-width:35px}
    .ref-desc{color:var(--text-muted);line-height:1.4}
    .bulk-section{overflow:hidden}
    .bulk-title{font-size:.82rem;font-weight:700;margin-bottom:.65rem}
    .table-scroll{overflow-x:auto}
    .gst-table{width:100%;border-collapse:collapse;font-size:.82rem}
    .gst-table th{padding:.55rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.72rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .gst-table th:first-child{text-align:left}
    .gst-table td{padding:.5rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .gst-table td:first-child{text-align:left}
    .gst-table tr.highlight td{background:var(--primary-light);font-weight:700}
    .gst-table tr:hover td{background:var(--bg-alt)}
    .green{color:var(--green)} .primary{color:var(--primary)} .bold{font-weight:800}
    @media(max-width:640px){.inp-row{grid-template-columns:1fr}.gst-results{flex-direction:column}.plus-sign,.eq-sign{align-self:center}.ref-grid{grid-template-columns:1fr}}
  `]
})
export class GstCalculatorComponent implements OnInit {
  amount = 1000;
  gstRate = 18;
  mode = 'add';
  isIntraState = true;

  rates = [0, 5, 12, 18, 28];

  gstSlabs = [
    { rate: '0%', examples: 'Eggs, milk, fresh vegetables, education, healthcare' },
    { rate: '5%', examples: 'Packaged foods, transport services, footwear <₹500' },
    { rate: '12%', examples: 'Processed foods, mobile phones, computers' },
    { rate: '18%', examples: 'Restaurants, IT services, most goods & services' },
    { rate: '28%', examples: 'Luxury cars, tobacco, aerated drinks, cement' },
    { rate: 'Exempt', examples: 'Fresh fruits, books, newspapers, unbranded cereals' },
  ];

  ngOnInit() { this.calc(); }

  calc() {}

  baseAmount(): number {
    if (this.mode === 'add') return this.amount;
    return Math.round((this.amount / (1 + this.gstRate / 100)) * 100) / 100;
  }

  gstAmount(): number {
    if (this.mode === 'add') return Math.round(this.amount * this.gstRate / 100 * 100) / 100;
    return Math.round((this.amount - this.baseAmount()) * 100) / 100;
  }

  totalAmount(): number {
    if (this.mode === 'add') return this.amount + this.gstAmount();
    return this.amount;
  }

  basePct(): number { return (this.baseAmount() / this.totalAmount()) * 100; }
  gstPct(): number { return (this.gstAmount() / this.totalAmount()) * 100; }
}
