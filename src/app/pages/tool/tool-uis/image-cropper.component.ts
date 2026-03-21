import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const RATIOS: Record<string, number|null> = {
  'Free': null, '1:1': 1, '16:9': 16/9, '4:3': 4/3, '3:2': 3/2, '9:16': 9/16, '4:5': 4/5,
};

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="ratio-bar">
        <span class="bar-label">Aspect Ratio:</span>
        <button *ngFor="let r of ratioKeys()" [class.active]="selectedRatio()===r" (click)="setRatio(r)" class="ratio-btn">{{r}}</button>
      </div>

      <div class="upload-area" *ngIf="!imgLoaded()">
        <div class="drop-zone" (click)="fi.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <input #fi type="file" accept="image/*" hidden (change)="loadFile($event)" />
          <div class="di">✂️</div>
          <div class="dt">Drop image to crop</div>
          <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Image</button>
        </div>
      </div>

      <div class="crop-area" *ngIf="imgLoaded()">
        <div class="canvas-wrap" #canvasWrap
             (mousedown)="startCrop($event)" (mousemove)="moveCrop($event)" (mouseup)="endCrop()"
             (touchstart)="startCropTouch($event)" (touchmove)="moveCropTouch($event)" (touchend)="endCrop()">
          <canvas #canvas class="crop-canvas"></canvas>
          <div class="selection-box" *ngIf="hasCrop()" [style.left.px]="cropDisplay().x" [style.top.px]="cropDisplay().y" [style.width.px]="cropDisplay().w" [style.height.px]="cropDisplay().h">
            <div class="crop-corner tl"></div><div class="crop-corner tr"></div><div class="crop-corner bl"></div><div class="crop-corner br"></div>
          </div>
        </div>
        <div class="crop-info">
          <span *ngIf="hasCrop()">Crop: {{Math.round(cropActual().w)}} × {{Math.round(cropActual().h)}} px</span>
          <span *ngIf="!hasCrop()" class="hint">Click and drag on the image to select crop area</span>
        </div>
        <div class="action-row">
          <button class="btn-change" (click)="fi2.click()">Change Image</button>
          <input #fi2 type="file" accept="image/*" hidden (change)="loadFile($event)" />
          <button class="btn-crop" [disabled]="!hasCrop()" (click)="cropImage()">✂️ Crop & Download</button>
        </div>
        <canvas #outputCanvas hidden></canvas>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .ratio-bar{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem}
    .bar-label{font-size:.8rem;font-weight:700;color:#374151;margin-right:.25rem}
    .ratio-btn{padding:.3rem .75rem;border:1px solid #e5e7eb;border-radius:99px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;color:#6b7280;transition:all .15s}
    .ratio-btn.active{background:#2563eb;border-color:#2563eb;color:white}
    .drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .di{font-size:2.5rem;margin-bottom:.75rem}.dt{font-size:.95rem;font-weight:700;margin-bottom:.85rem}
    .ubtn{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer}
    .crop-area{display:flex;flex-direction:column;gap:.75rem}
    .canvas-wrap{position:relative;display:inline-block;cursor:crosshair;user-select:none;max-width:100%;overflow:hidden;border-radius:8px;border:1px solid #e5e7eb}
    .crop-canvas{display:block;max-width:100%;height:auto}
    .selection-box{position:absolute;border:2px solid #2563eb;box-shadow:0 0 0 9999px rgba(0,0,0,.45);pointer-events:none}
    .crop-corner{position:absolute;width:8px;height:8px;background:#2563eb;border-radius:2px}
    .tl{top:-4px;left:-4px}.tr{top:-4px;right:-4px}.bl{bottom:-4px;left:-4px}.br{bottom:-4px;right:-4px}
    .crop-info{font-size:.82rem;color:#6b7280;min-height:1.2em}.hint{color:#9ca3af}
    .action-row{display:flex;gap:.75rem;flex-wrap:wrap}
    .btn-change{padding:.55rem 1.1rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-weight:600;font-size:.85rem}
    .btn-crop{padding:.55rem 1.25rem;border:none;background:#2563eb;color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:.85rem}
    .btn-crop:disabled{opacity:.4;cursor:not-allowed}
  `]
})
export class ImageCropperComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('outputCanvas') outputRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap') wrapRef!: ElementRef<HTMLDivElement>;
  Math = Math;
  imgLoaded = signal(false);
  hasCrop = signal(false);
  selectedRatio = signal('Free');
  ratioKeys() { return Object.keys(RATIOS); }
  private img = new Image();
  private scale = 1;
  private startX = 0; private startY = 0;
  private drawing = false;
  private crop = {x:0,y:0,w:0,h:0};
  cropDisplay() { return {x:this.crop.x,y:this.crop.y,w:this.crop.w,h:this.crop.h}; }
  cropActual() { return {x:this.crop.x/this.scale,y:this.crop.y/this.scale,w:this.crop.w/this.scale,h:this.crop.h/this.scale}; }
  setRatio(r: string) { this.selectedRatio.set(r); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer?.files[0];
    if (f?.type.startsWith('image/')) this.loadImage(f);
  }
  loadFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.loadImage(f);
    (e.target as HTMLInputElement).value = '';
  }
  loadImage(file: File) {
    const fr = new FileReader();
    fr.onload = ev => {
      this.img.onload = () => {
        this.imgLoaded.set(true);
        setTimeout(() => {
          const c = this.canvasRef.nativeElement;
          const maxW = this.wrapRef.nativeElement.parentElement!.clientWidth - 40;
          this.scale = Math.min(1, maxW / this.img.width);
          c.width = this.img.width * this.scale;
          c.height = this.img.height * this.scale;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(this.img, 0, 0, c.width, c.height);
          this.hasCrop.set(false);
        }, 50);
      };
      this.img.src = ev.target!.result as string;
    };
    fr.readAsDataURL(file);
  }

  startCrop(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.startX = e.clientX - rect.left; this.startY = e.clientY - rect.top;
    this.drawing = true;
  }
  moveCrop(e: MouseEvent) {
    if (!this.drawing) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    let w = x - this.startX, h = y - this.startY;
    const ratio = RATIOS[this.selectedRatio()];
    if (ratio) h = w / ratio;
    this.crop = { x: w<0?x:this.startX, y: h<0?y:this.startY, w: Math.abs(w), h: Math.abs(h) };
    this.hasCrop.set(this.crop.w > 5 && this.crop.h > 5);
  }
  startCropTouch(e: TouchEvent) { const t=e.touches[0]; this.startCrop({clientX:t.clientX,clientY:t.clientY} as MouseEvent); }
  moveCropTouch(e: TouchEvent) { e.preventDefault(); const t=e.touches[0]; this.moveCrop({clientX:t.clientX,clientY:t.clientY} as MouseEvent); }
  endCrop() { this.drawing = false; }

  cropImage() {
    if (!this.hasCrop()) return;
    const ca = this.cropActual();
    const oc = this.outputRef.nativeElement;
    oc.width = Math.round(ca.w); oc.height = Math.round(ca.h);
    const ctx = oc.getContext('2d')!;
    ctx.drawImage(this.img, ca.x, ca.y, ca.w, ca.h, 0, 0, ca.w, ca.h);
    const a = document.createElement('a'); a.href = oc.toDataURL('image/png');
    a.download = 'cropped.png'; a.click();
  }
}
