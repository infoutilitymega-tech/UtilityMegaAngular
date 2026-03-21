import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-age-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="age-wrap">
      <div class="inp-grid">
        <div class="date-field">
          <label>Date of Birth</label>
          <input type="date" [(ngModel)]="dob" (change)="calc()" class="date-inp" [max]="today" />
        </div>
        <div class="date-field">
          <label>Calculate Age On</label>
          <input type="date" [(ngModel)]="targetDate" (change)="calc()" class="date-inp" />
          <button class="today-btn" (click)="setToday()">Today</button>
        </div>
      </div>

      <!-- Main Result -->
      <div class="age-hero" *ngIf="result()">
        <div class="age-big">
          <div class="age-num">{{ result()!.years }}</div>
          <div class="age-unit">Years</div>
        </div>
        <div class="age-sep">+</div>
        <div class="age-big">
          <div class="age-num">{{ result()!.months }}</div>
          <div class="age-unit">Months</div>
        </div>
        <div class="age-sep">+</div>
        <div class="age-big">
          <div class="age-num">{{ result()!.days }}</div>
          <div class="age-unit">Days</div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="result()">
        <div class="stat-card"><div class="sc-icon">📅</div><div class="sc-val">{{ result()!.totalDays | number }}</div><div class="sc-lbl">Total Days Lived</div></div>
        <div class="stat-card"><div class="sc-icon">🕐</div><div class="sc-val">{{ result()!.totalHours | number }}</div><div class="sc-lbl">Total Hours</div></div>
        <div class="stat-card"><div class="sc-icon">⏱</div><div class="sc-val">{{ result()!.totalMinutes | number }}</div><div class="sc-lbl">Total Minutes</div></div>
        <div class="stat-card"><div class="sc-icon">⚡</div><div class="sc-val">{{ result()!.totalSeconds | number }}</div><div class="sc-lbl">Total Seconds</div></div>
        <div class="stat-card"><div class="sc-icon">🗓</div><div class="sc-val">{{ result()!.totalWeeks | number }}</div><div class="sc-lbl">Total Weeks</div></div>
        <div class="stat-card"><div class="sc-icon">🌙</div><div class="sc-val">{{ result()!.totalMonths }}</div><div class="sc-lbl">Total Months</div></div>
      </div>

      <!-- Birthday countdown -->
      <div class="birthday-card" *ngIf="nextBirthday()">
        <div class="bd-icon">🎂</div>
        <div class="bd-body">
          <div class="bd-title">Next Birthday</div>
          <div class="bd-val">in <strong>{{ nextBirthday() }} days</strong></div>
        </div>
        <div class="bd-extra">You turn <strong>{{ (result()?.years ?? 0) + 1 }}</strong> years old</div>
      </div>

      <!-- Fun facts -->
      <div class="fun-facts" *ngIf="result()">
        <div class="ff-title">🌟 Life in Numbers</div>
        <div class="ff-grid">
          <div class="ff-item"><span class="ff-num">~{{ heartbeats() }}</span><span class="ff-lbl">Heartbeats</span></div>
          <div class="ff-item"><span class="ff-num">~{{ breaths() }}</span><span class="ff-lbl">Breaths Taken</span></div>
          <div class="ff-item"><span class="ff-num">{{ sleepYears() }}</span><span class="ff-lbl">Years Sleeping</span></div>
          <div class="ff-item"><span class="ff-num">{{ result()!.dayOfWeek }}</span><span class="ff-lbl">Day You Were Born</span></div>
        </div>
      </div>

      <div class="age-note" *ngIf="!result()">👆 Please select your date of birth to calculate age.</div>
    </div>
  `,
  styles: [`
    .age-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .inp-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .date-field{display:flex;flex-direction:column;gap:.4rem;position:relative}
    .date-field label{font-size:.8rem;font-weight:600;color:var(--text-muted)}
    .date-inp{padding:.65rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--input-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font);width:100%;box-sizing:border-box}
    .date-inp:focus{border-color:var(--primary)}
    .today-btn{position:absolute;right:.5rem;bottom:.5rem;padding:.25rem .6rem;border-radius:6px;border:none;background:var(--primary);color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;font-family:var(--font)}
    .age-hero{display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:2rem;background:var(--primary-light);border-radius:16px;border:1.5px solid var(--primary)44}
    .age-big{display:flex;flex-direction:column;align-items:center;gap:.2rem}
    .age-num{font-size:3.5rem;font-weight:900;color:var(--primary);line-height:1}
    .age-unit{font-size:.82rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em}
    .age-sep{font-size:2rem;font-weight:300;color:var(--text-muted)}
    .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
    .stat-card{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border);text-align:center}
    .sc-icon{font-size:1.4rem}
    .sc-val{font-size:1.05rem;font-weight:800;color:var(--text)}
    .sc-lbl{font-size:.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .birthday-card{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;background:linear-gradient(135deg,#7c3aed22,#2563eb22);border-radius:14px;border:1.5px solid #7c3aed44}
    .bd-icon{font-size:2.5rem;flex-shrink:0}
    .bd-body{flex:1}
    .bd-title{font-size:.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .bd-val{font-size:1.1rem;font-weight:700;color:var(--text);margin-top:.1rem}
    .bd-extra{font-size:.83rem;color:var(--text-muted)}
    .fun-facts{background:var(--bg-alt);border-radius:14px;border:1px solid var(--border);overflow:hidden}
    .ff-title{padding:.75rem 1rem;font-size:.82rem;font-weight:700;border-bottom:1px solid var(--border);background:var(--card-bg)}
    .ff-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
    .ff-item{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:.85rem .5rem;border-right:1px solid var(--border);text-align:center}
    .ff-item:last-child{border-right:none}
    .ff-num{font-size:.95rem;font-weight:800;color:var(--primary)}
    .ff-lbl{font-size:.68rem;color:var(--text-muted);font-weight:600;text-transform:uppercase}
    .age-note{text-align:center;color:var(--text-muted);padding:2rem;font-size:.9rem;background:var(--bg-alt);border-radius:12px}
    @media(max-width:600px){.inp-grid{grid-template-columns:1fr}.age-hero{gap:.75rem}.age-num{font-size:2.5rem}.stats-grid{grid-template-columns:repeat(2,1fr)}.ff-grid{grid-template-columns:repeat(2,1fr)}.ff-item{border-bottom:1px solid var(--border)}}
  `]
})
export class AgeCalculatorComponent implements OnInit {
  dob = '';
  targetDate = '';
  today = new Date().toISOString().split('T')[0];

  result = signal<any>(null);

  ngOnInit() {
    this.targetDate = this.today;
    // Default demo DOB
    this.dob = '1995-06-15';
    this.calc();
  }

  setToday() { this.targetDate = this.today; this.calc(); }

  calc() {
    if (!this.dob || !this.targetDate) { this.result.set(null); return; }
    const birth = new Date(this.dob);
    const target = new Date(this.targetDate);
    if (birth > target) { this.result.set(null); return; }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) { months--; const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / 86400000);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    this.result.set({
      years, months, days,
      totalDays,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 24 * 60,
      totalSeconds: totalDays * 24 * 3600,
      totalWeeks: Math.floor(totalDays / 7),
      totalMonths: years * 12 + months,
      dayOfWeek: dayNames[birth.getDay()],
    });
  }

  nextBirthday(): number {
    if (!this.dob) return 0;
    const today = new Date();
    const birth = new Date(this.dob);
    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next <= today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    return Math.ceil((next.getTime() - today.getTime()) / 86400000);
  }

  heartbeats() {
    const days = this.result()?.totalDays ?? 0;
    return (days * 24 * 60 * 70 / 1e9).toFixed(2) + 'B';
  }
  breaths() {
    const days = this.result()?.totalDays ?? 0;
    return (days * 24 * 60 * 15 / 1e6).toFixed(1) + 'M';
  }
  sleepYears() {
    const years = this.result()?.years ?? 0;
    return (years * 0.33).toFixed(1) + ' yrs';
  }
}
