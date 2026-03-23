import { Component, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Stopwatch & Timer ────────────────────────────────────────────────────────
@Component({
  selector: 'app-stopwatch-timer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tabs">
        <button [class.active]="tab()==='stopwatch'" (click)="tab.set('stopwatch');reset()">⏱️ Stopwatch</button>
        <button [class.active]="tab()==='timer'" (click)="tab.set('timer');reset()">⏲️ Countdown Timer</button>
      </div>

      <!-- Stopwatch -->
      <div class="clock-section" *ngIf="tab()==='stopwatch'">
        <div class="time-display">{{formatTime(elapsed())}}</div>
        <div class="ms-display">.{{formatMs(elapsed())}}</div>
        <div class="btn-row">
          <button class="btn-start" [class.running]="running()" (click)="toggleRun()">{{running()?'⏸ Pause':'▶ Start'}}</button>
          <button class="btn-lap" (click)="lap()" [disabled]="!running()">🏁 Lap</button>
          <button class="btn-reset" (click)="reset()">↺ Reset</button>
        </div>
        <div class="laps-section" *ngIf="laps().length">
          <div class="laps-header"><span>Lap</span><span>Lap Time</span><span>Total</span></div>
          <div class="lap-row" *ngFor="let l of laps(); let i=index" [class.best]="l.isBest" [class.worst]="l.isWorst">
            <span>Lap {{laps().length - i}}</span><span>{{formatTime(l.lapTime)}}</span><span>{{formatTime(l.total)}}</span>
          </div>
        </div>
      </div>

      <!-- Countdown Timer -->
      <div class="clock-section" *ngIf="tab()==='timer'">
        <div class="timer-inputs" *ngIf="!running() && remaining()===0">
          <div class="time-unit"><input type="number" [(ngModel)]="timerH" min="0" max="99" class="tu-input" /><span>h</span></div>
          <span class="tu-sep">:</span>
          <div class="time-unit"><input type="number" [(ngModel)]="timerM" min="0" max="59" class="tu-input" /><span>m</span></div>
          <span class="tu-sep">:</span>
          <div class="time-unit"><input type="number" [(ngModel)]="timerS" min="0" max="59" class="tu-input" /><span>s</span></div>
        </div>
        <div class="time-display" *ngIf="running() || remaining()>0" [class.alarm]="remaining()===0 && timerStarted()">{{formatTime(remaining())}}</div>
        <div class="quick-presets">
          <button *ngFor="let p of presets" class="preset-btn" (click)="setPreset(p.s)">{{p.label}}</button>
        </div>
        <div class="btn-row">
          <button class="btn-start" [class.running]="running()" (click)="toggleTimer()">{{running()?'⏸ Pause':'▶ Start'}}</button>
          <button class="btn-reset" (click)="resetTimer()">↺ Reset</button>
        </div>
        <div class="alarm-msg" *ngIf="alarming()">🔔 Time's up!</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .tabs{display:flex;gap:.4rem;margin-bottom:1.5rem;background:#f3f4f6;border-radius:10px;padding:.35rem}
    .tabs button{flex:1;padding:.5rem;border:none;background:none;border-radius:7px;font-size:.85rem;font-weight:700;cursor:pointer;color:#6b7280;transition:all .15s}
    .tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .clock-section{display:flex;flex-direction:column;align-items:center;gap:1.25rem;padding:1rem 0}
    .time-display{font-size:clamp(2.5rem,8vw,4.5rem);font-weight:900;font-family:monospace;color:#111827;letter-spacing:.05em;line-height:1}
    .ms-display{font-size:1.5rem;font-weight:700;font-family:monospace;color:#6b7280;margin-top:-.5rem}
    .btn-row{display:flex;gap:.75rem}
    .btn-start,.btn-lap,.btn-reset{padding:.75rem 1.75rem;border:none;border-radius:12px;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .15s}
    .btn-start{background:#2563eb;color:white}.btn-start.running{background:#dc2626}
    .btn-lap{background:#7c3aed;color:white}.btn-lap:disabled{opacity:.4;cursor:not-allowed}
    .btn-reset{background:#f3f4f6;color:#374151;border:1px solid #e5e7eb}
    .laps-section{width:100%;max-width:420px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;max-height:220px;overflow-y:auto}
    .laps-header{display:grid;grid-template-columns:1fr 1fr 1fr;padding:.5rem 1rem;font-size:.72rem;font-weight:700;color:#9ca3af;border-bottom:1px solid #e5e7eb;text-transform:uppercase}
    .lap-row{display:grid;grid-template-columns:1fr 1fr 1fr;padding:.5rem 1rem;font-size:.82rem;font-family:monospace;border-bottom:1px solid #f3f4f6}
    .lap-row.best{background:#ecfdf5;color:#059669}
    .lap-row.worst{background:#fef2f2;color:#dc2626}
    .timer-inputs{display:flex;align-items:center;gap.5rem}
    .time-unit{display:flex;flex-direction:column;align-items:center;gap:.25rem}
    .tu-input{width:80px;text-align:center;font-size:2.5rem;font-weight:900;font-family:monospace;border:2px solid #e5e7eb;border-radius:10px;padding:.25rem;outline:none}
    .tu-input:focus{border-color:#2563eb}
    .time-unit span{font-size:.75rem;color:#9ca3af;font-weight:700}
    .tu-sep{font-size:2.5rem;font-weight:900;color:#9ca3af;padding-bottom:.75rem}
    .quick-presets{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center}
    .preset-btn{padding:.35rem .85rem;border:1px solid #e5e7eb;border-radius:99px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;color:#374151}
    .preset-btn:hover{background:#eff6ff;border-color:#2563eb;color:#2563eb}
    .alarm-msg{font-size:1.25rem;font-weight:800;color:#dc2626;animation:pulse 1s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .time-display.alarm{color:#dc2626;animation:pulse 1s ease-in-out infinite}
  `]
})
export class StopwatchTimerComponent implements OnDestroy {
  tab = signal<'stopwatch'|'timer'>('stopwatch');
  running = signal(false); elapsed = signal(0); remaining = signal(0);
  laps = signal<any[]>([]);
  timerH=0; timerM=5; timerS=0; timerStarted=signal(false); alarming=signal(false);
  private intervalId: any = null; private lastLapTime = 0;
  presets = [{label:'1 min',s:60},{label:'5 min',s:300},{label:'10 min',s:600},{label:'15 min',s:900},{label:'25 min',s:1500},{label:'30 min',s:1800}];

  toggleRun() {
    if(this.running()){clearInterval(this.intervalId);this.running.set(false);}
    else{this.running.set(true);this.intervalId=setInterval(()=>this.elapsed.update(v=>v+10),10);}
  }
  lap() {
    const all=this.laps();const lapTime=this.elapsed()-this.lastLapTime;this.lastLapTime=this.elapsed();
    const newLap={lapTime,total:this.elapsed(),isBest:false,isWorst:false};
    const updated=[newLap,...all].map(l=>({...l,isBest:false,isWorst:false}));
    if(updated.length>1){const times=updated.map(l=>l.lapTime);const best=Math.min(...times),worst=Math.max(...times);updated.forEach(l=>{if(l.lapTime===best)l.isBest=true;if(l.lapTime===worst)l.isWorst=true;});}
    this.laps.set(updated);
  }
  reset() { clearInterval(this.intervalId);this.running.set(false);this.elapsed.set(0);this.laps.set([]);this.lastLapTime=0; }

  toggleTimer() {
    if(this.running()){clearInterval(this.intervalId);this.running.set(false);}
    else{
      if(this.remaining()===0){const total=(this.timerH*3600+this.timerM*60+this.timerS)*1000;if(!total)return;this.remaining.set(total);this.timerStarted.set(true);}
      this.running.set(true);this.alarming.set(false);
      this.intervalId=setInterval(()=>{
        this.remaining.update(v=>v-10);
        if(this.remaining()<=0){this.remaining.set(0);clearInterval(this.intervalId);this.running.set(false);this.alarming.set(true);}
      },10);
    }
  }
  resetTimer(){clearInterval(this.intervalId);this.running.set(false);this.remaining.set(0);this.timerStarted.set(false);this.alarming.set(false);}
  setPreset(s:number){this.resetTimer();const t=s*1000;this.remaining.set(t);this.timerH=Math.floor(s/3600);this.timerM=Math.floor((s%3600)/60);this.timerS=s%60;}

  formatTime(ms:number){const s=Math.floor(ms/1000);const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const sec=s%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
  formatMs(ms:number){return String(Math.floor((ms%1000)/10)).padStart(2,'0');}
  ngOnDestroy(){clearInterval(this.intervalId);}
}

// ─── Screen Ruler ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-screen-ruler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="ruler-info">
        <div class="info-card"><div class="ic-label">Screen Resolution</div><div class="ic-val">{{screenW()}} × {{screenH()}} px</div></div>
        <div class="info-card"><div class="ic-label">Device Pixel Ratio</div><div class="ic-val">{{dpr()}}x</div></div>
        <div class="info-card"><div class="ic-label">Viewport Size</div><div class="ic-val">{{vpW()}} × {{vpH()}} px</div></div>
        <div class="info-card"><div class="ic-label">Color Depth</div><div class="ic-val">{{colorDepth()}} bit</div></div>
        <div class="info-card"><div class="ic-label">PPI (approx)</div><div class="ic-val">{{ppi()}} PPI</div></div>
        <div class="info-card"><div class="ic-label">Orientation</div><div class="ic-val">{{orientation()}}</div></div>
      </div>

      <div class="ruler-section">
        <div class="ruler-title">Interactive Ruler</div>
        <div class="unit-selector">
          <button *ngFor="let u of units" [class.active]="unit()===u" (click)="unit.set(u)">{{u}}</button>
        </div>
        <div class="ruler-canvas" #rulerCanvas (mousemove)="onRulerMove($event)" (mouseleave)="cursorPos.set(-1)">
          <div class="ruler-track"></div>
          <div class="ruler-ticks">
            <div class="tick" *ngFor="let t of getTicks()" [style.left.px]="t.px" [class.major]="t.major">
              <span *ngIf="t.major" class="tick-label">{{t.label}}</span>
            </div>
          </div>
          <div class="cursor-line" *ngIf="cursorPos()>=0" [style.left.px]="cursorPos()">
            <div class="cursor-val">{{getCursorVal()}}</div>
          </div>
        </div>

        <div class="measure-section">
          <div class="measure-title">Measure Distance</div>
          <div class="measure-row">
            <div class="mf"><label>From (px)</label><input type="number" [(ngModel)]="fromPx" class="px-input" /></div>
            <div class="mf"><label>To (px)</label><input type="number" [(ngModel)]="toPx" class="px-input" /></div>
            <div class="mf result-field"><label>Distance</label><div class="dist-val">{{getMeasurement()}}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .ruler-info{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.65rem;margin-bottom:1.5rem}
    .info-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem}
    .ic-label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:.25rem}
    .ic-val{font-size:.95rem;font-weight:800;color:#111827}
    .ruler-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem}
    .ruler-title{font-size:.85rem;font-weight:800;margin-bottom:.75rem}
    .unit-selector{display:flex;gap:.35rem;margin-bottom:1rem}
    .unit-selector button{padding:.3rem .75rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;color:#6b7280}
    .unit-selector button.active{background:#2563eb;border-color:#2563eb;color:white}
    .ruler-canvas{position:relative;height:60px;background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;cursor:crosshair;margin-bottom:1.25rem}
    .ruler-track{position:absolute;bottom:0;left:0;right:0;height:4px;background:#e5e7eb}
    .ruler-ticks{position:absolute;bottom:0;left:0;right:0;height:100%}
    .tick{position:absolute;bottom:0;width:1px;background:#d1d5db}
    .tick.major{background:#374151;height:20px}
    .tick-label{position:absolute;bottom:22px;transform:translateX(-50%);font-size:.6rem;font-weight:700;color:#374151;white-space:nowrap}
    .cursor-line{position:absolute;top:0;bottom:0;width:2px;background:#2563eb;pointer-events:none}
    .cursor-val{position:absolute;top:4px;left:4px;font-size:.65rem;font-weight:700;color:#2563eb;background:white;padding:.1rem .3rem;border-radius:3px;border:1px solid #93c5fd;white-space:nowrap}
    .measure-section{border-top:1px solid #e5e7eb;padding-top:1rem}
    .measure-title{font-size:.78rem;font-weight:700;color:#6b7280;margin-bottom:.65rem;text-transform:uppercase}
    .measure-row{display:flex;gap:.75rem;align-items:flex-end;flex-wrap:wrap}
    .mf{display:flex;flex-direction:column;gap:.3rem}.mf label{font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .px-input{width:90px;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.9rem;outline:none}
    .result-field .dist-val{padding:.4rem .85rem;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;font-size:.9rem;font-weight:800;color:#1d4ed8}
  `]
})
export class ScreenRulerComponent {
  screenW = signal(window.screen.width); screenH = signal(window.screen.height);
  dpr = signal(window.devicePixelRatio.toFixed(2)); vpW = signal(window.innerWidth); vpH = signal(window.innerHeight);
  colorDepth = signal(window.screen.colorDepth); cursorPos = signal(-1);
  units = ['px','cm','mm','in']; unit = signal('px');
  fromPx = 0; toPx = 100;

  orientation() { return window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait'; }
  ppi() { return Math.round(Math.sqrt(this.screenW()**2 + this.screenH()**2) / 15.6); }

  getTicks() {
    const ticks = []; const rulerW = window.innerWidth - 80;
    for(let i=0;i<=rulerW;i+=10) { ticks.push({px:i,major:i%100===0,label:this.convertUnit(i)}); }
    return ticks;
  }
  convertUnit(px: number) {
    switch(this.unit()) {
      case 'cm': return (px/this.ppi()*2.54).toFixed(1)+'cm';
      case 'mm': return (px/this.ppi()*25.4).toFixed(0)+'mm';
      case 'in': return (px/this.ppi()).toFixed(2)+'"';
      default: return px+'px';
    }
  }
  onRulerMove(e: MouseEvent) { const rect=(e.target as HTMLElement).getBoundingClientRect();this.cursorPos.set(e.clientX-rect.left); }
  getCursorVal() { return this.convertUnit(Math.round(this.cursorPos())); }
  getMeasurement() { return this.convertUnit(Math.abs(this.toPx-this.fromPx)); }
}

// ─── Pomodoro Timer ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="pom-container">
        <div class="session-tabs">
          <button [class.active]="phase()==='work'" (click)="setPhase('work')">🎯 Focus</button>
          <button [class.active]="phase()==='short'" (click)="setPhase('short')">☕ Short Break</button>
          <button [class.active]="phase()==='long'" (click)="setPhase('long')">🛌 Long Break</button>
        </div>
        <div class="pom-circle" [class.running]="running()" [style.border-color]="getPhaseColor()">
          <div class="pom-time">{{formatTime(remaining())}}</div>
          <div class="pom-phase">{{getPhaseName()}}</div>
          <div class="pom-session">Session {{session()}} / {{sessions}}</div>
        </div>
        <div class="pom-progress">
          <div class="pom-bar" [style.width.%]="getProgress()" [style.background]="getPhaseColor()"></div>
        </div>
        <div class="pom-controls">
          <button class="pom-btn start" [class.running]="running()" (click)="toggle()">{{running()?'⏸ Pause':'▶ Start'}}</button>
          <button class="pom-btn reset" (click)="reset()">↺ Reset</button>
          <button class="pom-btn skip" (click)="skip()">⏭ Skip</button>
        </div>
        <div class="pom-settings">
          <div class="setting"><label>Focus (min)</label><input type="number" [(ngModel)]="workMins" min="1" max="60" (change)="reset()" class="sm-inp" /></div>
          <div class="setting"><label>Short Break</label><input type="number" [(ngModel)]="shortMins" min="1" max="30" (change)="reset()" class="sm-inp" /></div>
          <div class="setting"><label>Long Break</label><input type="number" [(ngModel)]="longMins" min="1" max="60" (change)="reset()" class="sm-inp" /></div>
          <div class="setting"><label>Sessions</label><input type="number" [(ngModel)]="sessions" min="1" max="10" class="sm-inp" /></div>
        </div>
        <div class="completed-sessions" *ngIf="completedSessions()>0">
          <span class="tomato" *ngFor="let s of getRange(completedSessions())">🍅</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .pom-container{display:flex;flex-direction:column;align-items:center;gap:1.25rem;padding:.5rem 0}
    .session-tabs{display:flex;gap:.4rem;background:#f3f4f6;border-radius:10px;padding:.35rem}
    .session-tabs button{padding:.45rem 1rem;border:none;background:none;border-radius:7px;font-size:.82rem;font-weight:700;cursor:pointer;color:#6b7280;transition:all .15s}
    .session-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .pom-circle{width:200px;height:200px;border-radius:50%;border:6px solid #e5e7eb;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:border-color .3s;background:white;box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .pom-circle.running{animation:pulse-shadow 2s ease-in-out infinite}
    @keyframes pulse-shadow{0%,100%{box-shadow:0 4px 20px rgba(37,99,235,.1)}50%{box-shadow:0 4px 32px rgba(37,99,235,.25)}}
    .pom-time{font-size:2.75rem;font-weight:900;font-family:monospace;line-height:1}
    .pom-phase{font-size:.78rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-top:.25rem}
    .pom-session{font-size:.7rem;color:#9ca3af;margin-top:.15rem}
    .pom-progress{width:100%;max-width:320px;height:6px;background:#f3f4f6;border-radius:99px;overflow:hidden}
    .pom-bar{height:100%;border-radius:99px;transition:width .5s linear,background .3s}
    .pom-controls{display:flex;gap:.6rem}
    .pom-btn{padding:.65rem 1.4rem;border:none;border-radius:10px;font-size:.9rem;font-weight:800;cursor:pointer;transition:all .15s}
    .pom-btn.start{background:#2563eb;color:white}.pom-btn.start.running{background:#dc2626}
    .pom-btn.reset{background:#f3f4f6;color:#374151;border:1px solid #e5e7eb}
    .pom-btn.skip{background:#7c3aed;color:white}
    .pom-settings{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center}
    .setting{display:flex;flex-direction:column;align-items:center;gap:.25rem}
    .setting label{font-size:.65rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .sm-inp{width:65px;text-align:center;padding:.35rem;border:1px solid #d1d5db;border-radius:7px;font-size:.9rem;font-weight:700}
    .completed-sessions{display:flex;gap:.25rem;flex-wrap:wrap;justify-content:center}
    .tomato{font-size:1.25rem}
  `]
})
export class PomodoroComponent implements OnDestroy {
  phase = signal<'work'|'short'|'long'>('work');
  running = signal(false); session = signal(1); completedSessions = signal(0);
  workMins=25; shortMins=5; longMins=15; sessions=4;
  remaining = signal(25*60*1000); private startMs = 0; private totalMs = 25*60*1000;
  private iv: any = null;

  setPhase(p: 'work'|'short'|'long'){this.phase.set(p);this.reset();}
  getPhaseName(){return{work:'Focus Time',short:'Short Break',long:'Long Break'}[this.phase()];}
  getPhaseColor(){return{work:'#2563eb',short:'#059669',long:'#7c3aed'}[this.phase()];}
  getProgress(){return Math.round((1-this.remaining()/this.totalMs)*100);}
  getRange(n:number){return Array(n).fill(0);}
  formatTime(ms:number){const s=Math.floor(ms/1000);const m=Math.floor(s/60);return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

  toggle(){
    if(this.running()){clearInterval(this.iv);this.running.set(false);}
    else{this.running.set(true);this.iv=setInterval(()=>{this.remaining.update(v=>v-1000);if(this.remaining()<=0){this.nextPhase();}},1000);}
  }
  reset(){clearInterval(this.iv);this.running.set(false);const t=this.getPhaseMs();this.totalMs=t;this.remaining.set(t);}
  skip(){this.nextPhase();}
  getPhaseMs(){return{work:this.workMins*60*1000,short:this.shortMins*60*1000,long:this.longMins*60*1000}[this.phase()];}
  nextPhase(){
    clearInterval(this.iv);this.running.set(false);
    if(this.phase()==='work'){this.completedSessions.update(v=>v+1);if(this.session()%this.sessions===0){this.phase.set('long');}else{this.phase.set('short');}}
    else{this.session.update(v=>v+1);this.phase.set('work');}
    this.reset();
  }
  ngOnDestroy(){clearInterval(this.iv);}
}

// ─── Text to Speech ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-text-to-speech',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tts-main">
        <textarea [(ngModel)]="text" rows="6" placeholder="Type or paste text to convert to speech..." class="tts-area"></textarea>
        <div class="controls">
          <div class="ctrl-row">
            <div class="ctrl-field"><label>Voice</label>
              <select [(ngModel)]="selectedVoice" class="sel">
                <option *ngFor="let v of voices()" [value]="v.name">{{v.name}} ({{v.lang}})</option>
              </select>
            </div>
            <div class="ctrl-field"><label>Rate <span>{{rate}}x</span></label><input type="range" min="0.5" max="2" step="0.1" [(ngModel)]="rate" class="range" /></div>
            <div class="ctrl-field"><label>Pitch <span>{{pitch}}</span></label><input type="range" min="0" max="2" step="0.1" [(ngModel)]="pitch" class="range" /></div>
            <div class="ctrl-field"><label>Volume <span>{{volume}}</span></label><input type="range" min="0" max="1" step="0.1" [(ngModel)]="volume" class="range" /></div>
          </div>
          <div class="btn-row">
            <button class="btn-speak" (click)="speak()" [disabled]="!text||speaking()">{{speaking()?'🔊 Speaking...':'▶ Speak'}}</button>
            <button class="btn-pause" (click)="pauseResume()" *ngIf="speaking()">{{paused()?'▶ Resume':'⏸ Pause'}}</button>
            <button class="btn-stop" (click)="stop()" *ngIf="speaking()">⏹ Stop</button>
          </div>
        </div>
        <div class="char-count">{{text.length}} characters · {{wordCount()}} words</div>
        <div class="no-support" *ngIf="!supported()">⚠️ Your browser does not support Web Speech API. Try Chrome or Edge.</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .tts-main{display:flex;flex-direction:column;gap:1rem}
    .tts-area{width:100%;padding:.85rem;border:1px solid #d1d5db;border-radius:10px;font-size:.9rem;line-height:1.6;resize:vertical;outline:none;font-family:inherit;box-sizing:border-box}
    .tts-area:focus{border-color:#2563eb}
    .controls{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem}
    .ctrl-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem;margin-bottom:1rem}
    .ctrl-field{display:flex;flex-direction:column;gap:.3rem}
    .ctrl-field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .ctrl-field label span{font-weight:900;color:#2563eb}
    .sel{padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem}
    .range{accent-color:#2563eb;width:100%}
    .btn-row{display:flex;gap:.6rem;flex-wrap:wrap}
    .btn-speak,.btn-pause,.btn-stop{padding:.6rem 1.25rem;border:none;border-radius:9px;font-weight:700;cursor:pointer;font-size:.875rem}
    .btn-speak{background:#2563eb;color:white}.btn-speak:disabled{opacity:.5;cursor:not-allowed}
    .btn-pause{background:#f59e0b;color:white}
    .btn-stop{background:#dc2626;color:white}
    .char-count{font-size:.75rem;color:#9ca3af}
    .no-support{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:.75rem;color:#92400e;font-size:.82rem}
  `]
})
export class TextToSpeechComponent {
  text = ''; rate = 1; pitch = 1; volume = 1; selectedVoice = '';
  speaking = signal(false); paused = signal(false);
  voices = signal<SpeechSynthesisVoice[]>([]);
  supported = signal('speechSynthesis' in window);
  private utterance: SpeechSynthesisUtterance | null = null;

  ngOnInit() {
    if(!this.supported())return;
    const load=()=>{ const vs=speechSynthesis.getVoices();if(vs.length){this.voices.set(vs);this.selectedVoice=vs[0]?.name||'';} };
    load(); speechSynthesis.onvoiceschanged=load;
  }
  wordCount(){return this.text.trim()?this.text.trim().split(/\s+/).length:0;}
  speak(){
    if(!this.text||!this.supported())return;
    speechSynthesis.cancel();
    this.utterance=new SpeechSynthesisUtterance(this.text);
    const v=this.voices().find(v=>v.name===this.selectedVoice);
    if(v)this.utterance.voice=v;
    this.utterance.rate=this.rate;this.utterance.pitch=this.pitch;this.utterance.volume=this.volume;
    this.utterance.onstart=()=>{this.speaking.set(true);this.paused.set(false);};
    this.utterance.onend=()=>{this.speaking.set(false);this.paused.set(false);};
    this.utterance.onerror=()=>{this.speaking.set(false);};
    speechSynthesis.speak(this.utterance);
  }
  pauseResume(){if(this.paused()){speechSynthesis.resume();this.paused.set(false);}else{speechSynthesis.pause();this.paused.set(true);}}
  stop(){speechSynthesis.cancel();this.speaking.set(false);this.paused.set(false);}
}


// ─── base-converter.component.ts ────────────────────────────────────────────
@Component({
  selector: 'app-base-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="header-note">Convert numbers between Binary, Octal, Decimal, Hexadecimal, and any custom base (2–36).</div>
      <div class="input-section">
        <div class="inp-field">
          <label>Input Value</label>
          <input [(ngModel)]="inputVal" (ngModelChange)="convert()" class="inp mono big" placeholder="Enter a number..." [class.error]="hasError()" />
        </div>
        <div class="inp-field sm">
          <label>Input Base</label>
          <select [(ngModel)]="fromBase" (ngModelChange)="convert()" class="sel">
            <option value="2">Binary (2)</option>
            <option value="8">Octal (8)</option>
            <option value="10">Decimal (10)</option>
            <option value="16">Hexadecimal (16)</option>
            <option *ngFor="let b of customBases" [value]="b">Base {{b}}</option>
          </select>
        </div>
      </div>
      <div class="error-msg" *ngIf="hasError()">⚠️ Invalid characters for base {{fromBase}}</div>

      <div class="results-grid">
        <div class="res-card" *ngFor="let r of results()" [class.highlight]="r.highlight">
          <div class="rc-header">
            <span class="rc-name">{{r.name}}</span>
            <span class="rc-base">Base {{r.base}}</span>
          </div>
          <div class="rc-val mono">{{r.value||'—'}}</div>
          <div class="rc-actions">
            <button class="copy-btn" (click)="copy(r.value)" [disabled]="!r.value">📋 Copy</button>
            <button class="use-btn" (click)="useResult(r)" [disabled]="!r.value">Use</button>
          </div>
        </div>
      </div>

      <div class="custom-base-section">
        <div class="cb-title">Custom Base Conversion</div>
        <div class="cb-row">
          <div class="field"><label>To Base</label><input type="number" [(ngModel)]="customTo" min="2" max="36" class="sm-inp" /></div>
          <button class="btn-conv" (click)="convertCustom()">Convert</button>
          <div class="custom-result" *ngIf="customResult()"><span class="cr-label">Base {{customTo}}:</span><span class="cr-val mono">{{customResult()}}</span><button class="copy-btn" (click)="copy(customResult())">📋</button></div>
        </div>
      </div>

      <div class="bitwise-section" *ngIf="decimalVal() >= 0">
        <div class="cb-title">Bit Representation</div>
        <div class="bit-display">
          <span *ngFor="let bit of bits(); let i = index" class="bit" [class.one]="bit==='1'" [class.sep]="i>0&&(bits().length-i)%8===0">{{bit}}</span>
        </div>
        <div class="bit-meta">{{bits().length}} bits · {{Math.ceil(bits().length/8)}} bytes · {{decimalVal()}} decimal</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .header-note{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.65rem 1rem;font-size:.83rem;color:#1d4ed8;margin-bottom:1rem}
    .input-section{display:flex;gap:.75rem;align-items:flex-end;margin-bottom:.5rem;flex-wrap:wrap}
    .inp-field{display:flex;flex-direction:column;gap:.3rem;flex:1}.inp-field.sm{flex:0 0 180px}
    .inp-field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .inp{padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;outline:none;width:100%;box-sizing:border-box}
    .inp.big{font-size:1.1rem;font-weight:700}.inp.error{border-color:#dc2626;background:#fef2f2}
    .mono{font-family:monospace}.sel{padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;width:100%}
    .error-msg{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:6px;padding:.5rem .85rem;font-size:.82rem;margin-bottom:.75rem}
    .results-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem;margin-bottom:1.25rem}
    .res-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .res-card.highlight{background:#eff6ff;border-color:#93c5fd}
    .rc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem}
    .rc-name{font-size:.75rem;font-weight:800;color:#111827}.rc-base{font-size:.68rem;background:#e5e7eb;border-radius:99px;padding:.1rem .45rem;color:#6b7280;font-weight:600}
    .rc-val{font-size:.9rem;font-weight:700;color:#111827;word-break:break-all;margin-bottom:.5rem;min-height:1.3em}
    .rc-actions{display:flex;gap:.4rem}
    .copy-btn{padding:.2rem .55rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.68rem;font-weight:700}
    .copy-btn:disabled{opacity:.4;cursor:not-allowed}
    .use-btn{padding:.2rem .55rem;border:none;background:#eff6ff;border-radius:5px;cursor:pointer;font-size:.68rem;font-weight:700;color:#2563eb}
    .use-btn:disabled{opacity:.4;cursor:not-allowed}
    .custom-base-section,.bitwise-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem}
    .cb-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .cb-row{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
    .field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .sm-inp{width:60px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem}
    .btn-conv{background:#2563eb;color:white;border:none;padding:.45rem 1rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.82rem}
    .custom-result{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
    .cr-label{font-size:.78rem;font-weight:700;color:#6b7280}.cr-val{font-size:.88rem;font-weight:700;color:#111827}
    .bit-display{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:.5rem;font-family:monospace}
    .bit{font-size:.82rem;padding:.15rem .25rem;background:white;border:1px solid #e5e7eb;border-radius:3px;color:#6b7280;line-height:1}
    .bit.one{background:#1e3a5f;color:white;border-color:#1e3a5f}
    .bit.sep{margin-left:.4rem}
    .bit-meta{font-size:.72rem;color:#9ca3af;font-family:monospace}
  `]
})
export class BaseConverterComponent {
  Math=Math;
  inputVal='255';fromBase='10';customTo=36;
  hasError=signal(false);customResult=signal('');decimalVal=signal(-1);
  results=signal<{name:string,base:number,value:string,highlight:boolean}[]>([]);
  bits=signal<string[]>([]);
  customBases=[3,4,5,6,7,9,11,12,13,14,15,17,18,19,20,24,32,36];

  constructor(){this.convert();}

  convert(){
    if(!this.inputVal){this.results.set([]);this.hasError.set(false);this.decimalVal.set(-1);return;}
    try{
      const decimal=parseInt(this.inputVal,parseInt(this.fromBase));
      if(isNaN(decimal))throw new Error();
      this.hasError.set(false);
      this.decimalVal.set(decimal);
      this.results.set([
        {name:'Binary',base:2,value:decimal.toString(2),highlight:this.fromBase==='2'},
        {name:'Octal',base:8,value:decimal.toString(8),highlight:this.fromBase==='8'},
        {name:'Decimal',base:10,value:decimal.toString(10),highlight:this.fromBase==='10'},
        {name:'Hexadecimal',base:16,value:decimal.toString(16).toUpperCase(),highlight:this.fromBase==='16'},
        {name:'Base 32',base:32,value:decimal.toString(32).toUpperCase(),highlight:false},
        {name:'Base 36',base:36,value:decimal.toString(36).toUpperCase(),highlight:false},
      ]);
      this.bits.set(decimal.toString(2).split(''));
    }catch{this.hasError.set(true);this.results.set([]);this.decimalVal.set(-1);}
  }

  convertCustom(){
    try{
      const d=parseInt(this.inputVal,parseInt(this.fromBase));
      this.customResult.set(d.toString(this.customTo).toUpperCase());
    }catch{this.customResult.set('Error');}
  }

  useResult(r:{base:number,value:string}){
    this.inputVal=r.value;
    this.fromBase=String(r.base);
    this.convert();
  }
  copy(v:string){if(v)navigator.clipboard.writeText(v);}
}


// ─── morse-code-converter.component.ts ──────────────────────────────────────
const MORSE:Record<string,string>={
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
  'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
  'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','-':'-....-','@':'.--.-.','&':'.-...','(':'-.--.',')':'-.--.-',' ': ' '
};
const MORSE_REV:Record<string,string>=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

@Component({
  selector: 'app-morse-code-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button [class.active]="mode()==='encode'" (click)="mode.set('encode');convert()">Text → Morse</button>
        <button [class.active]="mode()==='decode'" (click)="mode.set('decode');convert()">Morse → Text</button>
      </div>

      <div class="io-layout">
        <div class="io-box">
          <label class="io-label">{{mode()==='encode'?'Enter Text':'Enter Morse Code'}}</label>
          <textarea [(ngModel)]="inputText" (ngModelChange)="convert()" class="io-textarea" [placeholder]="inputPlaceholder()" rows="5"></textarea>
          <div class="char-count">{{inputText.length}} characters</div>
        </div>
        <div class="io-middle">
          <button class="swap-btn" (click)="swap()">⇄ Swap</button>
        </div>
        <div class="io-box">
          <label class="io-label">{{mode()==='encode'?'Morse Code':'Decoded Text'}}</label>
          <textarea class="io-textarea output" [value]="outputText()" readonly rows="5"></textarea>
          <div class="io-actions">
            <button class="copy-btn" (click)="copy(outputText())" [disabled]="!outputText()">📋 Copy</button>
            <button class="play-btn" *ngIf="mode()==='encode' && outputText()" (click)="playMorse()">🔊 Play</button>
            <button class="stop-btn" *ngIf="isPlaying()" (click)="stopMorse()">⏹ Stop</button>
          </div>
        </div>
      </div>

      <div class="error-msg" *ngIf="errorMsg()">⚠️ {{errorMsg()}}</div>

      <!-- Visual Morse -->
      <div class="visual-morse" *ngIf="mode()==='encode' && visualMorse().length">
        <div class="vm-title">Visual Morse</div>
        <div class="vm-words">
          <div class="vm-word" *ngFor="let word of visualMorse()">
            <div class="vm-chars">
              <div class="vm-char" *ngFor="let ch of word">
                <div class="vm-letter">{{ch.letter}}</div>
                <div class="vm-dots">
                  <span *ngFor="let s of ch.symbols" class="vm-sym" [class.dash]="s==='-'" [class.dot]="s==='.'">{{s}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reference Table -->
      <div class="ref-section">
        <div class="ref-title">Morse Code Reference</div>
        <div class="ref-tabs">
          <button [class.active]="refTab()==='letters'" (click)="refTab.set('letters')">Letters</button>
          <button [class.active]="refTab()==='numbers'" (click)="refTab.set('numbers')">Numbers</button>
          <button [class.active]="refTab()==='punctuation'" (click)="refTab.set('punctuation')">Punctuation</button>
        </div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of filteredRef()" (click)="appendToInput(r.char)">
            <span class="ri-char">{{r.char}}</span><span class="ri-morse">{{r.morse}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.4rem;margin-bottom:1rem;background:#f3f4f6;border-radius:8px;padding:.3rem}
    .mode-tabs button{flex:1;padding:.4rem;border:none;background:none;border-radius:6px;font-size:.83rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .io-layout{display:grid;grid-template-columns:1fr auto 1fr;gap:.75rem;align-items:center;margin-bottom:1rem}
    @media(max-width:600px){.io-layout{grid-template-columns:1fr}}
    .io-box{display:flex;flex-direction:column;gap:.35rem}
    .io-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .io-textarea{width:100%;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.88rem;font-family:monospace;resize:none;outline:none;box-sizing:border-box}
    .io-textarea.output{background:#f8fafc;color:#374151}
    .char-count{font-size:.68rem;color:#9ca3af;text-align:right}
    .io-middle{display:flex;justify-content:center}
    .swap-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:.5rem .85rem;cursor:pointer;font-size:.82rem;font-weight:700}
    .io-actions{display:flex;gap:.4rem}
    .copy-btn{padding:.35rem .75rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.75rem;font-weight:700}
    .copy-btn:disabled{opacity:.4;cursor:not-allowed}
    .play-btn{background:#2563eb;color:white;border:none;padding:.35rem .85rem;border-radius:7px;cursor:pointer;font-size:.75rem;font-weight:700}
    .stop-btn{background:#dc2626;color:white;border:none;padding:.35rem .75rem;border-radius:7px;cursor:pointer;font-size:.75rem;font-weight:700}
    .error-msg{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:6px;padding:.5rem .85rem;font-size:.82rem;margin-bottom:.85rem}
    .visual-morse{background:#1e293b;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem}
    .vm-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:.75rem}
    .vm-words{display:flex;flex-wrap:wrap;gap:.85rem}
    .vm-chars{display:flex;gap:.5rem;flex-wrap:wrap}
    .vm-char{display:flex;flex-direction:column;align-items:center;gap:.2rem}
    .vm-letter{font-size:.78rem;font-weight:700;color:#94a3b8;text-transform:uppercase}
    .vm-dots{display:flex;gap:2px}
    .vm-sym{font-size:1rem;line-height:1}
    .vm-sym.dot{color:#60a5fa}.vm-sym.dash{color:#f472b6}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .ref-tabs{display:flex;gap:.35rem;margin-bottom:.6rem}
    .ref-tabs button{padding:.25rem .65rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600;color:#6b7280}
    .ref-tabs button.active{background:#2563eb;border-color:#2563eb;color:white}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:.35rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .5rem;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:.1rem}
    .ref-item:hover{border-color:#2563eb;background:#eff6ff}
    .ri-char{font-size:.9rem;font-weight:800;color:#111827}.ri-morse{font-size:.7rem;font-family:monospace;color:#6b7280}
  `]
})
export class MorseCodeConverterComponent {
  mode=signal<'encode'|'decode'>('encode');
  inputText='Hello World';outputText=signal('');errorMsg=signal('');
  isPlaying=signal(false);refTab=signal<'letters'|'numbers'|'punctuation'>('letters');
  visualMorse=signal<{letter:string,symbols:string[]}[][]>([]);
  private audioCtx:AudioContext|null=null;private stopFlag=false;

  constructor(){this.convert();}

  inputPlaceholder(){return this.mode()==='encode'?'Type text to convert to Morse code...':'Enter Morse code (. - / for letters, // for spaces)...';}

  filteredRef(){
    const all=Object.entries(MORSE).map(([k,v])=>({char:k,morse:v})).filter(x=>x.char!==' ');
    if(this.refTab()==='letters')return all.filter(x=>/[A-Z]/.test(x.char));
    if(this.refTab()==='numbers')return all.filter(x=>/[0-9]/.test(x.char));
    return all.filter(x=>/[^A-Z0-9]/.test(x.char));
  }

  convert(){
    this.errorMsg.set('');
    if(!this.inputText){this.outputText.set('');this.visualMorse.set([]);return;}
    if(this.mode()==='encode'){
      const result=this.inputText.toUpperCase().split('').map(c=>MORSE[c]||'').join(' ').replace(/  /g,' / ');
      this.outputText.set(result);
      this.buildVisual(this.inputText.toUpperCase());
    } else {
      const words=this.inputText.split(' / ');
      const result=words.map(w=>w.split(' ').map(c=>MORSE_REV[c]||'?').join('')).join(' ');
      this.outputText.set(result);
    }
  }

  buildVisual(text:string){
    const words:any[]=text.split(' ').map(word=>{
      return word.split('').map(c=>({letter:c,symbols:(MORSE[c]||'?').split('')}));
    });
    this.visualMorse.set(words);
  }

  swap(){
    const out=this.outputText();
    this.mode.update(m=>m==='encode'?'decode':'encode');
    this.inputText=out;
    this.convert();
  }

  async playMorse(){
    if(this.isPlaying())return;
    this.audioCtx=new AudioContext();this.isPlaying.set(true);this.stopFlag=false;
    const dot=100,dash=300,gap=100,charGap=300,wordGap=700;
    const morse=this.outputText();
    for(const sym of morse){
      if(this.stopFlag)break;
      if(sym==='.'){await this.beep(dot);await this.wait(gap);}
      else if(sym==='-'){await this.beep(dash);await this.wait(gap);}
      else if(sym===' '){
        const next=morse[morse.indexOf(sym)+1];
        await this.wait(next==='/'?wordGap:charGap);
      }
    }
    this.isPlaying.set(false);
  }

  beep(ms:number):Promise<void>{
    return new Promise(res=>{
      const o=this.audioCtx!.createOscillator();const g=this.audioCtx!.createGain();
      o.connect(g);g.connect(this.audioCtx!.destination);
      o.frequency.value=600;g.gain.value=0.3;
      o.start();setTimeout(()=>{o.stop();res();},ms);
    });
  }
  wait(ms:number):Promise<void>{return new Promise(res=>setTimeout(res,ms));}
  stopMorse(){this.stopFlag=true;this.isPlaying.set(false);}
  appendToInput(c:string){this.inputText+=c;this.convert();}
  copy(v:string){if(v)navigator.clipboard.writeText(v);}
}
