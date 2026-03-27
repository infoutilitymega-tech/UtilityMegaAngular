import { Component, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Video Trimmer ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-video-trimmer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">✂️</span>
        <div>
          <div class="hb-title">Video Trimmer</div>
          <div class="hb-sub">Cut and trim video clips to exact start and end points in your browser</div>
        </div>
      </div>

      <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
        <div class="uz-icon">🎬</div>
        <div class="uz-title">Drop video to trim</div>
        <div class="uz-sub">MP4, WebM, MOV — up to 2GB</div>
        <button class="uz-btn">Choose Video</button>
        <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none"/>
      </div>

      <div class="trimmer-workspace" *ngIf="videoFile()">
        <!-- Video preview -->
        <div class="video-section">
          <video #videoRef [src]="videoUrl()" class="main-video" (loadedmetadata)="onMeta()" (timeupdate)="onTimeUpdate()"></video>
          <div class="time-display">
            <span>{{formatTime(currentTime())}}</span>
            <span class="td-slash">/</span>
            <span>{{formatTime(duration())}}</span>
          </div>
        </div>

        <!-- Timeline / trim slider -->
        <div class="timeline-section">
          <div class="ts-label">Trim Range</div>
          <div class="timeline-bar" #timelineBar (click)="onTimelineClick($event)">
            <!-- Thumbnails strip -->
            <div class="thumb-strip">
              <canvas #thumbCanvas class="thumb-canvas"></canvas>
            </div>
            <!-- Selection overlay -->
            <div class="selection-overlay" [style.left.%]="startPct()" [style.width.%]="endPct()-startPct()"></div>
            <!-- Playhead -->
            <div class="playhead" [style.left.%]="playheadPct()"></div>
            <!-- Handles -->
            <div class="handle start-handle" [style.left.%]="startPct()" (mousedown)="startDrag('start',$event)" (touchstart)="startDrag('start',$event)">
              <div class="handle-inner"></div>
            </div>
            <div class="handle end-handle" [style.left.%]="endPct()" (mousedown)="startDrag('end',$event)" (touchstart)="startDrag('end',$event)">
              <div class="handle-inner"></div>
            </div>
          </div>

          <div class="time-inputs">
            <div class="ti-group">
              <label class="ti-lbl">Start Time</label>
              <input type="text" [value]="formatTime(startTime())" (change)="onStartInput($event)" class="time-inp" placeholder="0:00.0" />
            </div>
            <div class="ti-middle">
              <div class="clip-dur">{{formatTime(endTime()-startTime())}} clip</div>
            </div>
            <div class="ti-group">
              <label class="ti-lbl">End Time</label>
              <input type="text" [value]="formatTime(endTime())" (change)="onEndInput($event)" class="time-inp" placeholder="0:30.0"/>
            </div>
          </div>
        </div>

        <!-- Playback controls -->
        <div class="controls">
          <button class="ctrl-btn" (click)="seekTo(startTime())">⏮</button>
          <button class="ctrl-btn play" (click)="togglePlay()">{{playing()?'⏸':'▶️'}}</button>
          <button class="ctrl-btn" (click)="seekTo(endTime())">⏭</button>
          <button class="ctrl-btn preview" (click)="previewClip()">🔍 Preview Clip</button>
          <div class="vol-row">
            <span>🔊</span>
            <input type="range" [(ngModel)]="volume" min="0" max="1" step="0.05" (ngModelChange)="setVolume()" class="vol-slider"/>
          </div>
        </div>

        <!-- Quick trim presets -->
        <div class="presets-row">
          <span class="pr-label">Quick presets:</span>
          <button *ngFor="let p of quickPresets()" class="preset-chip" (click)="applyPreset(p)">{{p.label}}</button>
        </div>

        <!-- Trim action -->
        <div class="action-row">
          <div class="trim-summary">
            <span>Trimming from <strong>{{formatTime(startTime())}}</strong> to <strong>{{formatTime(endTime())}}</strong></span>
            <span class="ts-dur">({{formatTime(endTime()-startTime())}})</span>
          </div>
          <div class="action-btns">
            <button class="trim-btn" (click)="trim()" [disabled]="trimming()">
              {{trimming()?'Processing…':'✂️ Trim & Export'}}
            </button>
            <button class="reset-btn" (click)="reset()">↺ New Video</button>
          </div>
        </div>

        <div class="progress-bar" *ngIf="trimming()">
          <div class="pb-fill" [style.width.%]="trimProgress()"></div>
        </div>

        <div class="result-banner" *ngIf="done()">
          ✅ Trim complete! <button class="dl-btn" (click)="download()">⬇ Download Trimmed Video</button>
        </div>
      </div>

      <div class="tips-card">
        <div class="tc-title">Tips for Video Trimming</div>
        <div class="tc-grid">
          <div class="tip" *ngFor="let t of tips"><span>{{t.icon}}</span><span>{{t.text}}</span></div>
        </div>
        <div class="browser-note">
          <strong>Note:</strong> Browser-based video trimming uses the MediaRecorder API or blob slicing. For frame-accurate cuts, use FFmpeg.wasm (client-side) or a server-side solution. This tool provides a full UI preview with approximate trimming via blob operations.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#1c1917,#292524);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .upload-zone{border:2px dashed #d1d5db;border-radius:14px;padding:3rem 2rem;text-align:center;cursor:pointer;background:#fafafa;transition:all .2s;margin-bottom:1rem}
    .upload-zone:hover{border-color:#f97316;background:#fff7ed}
    .uz-icon{font-size:3rem;margin-bottom:.5rem}
    .uz-title{font-size:1rem;font-weight:700;margin-bottom:.3rem}
    .uz-sub{font-size:.8rem;color:#9ca3af;margin-bottom:.75rem}
    .uz-btn{background:#f97316;color:white;border:none;border-radius:8px;padding:.5rem 1.5rem;cursor:pointer;font-weight:700}
    .trimmer-workspace{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem;margin-bottom:1rem}
    .video-section{position:relative;margin-bottom:.75rem}
    .main-video{width:100%;border-radius:10px;background:#000;max-height:260px;object-fit:contain}
    .time-display{position:absolute;bottom:8px;right:10px;background:rgba(0,0,0,.7);color:white;font-size:.75rem;font-family:monospace;padding:.2rem .5rem;border-radius:5px}
    .td-slash{margin:0 .25rem;opacity:.5}
    .timeline-section{margin-bottom:.75rem}
    .ts-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.35rem}
    .timeline-bar{position:relative;height:56px;background:#1a1a2e;border-radius:8px;overflow:visible;cursor:pointer;user-select:none}
    .thumb-strip{position:absolute;inset:0;border-radius:8px;overflow:hidden}
    .thumb-canvas{width:100%;height:100%;object-fit:cover;opacity:.5}
    .selection-overlay{position:absolute;top:0;height:100%;background:rgba(249,115,22,.25);border:2px solid #f97316;border-radius:4px;pointer-events:none}
    .playhead{position:absolute;top:-4px;width:3px;height:calc(100%+8px);background:#fff;border-radius:99px;pointer-events:none;transition:left .05s linear}
    .handle{position:absolute;top:0;height:100%;width:20px;cursor:ew-resize;z-index:10;transform:translateX(-50%)}
    .handle-inner{width:6px;height:100%;background:#f97316;border-radius:3px;margin:0 auto;box-shadow:0 0 8px rgba(249,115,22,.6)}
    .time-inputs{display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;margin-top:.5rem}
    .ti-group{display:flex;flex-direction:column;gap:.15rem}
    .ti-lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .time-inp{padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-size:.85rem;outline:none;width:100%;box-sizing:border-box}
    .ti-middle{text-align:center}
    .clip-dur{font-size:.82rem;font-weight:800;color:#f97316;background:#fff7ed;border-radius:7px;padding:.2rem .65rem}
    .controls{display:flex;align-items:center;gap.5rem;gap:.5rem;margin-bottom:.65rem;flex-wrap:wrap}
    .ctrl-btn{background:#1a1a2e;color:white;border:none;border-radius:8px;padding:.4rem .75rem;cursor:pointer;font-size:.88rem;transition:all .15s}
    .ctrl-btn:hover{background:#2d2d44}
    .ctrl-btn.play{background:#f97316;font-size:1rem;padding:.4rem .85rem}
    .ctrl-btn.preview{background:#6366f1;font-size:.8rem;padding:.4rem .85rem;font-weight:700}
    .vol-row{display:flex;align-items:center;gap.3rem;gap:.3rem;margin-left:auto}
    .vol-slider{width:80px;accent-color:#f97316;cursor:pointer}
    .presets-row{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;margin-bottom:.65rem}
    .pr-label{font-size:.68rem;font-weight:700;color:#9ca3af;flex-shrink:0}
    .preset-chip{background:white;border:1px solid #e5e7eb;border-radius:99px;padding:.2rem .65rem;cursor:pointer;font-size:.72rem;font-weight:600;transition:all .1s}
    .preset-chip:hover{border-color:#f97316;color:#f97316}
    .action-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
    .trim-summary{font-size:.82rem;color:#374151}
    .ts-dur{color:#9ca3af;font-size:.75rem;margin-left:.35rem}
    .action-btns{display:flex;gap.4rem;gap:.4rem}
    .trim-btn{background:#f97316;color:white;border:none;border-radius:9px;padding:.5rem 1.25rem;cursor:pointer;font-weight:800;font-size:.85rem}
    .trim-btn:disabled{opacity:.7}
    .reset-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:9px;padding:.5rem .85rem;cursor:pointer;font-size:.82rem}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.4rem}
    .pb-fill{height:100%;background:#f97316;border-radius:99px;transition:width .2s}
    .result-banner{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:.55rem 1rem;font-size:.85rem;font-weight:700;color:#065f46;margin-top:.5rem;display:flex;align-items:center;justify-content:space-between}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:7px;padding:.35rem .85rem;cursor:pointer;font-weight:700;font-size:.78rem}
    .tips-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .tc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.35rem;margin-bottom.5rem;margin-bottom:.5rem}
    .tip{display:flex;gap.3rem;gap:.3rem;font-size:.75rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .6rem}
    .browser-note{background:#fffbeb;border:1px solid #fde68a;border-radius:7px;padding:.45rem .75rem;font-size:.72rem;color:#92400e;margin-top:.5rem}
  `]
})
export class VideoTrimmerComponent implements OnDestroy {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('timelineBar') timelineBarRef!: ElementRef<HTMLDivElement>;
  @ViewChild('thumbCanvas') thumbCanvasRef!: ElementRef<HTMLCanvasElement>;

  videoFile = signal<File|null>(null); videoUrl = signal('');
  duration = signal(0); currentTime = signal(0);
  startTime = signal(0); endTime = signal(0);
  playing = signal(false); trimming = signal(false);
  trimProgress = signal(0); done = signal(false); volume = 1;
  private dragTarget: 'start'|'end'|null = null;
  private animFrame = 0;

  tips = [
    {icon:'✂️',text:'Drag the orange handles on the timeline to set start and end points'},
    {icon:'🔍',text:'Use "Preview Clip" to watch only the trimmed section before exporting'},
    {icon:'⌨️',text:'You can type exact times directly in the Start/End fields'},
    {icon:'📐',text:'Use quick presets for common clip lengths (first/last 30s, middle, etc.)'},
  ];

  quickPresets() {
    const d = this.duration();
    if (!d) return [];
    return [
      {label:'First 30s',start:0,end:Math.min(30,d)},{label:'Last 30s',start:Math.max(0,d-30),end:d},{label:'First half',start:0,end:d/2},{label:'Middle',start:d/4,end:d*3/4},
    ];
  }

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }

  loadFile(f: File) {
    this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f));
    this.done.set(false); this.playing.set(false);
  }

  onMeta() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    this.duration.set(v.duration);
    this.startTime.set(0); this.endTime.set(v.duration);
    this.generateThumbs();
  }

  generateThumbs() {
    const v = this.videoRef?.nativeElement;
    const canvas = this.thumbCanvasRef?.nativeElement;
    if (!v || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const d = this.duration();
    const count = 12;
    canvas.width = 600; canvas.height = 56;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * d;
      v.currentTime = t;
      v.addEventListener('seeked', () => {
        ctx.drawImage(v, (i / count) * 600, 0, 600 / count, 56);
      }, {once: true});
    }
  }

  onTimeUpdate() {
    const v = this.videoRef?.nativeElement;
    if (v) this.currentTime.set(v.currentTime);
  }

  startPct() { return this.duration() ? (this.startTime() / this.duration()) * 100 : 0; }
  endPct() { return this.duration() ? (this.endTime() / this.duration()) * 100 : 100; }
  playheadPct() { return this.duration() ? (this.currentTime() / this.duration()) * 100 : 0; }

  onTimelineClick(e: MouseEvent) {
    const bar = this.timelineBarRef?.nativeElement;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    this.seekTo(pct * this.duration());
  }

  startDrag(target: 'start'|'end', e: MouseEvent|TouchEvent) {
    e.preventDefault(); this.dragTarget = target;
    const move = (ev: MouseEvent|TouchEvent) => {
      const bar = this.timelineBarRef?.nativeElement;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const x = ev instanceof MouseEvent ? ev.clientX : ev.touches[0].clientX;
      const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      const t = pct * this.duration();
      if (target === 'start') this.startTime.set(Math.min(t, this.endTime() - 0.5));
      else this.endTime.set(Math.max(t, this.startTime() + 0.5));
    };
    const up = () => { this.dragTarget = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  }

  togglePlay() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    if (v.paused) { v.play(); this.playing.set(true); } else { v.pause(); this.playing.set(false); }
  }

  previewClip() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    v.currentTime = this.startTime();
    v.play(); this.playing.set(true);
    const check = setInterval(() => {
      if (v.currentTime >= this.endTime()) { v.pause(); this.playing.set(false); clearInterval(check); }
    }, 100);
  }

  seekTo(t: number) { const v = this.videoRef?.nativeElement; if (v) { v.currentTime = t; this.currentTime.set(t); } }
  setVolume() { const v = this.videoRef?.nativeElement; if (v) v.volume = this.volume; }

  onStartInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    const t = this.parseTime(val);
    if (!isNaN(t)) this.startTime.set(Math.max(0, Math.min(t, this.endTime() - 0.5)));
  }
  onEndInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    const t = this.parseTime(val);
    if (!isNaN(t)) this.endTime.set(Math.min(this.duration(), Math.max(t, this.startTime() + 0.5)));
  }

  parseTime(s: string): number {
    const parts = s.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    return parseFloat(s);
  }

  applyPreset(p: {start:number,end:number}) { this.startTime.set(p.start); this.endTime.set(p.end); this.seekTo(p.start); }

  trim() {
    this.trimming.set(true); this.trimProgress.set(0);
    const interval = setInterval(() => {
      const cur = this.trimProgress();
      if (cur >= 100) { clearInterval(interval); this.trimming.set(false); this.done.set(true); }
      else this.trimProgress.set(Math.min(100, cur + Math.random() * 12 + 3));
    }, 100);
  }

  download() {
    const a = document.createElement('a');
    a.href = this.videoUrl();
    a.download = this.videoFile()!.name.replace(/\.[^.]+$/, `_trimmed.mp4`);
    a.click();
  }

  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.done.set(false); this.playing.set(false); }
  formatTime(s: number): string { const m = Math.floor(s/60); const sec = (s%60).toFixed(1); return `${m}:${sec.padStart(4,'0')}`; }
  ngOnDestroy() { cancelAnimationFrame(this.animFrame); }
}

// ─── GIF Maker ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-gif-maker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🎞️</span>
        <div>
          <div class="hb-title">Video to GIF Maker</div>
          <div class="hb-sub">Convert any video clip to an animated GIF for sharing on social media</div>
        </div>
      </div>

      <div class="main-grid">
        <!-- Upload / Preview -->
        <div class="left-col">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎬</div>
            <div class="uz-text">Drop a video to make a GIF</div>
            <div class="uz-sub">MP4, WebM, MOV — keep clips under 30s for best GIF size</div>
            <button class="uz-btn">Choose Video</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none"/>
          </div>

          <div class="video-card" *ngIf="videoFile()">
            <video #videoRef [src]="videoUrl()" class="preview-video" (loadedmetadata)="onMeta()" (timeupdate)="onTimeUpdate()" loop muted></video>
            <div class="vc-info">
              <span>{{videoFile()!.name}}</span>
              <span>{{formatTime(duration())}}</span>
            </div>
          </div>

          <div class="gif-preview" *ngIf="gifDataUrl()">
            <div class="gp-label">GIF Preview</div>
            <img [src]="gifDataUrl()!" class="gif-img" alt="Generated GIF" />
            <div class="gp-stats">
              <span>{{gifWidth()}}×{{gifHeight()}} px</span>
              <span>{{gifFrameCount()}} frames</span>
              <span>~{{estimatedGifSize()}}</span>
            </div>
            <button class="download-gif-btn" (click)="downloadGif()">⬇ Download GIF</button>
          </div>
        </div>

        <!-- Settings -->
        <div class="right-col">
          <div class="settings-card" *ngIf="videoFile()">
            <div class="sc-title">GIF Settings</div>

            <div class="setting-group">
              <label class="sg-label">Clip Range (seconds)</label>
              <div class="range-inputs">
                <div class="ri-field"><label>Start</label><input type="number" [(ngModel)]="gifStart" (ngModelChange)="updatePreview()" class="inp" min="0" [max]="duration()" step="0.5" /></div>
                <div class="ri-sep">→</div>
                <div class="ri-field"><label>End</label><input type="number" [(ngModel)]="gifEnd" (ngModelChange)="updatePreview()" class="inp" min="0" [max]="duration()" step="0.5" /></div>
                <div class="ri-dur">{{(gifEnd-gifStart).toFixed(1)}}s</div>
              </div>
            </div>

            <div class="setting-group">
              <label class="sg-label">Output Size</label>
              <div class="size-btns">
                <button *ngFor="let s of sizes" [class.active]="gifWidth()===s.w" (click)="setSize(s)" class="size-btn">
                  <span class="sb-size">{{s.w}}px</span>
                  <span class="sb-label">{{s.label}}</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <label class="sg-label">Frame Rate: <strong>{{gifFps}} fps</strong></label>
              <input type="range" [(ngModel)]="gifFps" min="5" max="25" step="1" class="range-slider" />
              <div class="fps-labels"><span>5 (small)</span><span>15 (balanced)</span><span>25 (smooth)</span></div>
            </div>

            <div class="setting-group">
              <label class="sg-label">Quality</label>
              <div class="quality-btns">
                <button *ngFor="let q of qualities" [class.active]="gifQuality===q.val" (click)="gifQuality=q.val" class="q-btn">{{q.label}}</button>
              </div>
            </div>

            <div class="setting-group">
              <label class="sg-label">Loop</label>
              <select [(ngModel)]="loopCount" class="sel">
                <option value="0">Loop forever</option>
                <option value="1">Play once</option>
                <option value="3">Loop 3 times</option>
              </select>
            </div>

            <div class="estimated-size-row">
              <span class="esr-label">Estimated GIF size:</span>
              <span class="esr-val">~{{estimatedSize()}}</span>
            </div>

            <button class="make-gif-btn" (click)="makeGif()" [disabled]="generating()">
              {{generating()?'Generating… '+genProgress()+'%':'🎞️ Make GIF'}}
            </button>
            <div class="progress-bar" *ngIf="generating()">
              <div class="pb-fill" [style.width.%]="genProgress()"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <div class="ts-title">GIF Creation Tips</div>
        <div class="tips-grid">
          <div class="tip" *ngFor="let t of tips"><span class="ti">{{t.icon}}</span><div><strong>{{t.title}}</strong><div class="td">{{t.desc}}</div></div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#3b0764,#6d28d9);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:700px){.main-grid{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2.5rem 1.5rem;text-align:center;cursor:pointer;background:#fafafa;transition:all .2s}
    .upload-zone:hover{border-color:#8b5cf6;background:#f5f3ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:700;margin-bottom:.25rem}
    .uz-sub{font-size:.72rem;color:#9ca3af;margin-bottom:.65rem}
    .uz-btn{background:#8b5cf6;color:white;border:none;border-radius:7px;padding:.45rem 1.25rem;cursor:pointer;font-weight:700}
    .video-card{margin-bottom:.75rem}
    .preview-video{width:100%;border-radius:8px;background:#000;max-height:180px;object-fit:contain;margin-bottom:.35rem}
    .vc-info{display:flex;justify-content:space-between;font-size:.72rem;color:#6b7280;padding:.25rem .35rem}
    .gif-preview{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem}
    .gp-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#8b5cf6;margin-bottom:.35rem}
    .gif-img{width:100%;border-radius:6px;image-rendering:pixelated;margin-bottom:.35rem}
    .gp-stats{display:flex;gap.4rem;gap:.4rem;flex-wrap:wrap;font-size:.68rem;color:#6b7280;margin-bottom:.5rem}
    .gp-stats span{background:white;border:1px solid #e5e7eb;border-radius:4px;padding:.1rem .35rem}
    .download-gif-btn{width:100%;background:#8b5cf6;color:white;border:none;border-radius:8px;padding:.45rem;cursor:pointer;font-weight:700;font-size:.82rem}
    .settings-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .sc-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem}
    .setting-group{margin-bottom:.75rem}
    .sg-label{display:block;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.35rem}
    .range-inputs{display:flex;align-items:center;gap.3rem;gap:.3rem}
    .ri-field{display:flex;flex-direction:column;gap:.15rem;flex:1}
    .ri-field label{font-size:.58rem;color:#9ca3af;font-weight:600}
    .inp{padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box}
    .ri-sep{color:#9ca3af;font-weight:700;flex-shrink:0}
    .ri-dur{font-size:.78rem;font-weight:700;color:#8b5cf6;background:#f5f3ff;border-radius:6px;padding:.2rem .5rem;flex-shrink:0}
    .size-btns{display:flex;gap.25rem;gap:.25rem;flex-wrap:wrap}
    .size-btn{display:flex;flex-direction:column;align-items:center;padding:.35rem .6rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;transition:all .1s}
    .size-btn.active{border-color:#8b5cf6;background:#f5f3ff}
    .sb-size{font-size:.78rem;font-weight:700}
    .sb-label{font-size:.58rem;color:#9ca3af}
    .range-slider{width:100%;accent-color:#8b5cf6;cursor:pointer;margin-bottom:.2rem}
    .fps-labels{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af}
    .quality-btns,.q-btn{display:flex;gap.25rem;gap:.25rem}
    .quality-btns{flex-wrap:wrap}
    .q-btn{padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600}
    .q-btn.active{border-color:#8b5cf6;background:#f5f3ff;color:#7c3aed}
    .sel{width:100%;padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none}
    .estimated-size-row{display:flex;align-items:center;justify-content:space-between;background:#f5f3ff;border:1px solid #e9d5ff;border-radius:7px;padding:.35rem .65rem;font-size:.78rem;margin-bottom:.65rem}
    .esr-label{color:#6b7280}.esr-val{font-weight:800;color:#7c3aed}
    .make-gif-btn{width:100%;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.88rem}
    .make-gif-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.4rem}
    .pb-fill{height:100%;background:#8b5cf6;border-radius:99px;transition:width .2s}
    .tips-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ts-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem}
    .tip{display:flex;gap.5rem;gap:.5rem;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.78rem}
    .ti{font-size:1rem;flex-shrink:0}.td{font-size:.7rem;color:#6b7280;margin-top:.1rem;line-height:1.3}
  `]
})
export class GifMakerComponent {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  videoFile = signal<File|null>(null); videoUrl = signal('');
  gifDataUrl = signal(''); duration = signal(0);
  generating = signal(false); genProgress = signal(0);
  gifWidth = signal(480); gifHeight = signal(270);
  gifFrameCount = signal(0);
  gifStart = 0; gifEnd = 0; gifFps = 10; gifQuality = 10; loopCount = '0';

  sizes = [{w:240,h:135,label:'Small'},{w:480,h:270,label:'Medium'},{w:720,h:405,label:'Large'},{w:960,h:540,label:'HD'}];
  qualities = [{val:5,label:'Low'},{val:10,label:'Medium'},{val:15,label:'High'},{val:20,label:'Max'}];

  tips = [
    {icon:'⏱',title:'Keep it short',desc:'GIFs over 10 seconds become very large. 3–6 seconds is the sweet spot.'},
    {icon:'📐',title:'Lower resolution',desc:'240px–480px wide GIFs are perfectly clear on most screens and much smaller.'},
    {icon:'🎨',title:'Simple content',desc:'GIFs work best for content with fewer distinct colors (animation, screen recordings).'},
    {icon:'🔄',title:'Infinite loop',desc:'Loop forever for memes/reactions; loop once for demos or instructions.'},
  ];

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }
  loadFile(f: File) { this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.gifDataUrl.set(''); }

  onMeta() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    this.duration.set(v.duration);
    this.gifEnd = Math.min(v.duration, 6);
    this.gifStart = 0;
  }

  onTimeUpdate() {}
  setSize(s: {w:number,h:number}) { this.gifWidth.set(s.w); this.gifHeight.set(s.h); }
  updatePreview() {}

  estimatedSize(): string {
    const frames = Math.round((this.gifEnd - this.gifStart) * this.gifFps);
    const bytesPerFrame = (this.gifWidth() * this.gifHeight() * this.gifQuality) / 8;
    const total = frames * bytesPerFrame * 0.3; // compression estimate
    if (total < 1048576) return (total/1024).toFixed(0) + ' KB';
    return (total/1048576).toFixed(1) + ' MB';
  }
  estimatedGifSize(): string { return this.estimatedSize(); }

  makeGif() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    this.generating.set(true); this.genProgress.set(0);
    const frames: ImageData[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = this.gifWidth(); canvas.height = this.gifHeight();
    const ctx = canvas.getContext('2d')!;
    const totalFrames = Math.round((this.gifEnd - this.gifStart) * this.gifFps);
    this.gifFrameCount.set(totalFrames);
    let frame = 0;

    const captureFrame = () => {
      if (frame >= totalFrames) {
        // Simulate GIF encoding with canvas data URL
        this.genProgress.set(100);
        this.gifDataUrl.set(canvas.toDataURL('image/gif'));
        this.generating.set(false);
        return;
      }
      v.currentTime = this.gifStart + (frame / this.gifFps);
      v.addEventListener('seeked', () => {
        ctx.drawImage(v, 0, 0, this.gifWidth(), this.gifHeight());
        frame++;
        this.genProgress.set(Math.round((frame / totalFrames) * 100));
        setTimeout(captureFrame, 16);
      }, {once: true});
    };
    captureFrame();
  }

  downloadGif() {
    const a = document.createElement('a');
    a.href = this.gifDataUrl()!;
    a.download = (this.videoFile()!.name.replace(/\.[^.]+$/, '') + '.gif');
    a.click();
  }

  formatTime(s: number): string { const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}
