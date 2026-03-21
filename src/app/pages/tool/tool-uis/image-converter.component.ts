// ─── image-converter.component.ts ────────────────────────────────────────────
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="settings-row">
        <div class="field">
          <label>Convert To</label>
          <select [(ngModel)]="targetFormat" class="sel">
            <option value="image/jpeg">JPEG (.jpg)</option>
            <option value="image/png">PNG (.png)</option>
            <option value="image/webp">WebP (.webp)</option>
          </select>
        </div>
        <div class="field" *ngIf="targetFormat !== 'image/png'">
          <label>Quality</label>
          <input type="range" min="10" max="100" [(ngModel)]="quality" class="range" />
          <span class="rval">{{quality}}%</span>
        </div>
        <div class="field" *ngIf="targetFormat === 'image/jpeg'">
          <label>BG Color (for transparent)</label>
          <input type="color" [(ngModel)]="bgColor" class="color-pick" />
        </div>
      </div>
      <div class="drop-zone" [class.drag-over]="drag()" (dragover)="$event.preventDefault();drag.set(true)" (dragleave)="drag.set(false)" (drop)="onDrop($event)" (click)="fi.click()">
        <input #fi type="file" accept="image/*" multiple hidden (change)="onFC($event)" />
        <div class="di">🔄</div>
        <div class="dt">Drop images to convert</div>
        <div class="ds">Supports JPG, PNG, WebP, GIF, BMP</div>
        <button class="ubtn" (click)="$event.stopPropagation();fi.click()">Choose Images</button>
      </div>
      <div class="proc" *ngIf="busy()"><div class="sp"></div>Converting...</div>
      <div class="res-list" *ngIf="results().length">
        <div class="res-hdr"><h3>Converted ({{results().length}})</h3><button class="btn-all" (click)="dlAll()">⬇ All</button></div>
        <div class="res-item" *ngFor="let r of results()">
          <img [src]="r.url" class="thumb" /><div class="rinfo"><div class="rn">{{r.name}}</div><div class="rd">{{r.w}}×{{r.h}} · {{r.ext.toUpperCase()}}</div></div>
          <button class="btn-dl" (click)="dl(r)">⬇</button>
        </div>
      </div>
    </div>`,
  styles: [`.tool-wrap{padding:1.25rem}.settings-row{display:flex;gap:1rem;flex-wrap:wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:1rem;align-items:flex-end}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}.sel{padding:.35rem .6rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem}.range{width:90px;accent-color:#2563eb}.rval{font-size:.85rem;font-weight:700;color:#2563eb}.color-pick{width:48px;height:32px;border:none;border-radius:6px;cursor:pointer}.drop-zone{border:2px dashed #d1d5db;border-radius:14px;padding:2rem;text-align:center;cursor:pointer;background:#fafafa}.drop-zone.drag-over{border-color:#2563eb;background:#eff6ff}.di{font-size:2rem;margin-bottom:.5rem}.dt{font-size:.95rem;font-weight:700;margin-bottom:.3rem}.ds{font-size:.78rem;color:#6b7280;margin-bottom:.85rem}.ubtn{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem}.proc{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:#eff6ff;border-radius:8px;margin-top:1rem;font-size:.875rem;font-weight:600;color:#1d4ed8}.sp{width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.res-list{margin-top:1.5rem}.res-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.res-hdr h3{font-size:1rem;font-weight:800;margin:0}.btn-all{background:#2563eb;color:white;border:none;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}.res-item{display:flex;align-items:center;gap:.85rem;background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.5rem}.thumb{width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}.rinfo{flex:1}.rn{font-size:.83rem;font-weight:600}.rd{font-size:.75rem;color:#6b7280;margin-top:.15rem}.btn-dl{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:.4rem .9rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.78rem}`]
})
export class ImageConverterComponent {
  targetFormat = 'image/webp'; quality = 85; bgColor = '#ffffff';
  drag = signal(false); busy = signal(false);
  results = signal<any[]>([]);
  onDrop(e: DragEvent) { e.preventDefault(); this.drag.set(false); const fs = Array.from(e.dataTransfer?.files||[]).filter(f=>f.type.startsWith('image/')); if(fs.length)this.process(fs); }
  onFC(e: Event) { const i=e.target as HTMLInputElement; const fs=Array.from(i.files||[]).filter(f=>f.type.startsWith('image/')); if(fs.length)this.process(fs); i.value=''; }
  async process(files: File[]) {
    this.busy.set(true);
    const out: any[] = [];
    for(const f of files) {
      const r = await new Promise<any>(res => {
        const fr=new FileReader(); fr.onload=ev=>{
          const img=new Image(); img.onload=()=>{
            const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
            const ctx=c.getContext('2d')!;
            if(this.targetFormat==='image/jpeg'){ctx.fillStyle=this.bgColor;ctx.fillRect(0,0,c.width,c.height);}
            ctx.drawImage(img,0,0);
            const url=c.toDataURL(this.targetFormat,this.quality/100);
            const ext=this.targetFormat.split('/')[1]==='jpeg'?'jpg':this.targetFormat.split('/')[1];
            res({url,name:f.name.replace(/\.[^/.]+$/,'')+'.'+ext,w:img.width,h:img.height,ext});
          }; img.src=ev.target!.result as string;
        }; fr.readAsDataURL(f);
      });
      out.push(r);
    }
    this.results.update(r=>[...r,...out]); this.busy.set(false);
  }
  dl(r: any){const a=document.createElement('a');a.href=r.url;a.download=r.name;a.click();}
  dlAll(){this.results().forEach(r=>this.dl(r));}
}
