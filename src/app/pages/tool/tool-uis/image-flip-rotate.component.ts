import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-flip-rotate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="upload-area" *ngIf="!imgSrc()">
        <div class="drop-zone" (click)="fi.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <input #fi type="file" accept="image/*" hidden (change)="loadFile($event)" />
          <div class="di">🔄</div><div class="dt">Drop image to flip or rotate</div>
          <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Image</button>
        </div>
      </div>

      <div class="editor" *ngIf="imgSrc()">
        <div class="preview-panel">
          <canvas #canvas class="preview-canvas"></canvas>
        </div>
        <div class="controls-panel">
          <div class="ctrl-section">
            <div class="ctrl-title">Rotate</div>
            <div class="rotate-btns">
              <button class="ctrl-btn" (click)="rotate(-90)" title="90° Counter-clockwise">↺ 90° CCW</button>
              <button class="ctrl-btn" (click)="rotate(90)" title="90° Clockwise">↻ 90° CW</button>
              <button class="ctrl-btn" (click)="rotate(180)" title="180°">↕ 180°</button>
            </div>
            <div class="ctrl-title mt">Custom Angle</div>
            <div class="angle-row">
              <input type="range" min="-180" max="180" [(ngModel)]="customAngle" (ngModelChange)="applyTransform()" class="range-full" />
              <span class="angle-val">{{customAngle}}°</span>
              <button class="reset-btn" (click)="customAngle=0;applyTransform()">Reset</button>
            </div>
          </div>
          <div class="ctrl-section">
            <div class="ctrl-title">Flip</div>
            <div class="flip-btns">
              <button class="ctrl-btn" (click)="flipH()" [class.active]="flippedH()">⇔ Horizontal</button>
              <button class="ctrl-btn" (click)="flipV()" [class.active]="flippedV()">⇕ Vertical</button>
            </div>
          </div>
          <div class="ctrl-section">
            <div class="ctrl-title">Background</div>
            <div class="bg-row">
              <button class="bg-btn" [class.active]="bgMode()==='white'" (click)="bgMode.set('white');applyTransform()">White</button>
              <button class="bg-btn" [class.active]="bgMode()==='black'" (click)="bgMode.set('black');applyTransform()">Black</button>
              <button class="bg-btn" [class.active]="bgMode()==='transparent'" (click)="bgMode.set('transparent');applyTransform()">Transparent</button>
            </div>
          </div>
          <div class="action-row">
            <button class="btn-change" (click)="fi2.click()">Change</button>
            <input #fi2 type="file" accept="image/*" hidden (change)="loadFile($event)" />
            <button class="btn-save" (click)="save()">⬇ Download</button>
          </div>
        </div>
      </div>
      <canvas #output hidden></canvas>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .di{font-size:2.5rem;margin-bottom:.75rem}.dt{font-size:.95rem;font-weight:700;margin-bottom:.85rem}
    .ubtn{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer}
    .editor{display:grid;grid-template-columns:1fr 260px;gap:1.25rem}
    @media(max-width:700px){.editor{grid-template-columns:1fr}}
    .preview-panel{background:#f3f4f6;border-radius:12px;display:flex;align-items:center;justify-content:center;min-height:240px;overflow:hidden;padding:.75rem}
    .preview-canvas{max-width:100%;max-height:340px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .controls-panel{display:flex;flex-direction:column;gap:1rem}
    .ctrl-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .ctrl-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.5rem}
    .ctrl-title.mt{margin-top:.75rem}
    .rotate-btns,.flip-btns{display:flex;gap:.4rem;flex-wrap:wrap}
    .ctrl-btn{padding:.4rem .75rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;transition:all .15s}
    .ctrl-btn:hover,.ctrl-btn.active{background:#eff6ff;border-color:#2563eb;color:#2563eb}
    .angle-row{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
    .range-full{flex:1;accent-color:#2563eb;min-width:80px}
    .angle-val{font-size:.85rem;font-weight:700;color:#2563eb;min-width:36px}
    .reset-btn{padding:.25rem .6rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.72rem}
    .bg-row{display:flex;gap:.4rem}
    .bg-btn{padding:.35rem .7rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600;transition:all .15s}
    .bg-btn.active{background:#2563eb;border-color:#2563eb;color:white}
    .action-row{display:flex;gap:.6rem;flex-wrap:wrap}
    .btn-change{padding:.5rem 1rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-weight:600;font-size:.82rem}
    .btn-save{padding:.5rem 1.1rem;border:none;background:#2563eb;color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:.82rem;flex:1}
  `]
})
export class ImageFlipRotateComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('output') outputRef!: ElementRef<HTMLCanvasElement>;
  imgSrc = signal(''); private img = new Image();
  private totalAngle = 0; customAngle = 0;
  flippedH = signal(false); flippedV = signal(false);
  bgMode = signal<'white'|'black'|'transparent'>('white');
  private fileName = 'image';

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f?.type.startsWith('image/'))this.loadImage(f); }
  loadFile(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f)this.loadImage(f); (e.target as HTMLInputElement).value=''; }
  loadImage(file: File) {
    this.fileName = file.name.replace(/\.[^/.]+$/, '');
    const fr = new FileReader(); fr.onload=ev=>{
      this.img.onload=()=>{this.imgSrc.set(this.img.src);this.totalAngle=0;this.customAngle=0;this.flippedH.set(false);this.flippedV.set(false);setTimeout(()=>this.draw(),50);};
      this.img.src=ev.target!.result as string;
    }; fr.readAsDataURL(file);
  }
  rotate(deg: number) { this.totalAngle=(this.totalAngle+deg+360)%360; this.draw(); }
  flipH() { this.flippedH.update(v=>!v); this.draw(); }
  flipV() { this.flippedV.update(v=>!v); this.draw(); }
  applyTransform() { this.draw(); }

  draw() {
    if (!this.canvasRef) return;
    const angle = (this.totalAngle + this.customAngle) * Math.PI / 180;
    const sw = this.img.width, sh = this.img.height;
    const cos = Math.abs(Math.cos(angle)), sin = Math.abs(Math.sin(angle));
    const w = Math.round(sw * cos + sh * sin);
    const h = Math.round(sw * sin + sh * cos);
    const c = this.canvasRef.nativeElement; c.width=w; c.height=h;
    const ctx=c.getContext('2d')!;
    if(this.bgMode()==='white'){ctx.fillStyle='white';ctx.fillRect(0,0,w,h);}
    else if(this.bgMode()==='black'){ctx.fillStyle='black';ctx.fillRect(0,0,w,h);}
    ctx.translate(w/2,h/2);
    ctx.rotate(angle);
    ctx.scale(this.flippedH()?-1:1, this.flippedV()?-1:1);
    ctx.drawImage(this.img,-sw/2,-sh/2);
    ctx.resetTransform();
  }

  save() {
    if (!this.canvasRef) return;
    const a=document.createElement('a');
    a.href=this.canvasRef.nativeElement.toDataURL('image/png');
    a.download=this.fileName+'_transformed.png'; a.click();
  }
}
