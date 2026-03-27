import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-duration-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='add'" (click)="mode.set('add')">Add Durations</button>
        <button class="tab-btn" [class.active]="mode()==='convert'" (click)="mode.set('convert')">Convert Duration</button>
        <button class="tab-btn" [class.active]="mode()==='split'" (click)="mode.set('split')">Split Into Segments</button>
      </div>

      <!-- ADD DURATIONS -->
      <ng-container *ngIf="mode()==='add'">
        <div class="clips-list">
          <div class="clip-row" *ngFor="let clip of clips(); let i=index">
            <span class="clip-num">#{{ i+1 }}</span>
            <input type="text" [(ngModel)]="clip.label" class="clip-name-inp" placeholder="Clip name" />
            <input type="text" [(ngModel)]="clip.time" (input)="sumDurations()" class="clip-time-inp" placeholder="HH:MM:SS or seconds" />
            <button class="del-btn" (click)="removeClip(i)">✕</button>
          </div>
        </div>
        <button class="add-clip-btn" (click)="addClip()">+ Add Clip</button>
        <div class="result-card" *ngIf="sumResult()">
          <div class="rc-row"><span class="rc-label">Total Duration</span><span class="rc-val primary">{{ sumResult()!.hms }}</span><button class="copy-btn" (click)="copy(sumResult()!.hms,'sum')" [class.copied]="copiedKey()==='sum'">{{ copiedKey()==='sum'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">Total Seconds</span><span class="rc-val">{{ sumResult()!.totalSecs }}</span></div>
          <div class="rc-row"><span class="rc-label">Total Minutes</span><span class="rc-val">{{ sumResult()!.totalMins }}</span></div>
          <div class="rc-row"><span class="rc-label">Clips</span><span class="rc-val">{{ sumResult()!.count }}</span></div>
          <div class="rc-row"><span class="rc-label">Average Clip</span><span class="rc-val">{{ sumResult()!.avgClip }}</span></div>
        </div>
      </ng-container>

      <!-- CONVERT DURATION -->
      <ng-container *ngIf="mode()==='convert'">
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">Duration Value</label>
            <input type="number" [(ngModel)]="convValue" (input)="convertDuration()" class="inp-field" placeholder="90" />
          </div>
          <div class="input-group">
            <label class="inp-label">Input Unit</label>
            <select [(ngModel)]="convUnit" (change)="convertDuration()" class="inp-field">
              <option value="s">Seconds</option>
              <option value="m">Minutes</option>
              <option value="h">Hours</option>
              <option value="frames24">{{'Frames @ 24fps'}}</option>
              <option value="frames25">{{'Frames @ 25fps'}}</option>
              <option value="frames30">{{'Frames @ 30fps'}}</option>
              <option value="frames60">{{'Frames @ 60fps'}}</option>
              <option value="ms">{{'Milliseconds'}}</option>
            </select>
          </div>
        </div>
        <div class="results-grid" *ngIf="convResult().length">
          <div class="result-item" *ngFor="let r of convResult()" [class.from-unit]="r.highlight">
            <span class="ri-unit">{{ r.label }}</span>
            <span class="ri-val">{{ r.value }}</span>
            <button class="ri-copy" (click)="copy(r.value,r.label)" [class.copied]="copiedKey()===r.label">{{ copiedKey()===r.label?'✓':'📋' }}</button>
          </div>
        </div>
      </ng-container>

      <!-- SPLIT INTO SEGMENTS -->
      <ng-container *ngIf="mode()==='split'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Total Duration (HH:MM:SS)</label>
            <input type="text" [(ngModel)]="splitTotal" (input)="calcSplit()" class="inp-field" placeholder="01:30:00" />
          </div>
          <div class="input-group">
            <label class="inp-label">Number of Segments</label>
            <input type="number" [(ngModel)]="splitCount" (input)="calcSplit()" class="inp-field" placeholder="5" min="1" />
          </div>
          <div class="input-group">
            <label class="inp-label">Overlap (seconds)</label>
            <input type="number" [(ngModel)]="splitOverlap" (input)="calcSplit()" class="inp-field" placeholder="0" min="0" />
          </div>
        </div>
        <div class="segments-list" *ngIf="segments().length">
          <div class="seg-header">
            <span>Segment</span><span>Start</span><span>End</span><span>Duration</span>
          </div>
          <div class="seg-row" *ngFor="let s of segments()">
            <span class="seg-num">{{ s.num }}</span>
            <span class="seg-time">{{ s.start }}</span>
            <span class="seg-time">{{ s.end }}</span>
            <span class="seg-dur">{{ s.dur }}</span>
          </div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Duration Quick Reference</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Duration</th><th>Seconds</th><th>{{'Frames @24fps'}}</th><th>{{'Frames @30fps'}}</th><th>{{'Frames @60fps'}}</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of durationRef">
                <td><strong>{{ r.label }}</strong></td>
                <td>{{ r.secs }}</td>
                <td>{{ r.f24 | number }}</td>
                <td>{{ r.f30 | number }}</td>
                <td>{{ r.f60 | number }}</td>
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
    .clips-list{display:flex;flex-direction:column;gap:.4rem}
    .clip-row{display:grid;grid-template-columns:32px 1fr 160px 28px;align-items:center;gap:.5rem}
    .clip-num{font-size:.75rem;color:var(--text-muted);font-weight:700;text-align:center}
    .clip-name-inp,.clip-time-inp{padding:.5rem .75rem;border:1.5px solid var(--border);border-radius:8px;background:var(--card-bg);color:var(--text);font-size:.85rem;outline:none;font-family:var(--font)}
    .clip-name-inp:focus,.clip-time-inp:focus{border-color:var(--primary)}
    .del-btn{background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:var(--text-muted);font-size:.75rem;padding:.2rem .4rem;transition:all .15s}
    .del-btn:hover{border-color:#f55;color:#f55}
    .add-clip-btn{padding:.5rem 1rem;border-radius:99px;border:1.5px dashed var(--border);background:transparent;color:var(--primary);font-size:.8rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s;width:fit-content}
    .add-clip-btn:hover{background:var(--primary-light);border-style:solid}
    .result-card{background:var(--primary-light);border:1.5px solid var(--primary)33;border-radius:14px;padding:1rem 1.15rem;display:flex;flex-direction:column;gap:.55rem}
    .rc-row{display:flex;align-items:center;gap:.6rem}
    .rc-label{font-size:.75rem;color:var(--text-muted);font-weight:600;flex:1}
    .rc-val{font-size:.9rem;font-weight:800;color:var(--text)}
    .rc-val.primary{color:var(--primary);font-size:1.1rem;font-family:monospace}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem}
    .copy-btn.copied{color:var(--green)}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font)}
    .inp-field:focus{border-color:var(--primary)}
    .results-grid{display:flex;flex-direction:column;gap:.3rem}
    .result-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .55rem;border-radius:8px;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .result-item.from-unit{background:var(--primary-light);border:1px solid var(--primary)33}
    .ri-unit{font-size:.78rem;color:var(--text-muted);flex:1}
    .ri-val{font-size:.85rem;font-weight:700;color:var(--text);white-space:nowrap;font-family:monospace}
    .result-item.from-unit .ri-val{color:var(--primary)}
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem}
    .ri-copy.copied{color:var(--green)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .segments-list{border:1px solid var(--border);border-radius:10px;overflow:hidden}
    .seg-header{display:grid;grid-template-columns:40px 1fr 1fr 1fr;padding:.45rem .75rem;background:var(--bg-alt);font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;border-bottom:1px solid var(--border)}
    .seg-row{display:grid;grid-template-columns:40px 1fr 1fr 1fr;padding:.4rem .75rem;border-bottom:1px solid var(--border);font-size:.82rem}
    .seg-row:last-child{border-bottom:none}
    .seg-row:hover{background:var(--bg-alt)}
    .seg-num{font-weight:700;color:var(--primary)}
    .seg-time,.seg-dur{font-family:monospace;color:var(--text)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.two-col{grid-template-columns:1fr}.settings-grid{grid-template-columns:1fr}.clip-row{grid-template-columns:24px 1fr 100px 24px}}
  `]
})
export class DurationCalculatorComponent {
  mode = signal<'add'|'convert'|'split'>('add');
  clips = signal<{label:string;time:string}[]>([
    {label:'Intro',time:'00:00:15'},{label:'Main Content',time:'00:05:30'},{label:'Outro',time:'00:00:10'},
  ]);
  copiedKey = signal('');
  sumResult = signal<any>(null);
  convValue: number|null = 90; convUnit = 's';
  convResult = signal<{label:string;value:string;highlight:boolean}[]>([]);
  splitTotal = '01:30:00'; splitCount: number|null = 5; splitOverlap: number|null = 0;
  segments = signal<any[]>([]);

  durationRef = [
    {label:'1 second',secs:1,f24:24,f30:30,f60:60},
    {label:'10 seconds',secs:10,f24:240,f30:300,f60:600},
    {label:'1 minute',secs:60,f24:1440,f30:1800,f60:3600},
    {label:'5 minutes',secs:300,f24:7200,f30:9000,f60:18000},
    {label:'10 minutes',secs:600,f24:14400,f30:18000,f60:36000},
    {label:'30 minutes',secs:1800,f24:43200,f30:54000,f60:108000},
    {label:'1 hour',secs:3600,f24:86400,f30:108000,f60:216000},
    {label:'2 hours',secs:7200,f24:172800,f30:216000,f60:432000},
  ];

  parseTime(t:string):number{
    if(!t)return 0;
    const trimmed=t.trim();
    if(/^\d+(\.\d+)?$/.test(trimmed))return parseFloat(trimmed);
    const parts=trimmed.split(':').map(Number);
    if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
    if(parts.length===2)return parts[0]*60+parts[1];
    return 0;
  }

  secsToHms(s:number):string{
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  sumDurations(){
    const list=this.clips();
    const totalSecs=list.reduce((acc,c)=>acc+this.parseTime(c.time),0);
    if(totalSecs===0){this.sumResult.set(null);return;}
    const count=list.filter(c=>this.parseTime(c.time)>0).length;
    const avgSec=count>0?totalSecs/count:0;
    this.sumResult.set({
      hms:this.secsToHms(totalSecs),
      totalSecs:totalSecs.toFixed(2),
      totalMins:(totalSecs/60).toFixed(2),
      count,
      avgClip:this.secsToHms(avgSec)
    });
  }

  addClip(){this.clips.update(c=>[...c,{label:`Clip ${c.length+1}`,time:''}]);}
  removeClip(i:number){this.clips.update(c=>c.filter((_,idx)=>idx!==i));this.sumDurations();}

  convertDuration(){
    if(!this.convValue){this.convResult.set([]);return;}
    let secs=this.convValue;
    if(this.convUnit==='m')secs*=60;
    else if(this.convUnit==='h')secs*=3600;
    else if(this.convUnit==='frames24')secs/=24;
    else if(this.convUnit==='frames25')secs/=25;
    else if(this.convUnit==='frames30')secs/=30;
    else if(this.convUnit==='frames60')secs/=60;
    else if(this.convUnit==='ms')secs/=1000;
    const results=[
      {label:'HH:MM:SS timecode',value:this.secsToHms(secs),highlight:true},
      {label:'Total seconds',value:`${secs.toFixed(4)} s`,highlight:false},
      {label:'Total minutes',value:`${(secs/60).toFixed(4)} min`,highlight:false},
      {label:'Total hours',value:`${(secs/3600).toFixed(6)} h`,highlight:false},
      {label:'Milliseconds',value:`${Math.round(secs*1000).toLocaleString()} ms`,highlight:false},
      {label:'Frames @ 24fps',value:`${Math.round(secs*24).toLocaleString()} frames`,highlight:false},
      {label:'Frames @ 25fps',value:`${Math.round(secs*25).toLocaleString()} frames`,highlight:false},
      {label:'Frames @ 30fps',value:`${Math.round(secs*30).toLocaleString()} frames`,highlight:false},
      {label:'Frames @ 60fps',value:`${Math.round(secs*60).toLocaleString()} frames`,highlight:false},
    ];
    this.convResult.set(results);
  }

  calcSplit(){
    const totalSecs=this.parseTime(this.splitTotal);
    if(!totalSecs||!this.splitCount||this.splitCount<1){this.segments.set([]);return;}
    const overlap=this.splitOverlap||0;
    const segDur=totalSecs/this.splitCount;
    const segs=[];
    for(let i=0;i<this.splitCount;i++){
      const start=Math.max(0,i*segDur-overlap);
      const end=Math.min(totalSecs,(i+1)*segDur+overlap);
      segs.push({num:i+1,start:this.secsToHms(start),end:this.secsToHms(end),dur:this.secsToHms(end-start)});
    }
    this.segments.set(segs);
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.sumDurations();this.convertDuration();this.calcSplit();}
}
