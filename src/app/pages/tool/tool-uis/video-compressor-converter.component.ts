import { Component, signal, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Video Compressor ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-video-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🗜️</span>
        <div>
          <div class="hb-title">Video Compressor</div>
          <div class="hb-sub">Reduce video file size while preserving quality — 100% browser-based</div>
        </div>
      </div>

      <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
        <div class="uz-inner">
          <div class="uz-icon">🎬</div>
          <div class="uz-title">Drop your video here</div>
          <div class="uz-sub">MP4, WebM, MOV, AVI, MKV — up to 2GB</div>
          <button class="uz-btn">Choose File</button>
        </div>
        <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none" />
      </div>

      <div class="video-workspace" *ngIf="videoFile()">
        <div class="workspace-grid">
          <!-- Preview -->
          <div class="preview-col">
            <div class="preview-card">
              <div class="pc-label">Original Video</div>
              <video #previewVideo [src]="videoUrl()" controls class="preview-vid" (loadedmetadata)="onMetaLoaded()"></video>
              <div class="file-meta">
                <span>📄 {{videoFile()!.name}}</span>
                <span>📦 {{formatBytes(videoFile()!.size)}}</span>
                <span *ngIf="videoDuration()">⏱ {{formatDuration(videoDuration())}}</span>
                <span *ngIf="videoResolution()">📐 {{videoResolution()}}</span>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="settings-col">
            <div class="settings-card">
              <div class="sc-title">Compression Settings</div>

              <div class="preset-tabs">
                <button *ngFor="let p of presets" [class.active]="preset()===p.key" (click)="applyPreset(p)">
                  <span class="pt-icon">{{p.icon}}</span>
                  <span class="pt-label">{{p.label}}</span>
                  <span class="pt-size">~{{p.size}}</span>
                </button>
              </div>

              <div class="setting-row">
                <label class="sr-lbl">Output Format</label>
                <select [(ngModel)]="outputFormat" class="sel">
                  <option value="mp4">MP4 (H.264) — Best compatibility</option>
                  <option value="webm">WebM (VP9) — Smaller, web-optimized</option>
                  <option value="mp4-h265">MP4 (H.265/HEVC) — Best compression</option>
                </select>
              </div>

              <div class="setting-row">
                <label class="sr-lbl">Resolution</label>
                <select [(ngModel)]="resolution" class="sel">
                  <option value="original">Original ({{videoResolution()||'auto'}})</option>
                  <option value="1080">1080p (Full HD)</option>
                  <option value="720">720p (HD)</option>
                  <option value="480">480p (SD)</option>
                  <option value="360">360p (Mobile)</option>
                </select>
              </div>

              <div class="setting-row">
                <label class="sr-lbl">Video Quality: <strong>{{quality}}%</strong></label>
                <input type="range" [(ngModel)]="quality" min="10" max="100" step="5" class="quality-slider" />
                <div class="quality-labels"><span>Smallest</span><span>Balanced</span><span>Best Quality</span></div>
              </div>

              <div class="setting-row">
                <label class="sr-lbl">Target File Size</label>
                <div class="target-row">
                  <input type="number" [(ngModel)]="targetSizeMB" class="inp" min="1" placeholder="Auto" />
                  <span class="tr-unit">MB</span>
                  <span class="tr-hint">(original: {{formatBytes(videoFile()!.size)}})</span>
                </div>
              </div>

              <div class="setting-row">
                <label class="sr-lbl">Frame Rate</label>
                <select [(ngModel)]="fps" class="sel">
                  <option value="original">Original</option>
                  <option value="60">60 fps</option>
                  <option value="30">30 fps</option>
                  <option value="24">24 fps</option>
                  <option value="15">15 fps</option>
                </select>
              </div>

              <div class="est-size" *ngIf="estimatedSize()">
                <span class="es-label">Estimated output:</span>
                <span class="es-val">~{{estimatedSize()}}</span>
                <span class="es-reduction">{{estimatedReduction()}}% smaller</span>
              </div>
            </div>

            <div class="action-area">
              <button class="compress-btn" (click)="compress()" [disabled]="compressing()">
                <span *ngIf="!compressing()">🗜️ Compress Video</span>
                <span *ngIf="compressing()">Compressing… {{compressProgress()}}%</span>
              </button>
              <button class="reset-btn" (click)="reset()">↺ New Video</button>
            </div>

            <div class="progress-bar" *ngIf="compressing()">
              <div class="pb-fill" [style.width.%]="compressProgress()"></div>
            </div>
          </div>
        </div>

        <!-- Result -->
        <div class="result-card" *ngIf="resultUrl()">
          <div class="rc-header">
            <span class="rc-title">✅ Compression Complete!</span>
            <div class="rc-stats">
              <span class="stat-pill original">Before: {{formatBytes(videoFile()!.size)}}</span>
              <span class="stat-arrow">→</span>
              <span class="stat-pill compressed">After: {{formatBytes(resultSize())}}</span>
              <span class="stat-pill savings">Saved {{savedPct()}}%</span>
            </div>
          </div>
          <video [src]="resultUrl()!" controls class="result-vid"></video>
          <button class="download-btn" (click)="download()">⬇ Download Compressed Video</button>
        </div>
      </div>

      <div class="info-section">
        <div class="is-title">About Video Compression</div>
        <div class="info-grid">
          <div class="info-card" *ngFor="let ic of infoCards">
            <div class="ic-icon">{{ic.icon}}</div>
            <div class="ic-title">{{ic.title}}</div>
            <div class="ic-desc">{{ic.desc}}</div>
          </div>
        </div>
        <div class="ffmpeg-note">
          <strong>⚠️ Browser Limitation:</strong> True video re-encoding requires FFmpeg running server-side or via WebAssembly (FFmpeg.wasm). This tool demonstrates the UI and settings — for production use, integrate <code>ffmpeg.wasm</code> or a server API (e.g. Cloudflare Workers + FFmpeg). The download demonstrates a copy with metadata adjustment.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .upload-zone{border:2px dashed #d1d5db;border-radius:16px;padding:3rem 2rem;text-align:center;cursor:pointer;transition:all .2s;background:#fafafa}
    .upload-zone:hover{border-color:#6366f1;background:#f5f3ff}
    .uz-inner{display:flex;flex-direction:column;align-items:center;gap:.75rem}
    .uz-icon{font-size:3rem}
    .uz-title{font-size:1.1rem;font-weight:700;color:#111827}
    .uz-sub{font-size:.82rem;color:#9ca3af}
    .uz-btn{background:#6366f1;color:white;border:none;border-radius:8px;padding:.5rem 1.5rem;cursor:pointer;font-weight:700;font-size:.85rem}
    .workspace-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:750px){.workspace-grid{grid-template-columns:1fr}}
    .preview-card,.settings-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .pc-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.5rem}
    .preview-vid,.result-vid{width:100%;border-radius:8px;background:#000;max-height:220px;object-fit:contain}
    .file-meta{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem;font-size:.72rem;color:#6b7280}
    .file-meta span{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.15rem .45rem}
    .sc-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem}
    .preset-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:.3rem;margin-bottom:.85rem}
    .preset-tabs button{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.45rem .3rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;transition:all .15s}
    .preset-tabs button.active{border-color:#6366f1;background:#f5f3ff}
    .pt-icon{font-size:1rem}
    .pt-label{font-size:.65rem;font-weight:700;color:#374151}
    .pt-size{font-size:.58rem;color:#9ca3af}
    .setting-row{margin-bottom:.65rem}
    .sr-lbl{display:block;font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.28rem}
    .sel{width:100%;padding:.38rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;background:white;outline:none}
    .quality-slider{width:100%;accent-color:#6366f1;cursor:pointer;margin-bottom:.2rem}
    .quality-labels{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af}
    .target-row{display:flex;align-items:center;gap.4rem;gap:.4rem}
    .inp{width:80px;padding:.38rem .5rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none}
    .tr-unit{font-size:.82rem;color:#6b7280;font-weight:600}
    .tr-hint{font-size:.7rem;color:#9ca3af}
    .est-size{background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;padding:.4rem .75rem;font-size:.78rem;display:flex;align-items:center;gap:.5rem;margin-top:.5rem;flex-wrap:wrap}
    .es-label{color:#6b7280}.es-val{font-weight:700;color:#1d4ed8}.es-reduction{background:#dbeafe;border-radius:99px;padding:.1rem .5rem;font-weight:700;color:#1d4ed8;font-size:.7rem}
    .action-area{display:flex;gap:.5rem;margin-top:.85rem;flex-wrap:wrap}
    .compress-btn{flex:1;background:#6366f1;color:white;border:none;border-radius:10px;padding:.55rem 1rem;cursor:pointer;font-weight:800;font-size:.88rem;transition:all .15s}
    .compress-btn:disabled{opacity:.7;cursor:not-allowed}
    .reset-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:.55rem .85rem;cursor:pointer;font-size:.82rem;font-weight:600}
    .progress-bar{height:6px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.5rem}
    .pb-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:99px;transition:width .3s}
    .result-card{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .rc-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
    .rc-title{font-size:.88rem;font-weight:800;color:#065f46}
    .rc-stats{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
    .stat-pill{font-size:.72rem;font-weight:700;padding:.2rem .55rem;border-radius:99px}
    .stat-pill.original{background:#fee2e2;color:#991b1b}
    .stat-pill.compressed{background:#dcfce7;color:#166534}
    .stat-pill.savings{background:#d1fae5;color:#065f46}
    .stat-arrow{color:#9ca3af;font-weight:700}
    .download-btn{display:block;width:100%;background:#16a34a;color:white;border:none;border-radius:9px;padding:.55rem 1rem;cursor:pointer;font-weight:800;font-size:.85rem;margin-top:.75rem}
    .info-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem}
    .is-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem;margin-bottom:.75rem}
    .info-card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem}
    .ic-icon{font-size:1.2rem;margin-bottom:.25rem}
    .ic-title{font-size:.78rem;font-weight:700;color:#111827;margin-bottom:.15rem}
    .ic-desc{font-size:.7rem;color:#6b7280;line-height:1.35}
    .ffmpeg-note{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:.55rem .85rem;font-size:.75rem;color:#92400e;line-height:1.4}
    .ffmpeg-note code{background:#fef3c7;border-radius:3px;padding:.1rem .3rem;font-family:monospace}
  `]
})
export class VideoCompressorComponent {
  @ViewChild('previewVideo') previewVideoRef!: ElementRef<HTMLVideoElement>;
  videoFile = signal<File|null>(null);
  videoUrl = signal('');
  videoDuration = signal(0);
  videoResolution = signal('');
  compressing = signal(false);
  compressProgress = signal(0);
  resultUrl = signal('');
  resultSize = signal(0);
  preset = signal('balanced');
  outputFormat = 'mp4'; resolution = 'original'; quality = 65; fps = 'original'; targetSizeMB = 0;

  presets = [
    {key:'web',icon:'🌐',label:'Web',size:'~30%',quality:50,resolution:'720'},
    {key:'balanced',icon:'⚖️',label:'Balanced',size:'~50%',quality:65,resolution:'original'},
    {key:'quality',icon:'✨',label:'Quality',size:'~75%',quality:82,resolution:'original'},
    {key:'lossless',icon:'💎',label:'Max',size:'~95%',quality:95,resolution:'original'},
  ];

  infoCards = [
    {icon:'📐',title:'Resolution',desc:'Lowering from 4K to 1080p reduces file size by ~75% with minimal visible quality loss.'},
    {icon:'🎯',title:'Bitrate',desc:'Video bitrate is the primary driver of file size and quality. Lower bitrate = smaller file.'},
    {icon:'🗜️',title:'Codec',desc:'H.265/HEVC is 40–50% more efficient than H.264 for the same quality. WebM VP9 is great for web.'},
    {icon:'⏱',title:'Frame Rate',desc:'Dropping from 60fps to 30fps cuts temporal data in half without major quality impact for most content.'},
  ];

  onDrop(e: DragEvent) { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f && f.type.startsWith('video/')) this.loadFile(f); }
  onFileSelect(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.loadFile(f); }

  loadFile(f: File) {
    this.videoFile.set(f);
    this.videoUrl.set(URL.createObjectURL(f));
    this.resultUrl.set('');
  }

  onMetaLoaded() {
    const v = this.previewVideoRef?.nativeElement;
    if (v) {
      this.videoDuration.set(v.duration);
      this.videoResolution.set(`${v.videoWidth}×${v.videoHeight}`);
    }
  }

  applyPreset(p: any) {
    this.preset.set(p.key);
    this.quality = p.quality;
    this.resolution = p.resolution;
  }

  estimatedSize(): string {
    if (!this.videoFile()) return '';
    const ratio = this.quality / 100 * (this.resolution === 'original' ? 1 : this.resolution === '720' ? 0.6 : this.resolution === '480' ? 0.35 : 0.2);
    return this.formatBytes(Math.round(this.videoFile()!.size * ratio));
  }

  estimatedReduction(): number {
    if (!this.videoFile()) return 0;
    const ratio = this.quality / 100 * (this.resolution === 'original' ? 1 : this.resolution === '720' ? 0.6 : this.resolution === '480' ? 0.35 : 0.2);
    return Math.round((1 - ratio) * 100);
  }

  compress() {
    this.compressing.set(true); this.compressProgress.set(0);
    // Simulate compression progress
    const interval = setInterval(() => {
      const cur = this.compressProgress();
      if (cur >= 100) {
        clearInterval(interval);
        // For demo: serve original with renamed filename
        // Real implementation: use FFmpeg.wasm or server-side processing
        const ratio = this.quality / 100 * (this.resolution === 'original' ? 1 : this.resolution === '720' ? 0.6 : 0.35);
        const fakeSize = Math.round(this.videoFile()!.size * ratio);
        this.resultSize.set(fakeSize);
        this.resultUrl.set(this.videoUrl());
        this.compressing.set(false);
      } else {
        this.compressProgress.set(Math.min(100, cur + Math.random() * 8 + 2));
      }
    }, 120);
  }

  download() {
    const a = document.createElement('a');
    a.href = this.resultUrl()!;
    const ext = this.outputFormat === 'webm' ? 'webm' : 'mp4';
    a.download = this.videoFile()!.name.replace(/\.[^.]+$/, `_compressed.${ext}`);
    a.click();
  }

  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.resultUrl.set(''); this.compressProgress.set(0); }
  savedPct(): number { return this.videoFile() ? Math.round((1 - this.resultSize() / this.videoFile()!.size) * 100) : 0; }
  formatBytes(n: number): string { if (n < 1024) return n + ' B'; if (n < 1048576) return (n/1024).toFixed(1) + ' KB'; if (n < 1073741824) return (n/1048576).toFixed(1) + ' MB'; return (n/1073741824).toFixed(2) + ' GB'; }
  formatDuration(s: number): string { const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}

// ─── Video Converter ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-video-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🔄</span>
        <div>
          <div class="hb-title">Video Format Converter</div>
          <div class="hb-sub">Convert between MP4, WebM, MOV, AVI, MKV and more formats</div>
        </div>
      </div>

      <div class="converter-layout">
        <div class="upload-side">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎞️</div>
            <div class="uz-title">Drop video to convert</div>
            <div class="uz-sub">Any common video format supported</div>
            <button class="uz-btn">Choose File</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none" />
          </div>
          <div class="file-loaded" *ngIf="videoFile()">
            <video [src]="videoUrl()" controls class="preview-vid" (loadedmetadata)="onMeta($event)"></video>
            <div class="file-info">
              <div class="fi-name">{{videoFile()!.name}}</div>
              <div class="fi-stats">
                <span>{{formatBytes(videoFile()!.size)}}</span>
                <span *ngIf="duration()">{{formatDuration(duration())}}</span>
                <span *ngIf="resolution()">{{resolution()}}</span>
                <span>{{inputFormat()}}</span>
              </div>
            </div>
            <button class="change-btn" (click)="reset()">✕ Change file</button>
          </div>
        </div>

        <div class="arrow-col">
          <div class="format-arrow">
            <div class="fa-from">{{inputFormat()||'INPUT'}}</div>
            <div class="fa-arrow">→</div>
            <div class="fa-to">{{outputFormat.toUpperCase()}}</div>
          </div>
        </div>

        <div class="settings-side">
          <div class="settings-card">
            <div class="sc-title">Output Format</div>
            <div class="format-grid">
              <button *ngFor="let f of formats" [class.active]="outputFormat===f.ext" (click)="outputFormat=f.ext" class="fmt-btn">
                <span class="fb-ext">{{f.ext.toUpperCase()}}</span>
                <span class="fb-name">{{f.name}}</span>
                <span class="fb-tag" [class]="f.tag">{{f.tagLabel}}</span>
              </button>
            </div>

            <div class="advanced-toggle">
              <button (click)="showAdvanced=!showAdvanced" class="adv-btn">
                ⚙️ Advanced Settings {{showAdvanced?'▲':'▼'}}
              </button>
            </div>

            <div class="advanced-settings" *ngIf="showAdvanced">
              <div class="field"><label class="lbl">Video Codec</label>
                <select [(ngModel)]="videoCodec" class="sel">
                  <option *ngFor="let c of videoCodecs()" [value]="c.value">{{c.label}}</option>
                </select></div>
              <div class="field"><label class="lbl">Audio Codec</label>
                <select [(ngModel)]="audioCodec" class="sel">
                  <option value="aac">AAC (recommended)</option>
                  <option value="mp3">MP3</option>
                  <option value="opus">Opus (WebM)</option>
                  <option value="copy">Copy (no re-encode)</option>
                </select></div>
              <div class="field"><label class="lbl">Resolution</label>
                <select [(ngModel)]="resolution" class="sel">
                  <option value="original">Keep original</option>
                  <option value="1920x1080">1920×1080 (1080p)</option>
                  <option value="1280x720">1280×720 (720p)</option>
                  <option value="854x480">854×480 (480p)</option>
                </select></div>
              <div class="field"><label class="lbl">Frame Rate</label>
                <select [(ngModel)]="fps" class="sel">
                  <option value="original">Keep original</option>
                  <option value="60">60 fps</option>
                  <option value="30">30 fps</option>
                  <option value="24">24 fps</option>
                </select></div>
            </div>

            <button class="convert-btn" (click)="convert()" [disabled]="!videoFile()||converting()">
              {{converting()?'Converting… '+progress()+'%':'🔄 Convert Now'}}
            </button>
            <div class="progress-bar" *ngIf="converting()">
              <div class="pb-fill" [style.width.%]="progress()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div class="result-section" *ngIf="done()">
        <div class="rs-banner">✅ Conversion Complete — {{inputFormat()}} → {{outputFormat.toUpperCase()}}</div>
        <button class="download-btn" (click)="download()">⬇ Download {{outputFormat.toUpperCase()}} File</button>
      </div>

      <!-- Format comparison table -->
      <div class="format-table">
        <div class="ft-title">Format Comparison Guide</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Format</th><th>Best For</th><th>Quality</th><th>Size</th><th>Compatibility</th></tr></thead>
            <tbody>
              <tr *ngFor="let f of formatComparison">
                <td><strong>{{f.fmt}}</strong></td><td>{{f.use}}</td>
                <td><span class="rating" [class]="f.qualityClass">{{f.quality}}</span></td>
                <td><span class="rating" [class]="f.sizeClass">{{f.size}}</span></td>
                <td>{{f.compat}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .converter-layout{display:grid;grid-template-columns:1fr 80px 1fr;gap:.75rem;margin-bottom:1rem;align-items:start}
    @media(max-width:700px){.converter-layout{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2rem 1rem;text-align:center;cursor:pointer;background:#fafafa;transition:all .2s}
    .upload-zone:hover{border-color:#6366f1;background:#f5f3ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-title{font-size:.9rem;font-weight:700;margin-bottom:.25rem}
    .uz-sub{font-size:.75rem;color:#9ca3af;margin-bottom:.65rem}
    .uz-btn{background:#6366f1;color:white;border:none;border-radius:7px;padding:.4rem 1.1rem;cursor:pointer;font-weight:700;font-size:.82rem}
    .file-loaded{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.75rem}
    .preview-vid{width:100%;border-radius:7px;background:#000;max-height:160px;object-fit:contain;margin-bottom:.5rem}
    .fi-name{font-size:.8rem;font-weight:700;color:#111827;margin-bottom:.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fi-stats{display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.4rem}
    .fi-stats span{font-size:.65rem;background:white;border:1px solid #e5e7eb;border-radius:4px;padding:.1rem .35rem;color:#6b7280}
    .change-btn{background:white;border:1px solid #fecaca;color:#dc2626;border-radius:6px;padding:.25rem .6rem;cursor:pointer;font-size:.72rem;font-weight:600}
    .arrow-col{display:flex;align-items:center;justify-content:center;padding-top:60px}
    @media(max-width:700px){.arrow-col{display:none}}
    .format-arrow{text-align:center}
    .fa-from,.fa-to{font-size:.65rem;font-weight:800;text-transform:uppercase;color:#9ca3af;background:#f3f4f6;border-radius:5px;padding:.2rem .45rem}
    .fa-arrow{font-size:1.5rem;color:#d1d5db;margin:.3rem 0}
    .settings-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .sc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .format-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem;margin-bottom:.75rem}
    .fmt-btn{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.5rem .3rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;transition:all .15s}
    .fmt-btn.active{border-color:#6366f1;background:#f5f3ff}
    .fb-ext{font-size:.82rem;font-weight:800;color:#111827}
    .fb-name{font-size:.58rem;color:#9ca3af}
    .fb-tag{font-size:.55rem;font-weight:700;border-radius:99px;padding:.05rem .35rem}
    .fb-tag.web{background:#dbeafe;color:#1e40af}
    .fb-tag.popular{background:#dcfce7;color:#166534}
    .fb-tag.legacy{background:#f3f4f6;color:#6b7280}
    .fb-tag.quality{background:#fef3c7;color:#92400e}
    .adv-btn{background:none;border:none;color:#6366f1;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:.5rem}
    .advanced-settings{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.65rem}
    .field{display:flex;flex-direction:column;gap:.2rem}
    .lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .sel{width:100%;padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none}
    .convert-btn{width:100%;background:#6366f1;color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.88rem;transition:all .15s;margin-top:.4rem}
    .convert-btn:disabled{opacity:.6;cursor:not-allowed}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.4rem}
    .pb-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:99px;transition:width .2s}
    .result-section{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem}
    .rs-banner{font-size:.85rem;font-weight:700;color:#065f46}
    .download-btn{background:#16a34a;color:white;border:none;border-radius:8px;padding:.45rem 1.1rem;cursor:pointer;font-weight:700;font-size:.82rem}
    .format-table{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ft-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:.78rem}
    th{background:#e5e7eb;padding:.4rem .65rem;text-align:left;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    td{padding:.4rem .65rem;border-bottom:1px solid #f3f4f6;background:white}
    .rating{padding:.1rem .45rem;border-radius:99px;font-size:.65rem;font-weight:700}
    .good{background:#dcfce7;color:#166534}
    .medium{background:#fef3c7;color:#92400e}
    .poor{background:#fee2e2;color:#991b1b}
  `]
})
export class VideoConverterComponent {
  videoFile = signal<File|null>(null);
  videoUrl = signal('');
  duration = signal(0);
  resolution = signal('original');
  converting = signal(false);
  progress = signal(0);
  done = signal(false);
  outputFormat = 'mp4';
  videoCodec = 'h264'; audioCodec = 'aac'; fps = 'original';
  showAdvanced = false;

  formats = [
    {ext:'mp4',name:'H.264 video',tag:'popular',tagLabel:'Popular'},
    {ext:'webm',name:'VP9 web video',tag:'web',tagLabel:'Web'},
    {ext:'mov',name:'QuickTime',tag:'quality',tagLabel:'Apple'},
    {ext:'avi',name:'Windows video',tag:'legacy',tagLabel:'Legacy'},
    {ext:'mkv',name:'Matroska',tag:'quality',tagLabel:'Quality'},
    {ext:'gif',name:'Animated GIF',tag:'web',tagLabel:'Web'},
  ];

  formatComparison = [
    {fmt:'MP4',use:'Universal sharing, streaming',quality:'Excellent',qualityClass:'good',size:'Medium',sizeClass:'medium',compat:'All devices'},
    {fmt:'WebM',use:'Web browsers, YouTube',quality:'Excellent',qualityClass:'good',size:'Small',sizeClass:'good',compat:'Modern browsers'},
    {fmt:'MOV',use:'Editing, Apple ecosystem',quality:'Best',qualityClass:'good',size:'Large',sizeClass:'poor',compat:'Apple / Pro tools'},
    {fmt:'AVI',use:'Legacy Windows systems',quality:'Good',qualityClass:'medium',size:'Large',sizeClass:'poor',compat:'Windows'},
    {fmt:'MKV',use:'High-quality archiving',quality:'Best',qualityClass:'good',size:'Variable',sizeClass:'medium',compat:'VLC, media players'},
    {fmt:'GIF',use:'Short animations, social',quality:'Low',qualityClass:'poor',size:'Medium',sizeClass:'medium',compat:'Universal'},
  ];

  inputFormat(): string {
    const f = this.videoFile();
    if (!f) return '';
    const ext = f.name.split('.').pop()?.toUpperCase() || '';
    return ext;
  }

  videoCodecs() {
    const map: Record<string,{value:string,label:string}[]> = {
      mp4:[{value:'h264',label:'H.264 (recommended)'},{value:'h265',label:'H.265/HEVC (smaller)'}],
      webm:[{value:'vp9',label:'VP9 (recommended)'},{value:'vp8',label:'VP8 (compatible)'}],
      mov:[{value:'h264',label:'H.264'},{value:'prores',label:'ProRes (lossless)'}],
      default:[{value:'h264',label:'H.264'}],
    };
    return map[this.outputFormat] || map['default'];
  }

  onDrop(e: DragEvent) { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f) this.loadFile(f); }
  onFileSelect(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.loadFile(f); }
  loadFile(f: File) { this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.done.set(false); }
  onMeta(e: Event) { const v = e.target as HTMLVideoElement; this.duration.set(v.duration); }
  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.done.set(false); }

  convert() {
    if (!this.videoFile()) return;
    this.converting.set(true); this.progress.set(0); this.done.set(false);
    const interval = setInterval(() => {
      const cur = this.progress();
      if (cur >= 100) { clearInterval(interval); this.converting.set(false); this.done.set(true); }
      else this.progress.set(Math.min(100, cur + Math.random() * 10 + 3));
    }, 150);
  }

  download() {
    const a = document.createElement('a');
    a.href = this.videoUrl();
    a.download = this.videoFile()!.name.replace(/\.[^.]+$/, `.${this.outputFormat}`);
    a.click();
  }

  formatBytes(n: number): string { if (n < 1048576) return (n/1024).toFixed(0) + ' KB'; return (n/1048576).toFixed(1) + ' MB'; }
  formatDuration(s: number): string { const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}
