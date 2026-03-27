import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frame-rate-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='convert'" (click)="mode.set('convert')">Convert FPS</button>
        <button class="tab-btn" [class.active]="mode()==='frames'" (click)="mode.set('frames')">Frame Counter</button>
        <button class="tab-btn" [class.active]="mode()==='timecode'" (click)="mode.set('timecode')">Timecode</button>
      </div>

      <!-- CONVERT FPS -->
      <ng-container *ngIf="mode()==='convert'">
        <div class="main-input">
          <div class="mi-val">
            <input type="number" [(ngModel)]="inputFps" (input)="convertFps()" class="big-inp" placeholder="24" step="0.001" />
          </div>
          <div class="mi-unit">
            <span class="big-unit">fps</span>
          </div>
        </div>
        <div class="popular-row">
          <button *ngFor="let f of commonFps" class="pop-btn" (click)="inputFps=f;convertFps()">{{ f }} fps</button>
        </div>
        <div class="results-grid" *ngIf="fpsResults().length">
          <div class="result-item" *ngFor="let r of fpsResults()" [class.from-unit]="r.highlight">
            <span class="ri-unit">{{ r.label }}</span>
            <span class="ri-val">{{ r.value }}</span>
            <button class="ri-copy" (click)="copy(r.value,r.label)" [class.copied]="copiedKey()===r.label">{{ copiedKey()===r.label?'✓':'📋' }}</button>
          </div>
        </div>
      </ng-container>

      <!-- FRAME COUNTER -->
      <ng-container *ngIf="mode()==='frames'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Duration (seconds)</label>
            <input type="number" [(ngModel)]="fcDuration" (input)="countFrames()" class="inp-field" placeholder="10" />
          </div>
          <div class="input-group">
            <label class="inp-label">Frame Rate (fps)</label>
            <input type="number" [(ngModel)]="fcFps" (input)="countFrames()" class="inp-field" placeholder="24" />
          </div>
          <div class="input-group">
            <label class="inp-label">Start Frame</label>
            <input type="number" [(ngModel)]="fcStart" (input)="countFrames()" class="inp-field" placeholder="0" />
          </div>
        </div>
        <div class="result-card" *ngIf="fcResult()">
          <div class="rc-row"><span class="rc-label">Total Frames</span><span class="rc-val primary">{{ fcResult()!.totalFrames | number }}</span><button class="copy-btn" (click)="copy(fcResult()!.totalFrames+'','fc')" [class.copied]="copiedKey()==='fc'">{{ copiedKey()==='fc'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">End Frame</span><span class="rc-val">{{ fcResult()!.endFrame | number }}</span></div>
          <div class="rc-row"><span class="rc-label">Duration</span><span class="rc-val">{{ fcResult()!.durationStr }}</span></div>
          <div class="rc-row"><span class="rc-label">Frame interval</span><span class="rc-val">{{ fcResult()!.interval }} ms</span></div>
        </div>
      </ng-container>

      <!-- TIMECODE -->
      <ng-container *ngIf="mode()==='timecode'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Hours</label>
            <input type="number" [(ngModel)]="tcH" (input)="timecodeToSecs()" class="inp-field" placeholder="0" min="0" />
          </div>
          <div class="input-group">
            <label class="inp-label">Minutes</label>
            <input type="number" [(ngModel)]="tcM" (input)="timecodeToSecs()" class="inp-field" placeholder="0" min="0" max="59" />
          </div>
          <div class="input-group">
            <label class="inp-label">Seconds</label>
            <input type="number" [(ngModel)]="tcS" (input)="timecodeToSecs()" class="inp-field" placeholder="0" min="0" max="59" />
          </div>
          <div class="input-group">
            <label class="inp-label">Frames</label>
            <input type="number" [(ngModel)]="tcF" (input)="timecodeToSecs()" class="inp-field" placeholder="0" min="0" />
          </div>
          <div class="input-group">
            <label class="inp-label">Frame Rate (fps)</label>
            <input type="number" [(ngModel)]="tcFps" (input)="timecodeToSecs()" class="inp-field" placeholder="24" />
          </div>
        </div>
        <div class="result-card" *ngIf="tcResult()">
          <div class="rc-row"><span class="rc-label">Total Seconds</span><span class="rc-val primary">{{ tcResult()!.secs }}</span></div>
          <div class="rc-row"><span class="rc-label">Total Frames</span><span class="rc-val">{{ tcResult()!.frames | number }}</span></div>
          <div class="rc-row"><span class="rc-label">Timecode String</span><span class="rc-val accent">{{ tcResult()!.tc }}</span><button class="copy-btn" (click)="copy(tcResult()!.tc,'tc')" [class.copied]="copiedKey()==='tc'">{{ copiedKey()==='tc'?'✓':'📋' }}</button></div>
          <div class="rc-row"><span class="rc-label">Milliseconds</span><span class="rc-val">{{ tcResult()!.ms | number }} ms</span></div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Frame Rate Reference</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>FPS</th><th>Frame Interval</th><th>Common Use</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of fpsRef">
                <td><strong>{{ r.fps }}</strong></td><td>{{ r.interval }}</td><td>{{ r.use }}</td>
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
    .main-input{display:flex;gap:.85rem;align-items:center;padding:1.25rem;background:var(--primary-light);border-radius:14px;border:1.5px solid var(--primary)44}
    .mi-val{flex:1}
    .big-inp{width:100%;border:none;outline:none;background:transparent;font-size:2rem;font-weight:900;color:var(--primary);font-family:var(--font)}
    .big-unit{font-size:1.2rem;font-weight:800;color:var(--primary)}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .results-grid{display:flex;flex-direction:column;gap:.3rem}
    .result-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .55rem;border-radius:8px;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .result-item.from-unit{background:var(--primary-light);border:1px solid var(--primary)33}
    .ri-unit{font-size:.78rem;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ri-val{font-size:.85rem;font-weight:700;color:var(--text);white-space:nowrap}
    .result-item.from-unit .ri-val{color:var(--primary)}
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;flex-shrink:0;transition:color .15s}
    .ri-copy.copied{color:var(--green)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font);transition:border .15s}
    .inp-field:focus{border-color:var(--primary)}
    .result-card{background:var(--primary-light);border:1.5px solid var(--primary)33;border-radius:14px;padding:1rem 1.15rem;display:flex;flex-direction:column;gap:.55rem}
    .rc-row{display:flex;align-items:center;gap:.6rem}
    .rc-label{font-size:.75rem;color:var(--text-muted);font-weight:600;flex:1}
    .rc-val{font-size:.9rem;font-weight:800;color:var(--text)}
    .rc-val.primary{color:var(--primary);font-size:1.1rem}
    .rc-val.accent{color:var(--green);font-family:monospace}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;transition:color .15s}
    .copy-btn.copied{color:var(--green)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.settings-grid{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class FrameRateConverterComponent {
  mode = signal<'convert'|'frames'|'timecode'>('convert');
  inputFps: number = 24;
  copiedKey = signal('');
  fpsResults = signal<{label:string;value:string;highlight:boolean}[]>([]);
  fcDuration: number|null = 10; fcFps: number|null = 24; fcStart: number|null = 0;
  fcResult = signal<any>(null);
  tcH: number|null = 0; tcM: number|null = 1; tcS: number|null = 30; tcF: number|null = 12; tcFps: number|null = 24;
  tcResult = signal<any>(null);

  commonFps = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120];

  fpsRef = [
    {fps:'23.976 fps',interval:'41.7 ms',use:'Film standard (NTSC pulldown)'},
    {fps:'24 fps',interval:'41.7 ms',use:'Cinema, film production'},
    {fps:'25 fps',interval:'40 ms',use:'PAL TV (Europe, Australia)'},
    {fps:'29.97 fps',interval:'33.4 ms',use:'NTSC broadcast (US/Japan)'},
    {fps:'30 fps',interval:'33.3 ms',use:'Web video, streaming'},
    {fps:'48 fps',interval:'20.8 ms',use:'High Frame Rate cinema (HFR)'},
    {fps:'50 fps',interval:'20 ms',use:'PAL slow motion, sports'},
    {fps:'60 fps',interval:'16.7 ms',use:'Gaming, sports, smooth motion'},
    {fps:'120 fps',interval:'8.3 ms',use:'Super slow motion, displays'},
    {fps:'240 fps',interval:'4.2 ms',use:'Extreme slow motion cameras'},
  ];

  convertFps(){
    if(!this.inputFps){this.fpsResults.set([]);return;}
    const fps=this.inputFps;
    const interval=(1000/fps).toFixed(4);
    const results = [
      {label:`${fps} fps → interval`,value:`${interval} ms per frame`,highlight:true},
      {label:'Frames per minute',value:`${(fps*60).toFixed(0)} frames`,highlight:false},
      {label:'Frames per hour',value:`${(fps*3600).toFixed(0)} frames`,highlight:false},
      {label:'At 24fps: ratio',value:`${(fps/24).toFixed(4)}×`,highlight:false},
      {label:'At 25fps: ratio',value:`${(fps/25).toFixed(4)}×`,highlight:false},
      {label:'At 30fps: ratio',value:`${(fps/30).toFixed(4)}×`,highlight:false},
      {label:'At 60fps: ratio',value:`${(fps/60).toFixed(4)}×`,highlight:false},
      {label:'NTSC compatible',value:fps===29.97||fps===59.94||fps===23.976?'✅ Yes':'❌ No',highlight:false},
      {label:'PAL compatible',value:fps===25||fps===50?'✅ Yes':'❌ No',highlight:false},
    ];
    this.fpsResults.set(results);
  }

  countFrames(){
    if(!this.fcDuration||!this.fcFps){this.fcResult.set(null);return;}
    const totalFrames=Math.round(this.fcDuration*this.fcFps);
    const endFrame=(this.fcStart||0)+totalFrames-1;
    const h=Math.floor(this.fcDuration/3600),m=Math.floor((this.fcDuration%3600)/60),s=Math.floor(this.fcDuration%60);
    const durationStr=`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    const interval=(1000/this.fcFps).toFixed(2);
    this.fcResult.set({totalFrames,endFrame,durationStr,interval});
  }

  timecodeToSecs(){
    if(!this.tcFps){this.tcResult.set(null);return;}
    const h=this.tcH||0,m=this.tcM||0,s=this.tcS||0,f=this.tcF||0;
    const secs=h*3600+m*60+s+f/this.tcFps;
    const frames=Math.round(secs*this.tcFps);
    const ms=Math.round(secs*1000);
    const fStr=f.toString().padStart(2,'0');
    const tc=`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${fStr}`;
    this.tcResult.set({secs:secs.toFixed(4),frames,ms,tc});
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.convertFps();this.countFrames();this.timecodeToSecs();}
}
