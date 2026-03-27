import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compression-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="settings-section">
        <div class="section-title">🎬 Video Settings</div>
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Codec</label>
            <select [(ngModel)]="codec" (change)="calc()" class="inp-field">
              <option value="h264">H.264 / AVC</option>
              <option value="h265">H.265 / HEVC</option>
              <option value="av1">AV1</option>
              <option value="vp9">VP9</option>
              <option value="prores">Apple ProRes</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Resolution</label>
            <select [(ngModel)]="resolution" (change)="calc()" class="inp-field">
              <option value="7680x4320">8K (7680×4320)</option>
              <option value="3840x2160">4K (3840×2160)</option>
              <option value="2560x1440">2K (2560×1440)</option>
              <option value="1920x1080">1080p (1920×1080)</option>
              <option value="1280x720">720p (1280×720)</option>
              <option value="854x480">480p (854×480)</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Frame Rate (fps)</label>
            <select [(ngModel)]="framerate" (change)="calc()" class="inp-field">
              <option value="24">24 fps</option>
              <option value="25">25 fps</option>
              <option value="30">30 fps</option>
              <option value="48">48 fps</option>
              <option value="50">50 fps</option>
              <option value="60">60 fps</option>
              <option value="120">120 fps</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Target Quality</label>
            <select [(ngModel)]="quality" (change)="calc()" class="inp-field">
              <option value="archive">Archival (lossless)</option>
              <option value="high">High Quality</option>
              <option value="medium">Medium (Streaming)</option>
              <option value="low">Low (Mobile / Proxy)</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Duration (minutes)</label>
            <input type="number" [(ngModel)]="durationMin" (input)="calc()" class="inp-field" placeholder="10" min="1" />
          </div>
          <div class="input-group">
            <label class="inp-label">Audio Channels</label>
            <select [(ngModel)]="audioChannels" (change)="calc()" class="inp-field">
              <option value="mono">Mono</option>
              <option value="stereo">Stereo</option>
              <option value="51">5.1 Surround</option>
              <option value="71">7.1 Surround</option>
            </select>
          </div>
        </div>
      </div>

      <div class="result-section" *ngIf="result()">
        <div class="rec-banner">
          <div class="rec-title">✅ Recommended Settings</div>
          <div class="rec-grid">
            <div class="rec-item" *ngFor="let r of result()!.settings">
              <span class="rec-lbl">{{ r.label }}</span>
              <span class="rec-val">{{ r.value }}</span>
              <button class="copy-btn" (click)="copy(r.value,r.label)" [class.copied]="copiedKey()===r.label">{{ copiedKey()===r.label?'✓':'📋' }}</button>
            </div>
          </div>
        </div>

        <div class="results-grid">
          <div class="group-section">
            <div class="group-title">📦 Output Estimates</div>
            <div class="result-item from-unit">
              <span class="ri-unit">Est. File Size</span>
              <span class="ri-val">{{ result()!.fileSize }}</span>
            </div>
            <div class="result-item"><span class="ri-unit">Video Bitrate</span><span class="ri-val">{{ result()!.videoBitrate }}</span></div>
            <div class="result-item"><span class="ri-unit">Audio Bitrate</span><span class="ri-val">{{ result()!.audioBitrate }}</span></div>
            <div class="result-item"><span class="ri-unit">Total Bitrate</span><span class="ri-val">{{ result()!.totalBitrate }}</span></div>
          </div>
          <div class="group-section">
            <div class="group-title">⚙️ Encoding Params</div>
            <div class="result-item" *ngFor="let p of result()!.params">
              <span class="ri-unit">{{ p.label }}</span>
              <span class="ri-val accent">{{ p.value }}</span>
              <button class="ri-copy" (click)="copy(p.value,p.label)" [class.copied]="copiedKey()===p.label">{{ copiedKey()===p.label?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🖥️ Platform Suitability</div>
            <div class="result-item" *ngFor="let p of result()!.platforms">
              <span class="ri-unit">{{ p.name }}</span>
              <span class="ri-val" [class.accent]="p.ok">{{ p.ok?'✅ Suitable':'⚠️ Check settings' }}</span>
            </div>
          </div>
        </div>

        <div class="ffmpeg-box">
          <div class="ffmpeg-title">🔧 Example FFmpeg Command</div>
          <div class="ffmpeg-cmd">{{ result()!.ffmpeg }}</div>
          <button class="ffmpeg-copy" (click)="copy(result()!.ffmpeg,'ffmpeg')" [class.copied]="copiedKey()==='ffmpeg'">{{ copiedKey()==='ffmpeg'?'✓ Copied':'📋 Copy Command' }}</button>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 CRF / Quality Reference (H.264)</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>CRF Value</th><th>Quality Level</th><th>File Size</th><th>Use Case</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of crfRef">
                <td><strong>{{ r.crf }}</strong></td><td>{{ r.quality }}</td><td>{{ r.size }}</td><td>{{ r.use }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .settings-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .section-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem;padding:1rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.88rem;outline:none;font-family:var(--font)}
    .inp-field:focus{border-color:var(--primary)}
    .rec-banner{background:var(--primary-light);border:1.5px solid var(--primary)33;border-radius:14px;padding:1rem 1.15rem}
    .rec-title{font-size:.8rem;font-weight:800;color:var(--primary);margin-bottom:.65rem;text-transform:uppercase;letter-spacing:.04em}
    .rec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}
    .rec-item{display:flex;align-items:center;gap:.4rem;padding:.3rem .5rem;background:#fff2;border-radius:6px}
    .rec-lbl{font-size:.72rem;color:var(--text-muted);flex:1}
    .rec-val{font-size:.8rem;font-weight:700;color:var(--text);white-space:nowrap;font-family:monospace}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.75rem;padding:.1rem .2rem}
    .copy-btn.copied{color:var(--green)}
    .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .group-section{display:flex;flex-direction:column;gap:.3rem}
    .group-title{font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;padding:.2rem 0;border-bottom:1px solid var(--border);margin-bottom:.2rem}
    .result-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .55rem;border-radius:8px;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .result-item.from-unit{background:var(--primary-light);border:1px solid var(--primary)33}
    .ri-unit{font-size:.78rem;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ri-val{font-size:.85rem;font-weight:700;color:var(--text);white-space:nowrap}
    .result-item.from-unit .ri-val{color:var(--primary)}
    .ri-val.accent{color:var(--green);font-family:monospace}
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem}
    .ri-copy.copied{color:var(--green)}
    .ffmpeg-box{background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem}
    .ffmpeg-title{font-size:.75rem;font-weight:700;color:var(--text-muted);margin-bottom:.5rem}
    .ffmpeg-cmd{font-family:monospace;font-size:.78rem;color:var(--text);word-break:break-all;background:var(--card-bg);border-radius:6px;padding:.6rem .75rem;border:1px solid var(--border)}
    .ffmpeg-copy{margin-top:.5rem;padding:.35rem .85rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font)}
    .ffmpeg-copy.copied{color:var(--green);border-color:var(--green)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.settings-grid{grid-template-columns:repeat(2,1fr)}.results-grid{grid-template-columns:1fr}.rec-grid{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class CompressionCalculatorComponent {
  codec = 'h264'; resolution = '1920x1080'; framerate = '30';
  quality = 'medium'; durationMin: number|null = 10; audioChannels = 'stereo';
  copiedKey = signal('');
  result = signal<any>(null);

  crfRef = [
    {crf:'0',quality:'Lossless',size:'Huge',use:'Archival, master copy'},
    {crf:'18',quality:'Visually Lossless',size:'Very Large',use:'High-end production'},
    {crf:'23',quality:'High (default)',size:'Large',use:'Standard production'},
    {crf:'28',quality:'Good',size:'Medium',use:'Streaming, online video'},
    {crf:'32',quality:'Acceptable',size:'Small',use:'Preview, proxy files'},
    {crf:'40+',quality:'Poor',size:'Very Small',use:'Preview only'},
  ];

  calc(){
    const [w,h]=this.resolution.split('x').map(Number);
    const fps=parseInt(this.framerate);
    const dur=(this.durationMin||10)*60;
    const pixels=w*h;

    const codecMultipliers:Record<string,number>={h264:1,h265:0.5,av1:0.4,vp9:0.6,prores:8};
    const qualityMultipliers:Record<string,{crf:string;mult:number}>={
      archive:{crf:'0',mult:4},high:{crf:'18',mult:2},medium:{crf:'23',mult:1},low:{crf:'28',mult:0.4}
    };
    const baseBitrate=pixels*fps*0.0015/1e6;
    const vm=baseBitrate*codecMultipliers[this.codec]*(qualityMultipliers[this.quality].mult);
    const audioBitrates:Record<string,number>={mono:96,stereo:192,'51':384,'71':512};
    const ab=audioBitrates[this.audioChannels];
    const totalBitsPerSec=(vm*1e6+ab*1e3);
    const fileSizeBytes=totalBitsPerSec*dur/8;
    const fmtSize=(b:number)=>b>1e9?`${(b/1e9).toFixed(1)} GB`:`${(b/1e6).toFixed(0)} MB`;

    const codecParams:Record<string,{crf:string;preset:string;enc:string}>={
      h264:{crf:qualityMultipliers[this.quality].crf,preset:this.quality==='archive'||this.quality==='high'?'slow':'medium',enc:'libx264'},
      h265:{crf:String(parseInt(qualityMultipliers[this.quality].crf)+5||28),preset:this.quality==='archive'||this.quality==='high'?'slow':'medium',enc:'libx265'},
      av1:{crf:String(parseInt(qualityMultipliers[this.quality].crf)+10||38),preset:'',enc:'libaom-av1'},
      vp9:{crf:qualityMultipliers[this.quality].crf,preset:'',enc:'libvpx-vp9'},
      prores:{crf:'',preset:'',enc:'prores_ks'},
    };

    const p=codecParams[this.codec];
    const crfStr=p.crf?`-crf ${p.crf} `:'';
    const presetStr=p.preset?`-preset ${p.preset} `:'';
    const profileStr=this.codec==='prores'?'-profile:v 3 ':this.codec==='h264'?'-profile:v high ':''
    const ffmpeg=`ffmpeg -i input.mp4 -c:v ${p.enc} ${crfStr}${presetStr}${profileStr}-vf scale=${w}:${h} -r ${fps} -c:a aac -b:a ${ab}k output.mp4`;

    this.result.set({
      fileSize:fmtSize(fileSizeBytes),
      videoBitrate:`${vm.toFixed(1)} Mbps`,
      audioBitrate:`${ab} kbps`,
      totalBitrate:`${((vm*1e6+ab*1e3)/1e6).toFixed(1)} Mbps`,
      settings:[
        {label:'Codec',value:p.enc},{label:'Resolution',value:`${w}×${h}`},
        {label:'Frame Rate',value:`${fps} fps`},{label:'Audio',value:`AAC ${ab}k`},
        ...(p.crf?[{label:'CRF',value:p.crf}]:[]),(p.preset?[{label:'Preset',value:p.preset}]:[])
      ].flat(),
      params:[
        ...(p.crf?[{label:'CRF',value:p.crf}]:[]),
        ...(p.preset?[{label:'Preset',value:p.preset}]:[]),
        {label:'Pixel Format',value:this.quality==='archive'?'yuv444p':'yuv420p'},
        {label:'Color Space',value:w>=3840?'bt2020nc':'bt709'},
        {label:'Audio Codec',value:'AAC'},
        {label:'Audio Sample Rate',value:'48000 Hz'},
      ],
      platforms:[
        {name:'YouTube',ok:['h264','h265','av1','vp9'].includes(this.codec)},
        {name:'Instagram/TikTok',ok:this.codec==='h264'},
        {name:'Apple Devices',ok:['h264','h265','prores'].includes(this.codec)},
        {name:'Web (HTML5)',ok:['h264','av1','vp9'].includes(this.codec)},
        {name:'Broadcast TV',ok:['h264','h265','prores','dnxhd'].includes(this.codec)},
      ],
      ffmpeg
    });
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calc();}
}
