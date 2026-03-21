import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CompressedFile { name: string; originalSize: number; compressedSize: number; saving: number; url: string; format: string; }

@Component({
  selector: 'app-image-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ic-wrap">
      <!-- Drop zone -->
      <div class="drop-zone" [class.dragging]="dragging" (dragover)="onDragOver($event)" (dragleave)="dragging=false" (drop)="onDrop($event)" (click)="fileInput.click()">
        <input #fileInput type="file" accept="image/*" multiple (change)="onFiles($event)" class="hidden" />
        <div class="dz-content" *ngIf="!files().length">
          <div class="dz-icon">🖼️</div>
          <div class="dz-title">Drop images here or click to upload</div>
          <div class="dz-sub">Supports JPG, PNG, WebP · Max 50MB per file · Batch supported</div>
        </div>
        <div class="dz-adding" *ngIf="files().length">
          <span>➕ Add more images</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-bar" *ngIf="files().length">
        <div class="ctrl-group">
          <label>Output Format</label>
          <div class="fmt-tabs">
            <button *ngFor="let f of formats" class="fmt-btn" [class.active]="outputFormat===f" (click)="outputFormat=f">{{ f }}</button>
          </div>
        </div>
        <div class="ctrl-group">
          <label>Quality: <strong>{{ quality }}%</strong></label>
          <input type="range" [(ngModel)]="quality" min="10" max="100" step="5" class="slider" />
        </div>
        <div class="ctrl-group">
          <label>Max Width (px)</label>
          <select [(ngModel)]="maxWidth" class="sel">
            <option value="0">Original</option>
            <option value="1920">1920px</option>
            <option value="1280">1280px</option>
            <option value="800">800px</option>
            <option value="600">600px</option>
          </select>
        </div>
        <button class="compress-btn" (click)="compressAll()" [disabled]="processing()">
          {{ processing() ? '⏳ Compressing...' : '⚡ Compress All' }}
        </button>
      </div>

      <!-- Results -->
      <div class="results-area" *ngIf="results().length">
        <!-- Summary stats -->
        <div class="summary-cards">
          <div class="sc"><div class="sc-num">{{ results().length }}</div><div class="sc-lbl">Images</div></div>
          <div class="sc"><div class="sc-num">{{ fmtSize(totalOriginal()) }}</div><div class="sc-lbl">Original Size</div></div>
          <div class="sc highlight"><div class="sc-num">{{ fmtSize(totalCompressed()) }}</div><div class="sc-lbl">Compressed Size</div></div>
          <div class="sc green"><div class="sc-num">{{ avgSaving() }}%</div><div class="sc-lbl">Avg Saving</div></div>
        </div>

        <!-- Savings bar chart -->
        <div class="chart-section">
          <div class="chart-title">📊 Compression Results</div>
          <div class="bar-list">
            <div class="bl-item" *ngFor="let r of results()">
              <div class="bl-name">{{ r.name.slice(0, 20) }}</div>
              <div class="bl-bars">
                <div class="bl-bar-row">
                  <span class="bl-lbl">Before</span>
                  <div class="bl-track">
                    <div class="bl-fill orig" style="width:100%"></div>
                  </div>
                  <span class="bl-size">{{ fmtSize(r.originalSize) }}</span>
                </div>
                <div class="bl-bar-row">
                  <span class="bl-lbl">After</span>
                  <div class="bl-track">
                    <div class="bl-fill comp" [style.width.%]="(r.compressedSize/r.originalSize)*100"></div>
                  </div>
                  <span class="bl-size green">{{ fmtSize(r.compressedSize) }}</span>
                </div>
              </div>
              <div class="bl-saving">-{{ r.saving }}%</div>
              <a [href]="r.url" [download]="'compressed_'+r.name" class="dl-btn">⬇️</a>
            </div>
          </div>
        </div>

        <button class="dl-all-btn" (click)="downloadAll()">⬇️ Download All Compressed Images</button>
      </div>

      <!-- Preview canvas (hidden) -->
      <canvas #cvs class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .ic-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .hidden{display:none}
    .drop-zone{border:2px dashed var(--border);border-radius:14px;padding:2.5rem;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-alt)}
    .drop-zone.dragging{border-color:var(--primary);background:var(--primary-light)}
    .drop-zone:hover{border-color:var(--primary)}
    .dz-icon{font-size:3rem;margin-bottom:.75rem}
    .dz-title{font-size:1rem;font-weight:700;margin-bottom:.35rem}
    .dz-sub{font-size:.8rem;color:var(--text-muted)}
    .dz-adding{font-size:.9rem;font-weight:600;color:var(--primary)}
    .controls-bar{display:flex;align-items:flex-end;gap:1.25rem;padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border);flex-wrap:wrap}
    .ctrl-group{display:flex;flex-direction:column;gap:.35rem;min-width:120px}
    .ctrl-group label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .fmt-tabs{display:flex;gap:.3rem}
    .fmt-btn{padding:.3rem .65rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.78rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s}
    .fmt-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .slider{accent-color:var(--primary);width:160px}
    .sel{padding:.4rem .6rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.83rem;outline:none;font-family:var(--font)}
    .compress-btn{padding:.6rem 1.5rem;border-radius:10px;border:none;background:var(--primary);color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;font-family:var(--font);margin-left:auto;transition:opacity .15s}
    .compress-btn:disabled{opacity:.5;cursor:not-allowed}
    .compress-btn:not(:disabled):hover{opacity:.85}
    .summary-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
    .sc{text-align:center;padding:1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .sc.highlight{background:var(--primary-light);border-color:var(--primary)}
    .sc.green{background:#10b98111;border-color:#10b98144}
    .sc-num{font-size:1.3rem;font-weight:800;color:var(--text)}
    .sc.highlight .sc-num{color:var(--primary)}
    .sc.green .sc-num{color:var(--green)}
    .sc-lbl{font-size:.72rem;font-weight:600;color:var(--text-muted);text-transform:uppercase}
    .chart-section{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .chart-title{padding:.65rem .9rem;font-size:.83rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .bar-list{display:flex;flex-direction:column;max-height:320px;overflow-y:auto}
    .bl-item{display:flex;align-items:center;gap:.75rem;padding:.65rem .9rem;border-bottom:1px solid var(--border)}
    .bl-name{width:140px;font-size:.78rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}
    .bl-bars{flex:1;display:flex;flex-direction:column;gap:.25rem}
    .bl-bar-row{display:flex;align-items:center;gap:.5rem}
    .bl-lbl{width:36px;font-size:.68rem;color:var(--text-muted);flex-shrink:0}
    .bl-track{flex:1;height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .bl-fill{height:100%;border-radius:99px;transition:width .4s}
    .bl-fill.orig{background:var(--text-muted)}
    .bl-fill.comp{background:var(--primary)}
    .bl-size{width:55px;font-size:.72rem;text-align:right;flex-shrink:0}
    .bl-size.green{color:var(--green);font-weight:700}
    .bl-saving{width:40px;font-size:.8rem;font-weight:800;color:var(--green);text-align:right;flex-shrink:0}
    .dl-btn{background:var(--primary-light);color:var(--primary);border:none;padding:.3rem .55rem;border-radius:7px;cursor:pointer;font-size:.85rem;text-decoration:none;flex-shrink:0}
    .dl-all-btn{padding:.75rem;border-radius:10px;border:none;background:var(--green);color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:opacity .15s}
    .dl-all-btn:hover{opacity:.85}
    @media(max-width:600px){.summary-cards{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class ImageCompressorComponent {
  @ViewChild('cvs') canvasRef!: ElementRef<HTMLCanvasElement>;
  dragging = false;
  outputFormat = 'JPEG';
  quality = 80;
  maxWidth = 0;
  formats = ['JPEG', 'PNG', 'WebP'];

  files = signal<File[]>([]);
  results = signal<CompressedFile[]>([]);
  processing = signal(false);

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragging = true; }
  onDrop(e: DragEvent) { e.preventDefault(); this.dragging = false; const files = Array.from(e.dataTransfer?.files ?? []); this.addFiles(files); }
  onFiles(e: Event) { const files = Array.from((e.target as HTMLInputElement).files ?? []); this.addFiles(files); }

  addFiles(incoming: File[]) {
    const imgs = incoming.filter(f => f.type.startsWith('image/'));
    this.files.set([...this.files(), ...imgs]);
  }

  totalOriginal() { return this.results().reduce((s, r) => s + r.originalSize, 0); }
  totalCompressed() { return this.results().reduce((s, r) => s + r.compressedSize, 0); }
  avgSaving() { const r = this.results(); return r.length ? Math.round(r.reduce((s, x) => s + x.saving, 0) / r.length) : 0; }

  async compressAll() {
    this.processing.set(true);
    const out: CompressedFile[] = [];
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const mimeMap: Record<string, string> = { JPEG: 'image/jpeg', PNG: 'image/png', WebP: 'image/webp' };
    const mime = mimeMap[this.outputFormat];

    for (const file of this.files()) {
      try {
        const img = await this.loadImage(file);
        let w = img.width, h = img.height;
        if (this.maxWidth && w > +this.maxWidth) { h = Math.round(h * +this.maxWidth / w); w = +this.maxWidth; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL(mime, this.quality / 100);
        const compressedSize = Math.round((dataUrl.length - 22) * 3 / 4);
        const saving = Math.max(0, Math.round((1 - compressedSize / file.size) * 100));
        out.push({ name: file.name, originalSize: file.size, compressedSize, saving, url: dataUrl, format: this.outputFormat });
      } catch {}
    }
    this.results.set(out);
    this.processing.set(false);
  }

  loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); res(img); }; img.onerror = rej; img.src = url;
    });
  }

  downloadAll() { this.results().forEach(r => { const a = document.createElement('a'); a.href = r.url; a.download = 'compressed_' + r.name; a.click(); }); }

  fmtSize(b: number): string {
    if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
    return b + ' B';
  }
}
