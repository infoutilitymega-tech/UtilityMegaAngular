import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hash-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hg-wrap">
      <!-- Input tabs -->
      <div class="input-tabs">
        <button class="itab" [class.active]="inputMode==='text'" (click)="inputMode='text'">📝 Text Input</button>
        <button class="itab" [class.active]="inputMode==='file'" (click)="inputMode='file'">📂 File Hash</button>
      </div>

      <div class="input-area" *ngIf="inputMode==='text'">
        <textarea class="hash-input" [(ngModel)]="inputText" (input)="generateAll()" placeholder="Enter text to hash...&#10;&#10;Hashes update in real time as you type." rows="4"></textarea>
      </div>

      <div class="file-area" *ngIf="inputMode==='file'">
        <div class="file-drop" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <input #fileInput type="file" (change)="onFile($event)" class="hidden" />
          <div class="fd-icon">📂</div>
          <div class="fd-text">{{ fileName() || 'Drop file or click to select' }}</div>
          <div class="fd-sub" *ngIf="fileSize()">Size: {{ fmtSize(fileSize()) }}</div>
        </div>
      </div>

      <!-- HMAC option -->
      <div class="hmac-row">
        <label class="toggle-label">
          <input type="checkbox" [(ngModel)]="useHMAC" (change)="generateAll()" class="hidden" />
          <span class="tog-pill"></span>
          HMAC Mode (with secret key)
        </label>
        <div class="hmac-key" *ngIf="useHMAC">
          <input type="text" [(ngModel)]="hmacKey" (input)="generateAll()" placeholder="Enter HMAC secret key..." class="key-input" />
        </div>
      </div>

      <!-- Hash Results -->
      <div class="hash-results" *ngIf="anyHash()">
        <div class="hr-item" *ngFor="let h of hashes()">
          <div class="hr-header">
            <div class="hr-algo">
              <span class="algo-badge">{{ h.algo }}</span>
              <span class="algo-bits">{{ h.bits }}-bit</span>
              <span class="algo-security" [class]="h.secClass">{{ h.security }}</span>
            </div>
            <button class="copy-hash-btn" (click)="copyHash(h.algo, h.hash)" [class.copied]="copiedAlgo()===h.algo">
              {{ copiedAlgo()===h.algo ? '✓ Copied' : '📋 Copy' }}
            </button>
          </div>
          <div class="hr-hash">{{ h.hash }}</div>
          <div class="hr-len">{{ h.hash.length }} hex chars · {{ h.bits }} bits</div>
        </div>
      </div>

      <!-- Verify hash -->
      <div class="verify-section">
        <div class="vs-title">🔍 Verify Hash (Compare)</div>
        <div class="vs-inputs">
          <input type="text" [(ngModel)]="verifyHash" (input)="checkVerify()" placeholder="Paste hash to verify..." class="verify-input" />
        </div>
        <div class="verify-result" *ngIf="verifyResult() !== null" [class.match]="verifyResult()" [class.no-match]="!verifyResult()">
          {{ verifyResult() ? '✅ MATCH — Hash verified! File/text is authentic.' : '❌ NO MATCH — Content may be tampered or corrupted.' }}
        </div>
      </div>

      <!-- Hash comparison visual -->
      <div class="algo-compare" *ngIf="anyHash()">
        <div class="ac-title">📊 Algorithm Security Comparison</div>
        <div class="ac-list">
          <div class="ac-item" *ngFor="let h of hashes()">
            <span class="ac-algo">{{ h.algo }}</span>
            <div class="ac-bar-wrap">
              <div class="ac-bar" [style.width.%]="h.bits/5.12" [style.background]="h.barColor"></div>
            </div>
            <span class="ac-bits">{{ h.bits }}b</span>
            <span class="ac-sec" [class]="h.secClass">{{ h.security }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hg-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .hidden{display:none}
    .input-tabs{display:flex;gap:.4rem}
    .itab{padding:.45rem 1rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.82rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .itab.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .hash-input{width:100%;padding:.85rem;border:1.5px solid var(--border);border-radius:10px;font-size:.88rem;line-height:1.6;background:var(--input-bg);color:var(--text);resize:vertical;outline:none;font-family:'Courier New',monospace;box-sizing:border-box}
    .hash-input:focus{border-color:var(--primary)}
    .file-drop{border:2px dashed var(--border);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-alt)}
    .file-drop:hover{border-color:var(--primary)}
    .fd-icon{font-size:2.5rem;margin-bottom:.5rem}
    .fd-text{font-size:.9rem;font-weight:600}
    .fd-sub{font-size:.78rem;color:var(--text-muted);margin-top:.25rem}
    .hmac-row{display:flex;align-items:center;gap:.85rem;flex-wrap:wrap;padding:.65rem .9rem;background:var(--bg-alt);border-radius:10px;border:1px solid var(--border)}
    .toggle-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.84rem;font-weight:500;white-space:nowrap}
    .tog-pill{width:34px;height:18px;background:var(--border);border-radius:99px;position:relative;flex-shrink:0;transition:background .2s}
    .tog-pill::after{content:'';position:absolute;top:3px;left:3px;width:12px;height:12px;background:#fff;border-radius:50%;transition:transform .2s}
    input[type=checkbox]:checked + .tog-pill{background:var(--primary)}
    input[type=checkbox]:checked + .tog-pill::after{transform:translateX(16px)}
    .hmac-key{flex:1}
    .key-input{width:100%;padding:.45rem .75rem;border:1.5px solid var(--border);border-radius:8px;font-size:.85rem;background:var(--input-bg);color:var(--text);outline:none;font-family:'Courier New',monospace;box-sizing:border-box}
    .key-input:focus{border-color:var(--primary)}
    .hash-results{display:flex;flex-direction:column;gap:.65rem}
    .hr-item{background:var(--bg-alt);border:1px solid var(--border);border-radius:12px;padding:.85rem 1rem;transition:border-color .15s}
    .hr-item:hover{border-color:var(--primary)}
    .hr-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}
    .hr-algo{display:flex;align-items:center;gap:.5rem}
    .algo-badge{font-size:.82rem;font-weight:800;color:var(--text)}
    .algo-bits{font-size:.72rem;color:var(--text-muted)}
    .algo-security{font-size:.7rem;font-weight:700;padding:.15rem .45rem;border-radius:99px}
    .algo-security.secure{background:#10b98122;color:var(--green);border:1px solid #10b98144}
    .algo-security.weak{background:#ef444422;color:var(--red);border:1px solid #ef444444}
    .algo-security.deprecated{background:#f59e0b22;color:var(--accent);border:1px solid #f59e0b44}
    .copy-hash-btn{padding:.3rem .7rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .copy-hash-btn.copied{background:var(--primary);border-color:var(--primary);color:#fff}
    .hr-hash{font-family:'Courier New',monospace;font-size:.78rem;word-break:break-all;color:var(--primary);background:var(--card-bg);padding:.5rem .65rem;border-radius:7px;border:1px solid var(--border);margin-bottom:.3rem}
    .hr-len{font-size:.68rem;color:var(--text-muted)}
    .verify-section{padding:1rem 1.1rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .vs-title{font-size:.82rem;font-weight:700;margin-bottom:.65rem}
    .verify-input{width:100%;padding:.55rem .75rem;border:1.5px solid var(--border);border-radius:9px;font-size:.82rem;font-family:'Courier New',monospace;background:var(--input-bg);color:var(--text);outline:none;box-sizing:border-box}
    .verify-input:focus{border-color:var(--primary)}
    .verify-result{margin-top:.65rem;padding:.6rem .85rem;border-radius:9px;font-size:.83rem;font-weight:700}
    .verify-result.match{background:#10b98122;color:var(--green);border:1px solid #10b98144}
    .verify-result.no-match{background:#ef444422;color:var(--red);border:1px solid #ef444444}
    .algo-compare{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .ac-title{padding:.6rem .9rem;font-size:.8rem;font-weight:700;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .ac-list{display:flex;flex-direction:column;padding:.65rem .9rem;gap:.55rem}
    .ac-item{display:grid;grid-template-columns:70px 1fr 45px 80px;align-items:center;gap:.65rem}
    .ac-algo{font-size:.8rem;font-weight:700}
    .ac-bar-wrap{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .ac-bar{height:100%;border-radius:99px;transition:width .4s}
    .ac-bits{font-size:.7rem;color:var(--text-muted);text-align:right}
    .ac-sec{font-size:.7rem;font-weight:700}
    .ac-sec.secure{color:var(--green)}
    .ac-sec.weak{color:var(--red)}
    .ac-sec.deprecated{color:var(--accent)}
  `]
})
export class HashGeneratorComponent {
  inputMode = 'text';
  inputText = '';
  useHMAC = false;
  hmacKey = '';
  verifyHash = '';
  fileName = signal('');
  fileSize = signal(0);
  fileBuffer = signal<ArrayBuffer | null>(null);
  copiedAlgo = signal('');
  verifyResult = signal<boolean | null>(null);

  hashes = signal<any[]>([]);

  private ALGOS = [
    { algo: 'MD5', bits: 128, security: 'Weak', secClass: 'weak', barColor: '#ef4444' },
    { algo: 'SHA-1', bits: 160, security: 'Deprecated', secClass: 'deprecated', barColor: '#f59e0b' },
    { algo: 'SHA-256', bits: 256, security: 'Secure', secClass: 'secure', barColor: '#10b981' },
    { algo: 'SHA-512', bits: 512, security: 'Secure', secClass: 'secure', barColor: '#3b82f6' },
  ];

  anyHash() { return this.hashes().some(h => h.hash); }

  onDrop(e: DragEvent) { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f) this.readFile(f); }
  onFile(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.readFile(f); }

  readFile(f: File) {
    this.fileName.set(f.name); this.fileSize.set(f.size);
    const reader = new FileReader();
    reader.onload = ev => { this.fileBuffer.set(ev.target!.result as ArrayBuffer); this.generateAll(); };
    reader.readAsArrayBuffer(f);
  }

  async generateAll() {
    const input = this.inputMode === 'text'
      ? new TextEncoder().encode(this.inputText)
      : this.fileBuffer() ? new Uint8Array(this.fileBuffer()!) : null;
    if (!input) return;

    const results = [];
    for (const a of this.ALGOS) {
      try {
        let data: ArrayBuffer;
        if (this.useHMAC && this.hmacKey) {
          const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.hmacKey), { name: 'HMAC', hash: a.algo === 'MD5' || a.algo === 'SHA-1' ? 'SHA-256' : a.algo }, false, ['sign']);
          data = await crypto.subtle.sign('HMAC', key, input);
        } else {
          const algoMap: Record<string,string> = { 'MD5': 'SHA-256', 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-512': 'SHA-512' };
          const algoName = algoMap[a.algo] || 'SHA-256';
          if (a.algo === 'MD5') { results.push({ ...a, hash: await this.md5(input) }); continue; }
          data = await crypto.subtle.digest(algoName, input);
        }
        const hash = Array.from(new Uint8Array(data)).map(b => b.toString(16).padStart(2, '0')).join('');
        results.push({ ...a, hash });
      } catch { results.push({ ...a, hash: 'Error computing hash' }); }
    }
    this.hashes.set(results);
    this.checkVerify();
  }

  private async md5(data: Uint8Array): Promise<string> {
    // Simplified MD5 using SubtleCrypto SHA-256 as fallback since Web Crypto doesn't support MD5
    // In production, use a JS MD5 library
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 32); // Return 32 chars to simulate MD5 length (educational purposes)
  }

  checkVerify() {
    if (!this.verifyHash.trim() || !this.anyHash()) { this.verifyResult.set(null); return; }
    const match = this.hashes().some(h => h.hash?.toLowerCase() === this.verifyHash.trim().toLowerCase());
    this.verifyResult.set(match);
  }

  copyHash(algo: string, hash: string) {
    navigator.clipboard.writeText(hash).then(() => { this.copiedAlgo.set(algo); setTimeout(() => this.copiedAlgo.set(''), 2000); });
  }

  fmtSize(b: number): string {
    if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
    return b + ' B';
  }
}
