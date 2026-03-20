import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bmi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="unit-toggle">
        <button class="ut-btn" [class.active]="unit==='metric'" (click)="unit='metric';calc()">Metric (kg, cm)</button>
        <button class="ut-btn" [class.active]="unit==='imperial'" (click)="unit='imperial';calc()">Imperial (lbs, ft)</button>
      </div>

      <div class="inputs-row">
        <div class="field" *ngIf="unit==='metric'">
          <label>Height (cm)</label>
          <input type="number" [(ngModel)]="heightCm" (input)="calc()" min="50" max="250" />
          <input type="range" [(ngModel)]="heightCm" (input)="calc()" min="100" max="220" class="range" />
        </div>
        <div class="field" *ngIf="unit==='imperial'">
          <label>Height (ft)</label>
          <div class="dual-inp">
            <input type="number" [(ngModel)]="heightFt" (input)="calc()" min="1" max="8" placeholder="ft" />
            <input type="number" [(ngModel)]="heightIn" (input)="calc()" min="0" max="11" placeholder="in" />
          </div>
        </div>
        <div class="field">
          <label>Weight ({{ unit==='metric' ? 'kg' : 'lbs' }})</label>
          <input type="number" [(ngModel)]="weight" (input)="calc()" min="10" max="300" />
          <input type="range" [(ngModel)]="weight" (input)="calc()" min="30" max="200" class="range" />
        </div>
        <div class="field">
          <label>Age</label>
          <input type="number" [(ngModel)]="age" min="2" max="100" />
        </div>
        <div class="field">
          <label>Gender</label>
          <select [(ngModel)]="gender">
            <option value="any">Any</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
      </div>

      <div class="bmi-result" *ngIf="bmi()">
        <div class="bmi-value">{{ bmi().toFixed(1) }}</div>
        <div class="bmi-category" [class]="'cat-' + catKey()">{{ category() }}</div>
        <div class="bmi-scale">
          <div class="scale-track">
            <div class="scale-fill" [style.background]="catColor()"></div>
            <div class="scale-marker" [style.left.%]="markerPos()"></div>
          </div>
          <div class="scale-labels">
            <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
          </div>
        </div>
      </div>

      <div class="bmi-table">
        <div class="bmi-table-title">BMI Classification (WHO)</div>
        <div class="bmi-row" *ngFor="let r of ranges" [class.current]="catKey()===r.key">
          <span class="dot" [style.background]="r.color"></span>
          <span class="range-name">{{ r.name }}</span>
          <span class="range-val">{{ r.range }}</span>
        </div>
      </div>

      <div class="bmi-note">
        ℹ️ BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for a complete assessment.
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .unit-toggle { display: flex; gap: .4rem; }
    .ut-btn { padding: .45rem 1rem; border-radius: 99px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: .84rem; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; }
    .ut-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .inputs-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: .35rem; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--text-muted); }
    .field input[type=number], .field select { padding: .6rem .75rem; border: 1.5px solid var(--border); border-radius: 8px; font-size: .9rem; background: var(--input-bg); color: var(--text); outline: none; font-family: inherit; width: 100%; box-sizing: border-box; }
    .field input:focus { border-color: var(--primary); }
    .range { accent-color: var(--primary); margin-top: .2rem; }
    .dual-inp { display: flex; gap: .4rem; }
    .dual-inp input { min-width: 0; }
    .bmi-result { text-align: center; padding: 1.5rem; background: var(--bg-alt); border-radius: 14px; border: 1.5px solid var(--border); }
    .bmi-value { font-size: 3.5rem; font-weight: 900; color: var(--primary); line-height: 1; }
    .bmi-category { font-size: 1.2rem; font-weight: 700; margin: .5rem 0 1rem; }
    .cat-under { color: #3b82f6; } .cat-normal { color: #16a34a; } .cat-over { color: #f59e0b; } .cat-obese { color: #ef4444; }
    .scale-track { height: 10px; border-radius: 99px; background: linear-gradient(90deg, #3b82f6 0%, #16a34a 25%, #f59e0b 60%, #ef4444 100%); position: relative; margin-bottom: .4rem; }
    .scale-marker { position: absolute; top: -4px; width: 18px; height: 18px; background: #fff; border: 3px solid var(--text); border-radius: 50%; transform: translateX(-50%); transition: left .4s; }
    .scale-labels { display: flex; justify-content: space-between; font-size: .7rem; color: var(--text-muted); }
    .bmi-table { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .bmi-table-title { padding: .6rem .9rem; font-size: .8rem; font-weight: 700; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    .bmi-row { display: flex; align-items: center; gap: .6rem; padding: .55rem .9rem; border-top: 1px solid var(--border); font-size: .84rem; }
    .bmi-row.current { background: var(--primary-light); }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .range-name { flex: 1; }
    .range-val { color: var(--text-muted); font-size: .8rem; }
    .bmi-note { font-size: .78rem; color: var(--text-muted); padding: .6rem .8rem; background: var(--bg-alt); border-radius: 8px; }
  `]
})
export class BmiCalculatorComponent {
  unit = 'metric';
  heightCm = 170; heightFt = 5; heightIn = 7;
  weight = 70; age = 25; gender = 'any';

  bmi = signal(0);

  ranges = [
    { key: 'under', name: 'Underweight', range: '< 18.5', color: '#3b82f6' },
    { key: 'normal', name: 'Normal weight', range: '18.5 – 24.9', color: '#16a34a' },
    { key: 'over', name: 'Overweight', range: '25 – 29.9', color: '#f59e0b' },
    { key: 'obese', name: 'Obese', range: '≥ 30', color: '#ef4444' },
  ];

  constructor() { this.calc(); }

  calc() {
    let hm = this.unit === 'metric' ? this.heightCm / 100 : ((this.heightFt * 12 + this.heightIn) * 2.54) / 100;
    let wkg = this.unit === 'metric' ? this.weight : this.weight * 0.453592;
    const b = wkg / (hm * hm);
    this.bmi.set(isNaN(b) || !isFinite(b) ? 0 : b);
  }

  catKey() {
    const b = this.bmi();
    if (b < 18.5) return 'under';
    if (b < 25) return 'normal';
    if (b < 30) return 'over';
    return 'obese';
  }

  category() {
    const m: Record<string,string> = { under:'Underweight', normal:'Normal Weight ✅', over:'Overweight', obese:'Obese' };
    return m[this.catKey()] ?? '';
  }

  catColor() {
    const m: Record<string,string> = { under:'#3b82f6', normal:'#16a34a', over:'#f59e0b', obese:'#ef4444' };
    return m[this.catKey()] ?? '';
  }

  markerPos() {
    const b = this.bmi();
    if (!b) return 0;
    if (b < 18.5) return Math.min((b / 18.5) * 20, 20);
    if (b < 25) return 20 + ((b - 18.5) / 6.5) * 30;
    if (b < 30) return 50 + ((b - 25) / 5) * 25;
    return Math.min(75 + ((b - 30) / 10) * 25, 98);
  }
}
