// ─── png-to-jpg.component.ts ─────────────────────────────────────────────────
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild, ElementRef,signal } from '@angular/core';

@Component({
  selector: 'app-png-to-jpg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="settings">
        <div class="field"><label>JPEG Quality</label><input type="range" min="10" max="100" [(ngModel)]="quality" class="range"/><span class="rv">{{quality}}%</span></div>
        <div class="field"><label>Background Color</label><input type="color" [(ngModel)]="bg" class="cpick"/></div>
      </div>
      <div class="drop-zone" [class.dov]="drag()" (dragover)="$event.preventDefault();drag.set(true)" (dragleave)="drag.set(false)" (drop)="onDrop($event)" (click)="fi.click()">
        <input #fi type="file" accept="image/png,image/gif,image/webp" multiple hidden (change)="onFC($event)" />
        <div class="di">🖼️→📷</div><div class="dt">Drop PNG/WebP/GIF images to convert to JPG</div>
        <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Images</button>
      </div>
      <div class="proc" *ngIf="busy()"><div class="sp"></div>Converting...</div>
      <div class="results" *ngIf="results().length">
        <div class="res-hdr"><h3>Converted to JPEG ({{results().length}})</h3><button class="btn-all" (click)="dlAll()">⬇ All</button></div>
        <div class="res-item" *ngFor="let r of results()">
          <img [src]="r.url" class="thumb"/><div class="rinfo"><div class="rn">{{r.name}}</div><div class="rd">{{r.w}}×{{r.h}} · JPEG · Q{{quality}}</div></div>
          <button class="btn-dl" (click)="dl(r)">⬇</button>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.settings{display:flex;gap:1rem;flex-wrap:wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:1rem;align-items:flex-end}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}.range{width:110px;accent-color:#2563eb}.rv{font-size:.85rem;font-weight:700;color:#2563eb}.cpick{width:44px;height:30px;border:none;border-radius:6px;cursor:pointer}.drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2rem;text-align:center;cursor:pointer;background:#fafafa}.dov{border-color:#2563eb;background:#eff6ff}.di{font-size:2rem;margin-bottom:.5rem}.dt{font-size:.9rem;font-weight:700;margin-bottom:.75rem}.ubtn{background:#2563eb;color:white;border:none;padding:.5rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem}.proc{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:#eff6ff;border-radius:8px;margin-top:1rem;font-size:.875rem;font-weight:600;color:#1d4ed8}.sp{width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.results{margin-top:1.5rem}.res-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.res-hdr h3{font-size:1rem;font-weight:800;margin:0}.btn-all{background:#2563eb;color:white;border:none;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}.res-item{display:flex;align-items:center;gap:.85rem;background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.5rem}.thumb{width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}.rinfo{flex:1}.rn{font-size:.83rem;font-weight:600}.rd{font-size:.75rem;color:#6b7280;margin-top:.15rem}.btn-dl{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}`]
})
export class PngToJpgComponent {
  quality=85;bg='#ffffff';drag=signal(false);busy=signal(false);results=signal<any[]>([]);
  onDrop(e:DragEvent){e.preventDefault();this.drag.set(false);const fs=Array.from(e.dataTransfer?.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);}
  onFC(e:Event){const i=e.target as HTMLInputElement;const fs=Array.from(i.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);i.value='';}
  async process(files:File[]){
    this.busy.set(true);const out:any[]=[];
    for(const f of files){const r=await new Promise<any>(res=>{const fr=new FileReader();fr.onload=ev=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d')!;ctx.fillStyle=this.bg;ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);const url=c.toDataURL('image/jpeg',this.quality/100);res({url,name:f.name.replace(/\.[^/.]+$/,'')+'.jpg',w:img.width,h:img.height});};img.src=ev.target!.result as string;};fr.readAsDataURL(f);});out.push(r);}
    this.results.update(r=>[...r,...out]);this.busy.set(false);
  }
  dl(r:any){const a=document.createElement('a');a.href=r.url;a.download=r.name;a.click();}
  dlAll(){this.results().forEach(r=>this.dl(r));}
}

// ─── jpg-to-png.component.ts ─────────────────────────────────────────────────
@Component({
  selector: 'app-jpg-to-png',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-wrap">
      <div class="info-box">Convert JPEG images to PNG for lossless quality and transparency support. No re-compression quality loss.</div>
      <div class="drop-zone" [class.dov]="drag()" (dragover)="$event.preventDefault();drag.set(true)" (dragleave)="drag.set(false)" (drop)="onDrop($event)" (click)="fi.click()">
        <input #fi type="file" accept="image/jpeg,image/jpg,image/webp,image/bmp" multiple hidden (change)="onFC($event)" />
        <div class="di">📷→🖼️</div><div class="dt">Drop JPG/JPEG/BMP/WebP images to convert to PNG</div>
        <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Images</button>
      </div>
      <div class="proc" *ngIf="busy()"><div class="sp"></div>Converting to PNG...</div>
      <div class="results" *ngIf="results().length">
        <div class="res-hdr"><h3>Converted to PNG ({{results().length}})</h3><button class="btn-all" (click)="dlAll()">⬇ All</button></div>
        <div class="res-item" *ngFor="let r of results()">
          <img [src]="r.url" class="thumb"/><div class="rinfo"><div class="rn">{{r.name}}</div><div class="rd">{{r.w}}×{{r.h}} · PNG · Lossless</div></div>
          <button class="btn-dl" (click)="dl(r)">⬇</button>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.info-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.75rem 1rem;font-size:.83rem;color:#1d4ed8;margin-bottom:1rem}.drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2rem;text-align:center;cursor:pointer;background:#fafafa}.dov{border-color:#2563eb;background:#eff6ff}.di{font-size:2rem;margin-bottom:.5rem}.dt{font-size:.9rem;font-weight:700;margin-bottom:.75rem}.ubtn{background:#2563eb;color:white;border:none;padding:.5rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem}.proc{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:#eff6ff;border-radius:8px;margin-top:1rem;font-size:.875rem;font-weight:600;color:#1d4ed8}.sp{width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.results{margin-top:1.5rem}.res-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.res-hdr h3{font-size:1rem;font-weight:800;margin:0}.btn-all{background:#2563eb;color:white;border:none;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}.res-item{display:flex;align-items:center;gap:.85rem;background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.5rem}.thumb{width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}.rinfo{flex:1}.rn{font-size:.83rem;font-weight:600}.rd{font-size:.75rem;color:#6b7280;margin-top:.15rem}.btn-dl{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}`]
})
export class JpgToPngComponent {
  drag=signal(false);busy=signal(false);results=signal<any[]>([]);
  onDrop(e:DragEvent){e.preventDefault();this.drag.set(false);const fs=Array.from(e.dataTransfer?.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);}
  onFC(e:Event){const i=e.target as HTMLInputElement;const fs=Array.from(i.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);i.value='';}
  async process(files:File[]){
    this.busy.set(true);const out:any[]=[];
    for(const f of files){const r=await new Promise<any>(res=>{const fr=new FileReader();fr.onload=ev=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d')!.drawImage(img,0,0);const url=c.toDataURL('image/png');res({url,name:f.name.replace(/\.[^/.]+$/,'')+'.png',w:img.width,h:img.height});};img.src=ev.target!.result as string;};fr.readAsDataURL(f);});out.push(r);}
    this.results.update(r=>[...r,...out]);this.busy.set(false);
  }
  dl(r:any){const a=document.createElement('a');a.href=r.url;a.download=r.name;a.click();}
  dlAll(){this.results().forEach(r=>this.dl(r));}
}

// ─── image-color-picker.component.ts ─────────────────────────────────────────
import { AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-image-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="drop-zone" *ngIf="!imgSrc()" (click)="fi.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        <input #fi type="file" accept="image/*" hidden (change)="loadFile($event)" />
        <div class="di">🎨</div><div class="dt">Drop image to pick colors</div>
        <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Image</button>
      </div>
      <div class="editor" *ngIf="imgSrc()">
        <div class="canvas-wrap">
          <canvas #canvas class="picker-canvas" (mousemove)="onMouseMove($event)" (click)="pickColor($event)" style="cursor:crosshair"></canvas>
          <div class="cursor-preview" *ngIf="hoverColor()" [style.background]="hoverColor()" [style.left.px]="hoverPos().x-16" [style.top.px]="hoverPos().y-16"></div>
        </div>
        <div class="color-panel">
          <div class="picked-section" *ngIf="pickedColor()">
            <div class="swatch" [style.background]="pickedColor()"></div>
            <div class="color-values">
              <div class="cv-row"><span class="cv-label">HEX</span><span class="cv-val">{{pickedColor()}}</span><button class="copy-btn" (click)="copy(pickedColor())">Copy</button></div>
              <div class="cv-row"><span class="cv-label">RGB</span><span class="cv-val">{{rgb()}}</span><button class="copy-btn" (click)="copy(rgb())">Copy</button></div>
              <div class="cv-row"><span class="cv-label">HSL</span><span class="cv-val">{{hsl()}}</span><button class="copy-btn" (click)="copy(hsl())">Copy</button></div>
            </div>
          </div>
          <div class="hint" *ngIf="!pickedColor()">Click anywhere on the image to pick a color</div>
          <div class="history-section" *ngIf="history().length">
            <div class="hist-title">History</div>
            <div class="hist-colors">
              <div class="hist-swatch" *ngFor="let c of history()" [style.background]="c" (click)="pickedColor.set(c);updateColorValues(c)" [title]="c"></div>
            </div>
          </div>
          <div class="palette-section" *ngIf="imgSrc()">
            <div class="hist-title">Dominant Colors</div>
            <button class="btn-extract" (click)="extractPalette()" [disabled]="extracting()">{{extracting()?'Extracting...':'Extract Palette'}}</button>
            <div class="palette-row" *ngIf="palette().length">
              <div class="pal-item" *ngFor="let c of palette()">
                <div class="pal-swatch" [style.background]="c" (click)="pickedColor.set(c);updateColorValues(c)"></div>
                <div class="pal-hex">{{c}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas #hiddenC hidden></canvas>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .di{font-size:2.5rem;margin-bottom:.75rem}.dt{font-size:.95rem;font-weight:700;margin-bottom:.85rem}
    .ubtn{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer}
    .editor{display:grid;grid-template-columns:1fr 280px;gap:1.25rem}
    @media(max-width:720px){.editor{grid-template-columns:1fr}}
    .canvas-wrap{position:relative;display:inline-block}
    .picker-canvas{max-width:100%;border-radius:8px;border:1px solid #e5e7eb;display:block}
    .cursor-preview{position:absolute;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);pointer-events:none}
    .color-panel{display:flex;flex-direction:column;gap:1rem}
    .picked-section{display:flex;gap:1rem;align-items:flex-start;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem}
    .swatch{width:64px;height:64px;border-radius:8px;flex-shrink:0;border:1px solid rgba(0,0,0,.1)}
    .color-values{flex:1;display:flex;flex-direction:column;gap:.4rem}
    .cv-row{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .cv-label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;min-width:28px}
    .cv-val{font-size:.8rem;font-family:monospace;font-weight:600;flex:1}
    .copy-btn{padding:.18rem .55rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.68rem;font-weight:700}
    .hint{font-size:.82rem;color:#9ca3af;text-align:center;padding:1.5rem;background:#f8fafc;border-radius:10px;border:1px dashed #e5e7eb}
    .history-section,.palette-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem}
    .hist-title{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.5rem}
    .hist-colors,.palette-row{display:flex;flex-wrap:wrap;gap:.4rem}
    .hist-swatch{width:28px;height:28px;border-radius:4px;cursor:pointer;border:1px solid rgba(0,0,0,.1)}
    .btn-extract{background:#2563eb;color:white;border:none;padding:.4rem .85rem;border-radius:7px;font-weight:600;cursor:pointer;font-size:.78rem;margin-bottom:.6rem}
    .btn-extract:disabled{opacity:.6;cursor:not-allowed}
    .pal-item{display:flex;flex-direction:column;align-items:center;gap:.2rem}
    .pal-swatch{width:40px;height:40px;border-radius:6px;cursor:pointer;border:1px solid rgba(0,0,0,.1)}
    .pal-hex{font-size:.6rem;font-family:monospace;color:#6b7280}
  `]
})
export class ImageColorPickerComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hiddenC') hiddenRef!: ElementRef<HTMLCanvasElement>;
  imgSrc = signal(''); pickedColor = signal(''); hoverColor = signal(''); hoverPos = signal({x:0,y:0});
  history = signal<string[]>([]); palette = signal<string[]>([]); extracting = signal(false);
  private img = new Image(); private rgbVal = {r:0,g:0,b:0};
  rgb(){const {r,g,b}=this.rgbVal;return `rgb(${r}, ${g}, ${b})`;}
  hsl(){const {r,g,b}=this.rgbVal;const rn=r/255,gn=g/255,bn=b/255;const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);let h=0,s=0;const l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case rn:h=((gn-bn)/d+(gn<bn?6:0))/6;break;case gn:h=((bn-rn)/d+2)/6;break;case bn:h=((rn-gn)/d+4)/6;break;}}return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)})%`;}
  onDrop(e:DragEvent){e.preventDefault();const f=e.dataTransfer?.files[0];if(f?.type.startsWith('image/'))this.loadImage(f);}
  loadFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f)this.loadImage(f);(e.target as HTMLInputElement).value='';}
  loadImage(file:File){const fr=new FileReader();fr.onload=ev=>{this.img.onload=()=>{this.imgSrc.set(this.img.src);setTimeout(()=>{const c=this.canvasRef.nativeElement;const maxW=500;const scale=Math.min(1,maxW/this.img.width);c.width=this.img.width*scale;c.height=this.img.height*scale;c.getContext('2d')!.drawImage(this.img,0,0,c.width,c.height);},50);};this.img.src=ev.target!.result as string;};fr.readAsDataURL(file);}
  onMouseMove(e:MouseEvent){const rect=(e.target as HTMLCanvasElement).getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;this.hoverPos.set({x,y});const ctx=this.canvasRef.nativeElement.getContext('2d')!;const d=ctx.getImageData(Math.round(x),Math.round(y),1,1).data;this.hoverColor.set(this.toHex(d[0],d[1],d[2]));}
  pickColor(e:MouseEvent){const rect=(e.target as HTMLCanvasElement).getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;const ctx=this.canvasRef.nativeElement.getContext('2d')!;const d=ctx.getImageData(Math.round(x),Math.round(y),1,1).data;const hex=this.toHex(d[0],d[1],d[2]);this.rgbVal={r:d[0],g:d[1],b:d[2]};this.pickedColor.set(hex);this.history.update(h=>[hex,...h.filter(c=>c!==hex)].slice(0,20));}
  updateColorValues(hex:string){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);this.rgbVal={r,g,b};}
  toHex(r:number,g:number,b:number){return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
  copy(val:string){navigator.clipboard.writeText(val);}
  async extractPalette(){
    this.extracting.set(true);
    await new Promise(r=>setTimeout(r,10));
    const c=this.canvasRef.nativeElement;const ctx=c.getContext('2d')!;
    const step=Math.max(4,Math.floor(c.width*c.height/2000));
    const data=ctx.getImageData(0,0,c.width,c.height).data;
    const buckets:Map<string,number>=new Map();
    for(let i=0;i<data.length;i+=4*step){const r=Math.round(data[i]/32)*32,g=Math.round(data[i+1]/32)*32,b=Math.round(data[i+2]/32)*32;const k=this.toHex(Math.min(255,r),Math.min(255,g),Math.min(255,b));buckets.set(k,(buckets.get(k)||0)+1);}
    const sorted=[...buckets.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
    this.palette.set(sorted);this.extracting.set(false);
  }
}

// ─── image-to-base64.component.ts ────────────────────────────────────────────
@Component({
  selector: 'app-image-to-base64',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button [class.active]="mode()==='datauri'" (click)="mode.set('datauri')">Data URI (HTML/CSS)</button>
        <button [class.active]="mode()==='pure'" (click)="mode.set('pure')">Pure Base64</button>
        <button [class.active]="mode()==='imgdecode'" (click)="mode.set('imgdecode')">Decode Base64 → Image</button>
      </div>

      <!-- Encode mode -->
      <div *ngIf="mode()!=='imgdecode'">
        <div class="drop-zone" [class.dov]="drag()" (dragover)="$event.preventDefault();drag.set(true)" (dragleave)="drag.set(false)" (drop)="onDrop($event)" (click)="fi.click()">
          <input #fi type="file" accept="image/*" multiple hidden (change)="onFC($event)" />
          <div class="di">📦</div><div class="dt">Drop images to encode to Base64</div>
          <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Images</button>
        </div>
        <div class="results" *ngIf="encoded().length">
          <div class="enc-item" *ngFor="let e of encoded()">
            <div class="enc-hdr">
              <img [src]="e.preview" class="enc-thumb" />
              <div class="enc-meta"><div class="enc-name">{{e.name}}</div><div class="enc-size">{{e.size}} chars · {{e.mime}}</div></div>
              <button class="copy-btn" (click)="copyText(e.value)">📋 Copy</button>
            </div>
            <textarea class="code-area" [value]="mode()==='datauri'?e.dataUri:e.b64" readonly rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Decode mode -->
      <div *ngIf="mode()==='imgdecode'" class="decode-section">
        <textarea class="decode-input" [(ngModel)]="decodeInput" placeholder="Paste Base64 string or Data URI here..." rows="6"></textarea>
        <button class="ubtn" (click)="decode()">Decode → Image</button>
        <div class="decoded-preview" *ngIf="decodedSrc()">
          <img [src]="decodedSrc()" class="decoded-img" />
          <button class="btn-dl" (click)="dlDecoded()">⬇ Download</button>
        </div>
        <div class="err-msg" *ngIf="decodeError()">{{decodeError()}}</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}.mode-tabs{display:flex;gap:.4rem;margin-bottom:1rem;background:#f3f4f6;border-radius:8px;padding:.3rem;flex-wrap:wrap}
    .mode-tabs button{flex:1;padding:.4rem .5rem;border:none;background:none;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2rem;text-align:center;cursor:pointer;background:#fafafa}.dov{border-color:#2563eb;background:#eff6ff}
    .di{font-size:2rem;margin-bottom:.5rem}.dt{font-size:.9rem;font-weight:700;margin-bottom:.75rem}
    .ubtn{background:#2563eb;color:white;border:none;padding:.5rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem}
    .results{margin-top:1rem;display:flex;flex-direction:column;gap:.85rem}
    .enc-item{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem}
    .enc-hdr{display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem}
    .enc-thumb{width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}
    .enc-meta{flex:1}.enc-name{font-size:.83rem;font-weight:600}.enc-size{font-size:.73rem;color:#6b7280}
    .copy-btn{padding:.35rem .75rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.75rem;font-weight:700}
    .code-area{width:100%;font-family:monospace;font-size:.72rem;background:#111827;color:#a3e635;border:none;border-radius:7px;padding:.6rem;resize:vertical;box-sizing:border-box}
    .decode-section{display:flex;flex-direction:column;gap:.85rem}
    .decode-input{width:100%;padding:.75rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.8rem;resize:vertical;box-sizing:border-box}
    .decoded-preview{display:flex;flex-direction:column;align-items:flex-start;gap:.75rem}
    .decoded-img{max-width:100%;max-height:300px;border-radius:8px;border:1px solid #e5e7eb}
    .btn-dl{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.8rem}
    .err-msg{color:#dc2626;font-size:.83rem;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:.6rem .85rem}
  `]
})
export class ImageToBase64Component {
  mode = signal<'datauri'|'pure'|'imgdecode'>('datauri');
  drag = signal(false); encoded = signal<any[]>([]);
  decodeInput = ''; decodedSrc = signal(''); decodeError = signal('');

  onDrop(e:DragEvent){e.preventDefault();this.drag.set(false);const fs=Array.from(e.dataTransfer?.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);}
  onFC(e:Event){const i=e.target as HTMLInputElement;const fs=Array.from(i.files||[]).filter(f=>f.type.startsWith('image/'));if(fs.length)this.process(fs);i.value='';}
  async process(files:File[]){
    const out:any[]=[];
    for(const f of files){const b64=await new Promise<string>(res=>{const fr=new FileReader();fr.onload=ev=>res(ev.target!.result as string);fr.readAsDataURL(f);});const pure=b64.split(',')[1];out.push({name:f.name,mime:f.type,dataUri:b64,b64:pure,preview:b64,size:b64.length.toLocaleString()});}
    this.encoded.update(e=>[...e,...out]);
  }
  copyText(val:string){navigator.clipboard.writeText(val);}
  decode(){
    this.decodeError.set('');
    try{
      let src=this.decodeInput.trim();
      if(!src.startsWith('data:')){src='data:image/png;base64,'+src;}
      this.decodedSrc.set(src);
    }catch(e){this.decodeError.set('Invalid Base64 string — could not decode as image.');}
  }
  dlDecoded(){const a=document.createElement('a');a.href=this.decodedSrc();a.download='decoded-image.png';a.click();}
}
