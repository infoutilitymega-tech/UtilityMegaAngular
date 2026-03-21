import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-percentage-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pct-wrap">
      <!-- Mode Selector -->
      <div class="mode-list">
        <button *ngFor="let m of modes; let i=index" class="mode-card" [class.active]="activeMode===i" (click)="activeMode=i;resetInputs()">
          <span class="mc-icon">{{ m.icon }}</span>
          <span class="mc-label">{{ m.label }}</span>
        </button>
      </div>

      <!-- Mode: X% of Y -->
      <div class="calc-area" *ngIf="activeMode===0">
        <div class="formula-row">
          <div class="f-inp"><label>What is</label>
            <div class="inp-box"><input type="number" [(ngModel)]="a" (input)="mode0()" class="f-input" placeholder="20" /><span class="suf">%</span></div>
          </div>
          <div class="f-op">of</div>
          <div class="f-inp"><label>Number</label>
            <div class="inp-box"><input type="number" [(ngModel)]="b" (input)="mode0()" class="f-input" placeholder="500" /></div>
          </div>
          <div class="f-op">=</div>
          <div class="f-result"><div class="res-val primary">{{ result0() }}</div></div>
        </div>
        <div class="result-explainer" *ngIf="a && b">
          {{ a }}% of {{ b }} = <strong>{{ result0() }}</strong> &nbsp;|&nbsp; Remaining: <strong>{{ (b - result0()).toFixed(4) }}</strong>
        </div>
      </div>

      <!-- Mode: X is what % of Y -->
      <div class="calc-area" *ngIf="activeMode===1">
        <div class="formula-row">
          <div class="f-inp"><label>Number</label>
            <div class="inp-box"><input type="number" [(ngModel)]="a" (input)="calcModes()" class="f-input" placeholder="80" /></div>
          </div>
          <div class="f-op">is what % of</div>
          <div class="f-inp"><label>Total</label>
            <div class="inp-box"><input type="number" [(ngModel)]="b" (input)="calcModes()" class="f-input" placeholder="400" /></div>
          </div>
          <div class="f-op">=</div>
          <div class="f-result"><div class="res-val primary">{{ modeResult() }}%</div></div>
        </div>
        <div class="result-explainer" *ngIf="a && b">{{ a }} is <strong>{{ modeResult() }}%</strong> of {{ b }}</div>
      </div>

      <!-- Mode: Percentage Change -->
      <div class="calc-area" *ngIf="activeMode===2">
        <div class="formula-row">
          <div class="f-inp"><label>Original Value</label>
            <div class="inp-box"><input type="number" [(ngModel)]="a" (input)="calcModes()" class="f-input" placeholder="200" /></div>
          </div>
          <div class="f-op">→</div>
          <div class="f-inp"><label>New Value</label>
            <div class="inp-box"><input type="number" [(ngModel)]="b" (input)="calcModes()" class="f-input" placeholder="250" /></div>
          </div>
          <div class="f-op">=</div>
          <div class="f-result">
            <div class="res-val" [class.green]="modeResult()>=0" [class.red]="modeResult()<0">
              {{ modeResult() >= 0 ? '+' : '' }}{{ modeResult() }}%
            </div>
          </div>
        </div>
        <div class="change-banner" *ngIf="a && b" [class.increase]="modeResult()>=0" [class.decrease]="modeResult()<0">
          {{ modeResult() >= 0 ? '📈 Increase' : '📉 Decrease' }} of <strong>{{ Math.abs(modeResult()) }}%</strong>
          ({{ modeResult() >= 0 ? '+' : '' }}{{ (b - a).toFixed(2) }})
        </div>
      </div>

      <!-- Mode: Add/Subtract Percentage -->
      <div class="calc-area" *ngIf="activeMode===3">
        <div class="formula-row">
          <div class="f-inp"><label>Base Amount</label>
            <div class="inp-box"><span class="pre">₹</span><input type="number" [(ngModel)]="a" (input)="calcModes()" class="f-input" placeholder="1000" /></div>
          </div>
          <div class="ops-toggle">
            <button [class.active]="op==='+'" (click)="op='+';calcModes()">+ Add</button>
            <button [class.active]="op==='-'" (click)="op='-';calcModes()">− Sub</button>
          </div>
          <div class="f-inp"><label>Percentage</label>
            <div class="inp-box"><input type="number" [(ngModel)]="b" (input)="calcModes()" class="f-input" placeholder="18" /><span class="suf">%</span></div>
          </div>
          <div class="f-op">=</div>
          <div class="f-result"><div class="res-val primary">₹{{ modeResult() }}</div></div>
        </div>
        <div class="result-explainer" *ngIf="a && b">
          ₹{{ a }} {{ op==='+'?'+':'-' }} {{ b }}% (₹{{ Math.abs(a * b / 100).toFixed(2) }}) = <strong>₹{{ modeResult() }}</strong>
        </div>
      </div>

      <!-- Mode: Percentage Difference -->
      <div class="calc-area" *ngIf="activeMode===4">
        <div class="formula-row">
          <div class="f-inp"><label>Value A</label>
            <div class="inp-box"><input type="number" [(ngModel)]="a" (input)="calcModes()" class="f-input" placeholder="150" /></div>
          </div>
          <div class="f-op">vs</div>
          <div class="f-inp"><label>Value B</label>
            <div class="inp-box"><input type="number" [(ngModel)]="b" (input)="calcModes()" class="f-input" placeholder="200" /></div>
          </div>
          <div class="f-op">=</div>
          <div class="f-result"><div class="res-val primary">{{ modeResult() }}%</div></div>
        </div>
        <div class="result-explainer" *ngIf="a && b">
          Difference: {{ Math.abs(b - a).toFixed(2) }} &nbsp;|&nbsp; Percentage difference: <strong>{{ modeResult() }}%</strong>
        </div>
      </div>

      <!-- Visual Bar -->
      <div class="visual-bar" *ngIf="showVisual()">
        <div class="vb-track">
          <div class="vb-fill" [style.width.%]="visualPct()"></div>
          <div class="vb-marker">{{ visualPct().toFixed(1) }}%</div>
        </div>
      </div>

      <!-- Quick reference -->
      <div class="quick-ref">
        <div class="qr-title">⚡ Quick Percentage Reference</div>
        <div class="qr-grid">
          <div class="qr-item" *ngFor="let q of quickRef()" (click)="loadQuick(q)">
            <span class="qr-label">{{ q.label }}</span>
            <span class="qr-val">{{ q.result }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pct-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .mode-list{display:grid;grid-template-columns:repeat(5,1fr);gap:.5rem}
    .mode-card{display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.75rem .5rem;border-radius:10px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-family:var(--font);transition:all .15s}
    .mode-card.active{background:var(--primary-light);border-color:var(--primary)}
    .mc-icon{font-size:1.25rem}
    .mc-label{font-size:.7rem;font-weight:600;color:var(--text-muted);text-align:center;line-height:1.3}
    .mode-card.active .mc-label{color:var(--primary)}
    .calc-area{background:var(--bg-alt);border-radius:14px;padding:1.5rem;border:1px solid var(--border)}
    .formula-row{display:flex;align-items:flex-end;gap:.85rem;flex-wrap:wrap}
    .f-inp{display:flex;flex-direction:column;gap:.35rem;min-width:120px}
    .f-inp label{font-size:.75rem;font-weight:600;color:var(--text-muted)}
    .inp-box{display:flex;align-items:center;background:var(--card-bg);border:1.5px solid var(--border);border-radius:10px;padding:.5rem .75rem;gap:.3rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .pre{font-size:.9rem;font-weight:700;color:var(--primary)}
    .suf{font-size:.85rem;font-weight:700;color:var(--text-muted)}
    .f-input{border:none;outline:none;background:transparent;font-size:1.1rem;font-weight:700;color:var(--text);width:80px;font-family:var(--font)}
    .f-op{font-size:.9rem;color:var(--text-muted);font-weight:600;padding-bottom:.6rem;white-space:nowrap}
    .f-result{display:flex;flex-direction:column;gap:.35rem}
    .res-val{font-size:2rem;font-weight:900;color:var(--text);min-width:100px}
    .res-val.primary{color:var(--primary)}
    .res-val.green{color:var(--green)}
    .res-val.red{color:var(--red)}
    .result-explainer{font-size:.84rem;color:var(--text-muted);margin-top:.75rem;padding:.6rem .85rem;background:var(--card-bg);border-radius:8px;border-left:3px solid var(--primary)}
    .change-banner{padding:.65rem 1rem;border-radius:8px;font-size:.85rem;margin-top:.65rem;font-weight:600}
    .change-banner.increase{background:#10b98122;color:var(--green);border:1px solid #10b98144}
    .change-banner.decrease{background:#ef444422;color:var(--red);border:1px solid #ef444444}
    .ops-toggle{display:flex;gap:.35rem;flex-direction:column;padding-bottom:.6rem}
    .ops-toggle button{padding:.3rem .65rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-size:.78rem;font-weight:600;font-family:var(--font);transition:all .15s;color:var(--text-muted)}
    .ops-toggle button.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .visual-bar{padding:.25rem 0}
    .vb-track{position:relative;height:28px;background:var(--bg-alt);border-radius:99px;overflow:visible;border:1px solid var(--border)}
    .vb-fill{height:100%;background:linear-gradient(90deg,var(--primary),var(--green));border-radius:99px;max-width:100%;transition:width .4s;min-width:2px}
    .vb-marker{position:absolute;top:50%;right:0;transform:translate(0,-50%);font-size:.72rem;font-weight:700;color:var(--primary);padding-right:.5rem}
    .quick-ref{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .qr-title{padding:.65rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .qr-grid{display:grid;grid-template-columns:repeat(4,1fr)}
    .qr-item{display:flex;flex-direction:column;gap:.2rem;padding:.65rem .75rem;border-right:1px solid var(--border);border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s}
    .qr-item:hover{background:var(--primary-light)}
    .qr-item:nth-child(4n){border-right:none}
    .qr-label{font-size:.72rem;color:var(--text-muted)}
    .qr-val{font-size:.9rem;font-weight:800;color:var(--primary)}
    @media(max-width:640px){.mode-list{grid-template-columns:repeat(3,1fr)}.formula-row{gap:.5rem}.qr-grid{grid-template-columns:repeat(2,1fr)}.qr-item:nth-child(2n){border-right:none}}
  `]
})
export class PercentageCalculatorComponent {
  activeMode = 0;
  a: number | null = null;
  b: number | null = null;
  op = '+';
  Math = Math;

  modes = [
    { icon: '%', label: 'X% of Y' },
    { icon: '÷', label: 'X is what %' },
    { icon: '📈', label: 'Change %' },
    { icon: '±', label: 'Add/Sub %' },
    { icon: '⚖️', label: 'Difference' },
  ];

  resetInputs() { this.a = null; this.b = null; }

  mode0(): number { if (!this.a || !this.b) return 0; return parseFloat(((this.a / 100) * this.b).toFixed(4)); }
  result0() { return this.mode0(); }

  modeResult(): any {
    const a = this.a ?? 0, b = this.b ?? 0;
    if (!a && !b) return 0;
    switch (this.activeMode) {
      case 1: return b ? parseFloat(((a / b) * 100).toFixed(4)) : 0;
      case 2: return a ? parseFloat((((b - a) / a) * 100).toFixed(2)) : 0;
      case 3: return this.op === '+' ? parseFloat((a + a * b / 100).toFixed(2)) : parseFloat((a - a * b / 100).toFixed(2));
      case 4: return (a + b) ? parseFloat(((Math.abs(a - b) / ((a + b) / 2)) * 100).toFixed(2)) : 0;
      default: return 0;
    }
  }

  showVisual(): boolean { return this.activeMode <= 1 && !!(this.a && this.b); }
  visualPct(): number {
    if (this.activeMode === 0) return Math.min(this.a ?? 0, 100);
    if (this.activeMode === 1) return Math.min(this.modeResult(), 100);
    return 0;
  }

  calcModes() {}

  quickRef() {
    const base = 1000;
    return [5, 10, 15, 20, 25, 30, 50, 75].map(p => ({
      label: `${p}% of ₹${base}`, result: `₹${base * p / 100}`
    }));
  }

  loadQuick(q: any) { this.a = parseInt(q.label); this.b = 1000; this.activeMode = 0; }
}
