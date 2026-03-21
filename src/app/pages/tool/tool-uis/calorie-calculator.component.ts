import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calorie-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cal-wrap">
      <!-- Inputs -->
      <div class="inp-grid">
        <div class="inp-field">
          <label>Gender</label>
          <div class="gender-tabs">
            <button class="g-btn" [class.active]="gender==='male'" (click)="gender='male';calc()">👨 Male</button>
            <button class="g-btn" [class.active]="gender==='female'" (click)="gender='female';calc()">👩 Female</button>
          </div>
        </div>

        <div class="inp-field">
          <label>Age (years)</label>
          <div class="inp-box"><input type="number" [(ngModel)]="age" (input)="calc()" min="10" max="100" class="val-inp" /></div>
        </div>

        <div class="inp-field">
          <label>Height</label>
          <div class="unit-toggle-sm">
            <button [class.active]="heightUnit==='cm'" (click)="heightUnit='cm';calc()">cm</button>
            <button [class.active]="heightUnit==='ft'" (click)="heightUnit='ft';calc()">ft/in</button>
          </div>
          <div class="inp-box" *ngIf="heightUnit==='cm'">
            <input type="number" [(ngModel)]="heightCm" (input)="calc()" min="100" max="250" class="val-inp" />
            <span class="suf">cm</span>
          </div>
          <div class="dual-inp" *ngIf="heightUnit==='ft'">
            <div class="inp-box"><input type="number" [(ngModel)]="heightFt" (input)="calc()" min="1" max="8" class="val-inp sm" /><span class="suf">ft</span></div>
            <div class="inp-box"><input type="number" [(ngModel)]="heightIn" (input)="calc()" min="0" max="11" class="val-inp sm" /><span class="suf">in</span></div>
          </div>
        </div>

        <div class="inp-field">
          <label>Weight</label>
          <div class="unit-toggle-sm">
            <button [class.active]="weightUnit==='kg'" (click)="weightUnit='kg';calc()">kg</button>
            <button [class.active]="weightUnit==='lb'" (click)="weightUnit='lb';calc()">lbs</button>
          </div>
          <div class="inp-box">
            <input type="number" [(ngModel)]="weight" (input)="calc()" min="20" max="300" class="val-inp" />
            <span class="suf">{{ weightUnit }}</span>
          </div>
        </div>
      </div>

      <!-- Activity Level -->
      <div class="activity-section">
        <label class="section-lbl">Activity Level</label>
        <div class="activity-list">
          <button *ngFor="let a of activities" class="act-btn" [class.active]="activityLevel===a.val" (click)="activityLevel=a.val;calc()">
            <span class="act-icon">{{ a.icon }}</span>
            <div class="act-body">
              <span class="act-name">{{ a.name }}</span>
              <span class="act-desc">{{ a.desc }}</span>
            </div>
            <span class="act-mult">×{{ a.val }}</span>
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="results-section" *ngIf="bmr() > 0">
        <div class="result-cards">
          <div class="rc bmr-card">
            <div class="rc-icon">🔥</div>
            <div class="rc-body">
              <div class="rc-label">BMR</div>
              <div class="rc-val">{{ bmr() | number:'1.0-0' }}</div>
              <div class="rc-sub">Base Metabolic Rate</div>
            </div>
          </div>
          <div class="rc tdee-card">
            <div class="rc-icon">⚡</div>
            <div class="rc-body">
              <div class="rc-label">TDEE (Maintain)</div>
              <div class="rc-val primary">{{ tdee() | number:'1.0-0' }}</div>
              <div class="rc-sub">Total Daily Calories</div>
            </div>
          </div>
          <div class="rc lose-card">
            <div class="rc-icon">📉</div>
            <div class="rc-body">
              <div class="rc-label">Lose Weight</div>
              <div class="rc-val green">{{ (tdee() - 500) | number:'1.0-0' }}</div>
              <div class="rc-sub">−500 cal/day (0.5kg/wk)</div>
            </div>
          </div>
          <div class="rc gain-card">
            <div class="rc-icon">💪</div>
            <div class="rc-body">
              <div class="rc-label">Gain Muscle</div>
              <div class="rc-val accent">{{ (tdee() + 300) | number:'1.0-0' }}</div>
              <div class="rc-sub">+300 cal/day surplus</div>
            </div>
          </div>
        </div>

        <!-- Macro Chart -->
        <div class="macro-section">
          <div class="macro-title">🥗 Recommended Macros ({{ tdee() | number:'1.0-0' }} cal/day)</div>
          <div class="macro-bars">
            <div class="mb-row" *ngFor="let m of macros()">
              <div class="mb-icon">{{ m.icon }}</div>
              <div class="mb-label">{{ m.name }}</div>
              <div class="mb-bar-wrap">
                <div class="mb-bar" [style.width.%]="m.pct" [style.background]="m.color"></div>
              </div>
              <div class="mb-stats">
                <span class="mb-g">{{ m.grams }}g</span>
                <span class="mb-cal">{{ m.calories }} cal</span>
                <span class="mb-pct">{{ m.pct }}%</span>
              </div>
            </div>
          </div>

          <!-- Visual donut-like macro ring -->
          <div class="macro-visual">
            <svg viewBox="0 0 120 120" class="macro-ring">
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border)" stroke-width="16"/>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#3b82f6" stroke-width="16"
                [attr.stroke-dasharray]="''+((macros()[0]?.pct??0)/100*301.6)+' 301.6'" stroke-dashoffset="0"
                style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .5s"/>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#10b981" stroke-width="16"
                [attr.stroke-dasharray]="''+((macros()[1]?.pct??0)/100*301.6)+' 301.6'"
                [attr.stroke-dashoffset]="'-'+((macros()[0]?.pct??0)/100*301.6)"
                style="transform:rotate(-90deg);transform-origin:50% 50%;transition:all .5s"/>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#f59e0b" stroke-width="16"
                [attr.stroke-dasharray]="''+((macros()[2]?.pct??0)/100*301.6)+' 301.6'"
                [attr.stroke-dashoffset]="'-'+(((macros()[0]?.pct??0)+(macros()[1]?.pct??0))/100*301.6)"
                style="transform:rotate(-90deg);transform-origin:50% 50%;transition:all .5s"/>
            </svg>
            <div class="ring-center"><div class="rc-num">{{ tdee() | number:'1.0-0' }}</div><div class="rc-u">cal</div></div>
          </div>
        </div>

        <!-- BMI quick check -->
        <div class="bmi-quick">
          <span class="bq-label">Your BMI:</span>
          <span class="bq-val" [class]="bmiClass()">{{ bmi() }}</span>
          <span class="bq-cat" [class]="bmiClass()">{{ bmiCategory() }}</span>
          <div class="bq-scale">
            <div class="bqs-fill" [style.left.%]="bmiMarker()"></div>
          </div>
        </div>
      </div>

      <div class="cal-note">ℹ️ Uses Mifflin-St Jeor equation — the most validated formula for BMR calculation.</div>
    </div>
  `,
  styles: [`
    .cal-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
    .inp-field{display:flex;flex-direction:column;gap:.45rem}
    .inp-field label,.section-lbl{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .gender-tabs,.unit-toggle-sm{display:flex;gap:.3rem}
    .g-btn,.unit-toggle-sm button{flex:1;padding:.4rem .5rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .g-btn.active,.unit-toggle-sm button.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:10px;padding:.5rem .75rem;gap:.3rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .val-inp{border:none;outline:none;background:transparent;font-size:1rem;font-weight:700;color:var(--text);width:70px;font-family:var(--font)}
    .val-inp.sm{width:45px}
    .suf{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .dual-inp{display:flex;gap:.35rem}
    .activity-section{display:flex;flex-direction:column;gap:.5rem}
    .activity-list{display:flex;flex-direction:column;gap:.35rem}
    .act-btn{display:flex;align-items:center;gap:.75rem;padding:.65rem .9rem;border-radius:10px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-family:var(--font);text-align:left;transition:all .15s}
    .act-btn.active{background:var(--primary-light);border-color:var(--primary)}
    .act-icon{font-size:1.3rem;flex-shrink:0}
    .act-body{display:flex;flex-direction:column;gap:.1rem;flex:1}
    .act-name{font-size:.84rem;font-weight:600;color:var(--text)}
    .act-desc{font-size:.72rem;color:var(--text-muted)}
    .act-mult{font-size:.8rem;font-weight:700;color:var(--primary)}
    .result-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem}
    .rc{display:flex;align-items:flex-start;gap:.7rem;padding:1rem;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt)}
    .rc.tdee-card{border-color:var(--primary);background:var(--primary-light)}
    .rc-icon{font-size:1.3rem}
    .rc-body{display:flex;flex-direction:column;gap:.12rem}
    .rc-label{font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .rc-val{font-size:1.1rem;font-weight:800;color:var(--text)}
    .rc-val.primary{color:var(--primary)}
    .rc-val.green{color:var(--green)}
    .rc-val.accent{color:var(--accent)}
    .rc-sub{font-size:.68rem;color:var(--text-muted)}
    .macro-section{background:var(--bg-alt);border-radius:14px;padding:1.1rem;border:1px solid var(--border);display:grid;grid-template-columns:1fr 140px;gap:1.5rem;align-items:center}
    .macro-title{font-size:.82rem;font-weight:700;grid-column:1/-1;margin-bottom:.25rem}
    .macro-bars{display:flex;flex-direction:column;gap:.65rem}
    .mb-row{display:grid;grid-template-columns:24px 80px 1fr auto;align-items:center;gap:.6rem}
    .mb-icon{font-size:1rem}
    .mb-label{font-size:.78rem;font-weight:600;color:var(--text)}
    .mb-bar-wrap{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .mb-bar{height:100%;border-radius:99px;transition:width .4s}
    .mb-stats{display:flex;gap:.5rem;font-size:.72rem;white-space:nowrap}
    .mb-g{font-weight:700;color:var(--text)}
    .mb-cal{color:var(--text-muted)}
    .mb-pct{color:var(--primary);font-weight:700}
    .macro-visual{position:relative;width:120px;height:120px;flex-shrink:0}
    .macro-ring{width:100%;height:100%}
    .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .rc-num{font-size:1.1rem;font-weight:900;color:var(--primary)}
    .rc-u{font-size:.65rem;color:var(--text-muted)}
    .bmi-quick{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:var(--bg-alt);border-radius:10px;border:1px solid var(--border);flex-wrap:wrap}
    .bq-label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .bq-val{font-size:1.1rem;font-weight:800}
    .bq-cat{font-size:.82rem;font-weight:700}
    .bq-val.under,.bq-cat.under{color:#3b82f6}
    .bq-val.normal,.bq-cat.normal{color:var(--green)}
    .bq-val.over,.bq-cat.over{color:var(--accent)}
    .bq-val.obese,.bq-cat.obese{color:var(--red)}
    .bq-scale{flex:1;height:6px;background:linear-gradient(90deg,#3b82f6 25%,#10b981 25% 50%,#f59e0b 50% 75%,#ef4444 75%);border-radius:99px;min-width:80px;position:relative}
    .bqs-fill{position:absolute;top:-3px;width:12px;height:12px;background:#fff;border:2.5px solid var(--text);border-radius:50%;transform:translateX(-50%);transition:left .4s}
    .cal-note{font-size:.78rem;color:var(--text-muted);padding:.6rem .9rem;background:var(--bg-alt);border-radius:8px;border-left:3px solid var(--primary)}
    @media(max-width:768px){.inp-grid{grid-template-columns:repeat(2,1fr)}.result-cards{grid-template-columns:repeat(2,1fr)}.macro-section{grid-template-columns:1fr}}
    @media(max-width:480px){.inp-grid{grid-template-columns:1fr}.result-cards{grid-template-columns:1fr}}
  `]
})
export class CalorieCalculatorComponent implements OnInit {
  gender = 'male';
  age = 25;
  heightUnit = 'cm'; weightUnit = 'kg';
  heightCm = 175; heightFt = 5; heightIn = 9;
  weight = 70;
  activityLevel = 1.55;


  activities = [
    { icon: '🛋️', name: 'Sedentary', desc: 'Little to no exercise', val: 1.2 },
    { icon: '🚶', name: 'Lightly Active', desc: 'Light exercise 1–3 days/week', val: 1.375 },
    { icon: '🏃', name: 'Moderately Active', desc: 'Exercise 3–5 days/week', val: 1.55 },
    { icon: '💪', name: 'Very Active', desc: 'Hard exercise 6–7 days/week', val: 1.725 },
    { icon: '🏋️', name: 'Extra Active', desc: 'Athlete/physical job', val: 1.9 },
  ];

  ngOnInit() { this.calc(); }

  calc() {}

  private getWeightKg() { return this.weightUnit === 'kg' ? this.weight : this.weight * 0.453592; }
  private getHeightCm() {
    if (this.heightUnit === 'cm') return this.heightCm;
    return (this.heightFt * 12 + this.heightIn) * 2.54;
  }

  bmr(): number {
    const w = this.getWeightKg(), h = this.getHeightCm(), a = this.age;
    if (this.gender === 'male') return Math.round(10 * w + 6.25 * h - 5 * a + 5);
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }

  tdee(): number { return Math.round(this.bmr() * this.activityLevel); }

  macros() {
    const cal = this.tdee();
    
    return [
      { icon: '🥩', name: 'Protein', pct: 30, grams: Math.round(cal * 0.3 / 4), calories: Math.round(cal * 0.3), color: '#3b82f6' },
      { icon: '🥗', name: 'Carbs', pct: 45, grams: Math.round(cal * 0.45 / 4), calories: Math.round(cal * 0.45), color: '#10b981' },
      { icon: '🥑', name: 'Fats', pct: 25, grams: Math.round(cal * 0.25 / 9), calories: Math.round(cal * 0.25), color: '#f59e0b' },
    ];
  }

  bmi(): string {
    const w = this.getWeightKg(), h = this.getHeightCm() / 100;
    return (w / (h * h)).toFixed(1);
  }

  bmiClass(): string {
    const b = parseFloat(this.bmi());
    if (b < 18.5) return 'under';
    if (b < 25) return 'normal';
    if (b < 30) return 'over';
    return 'obese';
  }

  bmiCategory(): string {
    const m: Record<string, string> = { under: 'Underweight', normal: 'Normal Weight ✅', over: 'Overweight', obese: 'Obese' };
    return m[this.bmiClass()];
  }

  bmiMarker(): number {
    const b = parseFloat(this.bmi());
    if (b < 18.5) return Math.min((b / 18.5) * 25, 24);
    if (b < 25) return 25 + ((b - 18.5) / 6.5) * 25;
    if (b < 30) return 50 + ((b - 25) / 5) * 25;
    return Math.min(75 + ((b - 30) / 10) * 25, 97);
  }
}
