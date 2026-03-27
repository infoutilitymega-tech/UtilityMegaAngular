import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bitrate-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-input">
        <div class="mi-val">
          <input type="number" [(ngModel)]="duration" (input)="calc()" class="big-inp" placeholder="60" />
        </div>
        <div class="mi-unit">
          <select [(ngModel)]="durationUnit" (change)="calc()" class="unit-sel">
            <option value="s">Seconds</option>
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
          </select>
        </div>
      </div>

      <div class="popular-row">
        <button *ngFor="let p of durationPresets" class="pop-btn" (click)="applyDuration(p)">{{ p.label }}</button>
      </div>

      <div class="settings-grid">
        <div class="input-group">
          <label class="inp-label">Video Bitrate (Mbps)</label>
          <input type="number" [(ngModel)]="videoBitrate" (input)="calc()" class="inp-field" placeholder="8" step="0.1"/>
        </div>
        <div class="input-group">
          <label class="inp-label">Audio Bitrate (kbps)</label>
          <input type="number" [(ngModel)]="audioBitrate" (input)="calc()" class="inp-field" placeholder="192" />
        </div>
        <div class="input-group">
          <label class="inp-label">Overhead %</label>
          <input type="number" [(ngModel)]="overhead" (input)="calc()" class="inp-field" placeholder="5" />
        </div>
      </div>

      <div class="results-section" *ngIf="result()">
        <div class="results-title">File Size Estimate</div>
        <div class="results-grid">
          <div class="group-section">
            <div class="group-title">📦 File Size</div>
            <div class="result-item" *ngFor="let s of result()!.sizes" [class.from-unit]="s.highlight">
              <span class="ri-unit">{{ s.label }}</span>
              <span class="ri-val">{{ s.value }}</span>
              <button class="ri-copy" (click)="copy(s.value, s.label)" [class.copied]="copiedKey()===s.label">{{ copiedKey()===s.label?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">📊 Breakdown</div>
            <div class="result-item">
              <span class="ri-unit">Video data</span>
              <span class="ri-val">{{ result()!.videoSize }}</span>
            </div>
            <div class="result-item">
              <span class="ri-unit">Audio data</span>
              <span class="ri-val">{{ result()!.audioSize }}</span>
            </div>
            <div class="result-item">
              <span class="ri-unit">Container overhead</span>
              <span class="ri-val">{{ result()!.overheadSize }}</span>
            </div>
            <div class="result-item from-unit">
              <span class="ri-unit">Total (MB)</span>
              <span class="ri-val">{{ result()!.totalMB }} MB</span>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">💾 Storage Fits On</div>
            <div class="result-item" *ngFor="let s of result()!.storage">
              <span class="ri-unit">{{ s.label }}</span>
              <span class="ri-val" [class.accent]="s.fits">{{ s.fits ? '✅ ' + s.count + ' copies' : '❌ Too large' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Recommended Bitrates by Platform</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Platform / Quality</th><th>Resolution</th><th>Video Bitrate</th><th>Audio Bitrate</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of bitrateRef">
                <td><strong>{{ r.platform }}</strong></td>
                <td>{{ r.res }}</td>
                <td>{{ r.video }}</td>
                <td>{{ r.audio }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .main-input{display:flex;gap:.85rem;align-items:center;padding:1.25rem;background:var(--primary-light);border-radius:14px;border:1.5px solid var(--primary)44}
    .mi-val{flex:1}
    .big-inp{width:100%;border:none;outline:none;background:transparent;font-size:2rem;font-weight:900;color:var(--primary);font-family:var(--font)}
    .mi-unit{flex-shrink:0}
    .unit-sel{padding:.6rem 1rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.88rem;outline:none;font-family:var(--font)}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font);transition:border .15s}
    .inp-field:focus{border-color:var(--primary)}
    .results-title{font-size:.83rem;font-weight:700;color:var(--text-muted)}
    .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .group-section{display:flex;flex-direction:column;gap:.3rem}
    .group-title{font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;padding:.2rem 0;border-bottom:1px solid var(--border);margin-bottom:.2rem}
    .result-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .55rem;border-radius:8px;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .result-item.from-unit{background:var(--primary-light);border:1px solid var(--primary)33}
    .ri-unit{font-size:.78rem;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ri-val{font-size:.85rem;font-weight:700;color:var(--text);white-space:nowrap}
    .result-item.from-unit .ri-val{color:var(--primary)}
    .ri-val.accent{color:var(--green)}
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;flex-shrink:0;transition:color .15s}
    .ri-copy.copied{color:var(--green)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.settings-grid{grid-template-columns:1fr}.results-grid{grid-template-columns:1fr}}
  `]
})
export class BitrateCalculatorComponent {
  duration: number|null = 60;
  durationUnit = 'm';
  videoBitrate: number|null = 8;
  audioBitrate: number|null = 192;
  overhead: number|null = 5;
  copiedKey = signal('');
  result = signal<any>(null);

  durationPresets = [
    {label:'30 sec',v:30,u:'s'},{label:'1 min',v:1,u:'m'},{label:'5 min',v:5,u:'m'},
    {label:'10 min',v:10,u:'m'},{label:'30 min',v:30,u:'m'},{label:'1 hour',v:1,u:'h'},
    {label:'2 hours',v:2,u:'h'},
  ];

  bitrateRef = [
    {platform:'YouTube 4K 60fps',res:'3840×2160',video:'35–45 Mbps',audio:'320 kbps'},
    {platform:'YouTube 1080p 60fps',res:'1920×1080',video:'8–12 Mbps',audio:'192 kbps'},
    {platform:'YouTube 720p 30fps',res:'1280×720',video:'2.5–4 Mbps',audio:'128 kbps'},
    {platform:'TikTok / Reels',res:'1080×1920',video:'6–8 Mbps',audio:'128 kbps'},
    {platform:'Instagram Feed',res:'1080×1080',video:'3.5 Mbps',audio:'128 kbps'},
    {platform:'Twitter/X Video',res:'1920×1080',video:'5 Mbps',audio:'128 kbps'},
    {platform:'Blu-ray (1080p)',res:'1920×1080',video:'25–40 Mbps',audio:'640 kbps'},
    {platform:'DVD Video',res:'720×480',video:'4–8 Mbps',audio:'192 kbps'},
    {platform:'Web streaming (HD)',res:'1920×1080',video:'4–6 Mbps',audio:'128 kbps'},
  ];

  applyDuration(p:{v:number;u:string}){this.duration=p.v;this.durationUnit=p.u;this.calc();}

  calc(){
    if(!this.duration||!this.videoBitrate||!this.audioBitrate) {this.result.set(null);return;}
    const mult = this.durationUnit==='s'?1:this.durationUnit==='m'?60:3600;
    const secs = this.duration * mult;
    const vBitsPerSec = this.videoBitrate * 1_000_000;
    const aBitsPerSec = this.audioBitrate * 1_000;
    const videoBytes = vBitsPerSec * secs / 8;
    const audioBytes = aBitsPerSec * secs / 8;
    const oh = (this.overhead||0)/100;
    const overheadBytes = (videoBytes+audioBytes)*oh;
    const totalBytes = videoBytes+audioBytes+overheadBytes;
    const totalMB = (totalBytes/1_000_000).toFixed(1);
    const totalGB = (totalBytes/1_000_000_000).toFixed(3);
    const totalGiB = (totalBytes/(1024**3)).toFixed(3);

    const fmtBytes=(b:number)=>b>1e9?`${(b/1e9).toFixed(2)} GB`:b>1e6?`${(b/1e6).toFixed(1)} MB`:`${(b/1e3).toFixed(0)} KB`;

    this.result.set({
      totalMB,
      sizes:[
        {label:'Megabytes (MB)',value:`${totalMB} MB`,highlight:true},
        {label:'Gigabytes (GB)',value:`${totalGB} GB`,highlight:false},
        {label:'Gibibytes (GiB)',value:`${totalGiB} GiB`,highlight:false},
        {label:'Bits',value:`${(totalBytes*8/1e9).toFixed(2)} Gbits`,highlight:false},
      ],
      videoSize: fmtBytes(videoBytes),
      audioSize: fmtBytes(audioBytes),
      overheadSize: fmtBytes(overheadBytes),
      storage:[
        {label:'4 GB USB Drive',fits:totalBytes<4e9,count:Math.floor(4e9/totalBytes)},
        {label:'16 GB USB Drive',fits:totalBytes<16e9,count:Math.floor(16e9/totalBytes)},
        {label:'64 GB SD Card',fits:totalBytes<64e9,count:Math.floor(64e9/totalBytes)},
        {label:'256 GB SSD',fits:totalBytes<256e9,count:Math.floor(256e9/totalBytes)},
        {label:'1 TB Hard Drive',fits:totalBytes<1e12,count:Math.floor(1e12/totalBytes)},
      ],
    });
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calc();}
}
