import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-watermark',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="drop-zone" *ngIf="!imgSrc()" (click)="fi.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        <input #fi type="file" accept="image/*" hidden (change)="loadFile($event)" />
        <div class="di">🖼️</div><div class="dt">Drop image to watermark</div>
        <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Image</button>
      </div>

      <div class="editor" *ngIf="imgSrc()">
        <canvas #canvas class="preview-canvas"></canvas>
        <div class="controls">
          <!-- Watermark Type -->
          <div class="ctrl-section">
            <div class="ctrl-title">Watermark Type</div>
            <div class="type-tabs">
              <button [class.active]="wmType()==='text'" (click)="wmType.set('text');draw()">Text</button>
              <button [class.active]="wmType()==='image'" (click)="wmType.set('image')">Image/Logo</button>
            </div>
          </div>

          <!-- Text watermark settings -->
          <div class="ctrl-section" *ngIf="wmType()==='text'">
            <div class="ctrl-title">Text Settings</div>
            <div class="field-col">
              <input type="text" [(ngModel)]="wmText" (ngModelChange)="draw()" placeholder="Your watermark text" class="text-inp" />
              <div class="row-fields">
                <div class="mini-field"><label>Size</label><input type="number" [(ngModel)]="fontSize" (ngModelChange)="draw()" class="sm-inp" min="8" max="200" /></div>
                <div class="mini-field"><label>Color</label><input type="color" [(ngModel)]="fontColor" (ngModelChange)="draw()" class="color-inp" /></div>
                <div class="mini-field"><label>Opacity</label><input type="range" min="5" max="100" [(ngModel)]="opacity" (ngModelChange)="draw()" class="range-sm" /><span class="rv">{{opacity}}%</span></div>
              </div>
              <div class="row-fields">
                <div class="mini-field"><label>Font</label>
                  <select [(ngModel)]="fontFamily" (ngModelChange)="draw()" class="sel-sm">
                    <option value="Arial">Arial</option><option value="Georgia">Georgia</option>
                    <option value="'Courier New'">Courier New</option><option value="Impact">Impact</option><option value="Verdana">Verdana</option>
                  </select>
                </div>
                <div class="mini-field"><label>Bold</label><input type="checkbox" [(ngModel)]="fontBold" (ngModelChange)="draw()" /></div>
                <div class="mini-field"><label>Italic</label><input type="checkbox" [(ngModel)]="fontItalic" (ngModelChange)="draw()" /></div>
              </div>
              <div class="mini-field"><label>Rotation (°)</label><input type="range" min="-180" max="180" [(ngModel)]="textRotation" (ngModelChange)="draw()" class="range-full" /><span class="rv">{{textRotation}}°</span></div>
            </div>
          </div>

          <!-- Logo watermark -->
          <div class="ctrl-section" *ngIf="wmType()==='image'">
            <div class="ctrl-title">Logo Settings</div>
            <button class="btn-logo" (click)="logoInput.click()">Upload Logo (PNG)</button>
            <input #logoInput type="file" accept="image/*" hidden (change)="loadLogo($event)" />
            <div *ngIf="logoLoaded()" class="field-col mt">
              <div class="mini-field"><label>Size (%)</label><input type="range" min="5" max="80" [(ngModel)]="logoSize" (ngModelChange)="draw()" class="range-full" /><span class="rv">{{logoSize}}%</span></div>
              <div class="mini-field"><label>Opacity</label><input type="range" min="5" max="100" [(ngModel)]="opacity" (ngModelChange)="draw()" class="range-full" /><span class="rv">{{opacity}}%</span></div>
            </div>
          </div>

          <!-- Position -->
          <div class="ctrl-section">
            <div class="ctrl-title">Position</div>
            <div class="pos-grid">
              <button *ngFor="let p of positions" [class.active]="position()===p" (click)="position.set(p);draw()" class="pos-btn">{{p}}</button>
            </div>
          </div>

          <div class="action-row">
            <button class="btn-change" (click)="fi2.click()">Change Image</button>
            <input #fi2 type="file" accept="image/*" hidden (change)="loadFile($event)" />
            <button class="btn-save" (click)="save()">⬇ Download</button>
          </div>
        </div>
      </div>
      <canvas #outputC hidden></canvas>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .di{font-size:2.5rem;margin-bottom:.75rem}.dt{font-size:.95rem;font-weight:700;margin-bottom:.85rem}
    .ubtn,.btn-logo{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem}
    .editor{display:grid;grid-template-columns:1fr 280px;gap:1.25rem}
    @media(max-width:720px){.editor{grid-template-columns:1fr}}
    .preview-canvas{max-width:100%;border-radius:8px;border:1px solid #e5e7eb;display:block}
    .controls{display:flex;flex-direction:column;gap:.75rem}
    .ctrl-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .ctrl-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.5rem}
    .type-tabs{display:flex;gap:.4rem}.type-tabs button{padding:.35rem .85rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.8rem;font-weight:600}
    .type-tabs button.active{background:#2563eb;border-color:#2563eb;color:white}
    .field-col{display:flex;flex-direction:column;gap:.5rem}
    .row-fields{display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end}
    .mini-field{display:flex;flex-direction:column;gap:.2rem}.mini-field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .text-inp{width:100%;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem}
    .sm-inp{width:60px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:5px;font-size:.82rem}
    .color-inp{width:44px;height:30px;border:none;border-radius:5px;cursor:pointer}
    .sel-sm{padding:.3rem .5rem;border:1px solid #d1d5db;border-radius:5px;font-size:.8rem}
    .range-sm{width:70px;accent-color:#2563eb}.range-full{width:100%;accent-color:#2563eb}
    .rv{font-size:.78rem;font-weight:700;color:#2563eb}.mt{margin-top:.5rem}
    .pos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem}
    .pos-btn{padding:.35rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.7rem;font-weight:600;text-align:center;transition:all .15s}
    .pos-btn.active{background:#2563eb;border-color:#2563eb;color:white}
    .action-row{display:flex;gap:.6rem}
    .btn-change{padding:.5rem 1rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-weight:600;font-size:.82rem}
    .btn-save{flex:1;padding:.5rem 1rem;border:none;background:#2563eb;color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:.82rem}
  `]
})
export class ImageWatermarkComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('outputC') outputRef!: ElementRef<HTMLCanvasElement>;
  imgSrc = signal(''); private img = new Image(); private logoImg = new Image();
  logoLoaded = signal(false); wmType = signal<'text'|'image'>('text');
  wmText = 'UtilityMega.com'; fontSize = 36; fontColor = '#ffffff'; fontFamily = 'Arial';
  fontBold = false; fontItalic = false; textRotation = -30; opacity = 50; logoSize = 20;
  position = signal('Bottom Right');
  positions = ['Top Left','Top Center','Top Right','Middle Left','Center','Middle Right','Bottom Left','Bottom Center','Bottom Right'];
  private fileName = 'image';

  onDrop(e: DragEvent){e.preventDefault();const f=e.dataTransfer?.files[0];if(f?.type.startsWith('image/'))this.loadImage(f);}
  loadFile(e: Event){const f=(e.target as HTMLInputElement).files?.[0];if(f)this.loadImage(f);(e.target as HTMLInputElement).value='';}
  loadLogo(e: Event){const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;const fr=new FileReader();fr.onload=ev=>{this.logoImg.onload=()=>{this.logoLoaded.set(true);this.draw();};this.logoImg.src=ev.target!.result as string;};fr.readAsDataURL(f);}
  loadImage(file: File){
    this.fileName=file.name.replace(/\.[^/.]+$/,'');
    const fr=new FileReader();fr.onload=ev=>{this.img.onload=()=>{this.imgSrc.set(this.img.src);setTimeout(()=>this.draw(),50);};this.img.src=ev.target!.result as string;};fr.readAsDataURL(file);
  }

  draw(){
    if(!this.canvasRef||!this.imgSrc())return;
    const c=this.canvasRef.nativeElement;c.width=this.img.width;c.height=this.img.height;
    const ctx=c.getContext('2d')!;ctx.drawImage(this.img,0,0);
    const alpha=this.opacity/100;
    if(this.wmType()==='text'){
      const style=`${this.fontItalic?'italic':''} ${this.fontBold?'bold':''} ${this.fontSize}px ${this.fontFamily}`.trim();
      ctx.font=style;ctx.fillStyle=this.fontColor;ctx.globalAlpha=alpha;
      const m=ctx.measureText(this.wmText);const tw=m.width,th=this.fontSize;
      const pos=this.getPos(tw,th,c.width,c.height,20);
      ctx.save();ctx.translate(pos.x+tw/2,pos.y+th/2);ctx.rotate(this.textRotation*Math.PI/180);ctx.fillText(this.wmText,-tw/2,th/2);ctx.restore();
    } else if(this.wmType()==='image'&&this.logoLoaded()){
      const lw=c.width*this.logoSize/100;const lh=this.logoImg.height*(lw/this.logoImg.width);
      const pos=this.getPos(lw,lh,c.width,c.height,20);
      ctx.globalAlpha=alpha;ctx.drawImage(this.logoImg,pos.x,pos.y,lw,lh);
    }
    ctx.globalAlpha=1;
  }

  getPos(w:number,h:number,cw:number,ch:number,pad:number){
    const p=this.position();
    let x=pad,y=pad;
    if(p.includes('Center')||p==='Center')x=cw/2-w/2;
    if(p.includes('Right'))x=cw-w-pad;
    if(p.includes('Middle')||p==='Center')y=ch/2-h/2;
    if(p.includes('Bottom'))y=ch-h-pad;
    return{x,y};
  }

  save(){
    if(!this.canvasRef)return;
    const a=document.createElement('a');a.href=this.canvasRef.nativeElement.toDataURL('image/png');
    a.download=this.fileName+'_watermarked.png';a.click();
  }
}
