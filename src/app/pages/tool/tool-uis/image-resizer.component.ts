import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-resizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ir-wrap">
      <div class="drop-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        <input #fileInput type="file" accept="image/*" (change)="onFile($event)" class="hidden" />
        <div *ngIf="!preview()">
          <div class="dz-icon">📐</div>
          <div class="dz-title">Click or drop image to resize</div>
          <div class="dz-sub">JPG, PNG, WebP supported</div>
        </div>
        <img *ngIf="preview()" [src]="preview()" class="preview-img" alt="preview" />
      </div>

      <div class="controls" *ngIf="original()">
        <!-- Original info -->
        <div class="orig-info">
          <span>Original: <strong>{{ original()!.width }} × {{ original()!.height }}px</strong></span>
          <span>Size: <strong>{{ fmtSize(originalSize()) }}</strong></span>
        </div>

        <!-- Presets -->
        <div class="presets-section">
          <div class="ps-title">🎯 Social Media Presets</div>
          <div class="presets-grid">
            <button *ngFor="let p of presets" class="preset-btn" (click)="applyPreset(p)">
              <span class="p-icon">{{ p.icon }}</span>
              <span class="p-name">{{ p.name }}</span>
              <span class="p-size">{{ p.w }}×{{ p.h }}</span>
            </button>
          </div>
        </div>

        <!-- Custom dimensions -->
        <div class="dim-row">
          <div class="inp-field">
            <label>Width (px)</label>
            <div class="inp-box">
              <input type="number" [(ngModel)]="newW" (input)="onWidthChange()" min="1" class="val-inp" />
            </div>
          </div>
          <button class="lock-btn" (click)="lockRatio=!lockRatio" [title]="lockRatio?'Unlock ratio':'Lock ratio'">
            {{ lockRatio ? '🔒' : '🔓' }}
          </button>
          <div class="inp-field">
            <label>Height (px)</label>
            <div class="inp-box">
              <input type="number" [(ngModel)]="newH" (input)="onHeightChange()" min="1" class="val-inp" />
            </div>
          </div>
          <div class="inp-field">
            <label>Scale %</label>
            <div class="inp-box">
              <input type="number" [(ngModel)]="scale" (input)="onScaleChange()" min="1" max="400" class="val-inp" />
              <span class="suf">%</span>
            </div>
          </div>
          <div class="inp-field">
            <label>Format</label>
            <select [(ngModel)]="format" class="sel">
              <option>JPEG</option><option>PNG</option><option>WebP</option>
            </select>
          </div>
        </div>

        <!-- Output preview info -->
        <div class="output-info" *ngIf="newW && newH">
          <span>Output: <strong>{{ newW }} × {{ newH }}px</strong></span>
          <span class="est-size">Est. size: ~{{ estSize() }}</span>
          <span [class.green]="isShrinking()" [class.red]="!isShrinking()">
            {{ isShrinking() ? '📉 Smaller' : '📈 Larger' }} than original
          </span>
        </div>

        <button class="resize-btn" (click)="resize()" [disabled]="!newW || !newH">
          ✂️ Resize Image
        </button>
      </div>

      <!-- Result -->
      <div class="result-area" *ngIf="resultUrl()">
        <div class="result-header">
          <span class="result-badge">✅ Resized Successfully</span>
          <a [href]="resultUrl()!" [download]="'resized_'+fileName()" class="dl-btn">⬇️ Download {{ newW }}×{{ newH }}px</a>
        </div>
        <img [src]="resultUrl()!" class="result-img" alt="resized" />
      </div>

      <canvas #cvs class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .ir-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .hidden{display:none}
    .drop-zone{border:2px dashed var(--border);border-radius:14px;padding:2rem;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-alt);min-height:160px;display:flex;align-items:center;justify-content:center}
    .drop-zone:hover{border-color:var(--primary)}
    .dz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .dz-title{font-size:.95rem;font-weight:700;margin-bottom:.25rem}
    .dz-sub{font-size:.78rem;color:var(--text-muted)}
    .preview-img{max-height:200px;border-radius:8px;object-fit:contain}
    .controls{display:flex;flex-direction:column;gap:1rem}
    .orig-info{display:flex;gap:1.5rem;font-size:.85rem;color:var(--text-muted);padding:.6rem .9rem;background:var(--bg-alt);border-radius:8px;border:1px solid var(--border)}
    .orig-info strong{color:var(--text)}
    .ps-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .presets-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.5rem}
    .preset-btn{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.6rem .5rem;border-radius:10px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-family:var(--font);transition:all .15s}
    .preset-btn:hover{border-color:var(--primary);background:var(--primary-light)}
    .p-icon{font-size:1.1rem}
    .p-name{font-size:.72rem;font-weight:700}
    .p-size{font-size:.65rem;color:var(--text-muted)}
    .dim-row{display:flex;align-items:flex-end;gap:.75rem;flex-wrap:wrap}
    .inp-field{display:flex;flex-direction:column;gap:.3rem;min-width:90px}
    .inp-field label{font-size:.75rem;font-weight:600;color:var(--text-muted)}
    .inp-box{display:flex;align-items:center;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:8px;padding:.45rem .65rem;gap:.25rem;transition:border-color .15s}
    .inp-box:focus-within{border-color:var(--primary)}
    .val-inp{border:none;outline:none;background:transparent;font-size:.9rem;font-weight:700;color:var(--text);width:65px;font-family:var(--font)}
    .suf{font-size:.75rem;color:var(--text-muted)}
    .sel{padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.83rem;outline:none;font-family:var(--font)}
    .lock-btn{padding:.4rem .6rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-size:1.1rem;margin-bottom:1px;transition:all .15s}
    .lock-btn:hover{border-color:var(--primary)}
    .output-info{display:flex;gap:1.25rem;align-items:center;font-size:.83rem;padding:.5rem .85rem;background:var(--bg-alt);border-radius:8px;flex-wrap:wrap}
    .output-info strong{color:var(--text)}
    .est-size{color:var(--text-muted)}
    .green{color:var(--green);font-weight:700}
    .red{color:var(--red);font-weight:700}
    .resize-btn{padding:.7rem;border-radius:10px;border:none;background:var(--primary);color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:opacity .15s}
    .resize-btn:disabled{opacity:.4;cursor:not-allowed}
    .resize-btn:not(:disabled):hover{opacity:.88}
    .result-area{display:flex;flex-direction:column;gap:.75rem}
    .result-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem}
    .result-badge{font-size:.85rem;font-weight:700;color:var(--green)}
    .dl-btn{background:var(--primary);color:#fff;border:none;padding:.55rem 1rem;border-radius:9px;text-decoration:none;font-size:.82rem;font-weight:700;cursor:pointer}
    .result-img{max-height:280px;border-radius:10px;border:1px solid var(--border);object-fit:contain}
  `]
})
export class ImageResizerComponent {
  @ViewChild('cvs') canvasRef!: ElementRef<HTMLCanvasElement>;
  preview = signal('');
  resultUrl = signal('');
  original = signal<{ width: number; height: number } | null>(null);
  originalSize = signal(0);
  fileName = signal('image');

  newW = 0; newH = 0; scale = 100;
  lockRatio = true;
  format = 'JPEG';

  presets = [
    { icon: '📘', name: 'FB Cover', w: 820, h: 312 },
    { icon: '📸', name: 'Instagram', w: 1080, h: 1080 },
    { icon: '🐦', name: 'Twitter', w: 1500, h: 500 },
    { icon: '🎬', name: 'YouTube', w: 1280, h: 720 },
    { icon: '💼', name: 'LinkedIn', w: 1128, h: 191 },
    { icon: '📌', name: 'Pinterest', w: 1000, h: 1500 },
  ];

  fmtSize(bytes: number): string {
  if (!bytes) return '0 B';

  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return bytes + ' B';
}

  onDrop(e: DragEvent) { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f) this.loadFile(f); }
  onFile(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.loadFile(f); }

  loadFile(f: File) {
    this.fileName.set(f.name); this.originalSize.set(f.size);
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target!.result as string; this.preview.set(src);
      const img = new Image();
      img.onload = () => {
        this.original.set({ width: img.width, height: img.height });
        this.newW = img.width; this.newH = img.height; this.scale = 100;
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  }

  applyPreset(p: { w: number; h: number }) { this.newW = p.w; this.newH = p.h; this.scale = Math.round(p.w / (this.original()?.width || 1) * 100); }

  onWidthChange() {
    if (this.lockRatio && this.original()) {
      this.newH = Math.round(this.newW * this.original()!.height / this.original()!.width);
    }
    this.scale = Math.round(this.newW / (this.original()?.width || 1) * 100);
  }

  onHeightChange() {
    if (this.lockRatio && this.original()) {
      this.newW = Math.round(this.newH * this.original()!.width / this.original()!.height);
    }
  }

  onScaleChange() {
    if (!this.original()) return;
    this.newW = Math.round(this.original()!.width * this.scale / 100);
    this.newH = Math.round(this.original()!.height * this.scale / 100);
  }

  isShrinking() { return this.newW < (this.original()?.width ?? 0) || this.newH < (this.original()?.height ?? 0); }

  estSize(): string {
    const pixels = this.newW * this.newH;
    const bytes = this.format === 'PNG' ? pixels * 3 * 0.5 : pixels * 0.15;
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }

  resize() {
    const img = new Image(); img.src = this.preview();
    img.onload = () => {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = this.newW; canvas.height = this.newH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, this.newW, this.newH);
      const mime = this.format === 'PNG' ? 'image/png' : this.format === 'WebP' ? 'image/webp' : 'image/jpeg';
      this.resultUrl.set(canvas.toDataURL(mime, 0.9));
    };
  }
}
