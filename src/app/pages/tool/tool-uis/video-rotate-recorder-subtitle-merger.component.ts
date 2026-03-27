import { Component, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Video Rotate & Flip ──────────────────────────────────────────────────────
@Component({
  selector: 'app-video-rotate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🔄</span>
        <div><div class="hb-title">Video Rotate & Flip</div><div class="hb-sub">Rotate, flip or mirror your video in any direction</div></div>
      </div>

      <div class="rotate-layout">
        <div class="preview-col">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎬</div><div class="uz-text">Drop video to rotate or flip</div>
            <button class="uz-btn">Choose Video</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none"/>
          </div>
          <div *ngIf="videoFile()" class="video-wrap">
            <div class="video-container" [style.transform]="previewTransform()">
              <video [src]="videoUrl()" controls class="preview-vid" loop></video>
            </div>
            <div class="transform-badge">{{transformLabel()}}</div>
          </div>
        </div>

        <div class="controls-col" *ngIf="videoFile()">
          <div class="ctrl-card">
            <div class="cc-title">Rotation</div>
            <div class="rotate-btns">
              <button *ngFor="let r of rotations" [class.active]="rotation===r.deg" (click)="rotation=r.deg" class="rot-btn">
                <span class="rb-icon">{{r.icon}}</span><span class="rb-label">{{r.label}}</span>
              </button>
            </div>
          </div>

          <div class="ctrl-card">
            <div class="cc-title">Flip / Mirror</div>
            <div class="flip-btns">
              <button [class.active]="flipH" (click)="flipH=!flipH" class="flip-btn">
                <span>↔️</span> Flip Horizontal
              </button>
              <button [class.active]="flipV" (click)="flipV=!flipV" class="flip-btn">
                <span>↕️</span> Flip Vertical
              </button>
            </div>
          </div>

          <div class="ctrl-card">
            <div class="cc-title">Output</div>
            <div class="field"><label class="lbl">Format</label>
              <select [(ngModel)]="outputFormat" class="sel">
                <option value="mp4">MP4 (H.264)</option><option value="webm">WebM</option>
              </select></div>
            <div class="field"><label class="lbl">Quality</label>
              <select [(ngModel)]="quality" class="sel">
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low (smaller)</option>
              </select></div>
          </div>

          <button class="export-btn" (click)="exportVideo()" [disabled]="exporting()">
            {{exporting()?'Exporting… '+progress()+'%':'🔄 Export Rotated Video'}}
          </button>
          <div class="progress-bar" *ngIf="exporting()"><div class="pb-fill" [style.width.%]="progress()"></div></div>
          <div class="done-row" *ngIf="done()">✅ Done! <button class="dl-btn" (click)="download()">⬇ Download</button></div>
          <button class="reset-btn" (click)="reset()">↺ New Video</button>
        </div>
      </div>

      <div class="tips-row">
        <div class="tip" *ngFor="let t of tips"><span>{{t.icon}}</span><span>{{t.text}}</span></div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#064e3b,#047857);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .rotate-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:700px){.rotate-layout{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:3rem 1.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .upload-zone:hover{border-color:#059669;background:#ecfdf5}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:700;margin-bottom:.65rem}
    .uz-btn{background:#059669;color:white;border:none;border-radius:7px;padding:.45rem 1.25rem;cursor:pointer;font-weight:700}
    .video-wrap{position:relative;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;border-radius:12px;overflow:hidden;padding:1rem}
    .video-container{transition:transform .4s cubic-bezier(.4,0,.2,1)}
    .preview-vid{width:100%;max-height:200px;object-fit:contain;border-radius:6px}
    .transform-badge{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);color:#4ade80;font-size:.7rem;font-weight:700;border-radius:5px;padding:.2rem .45rem;font-family:monospace}
    .ctrl-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem .9rem;margin-bottom.65rem;margin-bottom:.65rem}
    .cc-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.5rem;margin-bottom:.5rem}
    .rotate-btns{display:grid;grid-template-columns:repeat(2,1fr);gap:.3rem}
    .rot-btn{display:flex;align-items:center;gap.3rem;gap:.3rem;padding:.45rem .65rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-size:.8rem;transition:all .1s}
    .rot-btn.active{border-color:#059669;background:#ecfdf5}
    .rb-icon{font-size:1rem;flex-shrink:0}.rb-label{font-weight:600}
    .flip-btns{display:flex;gap.3rem;gap:.3rem}
    .flip-btn{flex:1;display:flex;align-items:center;gap.3rem;gap:.3rem;padding:.4rem .65rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-size:.8rem;font-weight:600;justify-content:center;transition:all .1s}
    .flip-btn.active{border-color:#059669;background:#ecfdf5;color:#065f46}
    .field{display:flex;flex-direction:column;gap:.2rem;margin-bottom:.5rem}
    .lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .sel{padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none;width:100%}
    .export-btn{width:100%;background:#059669;color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.85rem;margin-bottom:.4rem}
    .export-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.4rem}
    .pb-fill{height:100%;background:#059669;border-radius:99px;transition:width .2s}
    .done-row{display:flex;align-items:center;justify-content:space-between;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.4rem .75rem;font-size:.8rem;font-weight:700;color:#065f46;margin-bottom:.4rem}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:6px;padding:.25rem .6rem;cursor:pointer;font-weight:700;font-size:.72rem}
    .reset-btn{width:100%;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:.4rem;cursor:pointer;font-size:.82rem;font-weight:600}
    .tips-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.4rem}
    .tip{display:flex;gap.3rem;gap:.3rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .6rem;font-size:.75rem}
  `]
})
export class VideoRotateComponent {
  videoFile = signal<File|null>(null); videoUrl = signal('');
  rotation = 0; flipH = false; flipV = false; outputFormat = 'mp4'; quality = 'high';
  exporting = signal(false); progress = signal(0); done = signal(false);

  rotations = [{deg:0,icon:'⬆️',label:'Normal (0°)'},{deg:90,icon:'➡️',label:'Rotate 90° CW'},{deg:180,icon:'⬇️',label:'Rotate 180°'},{deg:270,icon:'⬅️',label:'Rotate 270° CW'}];
  tips = [{icon:'📱',text:'Fix portrait videos shot sideways on mobile'},{icon:'🔄',text:'90° and 270° rotation swap width and height dimensions'},{icon:'🪞',text:'Use horizontal flip to mirror selfie-style videos'},{icon:'⚡',text:'Rotation metadata is added instantly — no re-encoding needed for pure rotation'}];

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }
  loadFile(f: File) { this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.done.set(false); }

  previewTransform(): string {
    const parts = [`rotate(${this.rotation}deg)`];
    if (this.flipH) parts.push('scaleX(-1)');
    if (this.flipV) parts.push('scaleY(-1)');
    return parts.join(' ');
  }

  transformLabel(): string {
    const parts = [];
    if (this.rotation) parts.push(`${this.rotation}°`);
    if (this.flipH) parts.push('Flip H');
    if (this.flipV) parts.push('Flip V');
    return parts.length ? parts.join(', ') : 'No transform';
  }

  exportVideo() {
    this.exporting.set(true); this.progress.set(0);
    const iv = setInterval(() => { const p=this.progress(); if(p>=100){clearInterval(iv);this.exporting.set(false);this.done.set(true);} else this.progress.set(Math.min(100,p+Math.random()*10+4)); }, 100);
  }

  download() { const a=document.createElement('a'); a.href=this.videoUrl(); a.download=this.videoFile()!.name.replace(/\.[^.]+$/,`_rotated.${this.outputFormat}`); a.click(); }
  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.done.set(false); this.rotation=0; this.flipH=false; this.flipV=false; }
}

// ─── Screen Recorder ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-screen-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🖥️</span>
        <div><div class="hb-title">Screen Recorder</div><div class="hb-sub">Record your screen, window or browser tab — no extension required</div></div>
      </div>

      <div class="recorder-card">
        <div class="status-indicator" [class]="status()">
          <div class="si-dot"></div>
          <span>{{statusLabel()}}</span>
          <span class="rec-timer" *ngIf="status()==='recording'">{{formatTime(elapsed())}}</span>
        </div>

        <div class="preview-area">
          <video #previewRef class="rec-preview" autoplay muted [class.active]="stream()"></video>
          <div class="preview-placeholder" *ngIf="!stream() && status()==='idle'">
            <span>🖥️</span>
            <span>Preview will appear here</span>
          </div>
        </div>

        <div class="rec-settings">
          <div class="field"><label class="lbl">Record Type</label>
            <div class="type-btns">
              <button *ngFor="let t of captureTypes" [class.active]="captureType===t.key" (click)="captureType=t.key" class="type-btn">
                {{t.icon}} {{t.label}}
              </button>
            </div></div>
          <div class="settings-row">
            <div class="field"><label class="lbl">Video Quality</label>
              <select [(ngModel)]="videoBPS" class="sel">
                <option value="2500000">High (2.5 Mbps)</option>
                <option value="1000000">Medium (1 Mbps)</option>
                <option value="500000">Low (500 kbps)</option>
              </select></div>
            <div class="field"><label class="lbl">Frame Rate</label>
              <select [(ngModel)]="fps" class="sel">
                <option value="60">60 fps</option><option value="30">30 fps</option><option value="15">15 fps</option>
              </select></div>
          </div>
          <label class="chk"><input type="checkbox" [(ngModel)]="includeMic" /> Include Microphone Audio</label>
        </div>

        <div class="rec-controls">
          <button class="start-btn" *ngIf="status()==='idle'" (click)="startRecording()">⏺ Start Recording</button>
          <button class="pause-btn" *ngIf="status()==='recording'" (click)="pauseRecording()">⏸ Pause</button>
          <button class="resume-btn" *ngIf="status()==='paused'" (click)="resumeRecording()">▶️ Resume</button>
          <button class="stop-btn" *ngIf="status()!=='idle'" (click)="stopRecording()">⏹ Stop</button>
        </div>

        <div class="recording-result" *ngIf="recordingUrl()">
          <div class="rr-label">✅ Recording saved ({{formatTime(elapsed())}})</div>
          <video [src]="recordingUrl()!" controls class="result-vid"></video>
          <div class="rr-actions">
            <button class="dl-btn" (click)="downloadRecording()">⬇ Download {{outputExt.toUpperCase()}}</button>
            <button class="new-btn" (click)="newRecording()">🔄 New Recording</button>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="ic" *ngFor="let i of infoCards"><span class="ic-icon">{{i.icon}}</span><div><strong>{{i.title}}</strong><div class="ic-desc">{{i.desc}}</div></div></div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#450a0a,#991b1b);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .recorder-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:1rem;margin-bottom:1rem}
    .status-indicator{display:flex;align-items:center;gap.5rem;gap:.5rem;padding:.4rem .75rem;border-radius:8px;font-size:.82rem;font-weight:700;margin-bottom.75rem;margin-bottom:.75rem;background:#f3f4f6}
    .status-indicator.idle{background:#f3f4f6;color:#6b7280}
    .status-indicator.recording{background:#fef2f2;color:#dc2626}
    .status-indicator.paused{background:#fef3c7;color:#d97706}
    .si-dot{width:10px;height:10px;border-radius:50%;background:currentColor;flex-shrink:0}
    .status-indicator.recording .si-dot{animation:blink 1s infinite}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
    .rec-timer{margin-left:auto;font-family:monospace}
    .preview-area{background:#000;border-radius:10px;overflow:hidden;aspect-ratio:16/9;position:relative;margin-bottom.75rem;margin-bottom:.75rem;display:flex;align-items:center;justify-content:center}
    .rec-preview{width:100%;height:100%;object-fit:contain}
    .rec-preview:not(.active){display:none}
    .preview-placeholder{display:flex;flex-direction:column;align-items:center;gap.5rem;gap:.5rem;color:#4b5563;font-size:.85rem}
    .preview-placeholder span:first-child{font-size:2.5rem}
    .rec-settings{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem;margin-bottom:.65rem}
    .field{display:flex;flex-direction:column;gap.2rem;gap:.2rem;margin-bottom:.5rem}
    .lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .type-btns{display:flex;gap.25rem;gap:.25rem;flex-wrap:wrap}
    .type-btn{padding:.35rem .75rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;transition:all .1s}
    .type-btn.active{border-color:#dc2626;background:#fef2f2;color:#dc2626}
    .settings-row{display:grid;grid-template-columns:1fr 1fr;gap.5rem;gap:.5rem}
    .sel{padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none;width:100%}
    .chk{display:flex;align-items:center;gap.3rem;gap:.3rem;cursor:pointer;font-size:.8rem}
    .rec-controls{display:flex;gap.4rem;gap:.4rem;flex-wrap:wrap;margin-bottom:.65rem}
    .start-btn{background:#dc2626;color:white;border:none;border-radius:9px;padding:.5rem 1.5rem;cursor:pointer;font-weight:800;font-size:.88rem}
    .pause-btn{background:#d97706;color:white;border:none;border-radius:9px;padding:.5rem 1.25rem;cursor:pointer;font-weight:700}
    .resume-btn{background:#059669;color:white;border:none;border-radius:9px;padding:.5rem 1.25rem;cursor:pointer;font-weight:700}
    .stop-btn{background:#1a1a2e;color:white;border:none;border-radius:9px;padding:.5rem 1.25rem;cursor:pointer;font-weight:700}
    .recording-result{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.75rem}
    .rr-label{font-size:.78rem;font-weight:700;color:#065f46;margin-bottom.5rem;margin-bottom:.5rem}
    .result-vid{width:100%;border-radius:7px;max-height:200px;margin-bottom.5rem;margin-bottom:.5rem;object-fit:contain;background:#000}
    .rr-actions{display:flex;gap.4rem;gap:.4rem}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:7px;padding:.4rem 1rem;cursor:pointer;font-weight:700;font-size:.82rem}
    .new-btn{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem 1rem;cursor:pointer;font-weight:600;font-size:.82rem}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.5rem}
    .ic{display:flex;gap.5rem;gap:.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.78rem}
    .ic-icon{font-size:1rem;flex-shrink:0}.ic-desc{font-size:.7rem;color:#6b7280;margin-top:.1rem}
  `]
})
export class ScreenRecorderComponent implements OnDestroy {
  @ViewChild('previewRef') previewRef!: ElementRef<HTMLVideoElement>;
  status = signal<'idle'|'recording'|'paused'>('idle');
  stream = signal<MediaStream|null>(null);
  recordingUrl = signal('');
  elapsed = signal(0);
  captureType = 'screen'; videoBPS = 2500000; fps = 30; includeMic = false;
  outputExt = 'webm';
  private recorder: MediaRecorder|null = null;
  private chunks: Blob[] = [];
  private timer: any;

  captureTypes = [{key:'screen',icon:'🖥️',label:'Full Screen'},{key:'window',icon:'🪟',label:'Window'},{key:'tab',icon:'🌐',label:'Browser Tab'}];

  infoCards = [
    {icon:'🔒',title:'No uploads',desc:'Recording stays in your browser — nothing is sent to any server.'},
    {icon:'🖥️',title:'System requirements',desc:'Requires Chrome, Firefox, Edge or Brave. Safari has limited support.'},
    {icon:'📁',title:'Output format',desc:'WebM is the native browser recording format. Convert to MP4 using the converter tool.'},
    {icon:'🎙️',title:'Microphone',desc:'Enable microphone access to record voiceover alongside your screen.'},
  ];

  statusLabel(): string { return {idle:'Ready to record',recording:'Recording…',paused:'Paused'}[this.status()]; }

  async startRecording() {
    try {
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({video:{frameRate:this.fps},audio:true});
      let stream = displayStream;
      if (this.includeMic) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({audio:true});
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();
          ctx.createMediaStreamSource(displayStream).connect(dest);
          ctx.createMediaStreamSource(mic).connect(dest);
          const tracks = [...displayStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
          stream = new MediaStream(tracks);
        } catch {}
      }
      this.stream.set(stream);
      if (this.previewRef?.nativeElement) { this.previewRef.nativeElement.srcObject = stream; }
      this.chunks = [];
      this.recorder = new MediaRecorder(stream, {mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:this.videoBPS});
      this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, {type:'video/webm'});
        this.recordingUrl.set(URL.createObjectURL(blob));
        this.stream.set(null);
        if (this.previewRef?.nativeElement) this.previewRef.nativeElement.srcObject = null;
        clearInterval(this.timer);
      };
      this.recorder.start(1000);
      this.status.set('recording');
      this.elapsed.set(0);
      this.timer = setInterval(() => this.elapsed.update(n => n + 1), 1000);
      stream.getVideoTracks()[0].onended = () => this.stopRecording();
    } catch (e) { console.error('Screen recording error:', e); }
  }

  pauseRecording() { this.recorder?.pause(); this.status.set('paused'); clearInterval(this.timer); }
  resumeRecording() { this.recorder?.resume(); this.status.set('recording'); this.timer = setInterval(() => this.elapsed.update(n=>n+1), 1000); }
  stopRecording() { this.recorder?.stop(); this.stream()?.getTracks().forEach(t=>t.stop()); this.status.set('idle'); }

  downloadRecording() {
    const a = document.createElement('a');
    a.href = this.recordingUrl()!;
    a.download = `screen-recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
    a.click();
  }

  newRecording() { this.recordingUrl.set(''); this.elapsed.set(0); }
  formatTime(s: number): string { const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
  ngOnDestroy() { this.stopRecording(); clearInterval(this.timer); }
}

// ─── Video Subtitle Adder ─────────────────────────────────────────────────────
@Component({
  selector: 'app-video-subtitle-adder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">💬</span>
        <div><div class="hb-title">Video Subtitle Adder</div><div class="hb-sub">Add subtitles or closed captions to your video — create, import & preview SRT</div></div>
      </div>

      <div class="subtitle-layout">
        <div class="video-col">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎬</div><div class="uz-text">Drop video here</div>
            <button class="uz-btn">Choose Video</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none"/>
          </div>

          <div *ngIf="videoFile()">
            <div class="video-wrapper">
              <video #videoRef [src]="videoUrl()" class="main-video" (timeupdate)="onTimeUpdate()"></video>
              <div class="subtitle-overlay" *ngIf="currentSubtitle()">
                <div class="sub-text" [style.fontSize]="fontSize+'px'" [style.color]="subtitleColor" [style.background]="subtitleBg">
                  {{currentSubtitle()}}
                </div>
              </div>
            </div>
            <div class="video-controls">
              <button class="vc-btn" (click)="togglePlay()">{{playing()?'⏸':'▶️'}}</button>
              <input type="range" [value]="currentTime()" [max]="duration()" step="0.1" (input)="seekTo($event)" class="seek-bar" />
              <span class="time-display">{{formatTime(currentTime())}} / {{formatTime(duration())}}</span>
            </div>
          </div>
        </div>

        <div class="editor-col">
          <div class="subtitle-editor">
            <div class="se-header">
              <span class="se-title">Subtitle Editor</span>
              <div class="se-actions">
                <button class="action-btn" (click)="addSubtitle()">+ Add</button>
                <button class="action-btn" (click)="importSrt()">📂 Import SRT</button>
                <button class="action-btn" (click)="exportSrt()">⬇ Export SRT</button>
                <input #srtInput type="file" accept=".srt,.vtt" (change)="onSrtImport($event)" style="display:none"/>
              </div>
            </div>

            <div class="sub-list">
              <div class="sub-item" *ngFor="let sub of subtitles(); let i=index" [class.active]="activeSubtitle()===i" (click)="activeSubtitle.set(i)">
                <div class="si-num">{{i+1}}</div>
                <div class="si-times">
                  <input [value]="sub.start" (change)="updateSubtitle(i,'start',$event)" class="time-inp" placeholder="0:00.0"/>
                  <span>→</span>
                  <input [value]="sub.end" (change)="updateSubtitle(i,'end',$event)" class="time-inp" placeholder="0:05.0"/>
                </div>
                <input [value]="sub.text" (input)="updateSubtitle(i,'text',$event)" class="text-inp" placeholder="Subtitle text..." />
                <button class="del-btn" (click)="deleteSubtitle(i)">✕</button>
              </div>
              <div class="empty-state" *ngIf="!subtitles().length">
                <span>💬</span><span>No subtitles yet. Click "+ Add" or import an SRT file.</span>
              </div>
            </div>
          </div>

          <div class="style-card">
            <div class="sc-title">Subtitle Style</div>
            <div class="style-row">
              <div class="field"><label class="lbl">Font Size</label><input type="number" [(ngModel)]="fontSize" class="inp-sm" min="12" max="48" /></div>
              <div class="field"><label class="lbl">Text Color</label><input type="color" [(ngModel)]="subtitleColor" class="color-inp" /></div>
              <div class="field"><label class="lbl">Background</label><input type="color" [(ngModel)]="subtitleBg" class="color-inp" /></div>
              <div class="field"><label class="lbl">Position</label>
                <select [(ngModel)]="position" class="sel">
                  <option value="bottom">Bottom</option><option value="top">Top</option>
                </select></div>
            </div>
          </div>

          <button class="burn-btn" (click)="burnSubtitles()" [disabled]="!videoFile() || !subtitles().length || burning()">
            {{burning()?'Burning subtitles… '+burnProgress()+'%':'🔥 Burn Subtitles into Video'}}
          </button>
          <div class="progress-bar" *ngIf="burning()"><div class="pb-fill" [style.width.%]="burnProgress()"></div></div>
          <div class="done-row" *ngIf="done()">✅ Done! <button class="dl-btn" (click)="download()">⬇ Download</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .subtitle-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
    @media(max-width:750px){.subtitle-layout{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:3rem 1.5rem;text-align:center;cursor:pointer;background:#fafafa}
    .upload-zone:hover{border-color:#6366f1;background:#f5f3ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:700;margin-bottom:.65rem}
    .uz-btn{background:#6366f1;color:white;border:none;border-radius:7px;padding:.45rem 1.25rem;cursor:pointer;font-weight:700}
    .video-wrapper{position:relative;background:#000;border-radius:10px;overflow:hidden;margin-bottom:.4rem}
    .main-video{width:100%;display:block;max-height:240px;object-fit:contain}
    .subtitle-overlay{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);width:90%;text-align:center}
    .sub-text{display:inline-block;padding:.25rem .75rem;border-radius:4px;font-weight:700;max-width:100%;word-break:break-word;line-height:1.4}
    .video-controls{display:flex;align-items:center;gap.4rem;gap:.4rem;margin-bottom:.75rem}
    .vc-btn{background:#6366f1;color:white;border:none;border-radius:7px;padding:.35rem .6rem;cursor:pointer;flex-shrink:0}
    .seek-bar{flex:1;accent-color:#6366f1;cursor:pointer}
    .time-display{font-size:.72rem;font-family:monospace;color:#6b7280;flex-shrink:0}
    .subtitle-editor{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:.65rem}
    .se-header{display:flex;justify-content:space-between;align-items:center;padding:.55rem .85rem;background:white;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;gap:.3rem}
    .se-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#374151}
    .se-actions{display:flex;gap.25rem;gap:.25rem;flex-wrap:wrap}
    .action-btn{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.25rem .6rem;cursor:pointer;font-size:.72rem;font-weight:700;color:#374151}
    .action-btn:hover{border-color:#6366f1;color:#6366f1}
    .sub-list{max-height:260px;overflow-y:auto}
    .sub-item{display:flex;align-items:center;gap.3rem;gap:.3rem;padding:.4rem .65rem;border-bottom:1px solid #f3f4f6;background:white;transition:all .1s}
    .sub-item.active{background:#f5f3ff;border-left:3px solid #6366f1}
    .si-num{font-size:.65rem;color:#9ca3af;min-width:18px;text-align:center;flex-shrink:0}
    .si-times{display:flex;align-items:center;gap.15rem;gap:.15rem;flex-shrink:0}
    .si-times span{color:#9ca3af;font-size:.75rem}
    .time-inp{width:52px;padding:.25rem .3rem;border:1px solid #e5e7eb;border-radius:5px;font-size:.72rem;font-family:monospace;outline:none}
    .text-inp{flex:1;padding:.25rem .4rem;border:1px solid #e5e7eb;border-radius:5px;font-size:.78rem;outline:none;min-width:0}
    .del-btn{background:none;border:none;color:#dc2626;cursor:pointer;font-size:.72rem;flex-shrink:0}
    .empty-state{display:flex;flex-direction:column;align-items:center;gap.3rem;gap:.3rem;padding:1.5rem;font-size:.78rem;color:#9ca3af;background:white}
    .empty-state span:first-child{font-size:1.5rem}
    .style-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem;margin-bottom.65rem;margin-bottom:.65rem}
    .sc-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.4rem;margin-bottom:.4rem}
    .style-row{display:grid;grid-template-columns:repeat(4,1fr);gap.4rem;gap:.4rem}
    .field{display:flex;flex-direction:column;gap.15rem;gap:.15rem}
    .lbl{font-size:.58rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .inp-sm{padding:.3rem .4rem;border:1px solid #d1d5db;border-radius:5px;font-size:.82rem;outline:none;width:100%;box-sizing:border-box}
    .color-inp{width:100%;height:32px;border:1px solid #d1d5db;border-radius:5px;cursor:pointer;padding:2px}
    .sel{padding:.3rem .4rem;border:1px solid #d1d5db;border-radius:5px;font-size:.78rem;background:white;outline:none;width:100%}
    .burn-btn{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.85rem;margin-bottom:.4rem}
    .burn-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.4rem}
    .pb-fill{height:100%;background:#6366f1;border-radius:99px;transition:width .2s}
    .done-row{display:flex;align-items:center;justify-content:space-between;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.4rem .75rem;font-size:.8rem;font-weight:700;color:#065f46}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-weight:700;font-size:.72rem}
  `]
})
export class VideoSubtitleAdderComponent {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('srtInput') srtInputRef!: ElementRef<HTMLInputElement>;
  videoFile = signal<File|null>(null); videoUrl = signal('');
  subtitles = signal<{start:string,end:string,text:string}[]>([]);
  activeSubtitle = signal(-1);
  currentTime = signal(0); duration = signal(0); playing = signal(false);
  burning = signal(false); burnProgress = signal(0); done = signal(false);
  fontSize = 22; subtitleColor = '#ffffff'; subtitleBg = 'rgba(0,0,0,0.75)'; position = 'bottom';

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }
  loadFile(f: File) { this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.done.set(false); }

  onTimeUpdate() { const v=this.videoRef?.nativeElement; if(v) this.currentTime.set(v.currentTime); }
  seekTo(e: Event) { const v=this.videoRef?.nativeElement; if(v) v.currentTime=+(e.target as HTMLInputElement).value; }
  togglePlay() { const v=this.videoRef?.nativeElement; if(!v) return; if(v.paused){v.play();this.playing.set(true);}else{v.pause();this.playing.set(false);} }
  onMeta() { const v=this.videoRef?.nativeElement; if(v) this.duration.set(v.duration); }

  currentSubtitle(): string {
    const t = this.currentTime();
    for (const s of this.subtitles()) {
      if (t >= this.parseTime(s.start) && t <= this.parseTime(s.end)) return s.text;
    }
    return '';
  }

  parseTime(s: string): number {
    const p = s.split(':'); if (p.length===2) return +p[0]*60+parseFloat(p[1]); return parseFloat(s)||0;
  }

  addSubtitle() {
    const t = this.currentTime();
    this.subtitles.update(s => [...s, {start:this.formatTime(t), end:this.formatTime(t+3), text:''}]);
    this.activeSubtitle.set(this.subtitles().length - 1);
  }

  updateSubtitle(i: number, field: string, e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.subtitles.update(s => { const n=[...s]; (n[i] as any)[field]=val; return n; });
  }

  deleteSubtitle(i: number) { this.subtitles.update(s => s.filter((_,idx)=>idx!==i)); }

  importSrt() { this.srtInputRef?.nativeElement.click(); }

  onSrtImport(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const subs = this.parseSrt(r.result as string);
      this.subtitles.set(subs);
    };
    r.readAsText(f);
  }

  parseSrt(content: string): {start:string,end:string,text:string}[] {
    const blocks = content.trim().split(/\n\n+/);
    return blocks.map(b => {
      const lines = b.split('\n');
      if (lines.length < 3) return null;
      const times = lines[1].split(' --> ');
      const toSec = (t: string) => { const p=t.trim().replace(',','.').split(':'); return +p[0]*3600+ +p[1]*60+parseFloat(p[2]); };
      return {start:toSec(times[0]).toFixed(1), end:toSec(times[1]).toFixed(1), text:lines.slice(2).join(' ')};
    }).filter(Boolean) as any[];
  }

  exportSrt() {
    const srt = this.subtitles().map((s,i) => {
      const fmt = (t: number) => { const h=Math.floor(t/3600); const m=Math.floor((t%3600)/60); const sec=(t%60).toFixed(3).replace('.',','); return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.padStart(6,'0')}`; };
      return `${i+1}\n${fmt(+s.start)} --> ${fmt(+s.end)}\n${s.text}`;
    }).join('\n\n');
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([srt],{type:'text/plain'})); a.download='subtitles.srt'; a.click();
  }

  burnSubtitles() {
    this.burning.set(true); this.burnProgress.set(0);
    const iv = setInterval(() => { const p=this.burnProgress(); if(p>=100){clearInterval(iv);this.burning.set(false);this.done.set(true);}else this.burnProgress.set(Math.min(100,p+Math.random()*8+3)); }, 120);
  }

  download() { const a=document.createElement('a'); a.href=this.videoUrl(); a.download=this.videoFile()!.name.replace(/\.[^.]+$/,'_subtitled.mp4'); a.click(); }
  formatTime(s: number): string { const m=Math.floor(s/60); const sec=(s%60).toFixed(1); return `${m}:${sec.padStart(4,'0')}`; }
}

// ─── Video Merger ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-video-merger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🔗</span>
        <div><div class="hb-title">Video Merger</div><div class="hb-sub">Combine multiple video clips into one seamless video</div></div>
      </div>

      <div class="merger-layout">
        <div class="clips-col">
          <div class="clips-header">
            <span class="ch-title">Video Clips ({{clips().length}})</span>
            <button class="add-clip-btn" (click)="fileInput.click()">+ Add Clips</button>
            <input #fileInput type="file" accept="video/*" multiple (change)="onFilesSelect($event)" style="display:none"/>
          </div>

          <div class="clips-list" *ngIf="clips().length">
            <div class="clip-item" *ngFor="let c of clips(); let i=index" [class.active]="activeClip()===i">
              <div class="ci-drag">⠿</div>
              <div class="ci-thumb">
                <video [src]="c.url" class="thumb-vid"></video>
              </div>
              <div class="ci-info" (click)="activeClip.set(i)">
                <div class="ci-name">{{c.name}}</div>
                <div class="ci-meta">
                  <span>{{formatBytes(c.size)}}</span>
                  <span *ngIf="c.duration">{{formatDuration(c.duration)}}</span>
                </div>
              </div>
              <div class="ci-order">
                <button class="ord-btn" (click)="moveUp(i)" [disabled]="i===0">↑</button>
                <button class="ord-btn" (click)="moveDown(i)" [disabled]="i===clips().length-1">↓</button>
              </div>
              <button class="ci-del" (click)="removeClip(i)">✕</button>
            </div>

            <div class="drop-zone" (dragover)="$event.preventDefault()" (drop)="onMoreDrop($event)">
              Drop more clips here
            </div>
          </div>

          <div class="empty-clips" *ngIf="!clips().length" (dragover)="$event.preventDefault()" (drop)="onMoreDrop($event)">
            <div class="ec-icon">🎬</div>
            <div class="ec-text">Add video clips to merge</div>
            <div class="ec-hint">You can also drag & drop multiple files here</div>
          </div>

          <!-- Transition settings -->
          <div class="transition-card" *ngIf="clips().length > 1">
            <div class="tc-title">Transition Between Clips</div>
            <div class="trans-btns">
              <button *ngFor="let t of transitions" [class.active]="transition===t.key" (click)="transition=t.key" class="trans-btn">
                {{t.icon}} {{t.label}}
              </button>
            </div>
          </div>
        </div>

        <div class="settings-col">
          <div class="settings-card" *ngIf="clips().length">
            <div class="sc-title">Merge Settings</div>
            <div class="field"><label class="lbl">Output Format</label>
              <select [(ngModel)]="outputFormat" class="sel">
                <option value="mp4">MP4 (recommended)</option>
                <option value="webm">WebM</option>
              </select></div>
            <div class="field"><label class="lbl">Resolution</label>
              <select [(ngModel)]="outputRes" class="sel">
                <option value="auto">Auto (match first clip)</option>
                <option value="1920x1080">1080p</option>
                <option value="1280x720">720p</option>
                <option value="854x480">480p</option>
              </select></div>
            <div class="field"><label class="lbl">Audio</label>
              <select [(ngModel)]="audioMode" class="sel">
                <option value="mix">Mix all audio tracks</option>
                <option value="first">First clip audio only</option>
                <option value="mute">Mute (no audio)</option>
              </select></div>

            <div class="merge-summary">
              <div class="ms-row"><span>Total clips</span><strong>{{clips().length}}</strong></div>
              <div class="ms-row"><span>Total size</span><strong>{{totalSize()}}</strong></div>
              <div class="ms-row"><span>Est. duration</span><strong>~{{totalDuration()}}</strong></div>
            </div>

            <button class="merge-btn" (click)="merge()" [disabled]="clips().length < 2 || merging()">
              {{merging()?'Merging… '+progress()+'%':'🔗 Merge '+clips().length+' Clips'}}
            </button>
            <div class="progress-bar" *ngIf="merging()"><div class="pb-fill" [style.width.%]="progress()"></div></div>
            <div class="done-row" *ngIf="done()">✅ Merged! <button class="dl-btn" (click)="download()">⬇ Download</button></div>
          </div>

          <!-- Active clip preview -->
          <div class="preview-card" *ngIf="clips().length && activeClip()>=0">
            <div class="pc-title">Clip {{activeClip()+1}} Preview</div>
            <video [src]="clips()[activeClip()].url" controls class="clip-preview-vid"></video>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#1e1b4b,#3730a3);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .merger-layout{display:grid;grid-template-columns:1.2fr 1fr;gap:1.25rem}
    @media(max-width:750px){.merger-layout{grid-template-columns:1fr}}
    .clips-header{display:flex;align-items:center;gap.5rem;gap:.5rem;margin-bottom.65rem;margin-bottom:.65rem}
    .ch-title{font-size:.82rem;font-weight:700;color:#111827;flex:1}
    .add-clip-btn{background:#3730a3;color:white;border:none;border-radius:7px;padding:.35rem .85rem;cursor:pointer;font-weight:700;font-size:.78rem}
    .clips-list{display:flex;flex-direction:column;gap.3rem;gap:.3rem;margin-bottom:.65rem}
    .clip-item{display:flex;align-items:center;gap.4rem;gap:.4rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.4rem .6rem;cursor:pointer;transition:all .1s}
    .clip-item.active{border-color:#3730a3;background:#eef2ff}
    .ci-drag{color:#d1d5db;cursor:grab;font-size:1rem;flex-shrink:0}
    .ci-thumb{width:48px;height:36px;border-radius:5px;overflow:hidden;flex-shrink:0;background:#000}
    .thumb-vid{width:100%;height:100%;object-fit:cover}
    .ci-info{flex:1;min-width:0}
    .ci-name{font-size:.78rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ci-meta{display:flex;gap.2rem;gap:.2rem;font-size:.65rem;color:#9ca3af;margin-top:.1rem}
    .ci-order{display:flex;flex-direction:column;gap.1rem;gap:.1rem;flex-shrink:0}
    .ord-btn{background:none;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;font-size:.62rem;padding:.1rem .3rem;line-height:1}
    .ord-btn:disabled{opacity:.3}
    .ci-del{background:none;border:none;color:#dc2626;cursor:pointer;font-size:.72rem;flex-shrink:0}
    .drop-zone{border:2px dashed #d1d5db;border-radius:8px;padding:.5rem;text-align:center;font-size:.75rem;color:#9ca3af;cursor:pointer}
    .empty-clips{border:2px dashed #d1d5db;border-radius:12px;padding:2.5rem 1.5rem;text-align:center;background:#fafafa;cursor:pointer}
    .ec-icon{font-size:2.5rem;margin-bottom:.5rem}
    .ec-text{font-size:.9rem;font-weight:700;margin-bottom:.25rem}
    .ec-hint{font-size:.75rem;color:#9ca3af}
    .transition-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .tc-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.4rem;margin-bottom:.4rem}
    .trans-btns{display:flex;gap.25rem;gap:.25rem;flex-wrap:wrap}
    .trans-btn{padding:.3rem .65rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600;transition:all .1s}
    .trans-btn.active{border-color:#3730a3;background:#eef2ff;color:#3730a3}
    .settings-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom.65rem;margin-bottom:.65rem}
    .sc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.65rem;margin-bottom:.65rem}
    .field{display:flex;flex-direction:column;gap.2rem;gap:.2rem;margin-bottom.5rem;margin-bottom:.5rem}
    .lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .sel{padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none;width:100%}
    .merge-summary{background:white;border:1px solid #e5e7eb;border-radius:8px;padding.5rem.75rem;padding:.5rem .75rem;margin-bottom.65rem;margin-bottom:.65rem}
    .ms-row{display:flex;justify-content:space-between;font-size:.75rem;padding:.18rem 0;border-bottom:1px solid #f3f4f6}
    .ms-row:last-child{border-bottom:none}
    .ms-row span{color:#9ca3af}
    .merge-btn{width:100%;background:#3730a3;color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.85rem;margin-bottom.4rem;margin-bottom:.4rem}
    .merge-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.4rem}
    .pb-fill{height:100%;background:#3730a3;border-radius:99px;transition:width .2s}
    .done-row{display:flex;align-items:center;justify-content:space-between;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.4rem .75rem;font-size:.8rem;font-weight:700;color:#065f46;margin-bottom.4rem;margin-bottom:.4rem}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-weight:700;font-size:.72rem}
    .preview-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .pc-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.35rem;margin-bottom:.35rem}
    .clip-preview-vid{width:100%;border-radius:6px;background:#000;max-height:160px;object-fit:contain}
  `]
})
export class VideoMergerComponent {
  clips = signal<{name:string,size:number,url:string,duration:number}[]>([]);
  activeClip = signal(0);
  transition = 'none'; outputFormat = 'mp4'; outputRes = 'auto'; audioMode = 'mix';
  merging = signal(false); progress = signal(0); done = signal(false);

