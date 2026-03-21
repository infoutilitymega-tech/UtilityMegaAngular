import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const PRESETS: Record<string, {w:number,h:number}> = {
  'Instagram Square': {w:1080,h:1080},
  'Instagram Story': {w:1080,h:1920},
  'Facebook Cover': {w:820,h:312},
  'Twitter Header': {w:1500,h:500},
  'LinkedIn Banner': {w:1128,h:191},
  'YouTube Thumbnail': {w:1280,h:720},
  'WhatsApp DP': {w:500,h:500},
  'A4 Print (300dpi)': {w:2480,h:3508},
};

interface ResizedFile { name: string; url: string; width: number; height: number; }

@Component({
  selector: 'app-image-resizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">

      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button [class.active]="mode()==='pixels'" (click)="mode.set('pixels')">Exact Pixels</button>
        <button [class.active]="mode()==='percent'" (click)="mode.set('percent')">Percentage</button>
        <button [class.active]="mode()==='preset'" (click)="mode.set('preset')">Social Media Presets</button>
      </div>

      <!-- Pixel Mode -->
      <div class="mode-panel" *ngIf="mode()==='pixels'">
        <div class="input-row">
          <div class="field-group">
            <label>Width (px)</label>
            <input type="number" [(ngModel)]="targetW" (ngModelChange)="onWidthChange()" class="dim-input" placeholder="Width" />
          </div>
          <span class="x-sep">×</span>
          <div class="field-group">
            <label>Height (px)</label>
            <input type="number" [(ngModel)]="targetH" (ngModelChange)="onHeightChange()" class="dim-input" placeholder="Height" />
          </div>
          <div class="lock-wrap">
            <button class="lock-btn" [class.locked]="lockRatio()" (click)="toggleLockRatio()" [title]="lockRatio() ? 'Aspect ratio locked' : 'Aspect ratio free'">
              {{lockRatio() ? '🔒' : '🔓'}}
            </button>
            <span class="lock-label">{{lockRatio() ? 'Locked' : 'Free'}}</span>
          </div>
        </div>
      </div>

      <!-- Percent Mode -->
      <div class="mode-panel" *ngIf="mode()==='percent'">
        <div class="input-row">
          <div class="field-group">
            <label>Scale (%)</label>
            <input type="number" [(ngModel)]="scalePercent" min="1" max="500" class="dim-input" placeholder="50" />
          </div>
          <span class="pct-note">e.g. 50 = half size · 200 = double size</span>
        </div>
      </div>

      <!-- Preset Mode -->
      <div class="mode-panel" *ngIf="mode()==='preset'">
        <div class="presets-grid">
          <button *ngFor="let p of presetKeys()" class="preset-btn" [class.selected]="selectedPreset()===p" (click)="selectPreset(p)">
            <span class="preset-name">{{p}}</span>
            <span class="preset-dim">{{presets[p].w}}×{{presets[p].h}}</span>
          </button>
        </div>
      </div>

      <!-- Output Format -->
      <div class="fmt-row">
        <label>Output Format</label>
        <select [(ngModel)]="outputFormat" class="select-input">
          <option value="same">Same as input</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select>
        <label style="margin-left:1rem">Quality</label>
        <input type="range" min="10" max="100" [(ngModel)]="quality" class="range-sm" />
        <span class="range-val">{{quality}}%</span>
      </div>

      <!-- Upload -->
      <div class="drop-zone"
           [class.drag-over]="isDragging()"
           (dragover)="$event.preventDefault(); isDragging.set(true)"
           (dragleave)="isDragging.set(false)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <input #fileInput type="file" accept="image/*" multiple hidden (change)="onFileChange($event)" />
        <div class="drop-icon">📐</div>
        <div class="drop-title">Drop images to resize</div>
        <div class="drop-sub">JPG, PNG, WebP · Multiple files supported</div>
        <button class="upload-btn" (click)="$event.stopPropagation(); fileInput.click()">Choose Images</button>
      </div>

      <!-- Processing -->
      <div class="processing-bar" *ngIf="isProcessing()">
        <div class="spinner"></div><span>Resizing...</span>
      </div>

      <!-- Results -->
      <div class="results-section" *ngIf="results().length > 0">
        <div class="results-header">
          <h3>Resized Images ({{results().length}})</h3>
          <button class="btn-dl-all" (click)="downloadAll()">⬇ Download All</button>
        </div>
        <div class="result-list">
          <div class="result-item" *ngFor="let r of results()">
            <img [src]="r.url" class="thumb" [alt]="r.name" />
            <div class="item-info">
              <div class="item-name">{{r.name}}</div>
              <div class="item-dim">{{r.width}} × {{r.height}} px</div>
            </div>
            <button class="btn-dl" (click)="download(r)">⬇ Download</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap { padding: 1.25rem; }
    .mode-tabs { display: flex; gap: .4rem; margin-bottom: 1rem; background: #f3f4f6; border-radius: 8px; padding: .3rem; }
    .mode-tabs button { flex: 1; padding: .45rem .5rem; border: none; background: none; border-radius: 6px; font-size: .8rem; font-weight: 600; cursor: pointer; color: #6b7280; transition: all .15s; }
    .mode-tabs button.active { background: white; color: #2563eb; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .mode-panel { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .input-row { display: flex; align-items: flex-end; gap: .75rem; flex-wrap: wrap; }
    .field-group { display: flex; flex-direction: column; gap: .3rem; }
    .field-group label { font-size: .72rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
    .dim-input { width: 110px; padding: .45rem .65rem; border: 1px solid #d1d5db; border-radius: 7px; font-size: .9rem; outline: none; }
    .x-sep { font-size: 1.2rem; color: #9ca3af; padding-bottom: .3rem; }
    .lock-wrap { display: flex; flex-direction: column; align-items: center; gap: .15rem; }
    .lock-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: .3rem .5rem; cursor: pointer; font-size: 1rem; }
    .lock-btn.locked { background: #eff6ff; border-color: #93c5fd; }
    .lock-label { font-size: .65rem; color: #6b7280; }
    .pct-note { font-size: .8rem; color: #6b7280; padding-bottom: .3rem; }
    .presets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .5rem; }
    .preset-btn { display: flex; flex-direction: column; padding: .6rem .75rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; text-align: left; transition: all .15s; }
    .preset-btn:hover, .preset-btn.selected { border-color: #2563eb; background: #eff6ff; }
    .preset-name { font-size: .78rem; font-weight: 600; color: #111827; }
    .preset-dim { font-size: .68rem; color: #6b7280; }
    .fmt-row { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: .85rem; }
    .fmt-row label { font-weight: 600; color: #374151; }
    .select-input { padding: .35rem .6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: .85rem; }
    .range-sm { width: 90px; accent-color: #2563eb; }
    .range-val { font-size: .85rem; font-weight: 700; color: #2563eb; }
    .drop-zone { border: 2px dashed #d1d5db; border-radius: 14px; padding: 2rem; text-align: center; cursor: pointer; transition: all .2s; background: #fafafa; }
    .drop-zone.drag-over { border-color: #2563eb; background: #eff6ff; }
    .drop-icon { font-size: 2rem; margin-bottom: .5rem; }
    .drop-title { font-size: .95rem; font-weight: 700; margin-bottom: .3rem; }
    .drop-sub { font-size: .78rem; color: #6b7280; margin-bottom: .85rem; }
    .upload-btn { background: #2563eb; color: white; border: none; padding: .55rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: .85rem; }
    .processing-bar { display: flex; align-items: center; gap: .75rem; padding: .75rem 1rem; background: #eff6ff; border-radius: 8px; margin-top: 1rem; font-size: .875rem; font-weight: 600; color: #1d4ed8; }
    .spinner { width: 16px; height: 16px; border: 2px solid #bfdbfe; border-top-color: #2563eb; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .results-section { margin-top: 1.5rem; }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
    .results-header h3 { font-size: 1rem; font-weight: 800; margin: 0; }
    .btn-dl-all { background: #2563eb; color: white; border: none; padding: .45rem 1rem; border-radius: 7px; font-weight: 700; cursor: pointer; font-size: .8rem; }
    .result-list { display: flex; flex-direction: column; gap: .65rem; }
    .result-item { display: flex; align-items: center; gap: .85rem; background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: .75rem 1rem; }
    .thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
    .item-info { flex: 1; }
    .item-name { font-size: .83rem; font-weight: 600; }
    .item-dim { font-size: .75rem; color: #6b7280; margin-top: .15rem; }
    .btn-dl { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: .4rem .9rem; border-radius: 7px; font-weight: 700; cursor: pointer; font-size: .78rem; }
  `]
})
export class ImageResizerComponent {
  mode = signal<'pixels'|'percent'|'preset'>('pixels');
  targetW: number | null = null;
  targetH: number | null = null;
  scalePercent = 50;
  lockRatio = signal(true);
  selectedPreset = signal('');
  outputFormat = 'same';
  quality = 90;
  isDragging = signal(false);
  isProcessing = signal(false);
  results = signal<ResizedFile[]>([]);
  presets = PRESETS;
  private origW = 0; private origH = 0;
  presetKeys() { return Object.keys(this.presets); }

  selectPreset(name: string) {
    this.selectedPreset.set(name);
    this.targetW = this.presets[name].w;
    this.targetH = this.presets[name].h;
  }

  onWidthChange() {
    if (this.lockRatio() && this.origW && this.origH && this.targetW) {
      this.targetH = Math.round(this.targetW * this.origH / this.origW);
    }
  }
  onHeightChange() {
    if (this.lockRatio() && this.origW && this.origH && this.targetH) {
      this.targetW = Math.round(this.targetH * this.origW / this.origH);
    }
  }

  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.processFiles(files);
  }
  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.processFiles(files); input.value = '';
  }

  async processFiles(files: File[]) {
    this.isProcessing.set(true);
    const newResults: ResizedFile[] = [];
    for (const file of files) {
      const r = await this.resizeFile(file);
      if (r) newResults.push(r);
    }
    this.results.update(r => [...r, ...newResults]);
    this.isProcessing.set(false);
  }

  resizeFile(file: File): Promise<ResizedFile | null> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          this.origW = img.width; this.origH = img.height;
          let w = img.width, h = img.height;
          if (this.mode() === 'pixels') {
            if (this.targetW) w = this.targetW;
            if (this.targetH) h = this.targetH;
            if (!this.targetW && this.targetH) w = Math.round(this.targetH * img.width / img.height);
            if (!this.targetH && this.targetW) h = Math.round(this.targetW * img.height / img.width);
          } else if (this.mode() === 'percent') {
            w = Math.round(img.width * this.scalePercent / 100);
            h = Math.round(img.height * this.scalePercent / 100);
          } else if (this.mode() === 'preset' && this.selectedPreset()) {
            w = this.presets[this.selectedPreset()].w;
            h = this.presets[this.selectedPreset()].h;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          const fmt = this.outputFormat === 'same' ? (file.type || 'image/jpeg') : this.outputFormat;
          const url = canvas.toDataURL(fmt, this.quality / 100);
          resolve({ name: file.name, url, width: w, height: h });
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  download(r: ResizedFile) {
    const a = document.createElement('a'); a.href = r.url;
    a.download = r.name.replace(/\.[^/.]+$/, '') + `_${r.width}x${r.height}.jpg`;
    a.click();
  }
  downloadAll() { this.results().forEach(r => this.download(r)); }

  toggleLockRatio() {
  this.lockRatio.update(v => !v);
}
}
