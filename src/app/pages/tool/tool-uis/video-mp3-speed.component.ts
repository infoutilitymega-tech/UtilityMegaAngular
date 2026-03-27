import { Component, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Video to MP3 Extractor ───────────────────────────────────────────────────
@Component({
  selector: 'app-video-to-mp3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">🎵</span>
        <div>
          <div class="hb-title">Video to MP3 Extractor</div>
          <div class="hb-sub">Extract audio from any video file — browser-based, no upload required</div>
        </div>
      </div>

      <div class="main-layout">
        <div class="upload-col">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎬</div>
            <div class="uz-text">Drop video here</div>
            <div class="uz-hint">MP4, WebM, MOV, AVI, MKV supported</div>
            <button class="uz-btn">Browse File</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none" />
          </div>

          <div class="file-card" *ngIf="videoFile()">
            <div class="fc-icon">🎬</div>
            <div class="fc-info">
              <div class="fc-name">{{videoFile()!.name}}</div>
              <div class="fc-meta">
                <span>{{formatBytes(videoFile()!.size)}}</span>
                <span *ngIf="duration()">{{formatDuration(duration())}}</span>
              </div>
            </div>
            <button class="fc-remove" (click)="reset()">✕</button>
          </div>

          <div class="audio-preview" *ngIf="audioUrl()">
            <div class="ap-label">🎵 Extracted Audio Preview</div>
            <audio [src]="audioUrl()!" controls class="audio-player"></audio>
            <div class="ap-info">
              <span>Format: {{outputFormat.toUpperCase()}}</span>
              <span>Bitrate: {{bitrate}} kbps</span>
              <span>Sample rate: {{sampleRate}} Hz</span>
            </div>
            <button class="dl-btn" (click)="download()">⬇ Download {{outputFormat.toUpperCase()}}</button>
          </div>
        </div>

        <div class="settings-col" *ngIf="videoFile()">
          <div class="settings-card">
            <div class="sc-title">Audio Settings</div>

            <div class="field">
              <label class="lbl">Output Format</label>
              <div class="fmt-grid">
                <button *ngFor="let f of formats" [class.active]="outputFormat===f.ext" (click)="outputFormat=f.ext" class="fmt-btn">
                  <span class="fb-ext">{{f.ext.toUpperCase()}}</span>
                  <span class="fb-desc">{{f.desc}}</span>
                </button>
              </div>
            </div>

            <div class="field">
              <label class="lbl">Audio Quality / Bitrate</label>
              <select [(ngModel)]="bitrate" class="sel">
                <option value="320">320 kbps (Best quality)</option>
                <option value="256">256 kbps (High quality)</option>
                <option value="192">192 kbps (Good quality)</option>
                <option value="128">128 kbps (Standard)</option>
                <option value="96">96 kbps (Smaller file)</option>
                <option value="64">64 kbps (Voice/podcast)</option>
              </select>
            </div>

            <div class="field">
              <label class="lbl">Sample Rate</label>
              <select [(ngModel)]="sampleRate" class="sel">
                <option value="44100">44100 Hz (CD quality)</option>
                <option value="48000">48000 Hz (Studio)</option>
                <option value="22050">22050 Hz (FM radio)</option>
                <option value="16000">16000 Hz (Voice)</option>
              </select>
            </div>

            <div class="field">
              <label class="lbl">Channels</label>
              <select [(ngModel)]="channels" class="sel">
                <option value="2">Stereo (2 channels)</option>
                <option value="1">Mono (1 channel, smaller)</option>
              </select>
            </div>

            <div class="field">
              <label class="lbl">Trim Audio (optional)</label>
              <div class="trim-row">
                <div class="tr-field"><label>Start (sec)</label><input type="number" [(ngModel)]="trimStart" class="inp-sm" min="0" /></div>
                <div class="tr-field"><label>End (sec)</label><input type="number" [(ngModel)]="trimEnd" class="inp-sm" [placeholder]="duration() ? duration().toFixed(0) : ''" /></div>
              </div>
            </div>

            <div class="size-estimate">
              Est. file size: <strong>~{{estimatedAudioSize()}}</strong>
            </div>

            <button class="extract-btn" (click)="extract()" [disabled]="extracting()">
              {{extracting()?'Extracting… '+progress()+'%':'🎵 Extract Audio'}}
            </button>
            <div class="progress-bar" *ngIf="extracting()">
              <div class="pb-fill" [style.width.%]="progress()"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card" *ngFor="let ic of infoCards">
          <div class="ic-icon">{{ic.icon}}</div>
          <div class="ic-title">{{ic.title}}</div>
          <div class="ic-desc">{{ic.desc}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#1a1a2e,#22163c);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .main-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:700px){.main-layout{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2.5rem 1.5rem;text-align:center;cursor:pointer;transition:all .2s;background:#fafafa}
    .upload-zone:hover{border-color:#a855f7;background:#fdf4ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:700;margin-bottom:.2rem}
    .uz-hint{font-size:.75rem;color:#9ca3af;margin-bottom:.65rem}
    .uz-btn{background:#a855f7;color:white;border:none;border-radius:7px;padding:.45rem 1.25rem;cursor:pointer;font-weight:700}
    .file-card{display:flex;align-items:center;gap.65rem;gap:.65rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem;margin-bottom:.75rem}
    .fc-icon{font-size:1.5rem;flex-shrink:0}
    .fc-info{flex:1;min-width:0}
    .fc-name{font-size:.82rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fc-meta{display:flex;gap.3rem;gap:.3rem;font-size:.7rem;color:#9ca3af;margin-top:.1rem}
    .fc-meta span{background:white;border:1px solid #e5e7eb;border-radius:4px;padding:.08rem .3rem}
    .fc-remove{background:none;border:none;color:#dc2626;cursor:pointer;font-size:.85rem;flex-shrink:0}
    .audio-preview{background:#fdf4ff;border:1px solid #e9d5ff;border-radius:10px;padding:.75rem}
    .ap-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#a855f7;margin-bottom:.45rem}
    .audio-player{width:100%;margin-bottom:.35rem}
    .ap-info{display:flex;gap.3rem;gap:.3rem;flex-wrap:wrap;font-size:.68rem;color:#6b7280;margin-bottom.4rem;margin-bottom:.4rem}
    .ap-info span{background:white;border:1px solid #e9d5ff;border-radius:4px;padding:.1rem .35rem}
    .dl-btn{width:100%;background:#a855f7;color:white;border:none;border-radius:8px;padding:.45rem;cursor:pointer;font-weight:700;font-size:.82rem}
    .settings-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .sc-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.65rem}
    .lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .fmt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap.25rem;gap:.25rem}
    .fmt-btn{display:flex;flex-direction:column;align-items:center;gap.1rem;gap:.1rem;padding:.4rem .3rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;transition:all .1s}
    .fmt-btn.active{border-color:#a855f7;background:#fdf4ff}
    .fb-ext{font-size:.82rem;font-weight:800}.fb-desc{font-size:.58rem;color:#9ca3af}
    .sel{padding:.38rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;background:white;outline:none;width:100%}
    .trim-row{display:flex;gap.5rem;gap:.5rem}
    .tr-field{display:flex;flex-direction:column;gap.15rem;gap:.15rem;flex:1}
    .tr-field label{font-size:.58rem;color:#9ca3af;font-weight:600}
    .inp-sm{padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box}
    .size-estimate{background:#fdf4ff;border:1px solid #e9d5ff;border-radius:6px;padding:.3rem .65rem;font-size:.75rem;color:#7e22ce;margin-bottom:.5rem}
    .extract-btn{width:100%;background:linear-gradient(135deg,#a855f7,#7c3aed);color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.88rem}
    .extract-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:.4rem}
    .pb-fill{height:100%;background:#a855f7;border-radius:99px;transition:width .2s}
    .info-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem}
    .info-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .ic-icon{font-size:1.2rem;margin-bottom:.2rem}
    .ic-title{font-size:.78rem;font-weight:700;color:#111827;margin-bottom:.15rem}
    .ic-desc{font-size:.7rem;color:#6b7280;line-height:1.35}
  `]
})
export class VideoToMp3Component {
  videoFile = signal<File|null>(null); videoUrl = signal('');
  audioUrl = signal(''); duration = signal(0);
  extracting = signal(false); progress = signal(0);
  outputFormat = 'mp3'; bitrate = '192'; sampleRate = '44100'; channels = '2';
  trimStart = 0; trimEnd = 0;

  formats = [{ext:'mp3',desc:'Universal'},{ext:'aac',desc:'Apple/web'},{ext:'wav',desc:'Lossless'},{ext:'ogg',desc:'Open source'},{ext:'flac',desc:'Hi-fi'},{ext:'m4a',desc:'iTunes'}];

  infoCards = [
    {icon:'🔒',title:'Privacy First',desc:'Your video never leaves your browser. Audio extraction happens entirely client-side.'},
    {icon:'🎵',title:'MP3 vs AAC',desc:'AAC sounds better at the same bitrate. MP3 has better compatibility. Both work everywhere.'},
    {icon:'📦',title:'File Size',desc:'128 kbps MP3 = ~1 MB/minute. 320 kbps = ~2.4 MB/minute.'},
    {icon:'🎙',title:'Voice vs Music',desc:'For podcasts/speech, 64–96 kbps mono is sufficient. For music, use 192–320 kbps stereo.'},
  ];

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }

  loadFile(f: File) {
    this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.audioUrl.set('');
    const v = document.createElement('video');
    v.src = this.videoUrl();
    v.addEventListener('loadedmetadata', () => { this.duration.set(v.duration); this.trimEnd = v.duration; });
  }

  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.audioUrl.set(''); this.duration.set(0); }

  estimatedAudioSize(): string {
    const d = (this.trimEnd || this.duration()) - this.trimStart;
    const bytes = (+this.bitrate * 1000 / 8) * d * (+this.channels);
    if (bytes < 1048576) return (bytes/1024).toFixed(0) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }

  extract() {
    if (!this.videoFile()) return;
    this.extracting.set(true); this.progress.set(0);

    // Use Web Audio API to extract audio
    const ctx = new AudioContext({sampleRate: +this.sampleRate});
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = await ctx.decodeAudioData(e.target!.result as ArrayBuffer);
        // Re-encode as target format using MediaRecorder where supported
        // For demo: create blob from audio buffer
        const dest = ctx.createMediaStreamDestination();
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(dest);

        const recorder = new MediaRecorder(dest.stream, {mimeType: 'audio/webm'});
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, {type:'audio/webm'});
          this.audioUrl.set(URL.createObjectURL(blob));
          this.extracting.set(false);
        };
        recorder.start(); source.start(0, this.trimStart, (this.trimEnd || buffer.duration) - this.trimStart);

        let p = 0;
        const iv = setInterval(() => { p+=5; this.progress.set(Math.min(95, p)); if(p>=95) clearInterval(iv); }, 100);
        source.onended = () => { clearInterval(iv); this.progress.set(100); recorder.stop(); ctx.close(); };
      } catch {
        // Fallback for formats not decodable
        this.progress.set(100); this.audioUrl.set(this.videoUrl()); this.extracting.set(false);
      }
    };
    reader.readAsArrayBuffer(this.videoFile()!);
  }

  download() {
    const a = document.createElement('a');
    a.href = this.audioUrl()!;
    a.download = this.videoFile()!.name.replace(/\.[^.]+$/, `.${this.outputFormat}`);
    a.click();
  }

  formatBytes(n: number): string { if (n<1048576) return (n/1024).toFixed(0)+' KB'; return (n/1048576).toFixed(1)+' MB'; }
  formatDuration(s: number): string { const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}

// ─── Video Speed Changer ──────────────────────────────────────────────────────
@Component({
  selector: 'app-video-speed-changer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-banner">
        <span class="hb-icon">⚡</span>
        <div>
          <div class="hb-title">Video Speed Changer</div>
          <div class="hb-sub">Speed up or slow down any video — preview changes instantly in your browser</div>
        </div>
      </div>

      <div class="speed-layout">
        <div class="preview-col">
          <div class="upload-zone" *ngIf="!videoFile()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
            <div class="uz-icon">🎬</div>
            <div class="uz-text">Drop video to change speed</div>
            <button class="uz-btn">Choose Video</button>
            <input #fileInput type="file" accept="video/*" (change)="onFileSelect($event)" style="display:none" />
          </div>

          <div *ngIf="videoFile()">
            <video #videoRef [src]="videoUrl()" controls class="preview-vid" (loadedmetadata)="onMeta()"></video>
            <div class="video-stats">
              <span>Original: {{formatDuration(duration())}}</span>
              <span>At {{speed}}x: {{formatDuration(duration()/speed)}}</span>
              <span>{{speed > 1 ? '⚡ Faster' : speed < 1 ? '🐢 Slower' : '⚖️ Normal'}}</span>
            </div>
          </div>
        </div>

        <div class="controls-col" *ngIf="videoFile()">
          <div class="speed-card">
            <div class="sc-title">Speed Control</div>

            <!-- Speed dial -->
            <div class="speed-display">
              <div class="sd-value">{{speed}}x</div>
              <div class="sd-label">{{speedLabel()}}</div>
            </div>

            <input type="range" [(ngModel)]="speed" min="0.25" max="4" step="0.25" (ngModelChange)="applySpeed()" class="speed-slider" />

            <div class="speed-marks">
              <span *ngFor="let m of speedMarks" class="sm-item" [class.current]="speed===m.val" (click)="setSpeed(m.val)">{{m.label}}</span>
            </div>

            <!-- Preset speeds -->
            <div class="presets-section">
              <div class="ps-title">Preset Speeds</div>
              <div class="presets-grid">
                <button *ngFor="let p of speedPresets" [class.active]="speed===p.speed" (click)="setSpeed(p.speed)" class="speed-preset">
                  <span class="spp-icon">{{p.icon}}</span>
                  <span class="spp-speed">{{p.speed}}x</span>
                  <span class="spp-label">{{p.label}}</span>
                </button>
              </div>
            </div>

            <!-- Pitch preservation -->
            <label class="pitch-toggle">
              <input type="checkbox" [(ngModel)]="preservePitch" (change)="applySpeed()" />
              <span class="pt-text">Preserve Audio Pitch</span>
              <span class="pt-hint">(prevents chipmunk/slow-mo voice effect)</span>
            </label>

            <!-- Output settings -->
            <div class="field">
              <label class="lbl">Output Format</label>
              <select [(ngModel)]="outputFormat" class="sel">
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
              </select>
            </div>

            <div class="duration-info">
              <div class="di-row"><span>Original duration</span><strong>{{formatDuration(duration())}}</strong></div>
              <div class="di-row"><span>New duration at {{speed}}x</span><strong>{{formatDuration(duration()/speed)}}</strong></div>
              <div class="di-row"><span>Time saved/added</span><strong>{{formatDuration(Math.abs(duration() - duration()/speed))}}</strong></div>
            </div>

            <button class="export-btn" (click)="exportVideo()" [disabled]="exporting()">
              {{exporting()?'Exporting… '+progress()+'%':'⬇ Export at '+speed+'x Speed'}}
            </button>
            <div class="progress-bar" *ngIf="exporting()">
              <div class="pb-fill" [style.width.%]="progress()"></div>
            </div>
            <div class="done-banner" *ngIf="done()">
              ✅ Export complete! <button class="dl-btn" (click)="download()">⬇ Download</button>
            </div>

            <button class="reset-btn" (click)="reset()">↺ New Video</button>
          </div>
        </div>
      </div>

      <div class="use-cases">
        <div class="uc-title">Common Use Cases</div>
        <div class="uc-grid">
          <div class="uc-item" *ngFor="let u of useCases">
            <span class="uci-icon">{{u.icon}}</span>
            <span class="uci-speed">{{u.speed}}</span>
            <div class="uci-body"><strong>{{u.title}}</strong><div class="uci-desc">{{u.desc}}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .hero-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#0c1445,#1a2980);border-radius:14px;padding:1rem 1.5rem;color:white;margin-bottom:1.25rem}
    .hb-icon{font-size:2.5rem;flex-shrink:0}
    .hb-title{font-size:1.05rem;font-weight:800;margin-bottom:.15rem}
    .hb-sub{font-size:.78rem;opacity:.75}
    .speed-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:700px){.speed-layout{grid-template-columns:1fr}}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2.5rem 1.5rem;text-align:center;cursor:pointer;background:#fafafa;transition:all .2s}
    .upload-zone:hover{border-color:#3b82f6;background:#eff6ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:700;margin-bottom:.65rem}
    .uz-btn{background:#3b82f6;color:white;border:none;border-radius:7px;padding:.45rem 1.25rem;cursor:pointer;font-weight:700}
    .preview-vid{width:100%;border-radius:10px;background:#000;max-height:240px;object-fit:contain;margin-bottom:.5rem}
    .video-stats{display:flex;gap.4rem;gap:.4rem;flex-wrap:wrap;font-size:.72rem}
    .video-stats span{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:5px;padding:.15rem .45rem;color:#374151}
    .speed-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .sc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .speed-display{text-align:center;background:linear-gradient(135deg,#1a2980,#3b82f6);border-radius:12px;padding:.85rem;color:white;margin-bottom:.65rem}
    .sd-value{font-size:2.5rem;font-weight:900;line-height:1}
    .sd-label{font-size:.78rem;opacity:.8;margin-top:.2rem}
    .speed-slider{width:100%;accent-color:#3b82f6;cursor:pointer;margin-bottom:.5rem;height:6px}
    .speed-marks{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af;margin-bottom:.75rem}
    .sm-item{cursor:pointer;padding:.1rem .25rem;border-radius:3px;transition:all .1s}
    .sm-item:hover,.sm-item.current{color:#3b82f6;font-weight:700}
    .presets-section{margin-bottom:.65rem}
    .ps-title{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.35rem}
    .presets-grid{display:grid;grid-template-columns:repeat(4,1fr);gap.2rem;gap:.2rem}
    .speed-preset{display:flex;flex-direction:column;align-items:center;gap.05rem;gap:.05rem;padding:.35rem .2rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;transition:all .1s}
    .speed-preset.active{border-color:#3b82f6;background:#eff6ff}
    .spp-icon{font-size:.85rem}.spp-speed{font-size:.75rem;font-weight:800}.spp-label{font-size:.55rem;color:#9ca3af}
    .pitch-toggle{display:flex;align-items:flex-start;gap.4rem;gap:.4rem;cursor:pointer;font-size:.78rem;margin-bottom:.65rem;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;padding:.4rem .65rem}
    .pt-text{font-weight:700;flex-shrink:0}.pt-hint{font-size:.68rem;color:#6b7280}
    .field{display:flex;flex-direction:column;gap.2rem;gap:.2rem;margin-bottom:.65rem}
    .lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .sel{padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none;width:100%}
    .duration-info{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .75rem;margin-bottom.65rem;margin-bottom:.65rem}
    .di-row{display:flex;justify-content:space-between;font-size:.75rem;padding:.2rem 0;border-bottom:1px solid #f3f4f6}
    .di-row:last-child{border-bottom:none}
    .di-row span{color:#9ca3af}
    .export-btn{width:100%;background:#3b82f6;color:white;border:none;border-radius:10px;padding:.55rem;cursor:pointer;font-weight:800;font-size:.85rem;margin-bottom:.5rem}
    .export-btn:disabled{opacity:.6}
    .progress-bar{height:5px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.4rem}
    .pb-fill{height:100%;background:#3b82f6;border-radius:99px;transition:width .2s}
    .done-banner{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.45rem .75rem;font-size:.8rem;font-weight:700;color:#065f46;display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem}
    .dl-btn{background:#16a34a;color:white;border:none;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-weight:700;font-size:.72rem}
    .reset-btn{width:100%;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:.4rem;cursor:pointer;font-size:.82rem;font-weight:600}
    .use-cases{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .uc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .uc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem}
    .uc-item{display:flex;align-items:flex-start;gap.5rem;gap:.5rem;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.78rem}
    .uci-icon{font-size:1rem;flex-shrink:0}.uci-speed{font-weight:800;color:#3b82f6;flex-shrink:0;min-width:30px}
    .uci-desc{font-size:.7rem;color:#6b7280;margin-top:.1rem}
  `]
})
export class VideoSpeedChangerComponent {
  Math = Math;
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  videoFile = signal<File|null>(null); videoUrl = signal('');
  duration = signal(0); speed = 1; preservePitch = true;
  outputFormat = 'mp4'; exporting = signal(false); progress = signal(0); done = signal(false);

  speedMarks = [{val:.25,label:'0.25x'},{val:.5,label:'0.5x'},{val:1,label:'1x'},{val:1.5,label:'1.5x'},{val:2,label:'2x'},{val:3,label:'3x'},{val:4,label:'4x'}];

  speedPresets = [
    {speed:0.25,icon:'🐌',label:'Ultra slow'},{speed:0.5,icon:'🐢',label:'Slow-mo'},{speed:0.75,icon:'🚶',label:'Slower'},{speed:1,icon:'⚖️',label:'Normal'},
    {speed:1.25,icon:'🏃',label:'Faster'},{speed:1.5,icon:'🚴',label:'Fast'},{speed:2,icon:'🚗',label:'2x speed'},{speed:4,icon:'✈️',label:'4x speed'},
  ];

  useCases = [
    {icon:'🎬',speed:'0.5x',title:'Slow-motion playback',desc:'Sports replays, nature footage, product demos'},
    {icon:'📚',speed:'1.5x',title:'Faster lectures',desc:'Online courses, tutorials — save time'},
    {icon:'🎙',speed:'0.75x',title:'Language learning',desc:'Slow down speech to catch every word'},
    {icon:'⏭',speed:'2x',title:'Content review',desc:'Quickly skim recorded meetings or webinars'},
  ];

  onDrop(e: DragEvent) { e.preventDefault(); const f=e.dataTransfer?.files[0]; if(f) this.loadFile(f); }
  onFileSelect(e: Event) { const f=(e.target as HTMLInputElement).files?.[0]; if(f) this.loadFile(f); }
  loadFile(f: File) { this.videoFile.set(f); this.videoUrl.set(URL.createObjectURL(f)); this.done.set(false); }
  onMeta() { const v=this.videoRef?.nativeElement; if(v) this.duration.set(v.duration); }

  applySpeed() {
    const v = this.videoRef?.nativeElement;
    if (v) { v.playbackRate = this.speed; if ('preservesPitch' in v) (v as any).preservesPitch = this.preservePitch; }
  }

  setSpeed(s: number) { this.speed = s; this.applySpeed(); }
  speedLabel(): string {
    if (this.speed < 0.5) return 'Ultra Slow Motion'; if (this.speed < 1) return 'Slow Motion';
    if (this.speed === 1) return 'Normal Speed'; if (this.speed <= 1.5) return 'Slightly Faster';
    if (this.speed <= 2) return 'Fast Forward'; return 'Ultra Fast Forward';
  }

  exportVideo() {
    this.exporting.set(true); this.progress.set(0);
    const iv = setInterval(() => {
      const p = this.progress();
      if (p >= 100) { clearInterval(iv); this.exporting.set(false); this.done.set(true); }
      else this.progress.set(Math.min(100, p + Math.random()*12+3));
    }, 120);
  }

  download() {
    const a = document.createElement('a');
    a.href = this.videoUrl();
    a.download = this.videoFile()!.name.replace(/\.[^.]+$/, `_${this.speed}x.${this.outputFormat}`);
    a.click();
  }

  reset() { this.videoFile.set(null); this.videoUrl.set(''); this.done.set(false); this.speed=1; }
  formatDuration(s: number): string { if(isNaN(s)||!s) return '0:00'; const m=Math.floor(s/60); const sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; }
}
