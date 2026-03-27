import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-aspect-ratio-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='find'" (click)="mode.set('find');calcRatio()">Find Ratio</button>
        <button class="tab-btn" [class.active]="mode()==='scale'" (click)="mode.set('scale')">Scale Dimensions</button>
        <button class="tab-btn" [class.active]="mode()==='compare'" (click)="mode.set('compare')">Compare Ratios</button>
      </div>

      <!-- FIND RATIO -->
      <ng-container *ngIf="mode()==='find'">
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">Width (px)</label>
            <input type="number" [(ngModel)]="findW" (input)="calcRatio()" class="inp-field" placeholder="1920" />
          </div>
          <div class="input-group">
            <label class="inp-label">Height (px)</label>
            <input type="number" [(ngModel)]="findH" (input)="calcRatio()" class="inp-field" placeholder="1080" />
          </div>
        </div>
        <div class="result-card" *ngIf="ratioResult()">
          <div class="rc-row">
            <span class="rc-label">Aspect Ratio</span>
            <span class="rc-val primary">{{ ratioResult()!.ratio }}</span>
            <button class="copy-btn" (click)="copy(ratioResult()!.ratio,'ratio')" [class.copied]="copiedKey()==='ratio'">{{ copiedKey()==='ratio'?'✓':'📋' }}</button>
          </div>
          <div class="rc-row"><span class="rc-label">Decimal</span><span class="rc-val">{{ ratioResult()!.decimal }}</span></div>
          <div class="rc-row"><span class="rc-label">Common Name</span><span class="rc-val accent">{{ ratioResult()!.name }}</span></div>
          <div class="rc-row"><span class="rc-label">Orientation</span><span class="rc-val">{{ ratioResult()!.orientation }}</span></div>
        </div>
        <div class="preview-section" *ngIf="ratioResult() && findW && findH">
          <div class="preview-title">📐 Visual Preview</div>
          <div class="preview-box">
            <div class="preview-rect" [style.aspectRatio]="findW + '/' + findH">
              <span class="preview-label">{{ findW }} × {{ findH }}</span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- SCALE DIMENSIONS -->
      <ng-container *ngIf="mode()==='scale'">
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">Original Width</label>
            <input type="number" [(ngModel)]="srcW" (input)="calcFromW()" class="inp-field" placeholder="1920" />
          </div>
          <div class="input-group">
            <label class="inp-label">Original Height</label>
            <input type="number" [(ngModel)]="srcH" (input)="calcFromW()" class="inp-field" placeholder="1080" />
          </div>
        </div>
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">Target Width</label>
            <input type="number" [(ngModel)]="targetW" (input)="calcFromW()" class="inp-field" placeholder="1280" />
          </div>
          <div class="input-group">
            <label class="inp-label">Target Height</label>
            <input type="number" [(ngModel)]="targetH" (input)="calcFromH()" class="inp-field" placeholder="720" />
          </div>
        </div>
        <div class="result-card" *ngIf="scaleResult()">
          <div class="rc-row">
            <span class="rc-label">Scaled Dimensions</span>
            <span class="rc-val primary">{{ scaleResult()!.w }} × {{ scaleResult()!.h }}</span>
            <button class="copy-btn" (click)="copy(scaleResult()!.w+' x '+scaleResult()!.h,'scale')" [class.copied]="copiedKey()==='scale'">{{ copiedKey()==='scale'?'✓':'📋' }}</button>
          </div>
          <div class="rc-row"><span class="rc-label">Scale Factor</span><span class="rc-val">{{ scaleResult()!.factor }}×</span></div>
          <div class="rc-row"><span class="rc-label">Ratio Preserved</span><span class="rc-val accent">{{ scaleResult()!.preserved ? '✅ Yes' : '⚠️ No' }}</span></div>
        </div>
        <div class="section-label" style="margin-top:.5rem">Quick Presets</div>
        <div class="popular-row">
          <button *ngFor="let r of commonResolutions" class="pop-btn" (click)="applySource(r)">{{ r.label }}</button>
        </div>
      </ng-container>

      <!-- COMPARE -->
      <ng-container *ngIf="mode()==='compare'">
        <div class="compare-grid">
          <div class="compare-item" *ngFor="let r of compareRatios">
            <div class="cr-name">{{ r.name }}</div>
            <div class="cr-ratio">{{ r.ratio }}</div>
            <div class="cr-rect" [style.aspectRatio]="r.w + '/' + r.h"></div>
            <div class="cr-uses">{{ r.uses }}</div>
          </div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Standard Aspect Ratios</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Ratio</th><th>Decimal</th><th>Common Use</th><th>Example Resolution</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of standardRatios">
                <td><strong>{{ r.ratio }}</strong></td><td>{{ r.decimal }}</td><td>{{ r.use }}</td><td>{{ r.example }}</td>
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
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
    .input-group{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.95rem;outline:none;font-family:var(--font);transition:border .15s}
    .inp-field:focus{border-color:var(--primary)}
    .result-card{background:var(--primary-light);border:1.5px solid var(--primary)33;border-radius:14px;padding:1rem 1.15rem;display:flex;flex-direction:column;gap:.55rem}
    .rc-row{display:flex;align-items:center;gap:.6rem}
    .rc-label{font-size:.75rem;color:var(--text-muted);font-weight:600;flex:1}
    .rc-val{font-size:.9rem;font-weight:800;color:var(--text)}
    .rc-val.primary{color:var(--primary);font-size:1.1rem}
    .rc-val.accent{color:var(--green)}
    .copy-btn{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.8rem;padding:.1rem .25rem;transition:color .15s}
    .copy-btn.copied{color:var(--green)}
    .preview-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .preview-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .preview-box{padding:1.5rem;display:flex;justify-content:center;align-items:center}
    .preview-rect{width:100%;max-width:320px;max-height:200px;background:var(--primary-light);border:2px solid var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center}
    .preview-label{font-size:.78rem;font-weight:700;color:var(--primary)}
    .section-label{font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em}
    .popular-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .pop-btn{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .pop-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .compare-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .compare-item{border:1.5px solid var(--border);border-radius:12px;padding:.85rem;display:flex;flex-direction:column;gap:.4rem;align-items:center;text-align:center}
    .cr-name{font-size:.78rem;font-weight:800;color:var(--text)}
    .cr-ratio{font-size:.72rem;color:var(--primary);font-weight:700}
    .cr-rect{width:100%;max-width:100px;background:var(--primary-light);border:1.5px solid var(--primary)55;border-radius:4px;min-height:24px}
    .cr-uses{font-size:.68rem;color:var(--text-muted)}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.two-col{grid-template-columns:1fr}.compare-grid{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class AspectRatioCalculatorComponent {
  mode = signal<'find'|'scale'|'compare'>('find');
  findW: number|null = 1920; findH: number|null = 1080;
  srcW: number|null = 1920; srcH: number|null = 1080;
  targetW: number|null = 1280; targetH: number|null = null;
  copiedKey = signal('');
  ratioResult = signal<{ratio:string;decimal:string;name:string;orientation:string}|null>(null);
  scaleResult = signal<{w:number;h:number;factor:string;preserved:boolean}|null>(null);

  commonResolutions = [
    {label:'4K (3840×2160)',w:3840,h:2160},{label:'1080p (1920×1080)',w:1920,h:1080},
    {label:'720p (1280×720)',w:1280,h:720},{label:'480p (854×480)',w:854,h:480},
    {label:'Square (1080×1080)',w:1080,h:1080},{label:'Vertical (1080×1920)',w:1080,h:1920},
  ];

  compareRatios = [
    {name:'Widescreen HD',ratio:'16:9',w:16,h:9,uses:'YouTube, TV, streaming'},
    {name:'Classic TV',ratio:'4:3',w:4,h:3,uses:'Old TV, iPad'},
    {name:'Ultrawide',ratio:'21:9',w:21,h:9,uses:'Cinema, monitors'},
    {name:'Square',ratio:'1:1',w:1,h:1,uses:'Instagram feed'},
    {name:'Portrait / Vertical',ratio:'9:16',w:9,h:16,uses:'TikTok, Reels'},
    {name:'Anamorphic',ratio:'2.39:1',w:239,h:100,uses:'Film cinema'},
  ];

  standardRatios = [
    {ratio:'16:9',decimal:'1.778',use:'HD video, YouTube, TV',example:'1920×1080'},
    {ratio:'4:3',decimal:'1.333',use:'Traditional TV, tablets',example:'1024×768'},
    {ratio:'21:9',decimal:'2.333',use:'Ultrawide monitors, cinema',example:'2560×1080'},
    {ratio:'1:1',decimal:'1.000',use:'Instagram, square video',example:'1080×1080'},
    {ratio:'9:16',decimal:'0.563',use:'Mobile video, TikTok, Reels',example:'1080×1920'},
    {ratio:'2.35:1',decimal:'2.350',use:'Anamorphic widescreen film',example:'2350×1000'},
    {ratio:'3:2',decimal:'1.500',use:'Photography, DSLR/mirrorless',example:'3000×2000'},
    {ratio:'5:4',decimal:'1.250',use:'Medium format, old monitors',example:'1280×1024'},
  ];

  gcd(a:number,b:number):number{return b===0?a:this.gcd(b,a%b);}

  calcRatio(){
    if(!this.findW||!this.findH){this.ratioResult.set(null);return;}
    const g=this.gcd(this.findW,this.findH);
    const rw=this.findW/g,rh=this.findH/g;
    const dec=(this.findW/this.findH).toFixed(3);
    const d=parseFloat(dec);
    let name='Custom Ratio';
    if(Math.abs(d-1.778)<0.02)name='HD Widescreen (16:9)';
    else if(Math.abs(d-1.333)<0.02)name='Classic TV (4:3)';
    else if(Math.abs(d-1.000)<0.01)name='Square (1:1)';
    else if(Math.abs(d-0.563)<0.02)name='Vertical Portrait (9:16)';
    else if(Math.abs(d-2.333)<0.06)name='Ultrawide (21:9)';
    else if(Math.abs(d-1.500)<0.01)name='Photo Standard (3:2)';
    else if(Math.abs(d-2.350)<0.06)name='Anamorphic Cinema';
    else if(Math.abs(d-1.250)<0.01)name='Medium Format (5:4)';
    const orientation=this.findW>this.findH?'Landscape':this.findW<this.findH?'Portrait':'Square';
    this.ratioResult.set({ratio:`${rw}:${rh}`,decimal:dec,name,orientation});
  }

  calcFromW(){
    if(!this.srcW||!this.srcH||!this.targetW){this.scaleResult.set(null);return;}
    const h=Math.round(this.targetW*this.srcH/this.srcW);
    this.targetH=h;
    const factor=(this.targetW/this.srcW).toFixed(3);
    this.scaleResult.set({w:this.targetW,h,factor,preserved:true});
  }

  calcFromH(){
    if(!this.srcW||!this.srcH||!this.targetH){this.scaleResult.set(null);return;}
    const w=Math.round(this.targetH*this.srcW/this.srcH);
    this.targetW=w;
    const factor=(this.targetH/this.srcH).toFixed(3);
    this.scaleResult.set({w,h:this.targetH,factor,preserved:true});
  }

  applySource(r:{w:number;h:number}){this.srcW=r.w;this.srcH=r.h;this.targetW=null;this.targetH=null;this.scaleResult.set(null);}

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.calcRatio();}
}
