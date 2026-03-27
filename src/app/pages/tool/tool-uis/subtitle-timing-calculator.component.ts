import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subtitle-timing-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='timing'" (click)="mode.set('timing')">Timing Calc</button>
        <button class="tab-btn" [class.active]="mode()==='adjust'" (click)="mode.set('adjust')">Shift Timing</button>
        <button class="tab-btn" [class.active]="mode()==='srt'" (click)="mode.set('srt')">SRT Parser</button>
      </div>

      <!-- TIMING CALC -->
      <ng-container *ngIf="mode()==='timing'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Word Count</label>
            <input type="number" [(ngModel)]="wordCount" (input)="calcTiming()" class="inp-field" placeholder="20" />
          </div>
          <div class="input-group">
            <label class="inp-label">Reading Speed (wpm)</label>
            <input type="number" [(ngModel)]="readingSpeed" (input)="calcTiming()" class="inp-field" placeholder="250" />
          </div>
          <div class="input-group">
            <label class="inp-label">Start Time (HH:MM:SS,ms)</label>
            <input type="text" [(ngModel)]="startTime" (input)="calcTiming()" class="inp-field" placeholder="00:00:05,000" />
          </div>
        </div>
        <div class="result-card" *ngIf="timingResult()">
          <div class="rc-row"><span class="rc-label">Display Duration</span><span class="rc-val primary">{{ timingResult()!.duration }}</span></div>
          <div class="rc-row"><span class="rc-label">End Timecode</span><span class="rc-val accent">{{ timingResult()!.endTime }}</span><button class="copy-btn" (click)="copy(timingResult()!.endTime,'et')" [class.copied]="copiedKey()==='et'">{{ copiedKey()==='et'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">SRT Entry</span><span class="rc-val" style="font-family:monospace;font-size:.78rem">{{ timingResult()!.srtLine }}</span></div>
          <div class="rc-row"><span class="rc-label">Characters/sec</span><span class="rc-val">{{ timingResult()!.cps }}</span></div>
        </div>
        <div class="popular-row" style="margin-top:.25rem">
          <span class="section-label">Reading Speed Presets</span>
          <div class="row-btns">
            <button *ngFor="let p of readingPresets" class="pop-btn" (click)="readingSpeed=p.wpm;calcTiming()">{{ p.label }} ({{ p.wpm }} wpm)</button>
          </div>
        </div>
      </ng-container>

      <!-- SHIFT TIMING -->
      <ng-container *ngIf="mode()==='adjust'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Original Start</label>
            <input type="text" [(ngModel)]="shiftStart" class="inp-field" placeholder="00:01:23,456" />
          </div>
          <div class="input-group">
            <label class="inp-label">Original End</label>
            <input type="text" [(ngModel)]="shiftEnd" class="inp-field" placeholder="00:01:26,789" />
          </div>
          <div class="input-group">
            <label class="inp-label">Shift Amount (ms)</label>
            <input type="number" [(ngModel)]="shiftMs" (input)="calcShift()" class="inp-field" placeholder="500 (+ or -)" />
          </div>
        </div>
        <button class="calc-btn" (click)="calcShift()">Calculate Shifted Timing</button>
        <div class="result-card" *ngIf="shiftResult()">
          <div class="rc-row"><span class="rc-label">New Start Time</span><span class="rc-val primary">{{ shiftResult()!.newStart }}</span><button class="copy-btn" (click)="copy(shiftResult()!.newStart,'ns')" [class.copied]="copiedKey()==='ns'">{{ copiedKey()==='ns'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">New End Time</span><span class="rc-val primary">{{ shiftResult()!.newEnd }}</span><button class="copy-btn" (click)="copy(shiftResult()!.newEnd,'ne')" [class.copied]="copiedKey()==='ne'">{{ copiedKey()==='ne'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">SRT Arrow Line</span><span class="rc-val accent" style="font-family:monospace;font-size:.78rem">{{ shiftResult()!.srtArrow }}</span></div>
          <div class="rc-row"><span class="rc-label">Duration (unchanged)</span><span class="rc-val">{{ shiftResult()!.duration }}</span></div>
        </div>
      </ng-container>

      <!-- SRT PARSER -->
      <ng-container *ngIf="mode()==='srt'">
        <div class="input-group">
          <label class="inp-label">Paste SRT Content</label>
          <textarea [(ngModel)]="srtInput" (input)="parseSrt()" class="srt-textarea" placeholder="1&#10;00:00:01,000 --> 00:00:04,500&#10;Hello, welcome to our video.&#10;&#10;2&#10;00:00:05,000 --> 00:00:08,000&#10;Today we'll cover the basics."></textarea>
        </div>
        <div class="srt-stats" *ngIf="srtEntries().length">
          <div class="stat-pill"><span>{{ srtEntries().length }}</span> subtitles</div>
          <div class="stat-pill"><span>{{ srtTotalWords() }}</span> words</div>
          <div class="stat-pill"><span>{{ srtTotalDuration() }}</span> total display time</div>
          <div class="stat-pill"><span>{{ srtAvgDuration() }}s</span> avg duration</div>
        </div>
        <div class="srt-list" *ngIf="srtEntries().length">
          <div class="srt-entry" *ngFor="let e of srtEntries()">
            <div class="srt-num">{{ e.num }}</div>
            <div class="srt-times">{{ e.start }} → {{ e.end }}</div>
            <div class="srt-text">{{ e.text }}</div>
            <div class="srt-meta">{{ e.words }} words • {{ e.durationMs }}ms</div>
          </div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Subtitle Standards</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Rule</th><th>Recommended Value</th><th>Reason</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of subtitleStandards">
                <td><strong>{{ r.rule }}</strong></td><td>{{ r.value }}</td><td>{{ r.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .tab-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .tab-btn{padding:.45rem 1rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.8rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .tab-btn.active{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font)}
    .inp-field:focus{border-color:var(--primary)}
    .result-card{background:var(--primary-light);border:1.5px solid var(--primary)33;border-radius:14px;padding:1rem 1.15rem;display:flex;flex-direction:column;gap:.55rem}
    .rc-row{display:flex;align-items:center;gap:.6rem}
    .rc-label{font-size:.75rem;color:var(--text-muted);font-weight:600;flex:1}
    .rc-val{font-size:.9rem;font-weight:800;color:var(--text)}
    .rc-val.primary{color:var(--primary);font-size:1.05rem}
    .rc-val.accent{color:var(--green)}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem}
    .copy-btn.copied{color:var(--green)}
    .popular-row{display:flex;flex-direction:column;gap:.5rem}
    .section-label{font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em}
    .row-btns{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .calc-btn{padding:.5rem 1.2rem;border-radius:99px;border:1.5px solid var(--primary);background:var(--primary-light);color:var(--primary);font-size:.82rem;font-weight:700;cursor:pointer;font-family:var(--font);width:fit-content}
    .srt-textarea{padding:.7rem .9rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.8rem;outline:none;font-family:monospace;min-height:130px;resize:vertical;width:100%;box-sizing:border-box}
    .srt-textarea:focus{border-color:var(--primary)}
    .srt-stats{display:flex;gap:.5rem;flex-wrap:wrap}
    .stat-pill{padding:.3rem .75rem;border-radius:99px;background:var(--primary-light);color:var(--primary);font-size:.75rem;font-weight:700}
    .stat-pill span{font-size:.88rem}
    .srt-list{display:flex;flex-direction:column;gap:.4rem;max-height:350px;overflow-y:auto}
    .srt-entry{border:1px solid var(--border);border-radius:8px;padding:.6rem .85rem;display:grid;grid-template-columns:28px 1fr;grid-template-rows:auto auto auto;gap:.2rem .6rem}
    .srt-num{font-size:.8rem;font-weight:800;color:var(--primary);grid-row:1/4;align-self:start;padding-top:.1rem}
    .srt-times{font-size:.72rem;color:var(--text-muted);font-family:monospace}
    .srt-text{font-size:.82rem;color:var(--text);font-weight:600}
    .srt-meta{font-size:.68rem;color:var(--text-muted)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.settings-grid{grid-template-columns:1fr}}
  `]
})
export class SubtitleTimingCalculatorComponent {
  mode = signal<'timing'|'adjust'|'srt'>('timing');
  wordCount: number|null = 20; readingSpeed: number|null = 250; startTime = '00:00:05,000';
  shiftStart = '00:01:23,456'; shiftEnd = '00:01:26,789'; shiftMs: number|null = 500;
  srtInput = '1\n00:00:01,000 --> 00:00:04,500\nHello, welcome to our video.\n\n2\n00:00:05,000 --> 00:00:08,000\nToday we will cover the basics.';
  copiedKey = signal('');
  timingResult = signal<any>(null);
  shiftResult = signal<any>(null);
  srtEntries = signal<any[]>([]);

  readingPresets = [
    {label:'Slow',wpm:160},{label:'Average',wpm:250},{label:'Fast',wpm:300},{label:'Expert',wpm:400},
  ];

  subtitleStandards = [
    {rule:'Max chars per line',value:'42 characters',reason:'Readability on all screen sizes'},
    {rule:'Max lines per subtitle',value:'2 lines',reason:'Avoid blocking too much of the screen'},
    {rule:'Min display time',value:'0.8 seconds',reason:'Viewer needs time to read'},
    {rule:'Max display time',value:'7 seconds',reason:'Avoid subtitle lingering too long'},
    {rule:'Reading speed (adult)',value:'250 wpm / 17 cps',reason:'Standard adult reading speed'},
    {rule:'Gap between subtitles',value:'≥ 2 frames',reason:'Avoids subtitle "flash"'},
    {rule:'Netflix standard',value:'17 cps max',reason:'Netflix subtitle guidelines'},
    {rule:'BBC standard',value:'3 lines max / 37 cps',reason:'UK broadcast standard'},
  ];

  parseTimeToMs(t:string):number{
    const m=t.replace(',','.').match(/(\d+):(\d+):(\d+)[.,](\d+)/);
    if(!m)return 0;
    return (parseInt(m[1])*3600+parseInt(m[2])*60+parseInt(m[3]))*1000+parseInt(m[4].padEnd(3,'0').slice(0,3));
  }

  msToSrtTime(ms:number):string{
    const h=Math.floor(ms/3600000),rem=ms%3600000;
    const m=Math.floor(rem/60000),s2=Math.floor((rem%60000)/1000),mill=ms%1000;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s2.toString().padStart(2,'0')},${mill.toString().padStart(3,'0')}`;
  }

  calcTiming(){
    if(!this.wordCount||!this.readingSpeed){this.timingResult.set(null);return;}
    const durationMs=Math.max(800,Math.round((this.wordCount/this.readingSpeed)*60*1000));
    const startMs=this.parseTimeToMs(this.startTime);
    const endMs=startMs+durationMs;
    const endTime=this.msToSrtTime(endMs);
    const cps=((this.wordCount*5)/durationMs*1000).toFixed(1);
    const srtLine=`${this.startTime} --> ${endTime}`;
    this.timingResult.set({
      duration:`${(durationMs/1000).toFixed(2)} seconds`,
      endTime,srtLine,cps:`${cps} chars/sec`
    });
  }

  calcShift(){
    if(!this.shiftMs)return;
    const s=this.parseTimeToMs(this.shiftStart);
    const e=this.parseTimeToMs(this.shiftEnd);
    const newStart=this.msToSrtTime(Math.max(0,s+(this.shiftMs)));
    const newEnd=this.msToSrtTime(Math.max(0,e+(this.shiftMs)));
    const dur=e-s;
    this.shiftResult.set({
      newStart,newEnd,
      srtArrow:`${newStart} --> ${newEnd}`,
      duration:`${(dur/1000).toFixed(3)}s`
    });
  }

  parseSrt(){
    const blocks=this.srtInput.trim().split(/\n\n+/);
    const entries=blocks.map(b=>{
      const lines=b.trim().split('\n');
      if(lines.length<2)return null;
      const num=parseInt(lines[0]);
      const timeLine=lines[1]||'';
      const timeParts=timeLine.split('-->').map(t=>t.trim());
      const text=lines.slice(2).join(' ');
      const startMs=this.parseTimeToMs(timeParts[0]||'');
      const endMs=this.parseTimeToMs(timeParts[1]||'');
      const durationMs=endMs-startMs;
      const words=text.split(/\s+/).filter(w=>w.length>0).length;
      return {num,start:timeParts[0],end:timeParts[1],text,words,durationMs};
    }).filter(Boolean);
    this.srtEntries.set(entries as any[]);
  }

  srtTotalWords():number{return this.srtEntries().reduce((a,e)=>a+e.words,0);}
  srtTotalDuration():string{const ms=this.srtEntries().reduce((a,e)=>a+e.durationMs,0);return `${(ms/1000).toFixed(1)}s`;}
  srtAvgDuration():string{const e=this.srtEntries();return e.length?(e.reduce((a,b)=>a+b.durationMs,0)/e.length/1000).toFixed(2):'0';}

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calcTiming();this.parseSrt();}
}
