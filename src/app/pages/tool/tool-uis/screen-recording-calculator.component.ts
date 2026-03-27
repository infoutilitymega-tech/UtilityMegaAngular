import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-screen-recording-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="settings-section">
        <div class="section-title">🖥️ Screen & Content Settings</div>
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">Screen Resolution</label>
            <select [(ngModel)]="screenRes" (change)="calc()" class="inp-field">
              <option value="3840x2160">4K (3840×2160)</option>
              <option value="2560x1440">QHD (2560×1440)</option>
              <option value="1920x1080">FHD (1920×1080)</option>
              <option value="1280x720">HD (1280×720)</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Recording Format</label>
            <select [(ngModel)]="outputFormat" (change)="calc()" class="inp-field">
              <option value="capture">OBS (for streaming)</option>
              <option value="edit">High quality (for editing)</option>
              <option value="upload">Optimized (for uploading)</option>
              <option value="share">Quick share / lightweight</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Content Type</label>
            <select [(ngModel)]="contentType" (change)="calc()" class="inp-field">
              <option value="tutorial">Tutorial / screencast</option>
              <option value="gaming">Gaming (high motion)</option>
              <option value="slides">Slides / static content</option>
              <option value="ui">UI / App demo</option>
              <option value="webinar">Webinar / presentation</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Frame Rate</label>
            <select [(ngModel)]="fps" (change)="calc()" class="inp-field">
              <option value="24">24 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
              <option value="120">120 fps</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Duration (minutes)</label>
            <input type="number" [(ngModel)]="duration" (input)="calc()" class="inp-field" placeholder="30" min="1" />
          </div>
          <div class="input-group">
            <label class="inp-label">Include Webcam?</label>
            <select [(ngModel)]="webcam" (change)="calc()" class="inp-field">
              <option value="no">No webcam</option>
              <option value="480p">Webcam 480p</option>
              <option value="720p">Webcam 720p</option>
              <option value="1080p">Webcam 1080p</option>
            </select>
          </div>
        </div>
      </div>

      <div class="result-section" *ngIf="result()">
        <div class="rec-banner">
          <div class="rec-title">✅ Recommended Recording Settings</div>
          <div class="rec-rows">
            <div class="rec-item-wide" *ngFor="let r of result()!.settings">
              <span class="rec-lbl">{{ r.label }}</span>
              <span class="rec-val">{{ r.value }}</span>
              <button class="copy-btn" (click)="copy(r.value,r.label)" [class.copied]="copiedKey()===r.label">{{ copiedKey()===r.label?'✓':'📋' }}</button>
            </div>
          </div>
        </div>

        <div class="results-grid">
          <div class="group-section">
            <div class="group-title">📦 File Size Estimates</div>
            <div class="result-item from-unit">
              <span class="ri-unit">Estimated File Size</span>
              <span class="ri-val">{{ result()!.fileSize }}</span>
            </div>
            <div class="result-item"><span class="ri-unit">Per hour</span><span class="ri-val">{{ result()!.perHour }}</span></div>
            <div class="result-item"><span class="ri-unit">Per GB storage</span><span class="ri-val">{{ result()!.perGB }} min</span></div>
          </div>
          <div class="group-section">
            <div class="group-title">💻 Software Suggestions</div>
            <div class="result-item" *ngFor="let s of result()!.software">
              <span class="ri-unit">{{ s.name }}</span>
              <span class="ri-val accent">{{ s.tag }}</span>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">📤 Export Settings</div>
            <div class="result-item" *ngFor="let e of result()!.export">
              <span class="ri-unit">{{ e.label }}</span>
              <span class="ri-val">{{ e.value }}</span>
            </div>
          </div>
        </div>

        <div class="tips-box">
          <div class="tips-title">💡 Recording Tips</div>
          <ul class="tips-list">
            <li *ngFor="let tip of result()!.tips">{{ tip }}</li>
          </ul>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Screen Recording Software Reference</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Software</th><th>Platform</th><th>Best For</th><th>Cost</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of softwareRef">
                <td><strong>{{ r.name }}</strong></td><td>{{ r.platform }}</td><td>{{ r.use }}</td><td>{{ r.cost }}</td>
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
    .rec-title{font-size:.8rem;font-weight:800;color:var(--primary);margin-bottom:.65rem}
    .rec-rows{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}
    .rec-item-wide{display:flex;align-items:center;gap:.4rem;padding:.3rem .5rem;background:#fff2;border-radius:6px}
    .rec-lbl{font-size:.72rem;color:var(--text-muted);flex:1}
    .rec-val{font-size:.78rem;font-weight:700;color:var(--text);font-family:monospace;white-space:nowrap}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.75rem;padding:.1rem}
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
    .ri-val.accent{color:var(--green)}
    .tips-box{background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem}
    .tips-title{font-size:.78rem;font-weight:700;margin-bottom:.5rem;color:var(--text)}
    .tips-list{margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:.3rem}
    .tips-list li{font-size:.78rem;color:var(--text-muted)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.settings-grid{grid-template-columns:repeat(2,1fr)}.results-grid{grid-template-columns:1fr}.rec-rows{grid-template-columns:1fr}}
  `]
})
export class ScreenRecordingCalculatorComponent {
  screenRes = '1920x1080'; outputFormat = 'capture'; contentType = 'tutorial';
  fps = '30'; duration: number|null = 30; webcam = 'no';
  copiedKey = signal('');
  result = signal<any>(null);

  softwareRef = [
    {name:'OBS Studio',platform:'Win/Mac/Linux',use:'Live streaming, recording',cost:'Free'},
    {name:'Loom',platform:'Win/Mac/Browser',use:'Quick screen shares',cost:'Free/Pro'},
    {name:'Camtasia',platform:'Win/Mac',use:'Tutorial & course creation',cost:'Paid'},
    {name:'QuickTime',platform:'macOS',use:'Quick screen recordings',cost:'Free'},
    {name:'Bandicam',platform:'Windows',use:'Gaming capture',cost:'Free/Pro'},
    {name:'Xbox Game Bar',platform:'Windows',use:'Gaming screen capture',cost:'Free'},
    {name:'ScreenFlow',platform:'macOS',use:'Screencasts, tutorials',cost:'Paid'},
    {name:'Nvidia ShadowPlay',platform:'Windows (Nvidia GPU)',use:'Gaming, zero overhead',cost:'Free'},
  ];

  calc(){
    const [w,h]=this.screenRes.split('x').map(Number);
    const fpsN=parseInt(this.fps);
    const dur=(this.duration||30)*60;
    const pixels=w*h;

    const motionFactor:Record<string,number>={tutorial:0.3,gaming:1.0,slides:0.1,ui:0.4,webinar:0.2};
    const formatFactor:Record<string,{codec:string;crf:string;bitrateMult:number}>={
      capture:{codec:'H.264',crf:'23',bitrateMult:1},
      edit:{codec:'ProRes / DNxHD',crf:'18',bitrateMult:4},
      upload:{codec:'H.264',crf:'28',bitrateMult:0.5},
      share:{codec:'H.264',crf:'32',bitrateMult:0.3},
    };
    const ff=formatFactor[this.outputFormat];
    const baseMbps=(pixels*fpsN*motionFactor[this.contentType]*0.000002);
    const videoBitrate=baseMbps*ff.bitrateMult;
    const audioBitrate=192;
    const webcamBitrate=this.webcam==='no'?0:this.webcam==='480p'?1000:this.webcam==='720p'?2500:5000;
    const totalBitrate=(videoBitrate*1e6+audioBitrate*1e3+webcamBitrate*1e3);
    const fileBytes=totalBitrate*dur/8;
    const fmtSize=(b:number)=>b>1e9?`${(b/1e9).toFixed(1)} GB`:`${(b/1e6).toFixed(0)} MB`;

    const softwareSuggestions:Record<string,{name:string;tag:string}[]>={
      capture:[{name:'OBS Studio',tag:'Best free option'},{name:'Nvidia ShadowPlay',tag:'GPU: zero overhead'},{name:'XBox Game Bar',tag:'Windows built-in'}],
      edit:[{name:'OBS + ProRes',tag:'For post-production'},{name:'Camtasia',tag:'All-in-one'},{name:'ScreenFlow',tag:'macOS'}],
      upload:[{name:'Loom',tag:'Upload directly'},{name:'OBS + H.264',tag:'Balanced'},{name:'QuickTime',tag:'macOS quick'}],
      share:[{name:'Loom',tag:'Instant share link'},{name:'QuickTime',tag:'macOS share'},{name:'Xbox Game Bar',tag:'Windows share'}],
    };

    const tips:Record<string,string[]>={
      gaming:['Use hardware encoding (NVENC/AMF) to reduce CPU load','Set bitrate CBR for consistent quality','Enable Game Mode in Windows for better performance','Record at 60fps minimum for smooth motion'],
      tutorial:['Use 30fps for tutorials (24 also works well)','Record at 1:1 resolution — avoid upscaling','Use VBR bitrate to save space on static slides','Enable noise gate on audio to reduce background noise'],
      slides:['15–24fps is sufficient for slide content','Very low bitrate sufficient — CRF 32+ is fine','Enable hardware acceleration in encoder','Consider recording at lower resolution and upscaling'],
      ui:[],webinar:[],
    };

    this.result.set({
      fileSize:fmtSize(fileBytes),
      perHour:fmtSize(fileBytes/(this.duration||30)*60),
      perGB:Math.floor(1e9/((totalBitrate)*60/8)).toFixed(0),
      settings:[
        {label:'Codec',value:ff.codec},
        {label:'Resolution',value:`${w}×${h}`},
        {label:'Frame Rate',value:`${fpsN} fps`},
        {label:'CRF / Quality',value:ff.crf},
        {label:'Video Bitrate',value:`${videoBitrate.toFixed(1)} Mbps`},
        {label:'Audio',value:`AAC 192 kbps`},
      ],
      software:softwareSuggestions[this.outputFormat]||softwareSuggestions['capture'],
      export:[
        {label:'Container',value:'MP4'},
        {label:'Color Space',value:w>=3840?'Rec. 2020':'Rec. 709'},
        {label:'Audio Codec',value:'AAC-LC'},
        {label:'Audio Rate',value:'48 kHz'},
        {label:'Encoder',value:'Hardware (NVENC/VCN) or libx264'},
      ],
      tips:(tips[this.contentType]||tips['tutorial']).concat([
        'Close unnecessary applications before recording',
        'Test your setup with a short 1-minute recording first',
        'Store recordings on SSD for best write performance',
      ]).slice(0,5),
    });
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calc();}
}
