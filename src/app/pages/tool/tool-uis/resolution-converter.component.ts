import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resolution-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-input">
        <div class="mi-val">
          <input type="number" [(ngModel)]="width" (input)="calc()" class="big-inp" placeholder="1920" />
        </div>
        <div class="sep">×</div>
        <div class="mi-val">
          <input type="number" [(ngModel)]="height" (input)="calc()" class="big-inp" placeholder="1080" />
        </div>
        <div class="mi-unit">
          <span class="big-label">pixels</span>
        </div>
      </div>

      <div class="popular-row">
        <button *ngFor="let r of presets" class="pop-btn" (click)="applyPreset(r)">{{ r.label }}</button>
      </div>

      <div class="results-section" *ngIf="result()">
        <div class="results-grid">
          <div class="group-section">
            <div class="group-title">📊 Pixel Info</div>
            <div class="result-item from-unit">
              <span class="ri-unit">Total Pixels</span>
              <span class="ri-val">{{ result()!.totalPixels }}</span>
              <button class="ri-copy" (click)="copy(result()!.totalPixels,'tp')" [class.copied]="copiedKey()==='tp'">{{ copiedKey()==='tp'?'✓':'📋' }}</button>
            </div>
            <div class="result-item"><span class="ri-unit">Megapixels</span><span class="ri-val">{{ result()!.megapixels }} MP</span></div>
            <div class="result-item"><span class="ri-unit">Aspect Ratio</span><span class="ri-val">{{ result()!.ratio }}</span></div>
            <div class="result-item"><span class="ri-unit">Pixel Density Class</span><span class="ri-val">{{ result()!.densityClass }}</span></div>
          </div>
          <div class="group-section">
            <div class="group-title">🔍 Scale Variants</div>
            <div class="result-item" *ngFor="let s of result()!.scales">
              <span class="ri-unit">{{ s.label }}</span>
              <span class="ri-val">{{ s.value }}</span>
              <button class="ri-copy" (click)="copy(s.value,s.label)" [class.copied]="copiedKey()===s.label">{{ copiedKey()===s.label?'✓':'📋' }}</button>
            </div>
          </div>
          <div class="group-section">
            <div class="group-title">🖥️ Closest Standard</div>
            <div class="result-item" *ngFor="let s of result()!.closest">
              <span class="ri-unit">{{ s.name }}</span>
              <span class="ri-val" [class.accent]="s.match">{{ s.res }}</span>
            </div>
          </div>
        </div>

        <div class="scale-section">
          <div class="scale-title">📐 Resolution Comparison</div>
          <div class="scale-bars">
            <div class="sb-item" *ngFor="let r of comparisonBars()">
              <span class="sb-unit">{{ r.label }}</span>
              <div class="sb-track">
                <div class="sb-fill" [style.width.%]="r.pct" [class.from-bar]="r.current"></div>
              </div>
              <span class="sb-val">{{ r.mp }} MP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-table">
        <div class="rt-title">📋 Standard Video Resolutions</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Resolution</th><th>Pixels</th><th>Ratio</th><th>Common Use</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of resolutionRef" [class.highlight-row]="r.w===width&&r.h===height">
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.w }}×{{ r.h }}</td>
                <td>{{ (r.w*r.h/1e6).toFixed(1) }} MP</td>
                <td>{{ r.ratio }}</td>
                <td>{{ r.use }}</td>
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
    .sep{font-size:1.8rem;font-weight:900;color:var(--primary);flex-shrink:0}
    .big-inp{width:100%;border:none;outline:none;background:transparent;font-size:2rem;font-weight:900;color:var(--primary);font-family:var(--font)}
    .big-label{font-size:.9rem;font-weight:700;color:var(--primary);white-space:nowrap}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
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
    .ri-copy{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;flex-shrink:0}
    .ri-copy.copied{color:var(--green)}
    .scale-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .scale-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .scale-bars{display:flex;flex-direction:column;gap:.45rem;padding:.75rem .9rem}
    .sb-item{display:grid;grid-template-columns:120px 1fr 60px;align-items:center;gap:.65rem}
    .sb-unit{font-size:.75rem;color:var(--text-muted)}
    .sb-track{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .sb-fill{height:100%;background:var(--primary);border-radius:99px;opacity:.55;transition:width .4s}
    .sb-fill.from-bar{opacity:1}
    .sb-val{font-size:.72rem;font-weight:700;color:var(--text);text-align:right}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    .highlight-row td{background:var(--primary-light) !important;font-weight:700}
    @media(max-width:640px){.results-grid{grid-template-columns:1fr}.sb-item{grid-template-columns:80px 1fr 50px}}
  `]
})
export class ResolutionConverterComponent {
  width: number|null = 1920;
  height: number|null = 1080;
  copiedKey = signal('');
  result = signal<any>(null);
  comparisonBars = signal<any[]>([]);

  presets = [
    {label:'8K (7680×4320)',w:7680,h:4320},{label:'4K (3840×2160)',w:3840,h:2160},
    {label:'2K (2560×1440)',w:2560,h:1440},{label:'1080p',w:1920,h:1080},
    {label:'720p',w:1280,h:720},{label:'480p',w:854,h:480},
    {label:'Square 1080',w:1080,h:1080},{label:'Vertical 1080',w:1080,h:1920},
  ];

  resolutionRef = [
    {name:'8K UHD',w:7680,h:4320,ratio:'16:9',use:'Digital cinema, premium display'},
    {name:'4K UHD',w:3840,h:2160,ratio:'16:9',use:'4K TV, streaming'},
    {name:'DCI 4K',w:4096,h:2160,ratio:'17:9',use:'Digital cinema projection'},
    {name:'2K QHD',w:2560,h:1440,ratio:'16:9',use:'PC gaming, monitor'},
    {name:'Full HD 1080p',w:1920,h:1080,ratio:'16:9',use:'TV, web video'},
    {name:'HD Ready 720p',w:1280,h:720,ratio:'16:9',use:'Web streaming, mobile'},
    {name:'SD 480p',w:854,h:480,ratio:'16:9',use:'Legacy web, old DVD'},
    {name:'SD 360p',w:640,h:360,ratio:'16:9',use:'Low bandwidth streaming'},
    {name:'Instagram Square',w:1080,h:1080,ratio:'1:1',use:'Social media square'},
    {name:'TikTok / Reels',w:1080,h:1920,ratio:'9:16',use:'Vertical social media'},
  ];

  barRefs = [
    {name:'8K',w:7680,h:4320},{name:'4K',w:3840,h:2160},{name:'2K',w:2560,h:1440},
    {name:'1080p',w:1920,h:1080},{name:'720p',w:1280,h:720},{name:'480p',w:854,h:480},
  ];

  gcd(a:number,b:number):number{return b===0?a:this.gcd(b,a%b);}

  calc(){
    if(!this.width||!this.height){this.result.set(null);return;}
    const w=this.width,h=this.height;
    const total=w*h;
    const mp=(total/1e6).toFixed(2);
    const g=this.gcd(w,h);
    const ratio=`${w/g}:${h/g}`;
    let densityClass='SD';
    if(total>=7680*4320)densityClass='8K Ultra HD';
    else if(total>=3840*2160)densityClass='4K Ultra HD';
    else if(total>=1920*1080)densityClass='Full HD';
    else if(total>=1280*720)densityClass='HD Ready';
    else if(total>=640*480)densityClass='Standard Definition';

    const scales=[0.25,0.5,0.75,1.5,2].map(f=>({
      label:`${f*100}% scale`,
      value:`${Math.round(w*f)}×${Math.round(h*f)}`
    }));

    const closest = this.resolutionRef.map(r=>({
      name:r.name,res:`${r.w}×${r.h}`,match:r.w===w&&r.h===h
    })).slice(0,5);

    this.result.set({
      totalPixels:total.toLocaleString('en-IN'),
      megapixels:mp,
      ratio,
      densityClass,
      scales,
      closest
    });

    // bars
    const customMP=total/1e6;
    const allBars=[...this.barRefs,{name:'Custom',w,h}];
    const maxMP=Math.max(...allBars.map(b=>b.w*b.h/1e6));
    this.comparisonBars.set(allBars.map(b=>({
      label:b.name,mp:(b.w*b.h/1e6).toFixed(1),pct:(b.w*b.h/1e6/maxMP)*100,current:b.w===w&&b.h===h
    })));
  }

  applyPreset(r:{w:number;h:number}){this.width=r.w;this.height=r.h;this.calc();}

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calc();}
}
