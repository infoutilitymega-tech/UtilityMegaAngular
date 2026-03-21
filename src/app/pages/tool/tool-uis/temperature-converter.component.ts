import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-temperature-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tc-wrap">
      <!-- All 4 scales live -->
      <div class="scales-grid">
        <div class="scale-card" *ngFor="let s of scales" [class.active]="activeScale===s.key" (click)="setActive(s.key)">
          <div class="sc-label">{{ s.symbol }} {{ s.name }}</div>
          <input type="number" [value]="vals()[s.key]" (input)="onInput(s.key, $event)" class="sc-input" [placeholder]="s.placeholder" />
          <div class="sc-sub">{{ s.sub }}</div>
        </div>
      </div>

      <!-- Visual thermometer -->
      <div class="thermo-section">
        <div class="thermo-title">🌡️ Temperature Scale</div>
        <div class="thermo-bar">
          <div class="tb-fill" [style.width.%]="thermoPct()" [style.background]="thermoColor()"></div>
          <div class="tb-marker" [style.left.%]="thermoPct()"></div>
        </div>
        <div class="thermo-labels">
          <span>-40° (= both)</span>
          <span>0°C / 32°F</span>
          <span>37°C (body)</span>
          <span>100°C / 212°F</span>
        </div>
        <div class="current-temp-badge" [style.background]="thermoColor()">
          {{ vals()['c']?.toFixed(1) }}°C = {{ vals()['f']?.toFixed(1) }}°F
        </div>
      </div>

      <!-- Quick reference -->
      <div class="quick-ref">
        <div class="qr-title">⚡ Common Temperature References</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of references" (click)="setTemp(r.c)">
            <span class="ref-icon">{{ r.icon }}</span>
            <span class="ref-label">{{ r.label }}</span>
            <span class="ref-c">{{ r.c }}°C</span>
            <span class="ref-f">{{ cToF(r.c) }}°F</span>
            <span class="ref-k">{{ cToK(r.c) }}K</span>
          </div>
        </div>
      </div>

      <!-- Cooking guide -->
      <div class="cooking-guide">
        <div class="cg-title">🍳 Oven Temperature Guide</div>
        <div class="cg-list">
          <div class="cg-item" *ngFor="let o of ovenTemps" (click)="setTemp(o.c)" [class.current]="isCurrentOven(o.c)">
            <span class="cg-desc">{{ o.desc }}</span>
            <div class="cg-temps">
              <span class="cg-c">{{ o.c }}°C</span>
              <span class="cg-div">/</span>
              <span class="cg-f">{{ cToF(o.c) }}°F</span>
            </div>
            <div class="cg-bar">
              <div class="cgb-fill" [style.width.%]="(o.c/300)*100"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulas -->
      <div class="formulas">
        <div class="fm-title">📐 Conversion Formulas</div>
        <div class="fm-grid">
          <div class="fm-item"><span class="fm-from">°C → °F</span><span class="fm-eq">(°C × 9/5) + 32</span></div>
          <div class="fm-item"><span class="fm-from">°F → °C</span><span class="fm-eq">(°F − 32) × 5/9</span></div>
          <div class="fm-item"><span class="fm-from">°C → K</span><span class="fm-eq">°C + 273.15</span></div>
          <div class="fm-item"><span class="fm-from">K → °C</span><span class="fm-eq">K − 273.15</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .scales-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
    .scale-card{padding:1rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);cursor:pointer;transition:all .2s;display:flex;flex-direction:column;gap:.3rem}
    .scale-card:hover{border-color:var(--primary)}
    .scale-card.active{border-color:var(--primary);background:var(--primary-light)}
    .sc-label{font-size:.78rem;font-weight:700;color:var(--text-muted)}
    .scale-card.active .sc-label{color:var(--primary)}
    .sc-input{border:none;outline:none;background:transparent;font-size:1.6rem;font-weight:900;color:var(--text);width:100%;font-family:var(--font)}
    .scale-card.active .sc-input{color:var(--primary)}
    .sc-sub{font-size:.68rem;color:var(--text-muted)}
    .thermo-section{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:14px;border:1px solid var(--border)}
    .thermo-title{font-size:.82rem;font-weight:700;margin-bottom:.85rem}
    .thermo-bar{height:12px;background:linear-gradient(90deg,#3b82f6,#10b981,#f59e0b,#ef4444);border-radius:99px;position:relative;margin-bottom:.4rem}
    .tb-fill{position:absolute;top:0;left:0;height:100%;border-radius:99px;opacity:.3}
    .tb-marker{position:absolute;top:-4px;width:20px;height:20px;background:#fff;border:3px solid var(--text);border-radius:50%;transform:translateX(-50%);transition:left .3s;box-shadow:0 2px 6px rgba(0,0,0,.2)}
    .thermo-labels{display:flex;justify-content:space-between;font-size:.62rem;color:var(--text-muted);margin-bottom:.5rem}
    .current-temp-badge{display:inline-block;padding:.3rem .75rem;border-radius:99px;color:#fff;font-size:.82rem;font-weight:700;transition:background .3s}
    .quick-ref,.cooking-guide,.formulas{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .qr-title,.cg-title,.fm-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .ref-grid{display:flex;flex-direction:column}
    .ref-item{display:grid;grid-template-columns:28px 1fr 70px 70px 70px;align-items:center;gap:.5rem;padding:.5rem .9rem;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s}
    .ref-item:last-child{border-bottom:none}
    .ref-item:hover{background:var(--primary-light)}
    .ref-icon{font-size:1rem}
    .ref-label{font-size:.8rem;color:var(--text)}
    .ref-c{font-size:.8rem;font-weight:700;color:var(--primary);text-align:right}
    .ref-f{font-size:.78rem;color:var(--text-muted);text-align:right}
    .ref-k{font-size:.78rem;color:var(--text-muted);text-align:right}
    .cg-list{display:flex;flex-direction:column}
    .cg-item{display:grid;grid-template-columns:1fr auto 120px;align-items:center;gap:.75rem;padding:.55rem .9rem;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s}
    .cg-item:last-child{border-bottom:none}
    .cg-item:hover,.cg-item.current{background:var(--primary-light)}
    .cg-desc{font-size:.82rem;color:var(--text)}
    .cg-temps{display:flex;align-items:center;gap:.25rem;font-size:.82rem;white-space:nowrap}
    .cg-c{font-weight:700;color:var(--primary)}
    .cg-div{color:var(--text-muted)}
    .cg-f{color:var(--text-muted)}
    .cg-bar{height:5px;background:var(--border);border-radius:99px;overflow:hidden;width:80px}
    .cgb-fill{height:100%;background:linear-gradient(90deg,#3b82f6,#ef4444);border-radius:99px;transition:width .3s}
    .fm-grid{display:grid;grid-template-columns:repeat(2,1fr)}
    .fm-item{display:flex;align-items:center;justify-content:space-between;padding:.6rem .9rem;border-bottom:1px solid var(--border);border-right:1px solid var(--border)}
    .fm-item:nth-child(even){border-right:none}
    .fm-item:nth-last-child(-n+2){border-bottom:none}
    .fm-from{font-size:.8rem;font-weight:700;color:var(--primary)}
    .fm-eq{font-size:.78rem;color:var(--text-muted);font-family:'Courier New',monospace}
    @media(max-width:600px){.scales-grid{grid-template-columns:repeat(2,1fr)}.ref-item{grid-template-columns:28px 1fr 60px 60px}}
  `]
})
export class TemperatureConverterComponent {
  activeScale = 'c';
  vals = signal<Record<string, number>>({ c: 25, f: 77, k: 298.15, r: 536.67 });

  scales = [
    { key: 'c', name: 'Celsius', symbol: '°C', placeholder: '25', sub: 'Water freezes at 0°, boils at 100°' },
    { key: 'f', name: 'Fahrenheit', symbol: '°F', placeholder: '77', sub: 'Water freezes at 32°, boils at 212°' },
    { key: 'k', name: 'Kelvin', symbol: 'K', placeholder: '298.15', sub: 'Absolute zero = 0K' },
    { key: 'r', name: 'Rankine', symbol: '°R', placeholder: '536.67', sub: 'Used in engineering' },
  ];

  references = [
    { icon: '🧊', label: 'Absolute Zero', c: -273.15 },
    { icon: '❄️', label: 'Water Freezes', c: 0 },
    { icon: '🌡️', label: 'Room Temperature', c: 22 },
    { icon: '👤', label: 'Body Temperature', c: 37 },
    { icon: '☕', label: 'Hot Coffee', c: 70 },
    { icon: '💧', label: 'Water Boils', c: 100 },
    { icon: '🔥', label: 'Baking Temperature', c: 180 },
  ];

  ovenTemps = [
    { desc: 'Very Low (warm)', c: 120 },
    { desc: 'Low (slow cook)', c: 150 },
    { desc: 'Moderate', c: 175 },
    { desc: 'Moderate-Hot', c: 200 },
    { desc: 'Hot (roasting)', c: 220 },
    { desc: 'Very Hot', c: 250 },
  ];

  setActive(key: string) { this.activeScale = key; }

  onInput(key: string, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    this.convertFrom(key, val);
  }

  convertFrom(key: string, val: number) {
    let c = 0;
    switch (key) {
      case 'c': c = val; break;
      case 'f': c = (val - 32) * 5 / 9; break;
      case 'k': c = val - 273.15; break;
      case 'r': c = (val - 491.67) * 5 / 9; break;
    }
    this.vals.set({ c: parseFloat(c.toFixed(6)), f: parseFloat(this.cToF(c).toFixed(4)), k: parseFloat(this.cToK(c).toFixed(4)), r: parseFloat((this.cToK(c) * 9 / 5).toFixed(4)) });
  }

  setTemp(c: number) { this.convertFrom('c', c); }

  cToF(c: number) { return c * 9 / 5 + 32; }
  cToK(c: number) { return c + 273.15; }

  thermoPct() {
    const c = this.vals()['c'] ?? 0;
    return Math.max(0, Math.min(100, ((c + 40) / 140) * 100));
  }

  thermoColor() {
    const c = this.vals()['c'] ?? 0;
    if (c < 0) return '#3b82f6';
    if (c < 20) return '#06b6d4';
    if (c < 37) return '#10b981';
    if (c < 60) return '#f59e0b';
    return '#ef4444';
  }

  isCurrentOven(ovenC: number) {
    const c = this.vals()['c'] ?? 0;
    return Math.abs(c - ovenC) < 15;
  }
}
