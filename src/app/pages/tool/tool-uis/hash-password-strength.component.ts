import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Hash Generator ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-hash-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="mode.set(m.key);hashAll()">{{m.icon}} {{m.label}}</button>
      </div>

      <!-- Text input -->
      <div *ngIf="mode()==='text'">
        <div class="input-section">
          <label class="inp-label">Input Text</label>
          <textarea [(ngModel)]="textInput" (ngModelChange)="hashAll()" class="inp-ta" rows="5" placeholder="Enter text to hash..."></textarea>
          <div class="inp-footer">
            <span>{{textInput.length}} chars</span>
            <label class="chk"><input type="checkbox" [(ngModel)]="uppercaseHex" (change)="hashAll()" /> Uppercase hex</label>
          </div>
        </div>
      </div>

      <!-- File input -->
      <div *ngIf="mode()==='file'">
        <div class="upload-zone" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)" (click)="fileInput.click()">
          <div class="uz-icon">📁</div>
          <div class="uz-text">Drop file here or <span class="uz-link">click to browse</span></div>
          <div class="uz-sub">Max size: 500MB — for integrity verification</div>
          <input #fileInput type="file" (change)="onFileSelect($event)" style="display:none" />
        </div>
        <div class="file-info" *ngIf="fileName()">
          <span class="fi-name">{{fileName()}}</span>
          <span class="fi-size">{{fileSize()}}</span>
          <div class="fi-progress" *ngIf="hashing()">
            <div class="fp-bar" [style.width.%]="progress()"></div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="hash-results" *ngIf="results().length">
        <div class="hr-header">
          <div class="hr-title">Hash Results</div>
          <button class="btn-sm" (click)="copyAllHashes()">📋 Copy All</button>
        </div>
        <div class="hash-row" *ngFor="let r of results()">
          <div class="hash-meta">
            <span class="algo-badge" [class]="'algo-'+r.algo.toLowerCase().replace('-','')">{{r.algo}}</span>
            <span class="hash-bits">{{r.bits}} bits</span>
          </div>
          <div class="hash-value">
            <span class="hv-text mono" [class.loading]="r.loading">{{r.loading?'Computing...':r.hash}}</span>
            <div class="hv-actions">
              <button class="copy-sm" *ngIf="!r.loading" (click)="copy(r.hash)">📋</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Verify mode -->
      <div class="verify-section">
        <div class="vs-title">🔍 Verify Hash</div>
        <div class="vs-grid">
          <div class="field"><label class="inp-label">Expected Hash</label>
            <input [(ngModel)]="expectedHash" (ngModelChange)="verify()" class="inp mono" placeholder="Paste expected hash here..." /></div>
          <div class="field"><label class="inp-label">Auto-detected Algorithm</label>
            <div class="detected-algo" *ngIf="detectedAlgo()">
              <span class="algo-badge">{{detectedAlgo()}}</span>
            </div>
          </div>
        </div>
        <div class="verify-result" *ngIf="verifyResult()!==null">
          <div class="vr-match" *ngIf="verifyResult()===true">✅ Hash matches! File/text integrity verified.</div>
          <div class="vr-no-match" *ngIf="verifyResult()===false">❌ Hash does NOT match. File may be corrupted or tampered.</div>
        </div>
      </div>

      <!-- HMAC section -->
      <div class="hmac-section">
        <div class="hmac-title">🔐 HMAC (with Secret Key)</div>
        <div class="hmac-grid">
          <input [(ngModel)]="hmacKey" (ngModelChange)="computeHmac()" class="inp" placeholder="Secret key..." />
          <select [(ngModel)]="hmacAlgo" (ngModelChange)="computeHmac()" class="sel">
            <option value="SHA-256">HMAC-SHA256</option>
            <option value="SHA-512">HMAC-SHA512</option>
            <option value="SHA-1">HMAC-SHA1</option>
          </select>
        </div>
        <div class="hmac-result" *ngIf="hmacResult()">
          <span class="mono">{{hmacResult()}}</span>
          <button class="copy-sm" (click)="copy(hmacResult())">📋</button>
        </div>
      </div>

      <!-- Algo info -->
      <div class="algo-info">
        <div class="ai-title">Algorithm Guide</div>
        <div class="ai-grid">
          <div class="ai-card" *ngFor="let a of algoInfo">
            <div class="aic-header">
              <span class="aic-name">{{a.name}}</span>
              <span class="aic-badge" [class.secure]="a.secure" [class.deprecated]="!a.secure">{{a.secure?'✅ Secure':'⚠️ Deprecated'}}</span>
            </div>
            <div class="aic-bits">{{a.bits}} bits · {{a.hexLen}} hex chars</div>
            <div class="aic-use">{{a.use}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.3rem;background:#f3f4f6;border-radius:8px;padding:.3rem;margin-bottom:1rem}
    .mode-tabs button{flex:1;padding:.4rem;border:none;background:none;border-radius:6px;font-size:.82rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .input-section{margin-bottom:1rem}
    .inp-label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.3rem}
    .inp-ta{width:100%;padding:.6rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.85rem;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .inp-footer{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:#9ca3af;margin-top:.3rem}
    .chk{display:flex;align-items:center;gap:.3rem;cursor:pointer}
    .upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:2rem 1.5rem;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:.75rem}
    .upload-zone:hover{border-color:#2563eb;background:#eff6ff}
    .uz-icon{font-size:2.2rem;margin-bottom:.5rem}
    .uz-text{font-size:.9rem;font-weight:600;margin-bottom:.25rem}
    .uz-link{color:#2563eb;text-decoration:underline}
    .uz-sub{font-size:.75rem;color:#9ca3af}
    .file-info{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .85rem;margin-bottom:.75rem}
    .fi-name{font-size:.85rem;font-weight:700;color:#111827;display:block;margin-bottom:.15rem}
    .fi-size{font-size:.72rem;color:#6b7280}
    .fi-progress{background:#e5e7eb;border-radius:99px;height:4px;margin-top:.5rem}
    .fp-bar{height:100%;background:#2563eb;border-radius:99px;transition:width .2s}
    .hash-results{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:1rem}
    .hr-header{display:flex;justify-content:space-between;align-items:center;padding:.65rem 1rem;border-bottom:1px solid #e5e7eb;background:white}
    .hr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .btn-sm{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700}
    .hash-row{padding:.65rem 1rem;border-bottom:1px solid #f3f4f6;background:white}
    .hash-row:last-child{border-bottom:none}
    .hash-meta{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
    .algo-badge{padding:.15rem .5rem;border-radius:99px;font-size:.65rem;font-weight:800;text-transform:uppercase}
    .algomd5{background:#fef3c7;color:#d97706}
    .algosha1{background:#fee2e2;color:#dc2626}
    .algosha224,.algosha256{background:#ecfdf5;color:#059669}
    .algosha384,.algosha512{background:#eff6ff;color:#2563eb}
    .hash-bits{font-size:.65rem;color:#9ca3af}
    .hash-value{display:flex;align-items:center;gap:.5rem}
    .hv-text{flex:1;font-size:.75rem;font-family:monospace;word-break:break-all;color:#1e293b}
    .hv-text.loading{color:#9ca3af;font-style:italic}
    .copy-sm{background:none;border:1px solid #e5e7eb;border-radius:4px;padding:.15rem .4rem;cursor:pointer;font-size:.7rem;flex-shrink:0}
    .hv-actions{display:flex;gap:.25rem;flex-shrink:0}
    .mono{font-family:monospace}
    .verify-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .vs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .vs-grid{display:grid;grid-template-columns:1fr auto;gap:.75rem;align-items:start;margin-bottom:.5rem}
    @media(max-width:600px){.vs-grid{grid-template-columns:1fr}}
    .field{display:flex;flex-direction:column;gap:.25rem}
    .inp{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box}
    .detected-algo{padding:.35rem 0}
    .verify-result{margin-top:.5rem}
    .vr-match{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:7px;padding:.5rem .85rem;color:#059669;font-size:.82rem;font-weight:700}
    .vr-no-match{background:#fef2f2;border:1px solid #fecaca;border-radius:7px;padding:.5rem .85rem;color:#dc2626;font-size:.82rem;font-weight:700}
    .hmac-section{background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .hmac-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#7c3aed;margin-bottom:.6rem}
    .hmac-grid{display:grid;grid-template-columns:1fr auto;gap:.5rem;margin-bottom:.5rem}
    .sel{padding:.4rem .5rem;border:1px solid #e9d5ff;border-radius:7px;font-size:.82rem;background:white;outline:none}
    .hmac-result{display:flex;align-items:center;gap:.5rem;background:white;border:1px solid #e9d5ff;border-radius:7px;padding:.4rem .75rem;font-size:.75rem;word-break:break-all}
    .algo-info{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ai-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.5rem}
    .ai-card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem}
    .aic-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem}
    .aic-name{font-size:.82rem;font-weight:800;color:#111827}
    .aic-badge{font-size:.6rem;font-weight:700;padding:.1rem .4rem;border-radius:99px}
    .aic-badge.secure{background:#ecfdf5;color:#059669}
    .aic-badge.deprecated{background:#fef3c7;color:#d97706}
    .aic-bits{font-size:.68rem;color:#9ca3af;margin-bottom:.2rem;font-family:monospace}
    .aic-use{font-size:.72rem;color:#6b7280;line-height:1.3}
  `]
})
export class HashGeneratorComponent implements OnInit {
  mode = signal<'text'|'file'>('text');
  textInput = 'Hello, World! — UtilityMega'; uppercaseHex = false;
  fileName = signal(''); fileSize = signal(''); hashing = signal(false); progress = signal(0);
  expectedHash = ''; hmacKey = ''; hmacAlgo = 'SHA-256';
  results = signal<{algo:string,bits:number,hash:string,loading:boolean}[]>([]);
  hmacResult = signal(''); verifyResult = signal<boolean|null>(null);
  detectedAlgo = signal('');

  private fileBuffer: ArrayBuffer | null = null;

  algorithms = [
    {name:'MD5',bits:128,algo:'MD5'},
    {name:'SHA-1',bits:160,algo:'SHA-1'},
    {name:'SHA-224',bits:224,algo:'SHA-224'},
    {name:'SHA-256',bits:256,algo:'SHA-256'},
    {name:'SHA-384',bits:384,algo:'SHA-384'},
    {name:'SHA-512',bits:512,algo:'SHA-512'},
  ];

  algoInfo = [
    {name:'MD5',bits:128,hexLen:32,secure:false,use:'File checksums only. Broken for security. Fast to compute.'},
    {name:'SHA-1',bits:160,hexLen:40,secure:false,use:'Legacy only. Deprecated by NIST. Avoid for new systems.'},
    {name:'SHA-256',bits:256,hexLen:64,secure:true,use:'Current standard. Used in TLS, Bitcoin, JWT signing.'},
    {name:'SHA-512',bits:512,hexLen:128,secure:true,use:'Highest security. Best for passwords (server-side).'},
  ];

  modes : { key: 'text' | 'file'; icon: string; label: string }[] = [{key:'text',icon:'📝',label:'Text'},{key:'file',icon:'📁',label:'File'}];

  ngOnInit() { this.hashAll(); }

  async hashAll() {
    const input = this.mode() === 'text' ? this.textInput : null;
    if (this.mode() === 'text') {
      const initial = this.algorithms.map(a => ({algo:a.name,bits:a.bits,hash:'',loading:true}));
      this.results.set(initial);
      const enc = new TextEncoder().encode(this.textInput || '');
      for (let i = 0; i < this.algorithms.length; i++) {
        const a = this.algorithms[i];
        const hash = await this.computeHash(a.algo === 'MD5' ? 'MD5' : a.algo, enc);
        const updated = [...this.results()];
        updated[i] = {...updated[i], hash: this.uppercaseHex ? hash.toUpperCase() : hash, loading: false};
        this.results.set(updated);
      }
    }
    if (this.hmacKey) this.computeHmac();
    if (this.expectedHash) this.verify();
  }

  async computeHash(algo: string, data: Uint8Array): Promise<string> {
    if (algo === 'MD5') return this.md5(data);
    const buf = await crypto.subtle.digest(algo, data);
    
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async computeHmac() {
    if (!this.hmacKey || !this.textInput) { this.hmacResult.set(''); return; }
    try {
      const keyData = new TextEncoder().encode(this.hmacKey);
      const msgData = new TextEncoder().encode(this.textInput);
      const key = await crypto.subtle.importKey('raw', keyData, {name:'HMAC',hash:this.hmacAlgo}, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, msgData);
      const hex = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
      this.hmacResult.set(this.uppercaseHex ? hex.toUpperCase() : hex);
    } catch { this.hmacResult.set('Error computing HMAC'); }
  }

  verify() {
    const expected = this.expectedHash.trim().toLowerCase();
    if (!expected) { this.verifyResult.set(null); this.detectedAlgo.set(''); return; }
    const len = expected.length;
    const algoMap: Record<number,string> = {32:'MD5',40:'SHA-1',56:'SHA-224',64:'SHA-256',96:'SHA-384',128:'SHA-512'};
    this.detectedAlgo.set(algoMap[len] || 'Unknown');
    const match = this.results().find(r => r.hash.toLowerCase() === expected || r.hash.toUpperCase() === expected);
    this.verifyResult.set(match ? true : this.results().some(r => !r.loading) ? false : null);
  }

  onFileDrop(e: DragEvent) { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f) this.processFile(f); }
  onFileSelect(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.processFile(f); }

  processFile(f: File) {
    this.fileName.set(f.name);
    this.fileSize.set(this.fmtBytes(f.size));
    this.hashing.set(true); this.progress.set(0);
    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) this.progress.set(Math.round(e.loaded/e.total*80)); };
    reader.onload = async () => {
      this.fileBuffer = reader.result as ArrayBuffer;
      const data = new Uint8Array(this.fileBuffer);
      const initial = this.algorithms.map(a => ({algo:a.name,bits:a.bits,hash:'',loading:true}));
      this.results.set(initial);
      for (let i = 0; i < this.algorithms.length; i++) {
        const a = this.algorithms[i];
        const hash = await this.computeHash(a.algo === 'MD5' ? 'MD5' : a.algo, data);
        const updated = [...this.results()];
        updated[i] = {...updated[i], hash, loading:false};
        this.results.set(updated);
        this.progress.set(80 + Math.round((i+1)/this.algorithms.length*20));
      }
      this.hashing.set(false);
    };
    reader.readAsArrayBuffer(f);
  }

  // Simplified MD5 implementation
  md5(data: Uint8Array): string {
    const str = Array.from(data).map(c => String.fromCharCode(c)).join('');
    function safeAdd(x: number, y: number) { const lsw=(x&0xffff)+(y&0xffff); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xffff); }
    function bitRotL(num: number, cnt: number) { return (num<<cnt)|(num>>>(32-cnt)); }
    function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotL(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
    function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
    function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
    function str2binl(s:string){const b:number[]=[];for(let i=0;i<s.length*8;i+=8)b[i>>5]|=(s.charCodeAt(i/8)&0xff)<<(i%32);return b;}
    function binl2hex(b:number[]){let s='';for(let i=0;i<b.length*4;i++){s+='0123456789abcdef'.charAt((b[i>>2]>>(i%4*8+4))&0xf)+'0123456789abcdef'.charAt((b[i>>2]>>(i%4*8))&0xf);}return s;}
    function binlMD5(x:number[],len:number){x[len>>5]|=0x80<<(len%32);x[(((len+64)>>>9)<<4)+14]=len;let a=1732584193,b=-271733879,c=-1732584194,d=271733878;for(let i=0;i<x.length;i+=16){const oa=a,ob=b,oc=c,od=d;a=md5ff(a,b,c,d,x[i],7,-680876936);d=md5ff(d,a,b,c,x[i+1],12,-389564586);c=md5ff(c,d,a,b,x[i+2],17,606105819);b=md5ff(b,c,d,a,x[i+3],22,-1044525330);a=md5ff(a,b,c,d,x[i+4],7,-176418897);d=md5ff(d,a,b,c,x[i+5],12,1200080426);c=md5ff(c,d,a,b,x[i+6],17,-1473231341);b=md5ff(b,c,d,a,x[i+7],22,-45705983);a=md5ff(a,b,c,d,x[i+8],7,1770035416);d=md5ff(d,a,b,c,x[i+9],12,-1958414417);c=md5ff(c,d,a,b,x[i+10],17,-42063);b=md5ff(b,c,d,a,x[i+11],22,-1990404162);a=md5ff(a,b,c,d,x[i+12],7,1804603682);d=md5ff(d,a,b,c,x[i+13],12,-40341101);c=md5ff(c,d,a,b,x[i+14],17,-1502002290);b=md5ff(b,c,d,a,x[i+15],22,1236535329);a=md5gg(a,b,c,d,x[i+1],5,-165796510);d=md5gg(d,a,b,c,x[i+6],9,-1069501632);c=md5gg(c,d,a,b,x[i+11],14,643717713);b=md5gg(b,c,d,a,x[i],20,-373897302);a=md5gg(a,b,c,d,x[i+5],5,-701558691);d=md5gg(d,a,b,c,x[i+10],9,38016083);c=md5gg(c,d,a,b,x[i+15],14,-660478335);b=md5gg(b,c,d,a,x[i+4],20,-405537848);a=md5gg(a,b,c,d,x[i+9],5,568446438);d=md5gg(d,a,b,c,x[i+14],9,-1019803690);c=md5gg(c,d,a,b,x[i+3],14,-187363961);b=md5gg(b,c,d,a,x[i+8],20,1163531501);a=md5gg(a,b,c,d,x[i+13],5,-1444681467);d=md5gg(d,a,b,c,x[i+2],9,-51403784);c=md5gg(c,d,a,b,x[i+7],14,1735328473);b=md5gg(b,c,d,a,x[i+12],20,-1926607734);a=md5hh(a,b,c,d,x[i+5],4,-378558);d=md5hh(d,a,b,c,x[i+8],11,-2022574463);c=md5hh(c,d,a,b,x[i+11],16,1839030562);b=md5hh(b,c,d,a,x[i+14],23,-35309556);a=md5hh(a,b,c,d,x[i+1],4,-1530992060);d=md5hh(d,a,b,c,x[i+4],11,1272893353);c=md5hh(c,d,a,b,x[i+7],16,-155497632);b=md5hh(b,c,d,a,x[i+10],23,-1094730640);a=md5hh(a,b,c,d,x[i+13],4,681279174);d=md5hh(d,a,b,c,x[i],11,-358537222);c=md5hh(c,d,a,b,x[i+3],16,-722521979);b=md5hh(b,c,d,a,x[i+6],23,76029189);a=md5hh(a,b,c,d,x[i+9],4,-640364487);d=md5hh(d,a,b,c,x[i+12],11,-421815835);c=md5hh(c,d,a,b,x[i+15],16,530742520);b=md5hh(b,c,d,a,x[i+2],23,-995338651);a=md5ii(a,b,c,d,x[i],6,-198630844);d=md5ii(d,a,b,c,x[i+7],10,1126891415);c=md5ii(c,d,a,b,x[i+14],15,-1416354905);b=md5ii(b,c,d,a,x[i+5],21,-57434055);a=md5ii(a,b,c,d,x[i+12],6,1700485571);d=md5ii(d,a,b,c,x[i+3],10,-1894986606);c=md5ii(c,d,a,b,x[i+10],15,-1051523);b=md5ii(b,c,d,a,x[i+1],21,-2054922799);a=md5ii(a,b,c,d,x[i+8],6,1873313359);d=md5ii(d,a,b,c,x[i+15],10,-30611744);c=md5ii(c,d,a,b,x[i+6],15,-1560198380);b=md5ii(b,c,d,a,x[i+13],21,1309151649);a=md5ii(a,b,c,d,x[i+4],6,-145523070);d=md5ii(d,a,b,c,x[i+11],10,-1120210379);c=md5ii(c,d,a,b,x[i+2],15,718787259);b=md5ii(b,c,d,a,x[i+9],21,-343485551);a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);}return[a,b,c,d];}
    return binl2hex(binlMD5(str2binl(str),str.length*8));
  }

  copyAllHashes() { navigator.clipboard.writeText(this.results().map(r=>`${r.algo}: ${r.hash}`).join('\n')); }
  fmtBytes(n: number) { if (n<1024) return n+' B'; if (n<1048576) return (n/1024).toFixed(1)+' KB'; return (n/1048576).toFixed(2)+' MB'; }
  copy(t: string) { navigator.clipboard.writeText(t); }
}

// ─── Password Strength Checker ────────────────────────────────────────────────
@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="input-section">
        <label class="inp-label">Enter Password to Check</label>
        <div class="pw-input-wrap">
          <input [(ngModel)]="password" (ngModelChange)="analyze()" [type]="showPw?'text':'password'" class="pw-inp" placeholder="Type or paste your password..." autocomplete="off" />
          <button class="toggle-vis" (click)="showPw=!showPw">{{showPw?'🙈':'👁'}}</button>
        </div>
        <div class="security-note">🔒 Your password never leaves your browser — checked entirely client-side.</div>
      </div>

      <div class="results" *ngIf="password">
        <!-- Strength gauge -->
        <div class="gauge-section">
          <div class="gauge-label">Strength</div>
          <div class="gauge-bar">
            <div class="gb-fill" [style.width.%]="strengthPct()" [style.background]="strengthColor()"></div>
          </div>
          <div class="gauge-meta">
            <span class="gauge-text" [style.color]="strengthColor()">{{strengthLabel()}}</span>
            <span class="gauge-score">Score: {{score()}}/100</span>
          </div>
        </div>

        <!-- Entropy & crack time -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="mc-val">{{entropy()}} bits</div>
            <div class="mc-label">Entropy</div>
          </div>
          <div class="metric-card">
            <div class="mc-val" [class.danger]="isFast()">{{crackOnline()}}</div>
            <div class="mc-label">Online Attack</div>
            <div class="mc-sub">1,000/sec</div>
          </div>
          <div class="metric-card">
            <div class="mc-val" [class.danger]="isFastOffline()">{{crackOffline()}}</div>
            <div class="mc-label">Offline Fast Hash</div>
            <div class="mc-sub">10B/sec (MD5)</div>
          </div>
          <div class="metric-card">
            <div class="mc-val">{{charsetSize()}}</div>
            <div class="mc-label">Charset Size</div>
          </div>
          <div class="metric-card">
            <div class="mc-val">{{password.length}}</div>
            <div class="mc-label">Length</div>
          </div>
          <div class="metric-card">
            <div class="mc-val">{{uniqueChars()}}</div>
            <div class="mc-label">Unique Chars</div>
          </div>
        </div>

        <!-- Checks -->
        <div class="checks-section">
          <div class="cs-title">Detailed Analysis</div>
          <div class="check-item" *ngFor="let c of checks()" [class.pass]="c.pass" [class.fail]="!c.pass">
            <span class="ci-icon">{{c.pass?'✅':'❌'}}</span>
            <span class="ci-text">{{c.text}}</span>
            <span class="ci-pts">{{c.pass?'+'+c.pts:c.pts}} pts</span>
          </div>
        </div>

        <!-- Patterns detected -->
        <div class="patterns-section" *ngIf="patterns().length">
          <div class="ps-title">⚠️ Weak Patterns Detected</div>
          <div class="pattern-item" *ngFor="let p of patterns()">
            <span class="pi-icon">⚠️</span>
            <div><strong>{{p.name}}</strong> — {{p.desc}}</div>
            <span class="pi-impact">-{{p.impact}} pts</span>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="suggestions-section">
          <div class="ss-title">💡 Improvement Suggestions</div>
          <div class="suggestion" *ngFor="let s of suggestions()">{{s}}</div>
        </div>
      </div>

      <!-- Sample strengths -->
      <div class="samples-section">
        <div class="sm-title">Try Examples</div>
        <div class="sample-btns">
          <button *ngFor="let s of samples" class="sample-btn" (click)="password=s.label;analyze()">
            <span class="sb-label">{{s.label}}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .inp-label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.35rem}
    .pw-input-wrap{display:flex;align-items:center;background:white;border:2px solid #d1d5db;border-radius:10px;overflow:hidden;margin-bottom:.4rem;transition:border-color .2s}
    .pw-input-wrap:focus-within{border-color:#2563eb}
    .pw-inp{flex:1;padding:.6rem .85rem;border:none;font-size:1rem;font-family:monospace;outline:none;letter-spacing:.06em}
    .toggle-vis{background:none;border:none;padding:.5rem .75rem;cursor:pointer;font-size:1rem;color:#6b7280}
    .security-note{font-size:.72rem;color:#6b7280;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:.3rem .7rem;margin-bottom:1rem}
    .gauge-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .gauge-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.5rem}
    .gauge-bar{height:12px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.4rem}
    .gb-fill{height:100%;border-radius:99px;transition:all .4s cubic-bezier(.4,0,.2,1)}
    .gauge-meta{display:flex;justify-content:space-between;align-items:center}
    .gauge-text{font-size:.88rem;font-weight:800}
    .gauge-score{font-size:.72rem;color:#9ca3af}
    .metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-bottom:1rem}
    @media(max-width:500px){.metrics-grid{grid-template-columns:repeat(2,1fr)}}
    .metric-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem .75rem;text-align:center}
    .mc-val{font-size:1.1rem;font-weight:800;color:#111827;margin-bottom:.1rem}
    .mc-val.danger{color:#dc2626}
    .mc-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .mc-sub{font-size:.58rem;color:#d1d5db;margin-top:.1rem}
    .checks-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .cs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .check-item{display:flex;align-items:center;gap:.5rem;padding:.3rem .4rem;border-radius:6px;font-size:.8rem;margin-bottom:.2rem}
    .check-item.pass{background:#f0fdf4}
    .check-item.fail{background:#fef2f2}
    .ci-icon{font-size:.8rem;flex-shrink:0}
    .ci-text{flex:1}
    .ci-pts{font-size:.7rem;font-weight:700;min-width:40px;text-align:right}
    .check-item.pass .ci-pts{color:#059669}
    .check-item.fail .ci-pts{color:#9ca3af}
    .patterns-section{background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#92400e;margin-bottom:.5rem}
    .pattern-item{display:flex;align-items:flex-start;gap:.5rem;font-size:.8rem;background:white;border:1px solid #fcd34d;border-radius:7px;padding:.45rem .65rem;margin-bottom:.3rem}
    .pi-icon{flex-shrink:0}.pi-impact{font-weight:700;color:#d97706;flex-shrink:0;margin-left:auto}
    .suggestions-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .ss-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#1d4ed8;margin-bottom:.5rem}
    .suggestion{font-size:.8rem;color:#1e40af;padding:.25rem 0;border-bottom:1px solid #dbeafe}
    .suggestion:last-child{border-bottom:none}
    .samples-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.75rem 1rem}
    .sm-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .sample-btns{display:flex;gap:.4rem;flex-wrap:wrap}
    .sample-btn{padding:.3rem .75rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.78rem;font-weight:600}
    .sample-btn:hover{border-color:#2563eb;color:#2563eb}
    .sb-label{font-family:monospace}
  `]
})
export class PasswordStrengthCheckerComponent {
  password = ''; showPw = false;
  score = signal(0); entropy = signal(0); charsetSize = signal(0);
  strengthLabel = signal(''); strengthColor = signal('#ef4444'); strengthPct = signal(0);
  checks = signal<{pass:boolean,text:string,pts:number}[]>([]);
  patterns = signal<{name:string,desc:string,impact:number}[]>([]);
  suggestions = signal<string[]>([]);

  samples = [
    {label:'123456'},{label:'password'},{label:'P@ssw0rd!'},{label:'Tr0ub4dor&3'},{label:'correctHorseBatteryStaple'},{label:'X$9mK#2pLqR@8wN'},
  ];

  crackOnline(): string { return this.fmtTime(Math.pow(this.charsetSize(), this.password.length) / 2 / 1000); }
  crackOffline(): string { return this.fmtTime(Math.pow(this.charsetSize(), this.password.length) / 2 / 1e10); }
  isFast(): boolean { const t = Math.pow(this.charsetSize(), this.password.length) / 2 / 1000; return t < 3600; }
  isFastOffline(): boolean { const t = Math.pow(this.charsetSize(), this.password.length) / 2 / 1e10; return t < 3600; }
  uniqueChars(): number { return new Set(this.password).size; }

  fmtTime(s: number): string {
    if (s < 1) return 'instant'; if (s < 60) return `${s.toFixed(1)}s`;
    if (s < 3600) return `${(s/60).toFixed(1)}m`; if (s < 86400) return `${(s/3600).toFixed(1)}h`;
    if (s < 31536000) return `${(s/86400).toFixed(0)}d`;
    const y = s/31536000;
    if (y < 1e6) return `${y.toFixed(0)}yr`; if (y < 1e9) return `${(y/1e6).toFixed(1)}M yr`; return '∞ years';
  }

  analyze() {
    const pw = this.password;
    if (!pw) { this.score.set(0); return; }

    // Charset size
    let cs = 0;
    if (/[a-z]/.test(pw)) cs += 26;
    if (/[A-Z]/.test(pw)) cs += 26;
    if (/[0-9]/.test(pw)) cs += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) cs += 32;
    this.charsetSize.set(cs);
    this.entropy.set(Math.round(Math.log2(Math.pow(cs || 1, pw.length))));

    let score = 0;
    const checkList: {pass:boolean,text:string,pts:number}[] = [];
    const patList: {name:string,desc:string,impact:number}[] = [];
    const sugg: string[] = [];

    // Length checks
    const lenChecks = [{n:8,pts:15,t:'At least 8 characters'},{n:12,pts:15,t:'At least 12 characters'},{n:16,pts:10,t:'At least 16 characters'},{n:20,pts:10,t:'At least 20 characters'}];
    for (const lc of lenChecks) { const p = pw.length >= lc.n; checkList.push({pass:p,text:lc.t,pts:lc.pts}); if (p) score += lc.pts; }

    // Charset checks
    const cChecks = [{re:/[a-z]/,pts:5,t:'Contains lowercase letters'},{re:/[A-Z]/,pts:5,t:'Contains uppercase letters'},{re:/[0-9]/,pts:5,t:'Contains numbers'},{re:/[^a-zA-Z0-9]/,pts:10,t:'Contains symbols'}];
    for (const cc of cChecks) { const p = cc.re.test(pw); checkList.push({pass:p,text:cc.t,pts:cc.pts}); if (p) score += cc.pts; }

    // Diversity check
    const sets = [/[a-z]/,/[A-Z]/,/[0-9]/,/[^a-zA-Z0-9]/].filter(r=>r.test(pw)).length;
    const div = sets >= 3; checkList.push({pass:div,text:'Uses 3+ different character sets',pts:10}); if (div) score += 10;

    // Unique chars
    const uniq = this.uniqueChars() >= 8; checkList.push({pass:uniq,text:'At least 8 unique characters',pts:5}); if (uniq) score += 5;

    // Pattern detection
    if (/(.)\1{2,}/.test(pw)) { patList.push({name:'Repeating chars',desc:`"${(/(.)\1{2,}/.exec(pw)||[''])[0]}" repeated characters`,impact:10}); score -= 10; }
    if (/^[a-z]+$/i.test(pw)) { patList.push({name:'Letters only',desc:'No numbers or symbols',impact:10}); score -= 10; }
    if (/^[0-9]+$/.test(pw)) { patList.push({name:'Numbers only',desc:'Only digits, very easy to crack',impact:20}); score -= 20; }
    const commonPw = ['password','123456','qwerty','admin','letmein','welcome','monkey','dragon','master','abc123','iloveyou','sunshine','princess','football','shadow'];
    if (commonPw.some(c => pw.toLowerCase().includes(c))) { patList.push({name:'Common word',desc:'Contains a commonly used password',impact:25}); score -= 25; }
    if (/^(.+)\1+$/.test(pw)) { patList.push({name:'Repeated pattern',desc:'Password is a repeated sequence',impact:15}); score -= 15; }
    if (/19\d{2}|20\d{2}/.test(pw)) { patList.push({name:'Year pattern',desc:'Contains a year (predictable)',impact:5}); score -= 5; }
    if (/qwerty|asdf|zxcv|1234|abcd/i.test(pw)) { patList.push({name:'Keyboard walk',desc:'Sequential keyboard pattern detected',impact:15}); score -= 15; }

    score = Math.max(0, Math.min(100, score));
    this.score.set(score);

    // Strength label
    let label = 'Very Weak', color = '#ef4444';
    if (score >= 80) { label='Very Strong'; color='#22c55e'; }
    else if (score >= 60) { label='Strong'; color='#3b82f6'; }
    else if (score >= 40) { label='Fair'; color='#eab308'; }
    else if (score >= 20) { label='Weak'; color='#f97316'; }
    this.strengthLabel.set(label); this.strengthColor.set(color); this.strengthPct.set(score);
    this.checks.set(checkList); this.patterns.set(patList);

    // Suggestions
    if (pw.length < 12) sugg.push('→ Increase length to at least 12 characters.');
    if (!/[A-Z]/.test(pw)) sugg.push('→ Add uppercase letters (A–Z).');
    if (!/[0-9]/.test(pw)) sugg.push('→ Add numbers (0–9).');
    if (!/[^a-zA-Z0-9]/.test(pw)) sugg.push('→ Add symbols (!@#$%^&*).');
    if (patList.length) sugg.push('→ Remove predictable patterns (years, common words, repeats).');
    if (this.uniqueChars() < 8) sugg.push('→ Use more unique characters to increase entropy.');
    if (!sugg.length) sugg.push('✅ Your password looks strong! Store it in a password manager.');
    this.suggestions.set(sugg);
  }
}
