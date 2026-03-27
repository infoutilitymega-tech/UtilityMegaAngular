import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-space-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='hex'" (click)="mode.set('hex')">HEX / RGB</button>
        <button class="tab-btn" [class.active]="mode()==='yuv'" (click)="mode.set('yuv')">YUV / YCbCr</button>
        <button class="tab-btn" [class.active]="mode()==='hsl'" (click)="mode.set('hsl')">HSL / HSV</button>
        <button class="tab-btn" [class.active]="mode()==='ref'" (click)="mode.set('ref')">Color Spaces</button>
      </div>

      <!-- HEX / RGB -->
      <ng-container *ngIf="mode()==='hex'">
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">HEX Color</label>
            <div class="hex-row">
              <input type="color" [(ngModel)]="hexColor" (input)="fromHex()" class="color-pick" />
              <input type="text" [(ngModel)]="hexColor" (input)="fromHex()" class="inp-field flex1" placeholder="#FF5733" maxlength="7" />
            </div>
          </div>
          <div class="input-group">
            <label class="inp-label">Preview</label>
            <div class="color-preview" [style.background]="hexColor || '#ccc'">
              <span class="prev-label">{{ hexColor }}</span>
            </div>
          </div>
        </div>
        <div class="results-grid-2" *ngIf="rgbResult()">
          <div class="cs-card" *ngFor="let c of rgbResult()">
            <div class="cs-name">{{ c.name }}</div>
            <div class="cs-val">{{ c.value }}</div>
            <button class="cs-copy" (click)="copy(c.value,c.name)" [class.copied]="copiedKey()===c.name">{{ copiedKey()===c.name?'✓ Copied':'📋 Copy' }}</button>
          </div>
        </div>
      </ng-container>

      <!-- YUV / YCbCr -->
      <ng-container *ngIf="mode()==='yuv'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">R (0–255)</label>
            <input type="number" [(ngModel)]="yuvR" (input)="fromRgbYuv()" class="inp-field" placeholder="255" min="0" max="255" />
          </div>
          <div class="input-group">
            <label class="inp-label">G (0–255)</label>
            <input type="number" [(ngModel)]="yuvG" (input)="fromRgbYuv()" class="inp-field" placeholder="87" min="0" max="255" />
          </div>
          <div class="input-group">
            <label class="inp-label">B (0–255)</label>
            <input type="number" [(ngModel)]="yuvB" (input)="fromRgbYuv()" class="inp-field" placeholder="51" min="0" max="255" />
          </div>
        </div>
        <div class="color-bar" [style.background]="'rgb('+(yuvR||0)+','+(yuvG||0)+','+(yuvB||0)+')'"></div>
        <div class="results-grid-2" *ngIf="yuvResult()">
          <div class="cs-card" *ngFor="let c of yuvResult()">
            <div class="cs-name">{{ c.name }}</div>
            <div class="cs-val">{{ c.value }}</div>
            <button class="cs-copy" (click)="copy(c.value,c.name)" [class.copied]="copiedKey()===c.name">{{ copiedKey()===c.name?'✓ Copied':'📋 Copy' }}</button>
          </div>
        </div>
      </ng-container>

      <!-- HSL / HSV -->
      <ng-container *ngIf="mode()==='hsl'">
        <div class="settings-grid">
          <div class="input-group">
            <label class="inp-label">R (0–255)</label>
            <input type="number" [(ngModel)]="hslR" (input)="fromRgbHsl()" class="inp-field" placeholder="255" min="0" max="255" />
          </div>
          <div class="input-group">
            <label class="inp-label">G (0–255)</label>
            <input type="number" [(ngModel)]="hslG" (input)="fromRgbHsl()" class="inp-field" placeholder="87" min="0" max="255" />
          </div>
          <div class="input-group">
            <label class="inp-label">B (0–255)</label>
            <input type="number" [(ngModel)]="hslB" (input)="fromRgbHsl()" class="inp-field" placeholder="51" min="0" max="255" />
          </div>
        </div>
        <div class="color-bar" [style.background]="'rgb('+(hslR||0)+','+(hslG||0)+','+(hslB||0)+')'"></div>
        <div class="results-grid-2" *ngIf="hslResult()">
          <div class="cs-card" *ngFor="let c of hslResult()">
            <div class="cs-name">{{ c.name }}</div>
            <div class="cs-val">{{ c.value }}</div>
            <button class="cs-copy" (click)="copy(c.value,c.name)" [class.copied]="copiedKey()===c.name">{{ copiedKey()===c.name?'✓ Copied':'📋 Copy' }}</button>
          </div>
        </div>
      </ng-container>

      <!-- COLOR SPACES REF -->
      <ng-container *ngIf="mode()==='ref'">
        <div class="cs-cards-grid">
          <div class="cs-ref-card" *ngFor="let cs of colorSpaceRef">
            <div class="csr-name">{{ cs.name }}</div>
            <div class="csr-badge">{{ cs.badge }}</div>
            <div class="csr-desc">{{ cs.desc }}</div>
            <div class="csr-use">{{ cs.use }}</div>
          </div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Video Color Space Standards</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Standard</th><th>Color Space</th><th>Bit Depth</th><th>Use Case</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of colorStandards">
                <td><strong>{{ r.std }}</strong></td><td>{{ r.space }}</td><td>{{ r.bits }}</td><td>{{ r.use }}</td>
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
    .hex-row{display:flex;gap:.5rem;align-items:center}
    .color-pick{width:40px;height:40px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;padding:2px}
    .flex1{flex:1}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.9rem;outline:none;font-family:var(--font)}
    .inp-field:focus{border-color:var(--primary)}
    .color-preview{width:100%;height:50px;border-radius:10px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center}
    .prev-label{font-size:.8rem;font-weight:700;color:#fff;text-shadow:0 1px 3px #0005;font-family:monospace}
    .color-bar{height:40px;border-radius:10px;border:1.5px solid var(--border)}
    .results-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
    .cs-card{border:1.5px solid var(--border);border-radius:10px;padding:.75rem;display:flex;flex-direction:column;gap:.3rem}
    .cs-name{font-size:.7rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .cs-val{font-size:.85rem;font-weight:700;color:var(--text);font-family:monospace;word-break:break-all}
    .cs-copy{background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:var(--text-muted);font-size:.68rem;padding:.2rem .45rem;font-family:var(--font);transition:all .15s;margin-top:.2rem;width:fit-content}
    .cs-copy:hover{color:var(--primary);border-color:var(--primary)}
    .cs-copy.copied{color:var(--green);border-color:var(--green)}
    .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    .cs-cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.85rem}
    .cs-ref-card{border:1.5px solid var(--border);border-radius:12px;padding:1rem;display:flex;flex-direction:column;gap:.35rem}
    .csr-name{font-size:.88rem;font-weight:800;color:var(--text)}
    .csr-badge{display:inline-block;padding:.2rem .6rem;border-radius:99px;background:var(--primary-light);color:var(--primary);font-size:.7rem;font-weight:700;width:fit-content}
    .csr-desc{font-size:.78rem;color:var(--text-muted)}
    .csr-use{font-size:.75rem;color:var(--text);font-weight:600}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.two-col{grid-template-columns:1fr}.results-grid-2{grid-template-columns:repeat(2,1fr)}.cs-cards-grid{grid-template-columns:1fr}}
  `]
})
export class ColorSpaceConverterComponent {
  mode = signal<'hex'|'yuv'|'hsl'|'ref'>('hex');
  hexColor = '#FF5733';
  yuvR: number|null = 255; yuvG: number|null = 87; yuvB: number|null = 51;
  hslR: number|null = 255; hslG: number|null = 87; hslB: number|null = 51;
  copiedKey = signal('');
  rgbResult = signal<{name:string;value:string}[]|null>(null);
  yuvResult = signal<{name:string;value:string}[]|null>(null);
  hslResult = signal<{name:string;value:string}[]|null>(null);

  colorSpaceRef = [
    {name:'Rec. 709 (sRGB)',badge:'HD Standard',desc:'Standard for HD video and web. The default color space for most cameras and displays.',use:'YouTube, streaming, broadcast HD'},
    {name:'Rec. 2020',badge:'HDR/UHD',desc:'Wide color gamut for 4K/8K HDR. Covers ~75% of human vision vs 35% for sRGB.',use:'4K/8K HDR, HDR10, Dolby Vision'},
    {name:'DCI-P3',badge:'Cinema',desc:'Digital cinema standard with wider gamut than sRGB. About 25% larger than Rec. 709.',use:'Film projection, Apple displays, HDR'},
    {name:'Adobe RGB',badge:'Photography',desc:'Wider gamut than sRGB, designed for print reproduction with richer greens.',use:'Professional photo editing, print'},
    {name:'Log (S-Log, C-Log)',badge:'RAW Video',desc:'Logarithmic encoding preserving more dynamic range from camera sensors before grading.',use:'Cinema cameras, color grading'},
    {name:'YCbCr / YUV',badge:'Broadcast',desc:'Separates luminance (Y) from color info (Cb/Cr). Used in JPEG, MPEG, H.264/265.',use:'Video compression, broadcast TV'},
  ];

  colorStandards = [
    {std:'Rec. 709',space:'YCbCr 4:2:0',bits:'8-bit',use:'HD broadcast, YouTube HD'},
    {std:'Rec. 2020',space:'YCbCr 4:2:0',bits:'10/12-bit',use:'4K HDR streaming'},
    {std:'DCI-P3',space:'XYZ',bits:'12-bit',use:'Digital cinema projection'},
    {std:'sRGB',space:'RGB',bits:'8-bit',use:'Web, monitors, photos'},
    {std:'Adobe RGB',space:'RGB',bits:'8-bit',use:'Photo editing, print'},
    {std:'ProPhoto RGB',space:'RGB',bits:'16-bit',use:'High-end photo archival'},
  ];

  hexToRgb(hex:string):{r:number;g:number;b:number}|null{
    const m=hex.replace('#','').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null;
  }

  fromHex(){
    const rgb=this.hexToRgb(this.hexColor);
    if(!rgb){this.rgbResult.set(null);return;}
    const {r,g,b}=rgb;
    const rf=r/255,gf=g/255,bf=b/255;
    this.rgbResult.set([
      {name:'HEX',value:this.hexColor.toUpperCase()},
      {name:'RGB',value:`rgb(${r}, ${g}, ${b})`},
      {name:'RGB %',value:`${(rf*100).toFixed(1)}%, ${(gf*100).toFixed(1)}%, ${(bf*100).toFixed(1)}%`},
      {name:'RGBA',value:`rgba(${r}, ${g}, ${b}, 1)`},
      {name:'CSS HSL',value:this.rgbToHslStr(r,g,b)},
      {name:'Linear RGB',value:`${rf.toFixed(4)}, ${gf.toFixed(4)}, ${bf.toFixed(4)}`},
    ]);
  }

  fromRgbYuv(){
    const r=this.yuvR||0,g=this.yuvG||0,b=this.yuvB||0;
    const Y=0.299*r+0.587*g+0.114*b;
    const U=128-0.168736*r-0.331264*g+0.5*b;
    const V=128+0.5*r-0.418688*g-0.081312*b;
    const Cb=128-0.16875*r-0.33126*g+0.5*b;
    const Cr=128+0.5*r-0.41869*g-0.08131*b;
    this.yuvResult.set([
      {name:'RGB',value:`rgb(${r}, ${g}, ${b})`},
      {name:'HEX',value:`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`.toUpperCase()},
      {name:'Y (Luma)',value:Y.toFixed(2)},
      {name:'U (Cb)',value:U.toFixed(2)},
      {name:'V (Cr)',value:V.toFixed(2)},
      {name:'YCbCr (BT.601)',value:`${Y.toFixed(0)}, ${Cb.toFixed(0)}, ${Cr.toFixed(0)}`},
    ]);
  }

  fromRgbHsl(){
    const r=this.hslR||0,g=this.hslG||0,b=this.hslB||0;
    this.hslResult.set([
      {name:'RGB',value:`rgb(${r}, ${g}, ${b})`},
      {name:'HEX',value:`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`.toUpperCase()},
      {name:'HSL',value:this.rgbToHslStr(r,g,b)},
      {name:'HSV / HSB',value:this.rgbToHsvStr(r,g,b)},
      {name:'CMYK',value:this.rgbToCmyk(r,g,b)},
      {name:'Luminance (Rec.709)',value:((0.2126*(r/255)+0.7152*(g/255)+0.0722*(b/255))*100).toFixed(2)+'%'},
    ]);
  }

  rgbToHslStr(r:number,g:number,b:number):string{
    const rf=r/255,gf=g/255,bf=b/255;
    const max=Math.max(rf,gf,bf),min=Math.min(rf,gf,bf);
    let h=0,s=0;const l=(max+min)/2;
    if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
      if(max===rf)h=((gf-bf)/d+(gf<bf?6:0))/6;
      else if(max===gf)h=((bf-rf)/d+2)/6;
      else h=((rf-gf)/d+4)/6;}
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
  }

  rgbToHsvStr(r:number,g:number,b:number):string{
    const rf=r/255,gf=g/255,bf=b/255;
    const max=Math.max(rf,gf,bf),min=Math.min(rf,gf,bf),d=max-min;
    let h=0;const s=max===0?0:d/max,v=max;
    if(max!==min){if(max===rf)h=((gf-bf)/d+(gf<bf?6:0))/6;
      else if(max===gf)h=((bf-rf)/d+2)/6;
      else h=((rf-gf)/d+4)/6;}
    return `hsv(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(v*100)}%)`;
  }

  rgbToCmyk(r:number,g:number,b:number):string{
    const rf=r/255,gf=g/255,bf=b/255;
    const k=1-Math.max(rf,gf,bf);
    if(k===1)return 'cmyk(0%, 0%, 0%, 100%)';
    const c=(1-rf-k)/(1-k),m=(1-gf-k)/(1-k),y=(1-bf-k)/(1-k);
    return `cmyk(${(c*100).toFixed(0)}%, ${(m*100).toFixed(0)}%, ${(y*100).toFixed(0)}%, ${(k*100).toFixed(0)}%)`;
  }

  copy(val:string,key:string){
    navigator.clipboard.writeText(val).then(()=>{this.copiedKey.set(key);setTimeout(()=>this.copiedKey.set(''),2000);});
  }

  ngOnInit(){this.fromHex();this.fromRgbYuv();this.fromRgbHsl();}
}