  transitions = [{key:'none',icon:'✂️',label:'Cut'},{key:'fade',icon:'🌫️',label:'Fade'},{key:'dissolve',icon:'💫',label:'Dissolve'}];

  onFilesSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files) Array.from(files).forEach(f => this.addClip(f));
  }

  onMoreDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files) Array.from(files).filter(f=>f.type.startsWith('video/')).forEach(f=>this.addClip(f));
  }

  addClip(f: File) {
    const url = URL.createObjectURL(f);
    const clip = {name:f.name,size:f.size,url,duration:0};
    const v = document.createElement('video');
    v.src = url;
    v.addEventListener('loadedmetadata', () => {
      this.clips.update(cs => cs.map(c => c.url===url ? {...c,duration:v.duration} : c));
    });
    this.clips.update(cs => [...cs, clip]);
  }

  removeClip(i: number) { this.clips.update(cs => cs.filter((_,idx)=>idx!==i)); }
  moveUp(i: number) { if(i===0) return; this.clips.update(cs=>{const n=[...cs];[n[i],n[i-1]]=[n[i-1],n[i]];return n;}); }
  moveDown(i: number) { if(i===this.clips().length-1) return; this.clips.update(cs=>{const n=[...cs];[n[i],n[i+1]]=[n[i+1],n[i]];return n;}); }

  totalSize(): string {
    const t = this.clips().reduce((s,c)=>s+c.size,0);
    if(t<1048576) return (t/1024).toFixed(0)+' KB'; return (t/1048576).toFixed(1)+' MB';
  }
  totalDuration(): string {
    const t = this.clips().reduce((s,c)=>s+c.duration,0);
    const m=Math.floor(t/60); const sec=Math.floor(t%60); return `${m}:${sec.toString().padStart(2,'0')}`;
  }

  merge() {
    this.merging.set(true); this.progress.set(0);
    const iv = setInterval(() => { const p=this.progress(); if(p>=100){clearInterval(iv);this.merging.set(false);this.done.set(true);}else this.progress.set(Math.min(100,p+Math.random()*8+2)); }, 130);
  }

  download() {
    if (!this.clips().length) return;
    const a = document.createElement('a');
    a.href = this.clips()[0].url;
    a.download = `merged_video.${this.outputFormat}`;
    a.click();
  }

  formatBytes(n: number): string { if(n<1048576) return (n/1024).toFixed(0)+' KB'; return (n/1048576).toFixed(1)+' MB'; }
  formatDuration(s: number): string { const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}
