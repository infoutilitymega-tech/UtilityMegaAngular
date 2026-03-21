import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CompressedFile {
  name: string;
  originalSize: number;
  compressedSize: number;
  quality: number;
  format: string;
  originalUrl: string;
  compressedUrl: string;
  savings: number;
}

@Component({
  selector: 'app-image-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <!-- Settings Bar -->
      <div class="settings-bar">
        <div class="setting-group">
          <label>Quality</label>
          <div class="range-wrap">
            <input type="range" min="10" max="100" [(ngModel)]="quality" class="range-input" />
            <span class="range-val">{{quality}}%</span>
          </div>
        </div>
        <div class="setting-group">
          <label>Output Format</label>
          <select [(ngModel)]="outputFormat" class="select-input">
            <option value="same">Same as input</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div class="setting-group">
          <label>Max Width (px)</label>
          <input type="number" [(ngModel)]="maxWidth" placeholder="No limit" class="num-input" />
        </div>
      </div>

      <!-- Drop Zone -->
      <div class="drop-zone"
           [class.drag-over]="isDragging()"
           (dragover)="$event.preventDefault(); isDragging.set(true)"
           (dragleave)="isDragging.set(false)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <input #fileInput type="file" accept="image/*" multiple hidden (change)="onFileChange($event)" />
        <div class="drop-icon">🖼️</div>
        <div class="drop-title">Drop images here or click to upload</div>
        <div class="drop-sub">JPG, PNG, WebP · Multiple files supported · Max 50MB each</div>
        <button class="upload-btn" (click)="$event.stopPropagation(); fileInput.click()">Choose Images</button>
      </div>

      <!-- Processing Indicator -->
      <div class="processing-bar" *ngIf="isProcessing()">
        <div class="spinner"></div>
        <span>Compressing images...</span>
      </div>

      <!-- Results -->
      <div class="results-grid" *ngIf="results().length > 0">
        <div class="results-header">
          <h3>Compressed Images</h3>
          <div class="results-summary">
            <span class="badge-stat green">{{results().length}} files</span>
            <span class="badge-stat blue">Avg {{avgSavings()}}% saved</span>
            <button class="btn-download-all" (click)="downloadAll()">⬇ Download All</button>
          </div>
        </div>
        <div class="result-card" *ngFor="let r of results()">
          <div class="result-previews">
            <div class="preview-box">
              <img [src]="r.originalUrl" alt="Original" class="preview-img" />
              <div class="preview-label">Original<br>{{formatSize(r.originalSize)}}</div>
            </div>
            <div class="arrow-sep">→</div>
            <div class="preview-box">
              <img [src]="r.compressedUrl" alt="Compressed" class="preview-img" />
              <div class="preview-label compressed-label">Compressed<br>{{formatSize(r.compressedSize)}}</div>
            </div>
          </div>
          <div class="result-info">
            <div class="result-name">{{r.name}}</div>
            <div class="result-stats">
              <span class="stat-pill green">{{r.savings}}% smaller</span>
              <span class="stat-pill gray">{{r.format.replace('image/','').toUpperCase()}} · Q{{r.quality}}</span>
            </div>
          </div>
          <button class="btn-dl" (click)="download(r)">⬇ Download</button>
        </div>
      </div>

      <!-- Empty state after clear -->
      <div class="empty-state" *ngIf="results().length === 0 && !isProcessing()">
        <div class="empty-icon">📦</div>
        <p>Upload images above to compress them instantly in your browser.</p>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap { padding: 1.25rem; }
    .settings-bar { display: flex; gap: 1.25rem; flex-wrap: wrap; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
    .setting-group { display: flex; flex-direction: column; gap: .3rem; }
    .setting-group label { font-size: .72rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
    .range-wrap { display: flex; align-items: center; gap: .5rem; }
    .range-input { width: 120px; accent-color: #2563eb; }
    .range-val { font-size: .875rem; font-weight: 700; color: #2563eb; min-width: 36px; }
    .select-input, .num-input { padding: .35rem .6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: .85rem; background: white; outline: none; }
    .num-input { width: 100px; }
    .drop-zone { border: 2px dashed #d1d5db; border-radius: 14px; padding: 2.5rem; text-align: center; cursor: pointer; transition: all .2s; background: #fafafa; }
    .drop-zone.drag-over { border-color: #2563eb; background: #eff6ff; }
    .drop-zone:hover { border-color: #93c5fd; }
    .drop-icon { font-size: 2.5rem; margin-bottom: .75rem; }
    .drop-title { font-size: 1rem; font-weight: 700; margin-bottom: .4rem; }
    .drop-sub { font-size: .8rem; color: #6b7280; margin-bottom: 1rem; }
    .upload-btn { background: #2563eb; color: white; border: none; padding: .6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .875rem; }
    .processing-bar { display: flex; align-items: center; gap: .75rem; padding: .85rem 1.25rem; background: #eff6ff; border-radius: 10px; margin-top: 1rem; font-size: .875rem; font-weight: 600; color: #1d4ed8; }
    .spinner { width: 18px; height: 18px; border: 2px solid #bfdbfe; border-top-color: #2563eb; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .results-grid { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .results-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .75rem; margin-bottom: .25rem; }
    .results-header h3 { font-size: 1rem; font-weight: 800; margin: 0; }
    .results-summary { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .badge-stat { font-size: .72rem; font-weight: 700; padding: .2rem .65rem; border-radius: 99px; }
    .badge-stat.green { background: #ecfdf5; color: #059669; }
    .badge-stat.blue { background: #eff6ff; color: #2563eb; }
    .btn-download-all { background: #2563eb; color: white; border: none; padding: .45rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: .8rem; }
    .result-card { display: flex; align-items: center; gap: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; flex-wrap: wrap; }
    .result-previews { display: flex; align-items: center; gap: .5rem; }
    .preview-box { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
    .preview-img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
    .preview-label { font-size: .65rem; text-align: center; color: #6b7280; line-height: 1.3; }
    .compressed-label { color: #059669; font-weight: 700; }
    .arrow-sep { font-size: 1.1rem; color: #9ca3af; }
    .result-info { flex: 1; }
    .result-name { font-size: .83rem; font-weight: 600; margin-bottom: .35rem; word-break: break-all; }
    .result-stats { display: flex; gap: .4rem; flex-wrap: wrap; }
    .stat-pill { font-size: .7rem; padding: .15rem .55rem; border-radius: 99px; font-weight: 700; }
    .stat-pill.green { background: #ecfdf5; color: #059669; }
    .stat-pill.gray { background: #f3f4f6; color: #6b7280; }
    .btn-dl { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: .45rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: .8rem; white-space: nowrap; }
    .btn-dl:hover { background: #d1fae5; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-icon { font-size: 2rem; margin-bottom: .5rem; }
    .empty-state p { font-size: .875rem; }
  `]
})
export class ImageCompressorComponent {
  quality = 80;
  outputFormat = 'same';
  maxWidth = null as number | null;
  isDragging = signal(false);
  isProcessing = signal(false);
  results = signal<CompressedFile[]>([]);

  avgSavings(): number {
    const r = this.results();
    if (!r.length) return 0;
    return Math.round(r.reduce((a, b) => a + b.savings, 0) / r.length);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.processFiles(files);
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.processFiles(files);
    input.value = '';
  }

  async processFiles(files: File[]) {
    this.isProcessing.set(true);
    const newResults: CompressedFile[] = [];
    for (const file of files) {
      const result = await this.compressFile(file);
      if (result) newResults.push(result);
    }
    this.results.update(r => [...r, ...newResults]);
    this.isProcessing.set(false);
  }

  compressFile(file: File): Promise<CompressedFile | null> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (this.maxWidth && w > this.maxWidth) { h = Math.round(h * this.maxWidth / w); w = this.maxWidth; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          const fmt = this.outputFormat === 'same' ? (file.type || 'image/jpeg') : this.outputFormat;
          const q = this.quality / 100;
          const compressedUrl = canvas.toDataURL(fmt, q);
          const compressedSize = Math.round((compressedUrl.length - 22) * 0.75);
          const savings = Math.max(0, Math.round((1 - compressedSize / file.size) * 100));
          const ext = fmt.split('/')[1];
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve({
            name: file.name,
            originalSize: file.size,
            compressedSize,
            quality: this.quality,
            format: fmt,
            originalUrl: e.target!.result as string,
            compressedUrl,
            savings
          });
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  download(r: CompressedFile) {
    const a = document.createElement('a');
    a.href = r.compressedUrl;
    const ext = r.format.split('/')[1];
    a.download = r.name.replace(/\.[^/.]+$/, '') + '_compressed.' + (ext === 'jpeg' ? 'jpg' : ext);
    a.click();
  }

  downloadAll() { this.results().forEach(r => this.download(r)); }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
