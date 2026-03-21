import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-discount-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="disc-wrap">
      <!-- Main Calc -->
      <div class="main-calc">
        <div class="mc-grid">
          <div class="inp-field">
            <label>Original Price (MRP)</label>
            <div class="inp-box"><span class="pre">₹</span>
              <input type="number" [(ngModel)]="originalPrice" (input)="calc()" min="0" class="val-inp big" placeholder="2000" />
            </div>
          </div>

          <div class="inp-field">
            <label>Discount (%)</label>
            <div class="inp-box">
              <input type="number" [(ngModel)]="discountPct" (input)="calc()" min="0" max="100" class="val-inp big" placeholder="30" />
              <span class="suf">%</span>
            </div>
            <input type="range" [(ngModel)]="discountPct" (input)="calc()" min="0" max="100" class="slider" />
          </div>

          <!-- Quick % buttons -->
          <div class="inp-field">
            <label>Quick Select</label>
            <div class="quick-pcts">
              <button *ngFor="let p of [5,10,15,20,25,30,40,50,60,70]" class="qp-btn"
                [class.active]="discountPct===p" (click)="discountPct=p;calc()">{{ p }}%</button>
            </div>
          </div>
        </div>

        <!-- Result banner -->
        <div class="result-banner" *ngIf="originalPrice > 0">
          <div class="rb-original">
            <span class="rb-label">Original</span>
            <span class="rb-val strikethrough">₹{{ originalPrice | number:'1.2-2' }}</span>
          </div>
          <div class="rb-arrow">→</div>
          <div class="rb-final">
            <span class="rb-label">You Pay</span>
            <span class="rb-val primary big">₹{{ finalPrice() | number:'1.2-2' }}</span>
          </div>
          <div class="rb-save">
            <span class="rb-label">You Save</span>
            <span class="rb-val green">₹{{ discountAmount() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Visual savings bar -->
      <div class="savings-visual" *ngIf="originalPrice > 0">
        <div class="sv-bar">
          <div class="sv-pay" [style.width.%]="100-discountPct">
            <span *ngIf="100-discountPct > 15">Pay ₹{{ finalPrice() | number:'1.0-0' }}</span>
          </div>
          <div class="sv-save" [style.width.%]="discountPct">
            <span *ngIf="discountPct > 10">Save {{ discountPct }}%</span>
          </div>
        </div>
        <div class="sv-labels">
          <span>₹0</span><span>₹{{ originalPrice | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Reverse calculator -->
      <div class="reverse-section">
        <div class="rev-title">🔄 Reverse: Find Original Price or Discount %</div>
        <div class="rev-grid">
          <div class="rev-calc">
            <div class="rev-lbl">Know final price & discount → Find original</div>
            <div class="rev-inputs">
              <div class="inp-box sm"><span class="pre">₹</span><input type="number" [(ngModel)]="revFinal" (input)="calcRev()" class="val-inp" placeholder="1400" /></div>
              <span class="rev-op">at</span>
              <div class="inp-box sm"><input type="number" [(ngModel)]="revDisc" (input)="calcRev()" class="val-inp" placeholder="30" /><span class="suf">%</span></div>
              <span class="rev-op">=</span>
              <span class="rev-result">₹{{ revOriginal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="rev-calc">
            <div class="rev-lbl">Know original & final → Find discount %</div>
            <div class="rev-inputs">
              <div class="inp-box sm"><span class="pre">₹</span><input type="number" [(ngModel)]="revOrig2" (input)="calcRevDisc()" class="val-inp" placeholder="2000" /></div>
              <span class="rev-op">→</span>
              <div class="inp-box sm"><span class="pre">₹</span><input type="number" [(ngModel)]="revFinal2" (input)="calcRevDisc()" class="val-inp" placeholder="1400" /></div>
              <span class="rev-op">=</span>
              <span class="rev-result">{{ revDiscPct() }}% off</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Successive discounts -->
      <div class="successive-section">
        <div class="ss-title">📊 Successive Discounts (Two-Step)</div>
        <div class="ss-inputs">
          <div class="inp-box sm"><span class="pre">₹</span><input type="number" [(ngModel)]="succPrice" (input)="calcSucc()" class="val-inp" placeholder="2000" /></div>
          <span class="ss-op">after</span>
          <div class="inp-box sm"><input type="number" [(ngModel)]="succ1" (input)="calcSucc()" class="val-inp" placeholder="20" /><span class="suf">%</span></div>
          <span class="ss-op">then</span>
          <div class="inp-box sm"><input type="number" [(ngModel)]="succ2" (input)="calcSucc()" class="val-inp" placeholder="10" /><span class="suf">%</span></div>
        </div>
        <div class="ss-result" *ngIf="succPrice && succ1 && succ2">
          <div class="ss-res-item"><span>After 1st discount:</span><span class="bold primary">₹{{ succAfterFirst() | number:'1.2-2' }}</span></div>
          <div class="ss-res-item"><span>After 2nd discount:</span><span class="bold green">₹{{ succFinal() | number:'1.2-2' }}</span></div>
          <div class="ss-res-item"><span>Equivalent single discount:</span><span class="bold accent">{{ succEquiv() }}% off</span></div>
          <div class="ss-note">ℹ️ {{ succ1 }}% + {{ succ2 }}% ≠ {{ succ1 + succ2 }}% — successive discounts = {{ succEquiv() }}%</div>
        </div>
      </div>

      <!-- Multi-discount comparison table -->
      <div class="comp-table">
        <div class="ct-title">📈 Discount Comparison (₹{{ originalPrice || 2000 | number:'1.0-0' }})</div>
        <div class="table-scroll">
          <table class="disc-table">
            <thead><tr><th>Discount</th><th>Saved</th><th>Final Price</th><th>Savings %</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of [5,10,15,20,25,30,40,50,60,70,80]" [class.active]="p===discountPct">
                <td><strong>{{ p }}% off</strong></td>
                <td class="green">₹{{ ((originalPrice||2000) * p / 100) | number:'1.2-2' }}</td>
                <td class="primary bold">₹{{ ((originalPrice||2000) * (1 - p/100)) | number:'1.2-2' }}</td>
                <td>
                  <div class="pbar-wrap"><div class="pbar" [style.width.%]="p"></div><span>{{ p }}%</span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .disc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .mc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem}
    .inp-field{display:flex;flex-direction:column;gap:.45rem}
    .inp-field label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:10px;padding:.5rem .75rem;gap:.3rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .inp-box.sm{padding:.4rem .6rem}
    .pre{font-size:.85rem;font-weight:700;color:var(--primary)}
    .suf{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .val-inp{border:none;outline:none;background:transparent;font-size:.95rem;font-weight:700;color:var(--text);width:70px;font-family:var(--font)}
    .val-inp.big{font-size:1.4rem;width:100px}
    .slider{width:100%;accent-color:var(--primary);cursor:pointer}
    .quick-pcts{display:flex;flex-wrap:wrap;gap:.3rem}
    .qp-btn{padding:.28rem .55rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s}
    .qp-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .result-banner{display:flex;align-items:center;justify-content:space-around;padding:1.5rem;background:linear-gradient(135deg,var(--primary-light),var(--bg-alt));border-radius:16px;border:1.5px solid var(--primary)44;flex-wrap:wrap;gap:1rem}
    .rb-original,.rb-final,.rb-save{display:flex;flex-direction:column;align-items:center;gap:.25rem}
    .rb-label{font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .rb-val{font-size:1.25rem;font-weight:800;color:var(--text)}
    .rb-val.big{font-size:2rem}
    .rb-val.primary{color:var(--primary)}
    .rb-val.green{color:var(--green)}
    .strikethrough{text-decoration:line-through;color:var(--text-muted);font-size:1.1rem}
    .rb-arrow{font-size:1.5rem;color:var(--text-muted)}
    .savings-visual{display:flex;flex-direction:column;gap:.25rem}
    .sv-bar{display:flex;height:44px;border-radius:12px;overflow:hidden}
    .sv-pay{background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700;transition:width .4s;min-width:4px}
    .sv-save{background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700;transition:width .4s;min-width:4px}
    .sv-labels{display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-muted)}
    .reverse-section,.successive-section{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .rev-title,.ss-title,.ct-title{font-size:.85rem;font-weight:700;margin-bottom:.75rem}
    .rev-grid{display:flex;flex-direction:column;gap:.75rem}
    .rev-calc{display:flex;flex-direction:column;gap:.4rem}
    .rev-lbl{font-size:.75rem;color:var(--text-muted)}
    .rev-inputs,.ss-inputs{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
    .rev-op,.ss-op{font-size:.82rem;color:var(--text-muted);font-weight:600}
    .rev-result,.ss-result .bold{font-size:1.05rem;font-weight:800;color:var(--primary)}
    .ss-result{display:flex;flex-direction:column;gap:.4rem;margin-top:.75rem;padding:.75rem;background:var(--card-bg);border-radius:10px;border:1px solid var(--border)}
    .ss-res-item{display:flex;justify-content:space-between;align-items:center;font-size:.84rem;color:var(--text-muted)}
    .ss-note{font-size:.75rem;color:var(--text-muted);padding:.4rem .6rem;background:var(--bg-alt);border-radius:6px;border-left:3px solid var(--accent)}
    .bold{font-weight:800}
    .primary{color:var(--primary)}
    .green{color:var(--green)}
    .accent{color:var(--accent)}
    .table-scroll{overflow-x:auto}
    .disc-table{width:100%;border-collapse:collapse;font-size:.82rem}
    .disc-table th{padding:.5rem .75rem;text-align:right;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .disc-table th:first-child{text-align:left}
    .disc-table td{padding:.45rem .75rem;text-align:right;border-bottom:1px solid var(--border)}
    .disc-table td:first-child{text-align:left}
    .disc-table tr.active td{background:var(--primary-light)}
    .disc-table tr:hover td{background:var(--bg-alt)}
    .pbar-wrap{display:flex;align-items:center;gap:.4rem}
    .pbar{height:5px;background:linear-gradient(90deg,var(--primary),var(--green));border-radius:99px;transition:width .3s}
    .pbar-wrap span{font-size:.7rem;color:var(--text-muted);white-space:nowrap}
    @media(max-width:640px){.mc-grid{grid-template-columns:1fr}}
  `]
})
export class DiscountCalculatorComponent implements OnInit {
  originalPrice = 2000;
  discountPct = 30;
  revFinal = null; revDisc = null;
  revOrig2 = null; revFinal2 = null;
  succPrice = null; succ1 = null; succ2 = null;

  ngOnInit() { this.calc(); }
  calc() {}
  calcRev() {}
  calcRevDisc() {}
  calcSucc() {}

  finalPrice() { return this.originalPrice * (1 - this.discountPct / 100); }
  discountAmount() { return this.originalPrice * this.discountPct / 100; }

  revOriginal() {
    if (!this.revFinal || !this.revDisc) return 0;
    return ((this.revFinal as number) / (1 - (this.revDisc as number) / 100)).toFixed(2);
  }

  revDiscPct() {
    if (!this.revOrig2 || !this.revFinal2) return 0;
    return ((((this.revOrig2 as number) - (this.revFinal2 as number)) / (this.revOrig2 as number)) * 100).toFixed(2);
  }

  succAfterFirst() {
    if (!this.succPrice || !this.succ1) return 0;
    return (this.succPrice as number) * (1 - (this.succ1 as number) / 100);
  }

  succFinal() {
    if (!this.succ2) return this.succAfterFirst();
    return (this.succAfterFirst() as number) * (1 - (this.succ2 as number) / 100);
  }

  succEquiv() {
    if (!this.succ1 || !this.succ2) return 0;
    const s1 = this.succ1 as number, s2 = this.succ2 as number;
    return (100 - (100 - s1) * (100 - s2) / 100).toFixed(2);
  }
}
