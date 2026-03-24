import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base64-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="setMode(m.key)">{{m.label}}</button>
      </div>

      <!-- Text encode/decode -->
      <div *ngIf="mode()==='text'">
        <div class="io-grid">
          <div class="io-box">
            <div class="io-header">
              <label class="io-label">Plain Text Input</label>
              <div class="io-actions">
                <label class="chk-label"><input type="checkbox" [(ngModel)]="urlSafe" (change)="convert()" /> URL-safe</label>
              </div>
            </div>
            <textarea [(ngModel)]="textInput" (ngModelChange)="convert()" class="io-ta" rows="7" placeholder="Enter text to encode to Base64..."></textarea>
            <div class="ta-footer">{{textInput.length}} chars</div>
          </div>
          <div class="io-box">
            <div class="io-header">
              <label class="io-label">Base64 Output</label>
              <button class="copy-btn" (click)="copy(b64Output)">📋 Copy</button>
            </div>
            <textarea class="io-ta output" [value]="b64Output" readonly rows="7"></textarea>
            <div class="ta-footer">{{b64Output.length}} chars · {{ratio()}}x size</div>
          </div>
        </div>
        <div class="divider"><span>⇅ Decode</span></div>
        <div class="io-grid">
          <div class="io-box">
            <label class="io-label">Base64 Input</label>
            <textarea [(ngModel)]="b64Input" (ngModelChange)="decode()" class="io-ta" rows="5" placeholder="Paste Base64 string to decode..."></textarea>
          </div>
          <div class="io-box">
            <div class="io-header">
              <label class="io-label">Decoded Text</label>
              <button class="copy-btn" (click)="copy(decodedOutput)">📋 Copy</button>
            </div>
            <textarea class="io-ta output" [value]="decodedOutput" readonly rows="5"></textarea>
            <div class="error-inline" *ngIf="decodeError()">⚠️ {{decodeError()}}</div>
          </div>
        </div>
      </div>

      <!-- File encode -->
      <div *ngIf="mode()==='file'">
        <div class="upload-zone" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)" (click)="fileInput.click()">
          <div class="uz-icon">📁</div>
          <div class="uz-text">Drop any file here or <span class="uz-link">click to browse</span></div>
          <div class="uz-sub">Any file type supported — image, PDF, audio, video</div>
          <input #fileInput type="file" (change)="onFileSelect($event)" style="display:none" />
        </div>
        <div class="file-result" *ngIf="fileName()">
          <div class="fr-header">
            <div class="fr-info">
              <span class="fr-name">{{fileName()}}</span>
              <span class="fr-size">{{fileSize()}}</span>
              <span class="fr-type">{{fileType()}}</span>
            </div>
            <div class="fr-actions">
              <button class="btn-action" (click)="copy(fileB64.startsWith('data:')?fileB64:dataUri())">📋 Copy Data URI</button>
              <button class="btn-action secondary" (click)="copy(pureB64())">📋 Copy Pure Base64</button>
            </div>
          </div>
          <textarea class="io-ta output file-ta" [value]="fileB64" readonly rows="6"></textarea>
          <div class="encode-ratio">Original: {{origBytes()}} bytes → Base64: {{fileB64.length}} chars (~{{Math.ceil(fileB64.length/1.37)}} bytes, {{Math.round((fileB64.length/origBytes()-1)*100)}}% larger)</div>
        </div>
      </div>

      <!-- Image preview -->
      <div *ngIf="mode()==='image'">
        <div class="io-grid">
          <div class="io-box">
            <label class="io-label">Paste Base64 Image / Data URI</label>
            <textarea [(ngModel)]="imgInput" (ngModelChange)="previewImage()" class="io-ta" rows="8" placeholder="Paste Base64 image string or full data URI here...&#10;&#10;data:image/png;base64,iVBORw0KGgo..."></textarea>
          </div>
          <div class="io-box">
            <label class="io-label">Image Preview</label>
            <div class="img-preview" *ngIf="previewSrc()">
              <img [src]="previewSrc()" class="preview-img" alt="Base64 preview" />
            </div>
            <div class="img-placeholder" *ngIf="!previewSrc()">🖼️ Image will appear here</div>
            <div class="error-inline" *ngIf="imgError()">⚠️ {{imgError()}}</div>
          </div>
        </div>
      </div>

      <!-- Reference -->
      <div class="ref-section">
        <div class="ref-title">Base64 Encoding Rules</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of refItems"><span class="ri-label">{{r.label}}</span><span class="ri-val">{{r.val}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.35rem;background:#f3f4f6;border-radius:8px;padding:.3rem;margin-bottom:1rem}
    .mode-tabs button{flex:1;padding:.4rem;border:none;background:none;border-radius:6px;font-size:.82rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .io-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.85rem}
    @media(max-width:680px){.io-grid{grid-template-columns:1fr}}
    .io-box{display:flex;flex-direction:column;gap:.3rem}
    .io-header{display:flex;justify-content:space-between;align-items:center}
    .io-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .io-actions{display:flex;align-items:center;gap:.5rem}
    .chk-label{font-size:.75rem;font-weight:600;display:flex;align-items:center;gap:.25rem;cursor:pointer}
    .io-ta{width:100%;padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .io-ta.output{background:#f8fafc;color:#374151}
    .ta-footer{font-size:.68rem;color:#9ca3af;text-align:right}
    .copy-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:6px;padding:.2rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700}
    .divider{display:flex;align-items:center;gap:.75rem;margin:.75rem 0;color:#9ca3af;font-size:.78rem;font-weight:600}
    .divider::before,.divider::after{content:'';flex:1;border-top:1px solid #e5e7eb}
    .error-inline{color:#dc2626;font-size:.75rem;margin-top:.25rem}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2.5rem 1.5rem;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:1rem}
    .upload-zone:hover{border-color:#2563eb;background:#eff6ff}
    .uz-icon{font-size:2.5rem;margin-bottom:.65rem}
    .uz-text{font-size:.9rem;font-weight:600;color:#374151;margin-bottom:.3rem}
    .uz-link{color:#2563eb;text-decoration:underline}
    .uz-sub{font-size:.75rem;color:#9ca3af}
    .file-result{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .fr-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
    .fr-info{display:flex;flex-direction:column;gap:.15rem}
    .fr-name{font-size:.85rem;font-weight:700;color:#111827}
    .fr-size,.fr-type{font-size:.72rem;color:#6b7280}
    .fr-actions{display:flex;gap:.4rem;flex-wrap:wrap}
    .btn-action{background:#2563eb;color:white;border:none;border-radius:7px;padding:.35rem .85rem;cursor:pointer;font-size:.78rem;font-weight:700}
    .btn-action.secondary{background:#f3f4f6;border:1px solid #e5e7eb;color:#374151}
    .file-ta{min-height:130px}
    .encode-ratio{font-size:.72rem;color:#6b7280;margin-top:.4rem}
    .img-preview,.img-placeholder{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;min-height:180px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .preview-img{max-width:100%;max-height:240px;object-fit:contain}
    .img-placeholder{color:#9ca3af;font-size:1.5rem;flex-direction:column;gap:.5rem}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-top:.85rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.4rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.4rem .75rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem}
    .ri-label{font-size:.75rem;color:#374151}.ri-val{font-size:.72rem;font-family:monospace;color:#2563eb;font-weight:600}
  `]
})
export class Base64EncoderComponent {
  Math = Math;
  mode = signal<'text'|'file'|'image'>('text');
  textInput = 'Hello, World! नमस्ते 🙏'; urlSafe = false;
  b64Output = ''; b64Input = ''; decodedOutput = '';
  decodeError = signal(''); fileB64 = '';
  imgInput = ''; previewSrc = signal(''); imgError = signal('');
  fileName = signal(''); fileSize = signal(''); fileType = signal('');
  private _origBytes = 0;

  modes :{ key: Base64Mode; label: string }[] = [{key:'text',label:'📝 Text'},{key:'file',label:'📁 File'},{key:'image',label:'🖼️ Image Preview'}];


  refItems = [
    {label:'Alphabet',val:'A–Z, a–z, 0–9, +, /'},
    {label:'URL-safe alphabet',val:'A–Z, a–z, 0–9, -, _'},
    {label:'Padding character',val:'= (1 or 2 chars)'},
    {label:'Output size',val:'⌈n/3⌉ × 4 bytes'},
    {label:'Size increase',val:'~33% larger than input'},
    {label:'MIME type (images)',val:'data:[type];base64,...'},
  ];

  constructor() { this.convert(); }

  reset() { this.b64Output=''; this.b64Input=''; this.decodedOutput=''; this.fileB64=''; this.imgInput=''; this.previewSrc.set(''); this.imgError.set(''); this.decodeError.set(''); this.fileName.set(''); }

  setMode(m: Base64Mode) {
  this.mode.set(m);
  this.reset();
}
  
  convert() {
    try {
      let encoded = btoa(unescape(encodeURIComponent(this.textInput)));
      if (this.urlSafe) encoded = encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
      this.b64Output = encoded;
    } catch { this.b64Output = 'Error: invalid input'; }
  }

  decode() {
    this.decodeError.set('');
    try {
      let s = this.b64Input.trim();
      if (this.urlSafe) s = s.replace(/-/g,'+').replace(/_/g,'/');
      while (s.length % 4) s += '=';
      this.decodedOutput = decodeURIComponent(escape(atob(s)));
    } catch (e: any) { this.decodeError.set('Invalid Base64 string'); this.decodedOutput = ''; }
  }

  ratio() { return this.textInput.length ? (this.b64Output.length / this.textInput.length).toFixed(2) : '—'; }

  onFileDrop(e: DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer?.files[0];
    if (f) this.encodeFile(f);
  }
  onFileSelect(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.encodeFile(f);
  }

  encodeFile(f: File) {
    this.fileName.set(f.name);
    this.fileSize.set(this.formatBytes(f.size));
    this.fileType.set(f.type || 'application/octet-stream');
    this._origBytes = f.size;
    const r = new FileReader();
    r.onload = () => { this.fileB64 = r.result as string; };
    r.readAsDataURL(f);
  }

  pureB64() { return this.fileB64.split(',')[1] || this.fileB64; }
  dataUri() { return this.fileB64; }
  origBytes() { return this._origBytes; }
  formatBytes(n: number) { if (n < 1024) return n + ' B'; if (n < 1048576) return (n/1024).toFixed(1) + ' KB'; return (n/1048576).toFixed(2) + ' MB'; }

  previewImage() {
    this.imgError.set('');
    const s = this.imgInput.trim();
    if (!s) { this.previewSrc.set(''); return; }
    const src = s.startsWith('data:') ? s : `data:image/png;base64,${s}`;
    const img = new Image();
    img.onload = () => this.previewSrc.set(src);
    img.onerror = () => { this.imgError.set('Not a valid image'); this.previewSrc.set(''); };
    img.src = src;
  }

  copy(t: string) { navigator.clipboard.writeText(t); }
}
type Base64Mode = 'text' | 'file' | 'image';
