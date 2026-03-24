import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <!-- Generated Password Display -->
      <div class="password-display">
        <div class="pd-label">Generated Password</div>
        <div class="pd-password">
          <span class="pw-text" [class.hidden]="hidePassword">{{password()}}</span>
          <span class="pw-text hidden-text" *ngIf="hidePassword">{{maskPassword()}}</span>
        </div>
        <div class="pd-actions">
          <button class="pd-btn" (click)="hidePassword=!hidePassword" [title]="hidePassword?'Show':'Hide'">{{hidePassword?'👁':'🙈'}}</button>
          <button class="pd-btn" (click)="copy(password())">📋 Copy</button>
          <button class="pd-btn regen" (click)="generate()">🔄 Regenerate</button>
        </div>
        <!-- Strength meter -->
        <div class="strength-row">
          <div class="strength-bar">
            <div class="sb-fill" [style.width.%]="strengthPct()" [style.background]="strengthColor()"></div>
          </div>
          <span class="strength-label" [style.color]="strengthColor()">{{strengthLabel()}}</span>
        </div>
        <div class="entropy-row">Entropy: <strong>{{entropy()}} bits</strong> · Estimated crack time: <strong>{{crackTime()}}</strong></div>
      </div>

      <!-- Settings -->
      <div class="settings-grid">
        <div class="setting-card">
          <div class="sc-header">
            <span class="sc-title">Length</span>
            <span class="sc-val">{{length}}</span>
          </div>
          <input type="range" [(ngModel)]="length" min="4" max="64" (ngModelChange)="generate()" class="slider" />
          <div class="slider-marks"><span>4</span><span>16</span><span>32</span><span>64</span></div>
        </div>

        <div class="setting-card">
          <div class="sc-title">Character Sets</div>
          <div class="charset-options">
            <label class="cs-opt" *ngFor="let cs of charsets">
              <input type="checkbox" [(ngModel)]="cs.enabled" (change)="generate()" [disabled]="isLastEnabled(cs)" />
              <span class="cs-icon">{{cs.icon}}</span>
              <span class="cs-name">{{cs.name}}</span>
              <span class="cs-sample mono">{{cs.sample}}</span>
            </label>
          </div>
        </div>

        <div class="setting-card">
          <div class="sc-title">Options</div>
          <div class="options-list">
            <label class="opt-row"><input type="checkbox" [(ngModel)]="noAmbiguous" (change)="generate()" /> Exclude ambiguous (0, O, l, 1, I)</label>
            <label class="opt-row"><input type="checkbox" [(ngModel)]="noRepeating" (change)="generate()" /> No repeating characters</label>
            <label class="opt-row"><input type="checkbox" [(ngModel)]="mustIncludeAll" (change)="generate()" /> Include at least one from each set</label>
          </div>
          <div class="custom-chars">
            <label class="sc-title">Custom extra chars</label>
            <input [(ngModel)]="customChars" (ngModelChange)="generate()" class="custom-inp" placeholder="e.g. @#$%" />
          </div>
        </div>
      </div>

      <!-- Batch generate -->
      <div class="batch-section">
        <div class="batch-header">
          <div class="bs-left">
            <span class="sc-title">Batch Generate</span>
            <select [(ngModel)]="batchCount" class="batch-sel">
              <option *ngFor="let n of [5,10,20,50]" [value]="n">{{n}} passwords</option>
            </select>
            <button class="btn-batch" (click)="generateBatch()">Generate</button>
          </div>
          <div class="bs-right" *ngIf="batch().length">
            <button class="btn-sm" (click)="copyBatch()">📋 Copy All</button>
            <button class="btn-sm" (click)="downloadBatch()">⬇ Download</button>
            <button class="btn-sm warn" (click)="batch.set([])">🗑 Clear</button>
          </div>
        </div>
        <div class="batch-list" *ngIf="batch().length">
          <div class="bl-item" *ngFor="let pw of batch(); let i=index">
            <span class="bl-num">{{i+1}}</span>
            <span class="bl-pw mono">{{pw}}</span>
            <button class="bl-copy" (click)="copy(pw)">📋</button>
          </div>
        </div>
      </div>

      <!-- Passphrase generator -->
      <div class="passphrase-section">
        <div class="ps-header">
          <span class="sc-title">🗝 Passphrase Generator</span>
          <button class="btn-sm" (click)="generatePassphrase()">Generate</button>
        </div>
        <div class="passphrase-display" *ngIf="passphrase()">
          <span class="pp-text">{{passphrase()}}</span>
          <button class="pp-copy" (click)="copy(passphrase())">📋 Copy</button>
        </div>
        <div class="pp-settings">
          <label class="opt-row"><span>Words:</span>
            <input type="number" [(ngModel)]="ppWords" min="3" max="8" (ngModelChange)="generatePassphrase()" class="num-inp" /></label>
          <label class="opt-row"><span>Separator:</span>
            <input [(ngModel)]="ppSep" (ngModelChange)="generatePassphrase()" class="sep-inp" /></label>
          <label class="opt-row"><input type="checkbox" [(ngModel)]="ppCapitalize" (change)="generatePassphrase()" /> Capitalize</label>
          <label class="opt-row"><input type="checkbox" [(ngModel)]="ppNumbers" (change)="generatePassphrase()" /> Add numbers</label>
        </div>
      </div>

      <!-- Tips -->
      <div class="tips-section">
        <div class="tips-title">💡 Password Security Tips</div>
        <div class="tips-grid">
          <div class="tip" *ngFor="let t of tips">
            <span class="tip-icon">{{t.icon}}</span>
            <div><strong>{{t.title}}</strong> — {{t.desc}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .password-display{background:linear-gradient(135deg,#1e3a5f,#1e293b);border-radius:14px;padding:1.25rem 1.5rem;color:white;margin-bottom:1.25rem}
    .pd-label{font-size:.68rem;font-weight:700;text-transform:uppercase;opacity:.6;margin-bottom:.4rem;letter-spacing:.06em}
    .pd-password{background:rgba(255,255,255,.08);border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem;min-height:48px;display:flex;align-items:center}
    .pw-text{font-family:monospace;font-size:1rem;font-weight:600;color:#a3e635;letter-spacing:.06em;word-break:break-all;line-height:1.5}
    .hidden-text{color:#64748b;letter-spacing:.15em}
    .pd-actions{display:flex;gap:.5rem;margin-bottom:.85rem;flex-wrap:wrap}
    .pd-btn{padding:.35rem .85rem;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:white;border-radius:7px;cursor:pointer;font-size:.8rem;font-weight:600;transition:all .15s}
    .pd-btn:hover{background:rgba(255,255,255,.22)}
    .pd-btn.regen{background:rgba(163,230,53,.2);border-color:rgba(163,230,53,.4);color:#a3e635}
    .strength-row{display:flex;align-items:center;gap.75rem;margin-bottom:.35rem}
    .strength-bar{flex:1;height:6px;background:rgba(255,255,255,.15);border-radius:99px;overflow:hidden}
    .sb-fill{height:100%;border-radius:99px;transition:all .3s}
    .strength-label{font-size:.75rem;font-weight:700;min-width:70px;text-align:right}
    .entropy-row{font-size:.72rem;opacity:.6;margin-top:.25rem}
    .settings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin-bottom:1rem}
    .setting-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .sc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
    .sc-title{font-size:.72rem;font-weight:800;text-transform:uppercase;color:#374151;letter-spacing:.04em;display:block;margin-bottom:.5rem}
    .sc-val{font-size:1.1rem;font-weight:800;color:#2563eb}
    .slider{width:100%;cursor:pointer;accent-color:#2563eb;margin-bottom:.2rem}
    .slider-marks{display:flex;justify-content:space-between;font-size:.6rem;color:#9ca3af}
    .charset-options{display:flex;flex-direction:column;gap:.3rem}
    .cs-opt{display:flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.82rem;padding:.2rem 0}
    .cs-icon{font-size:.9rem}.cs-name{flex:1;font-weight:600}.cs-sample{font-size:.7rem;color:#9ca3af;font-family:monospace}
    .options-list{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.65rem}
    .opt-row{display:flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.8rem}
    .custom-chars{margin-top:.5rem}
    .custom-inp{width:100%;padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;box-sizing:border-box;margin-top:.25rem;outline:none}
    .mono{font-family:monospace}
    .batch-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .batch-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
    .bs-left,.bs-right{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .batch-sel{padding:.3rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;outline:none}
    .btn-batch{background:#2563eb;color:white;border:none;border-radius:7px;padding:.35rem .85rem;cursor:pointer;font-size:.78rem;font-weight:700}
    .btn-sm{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.28rem .65rem;cursor:pointer;font-size:.72rem;font-weight:600}
    .btn-sm.warn{color:#dc2626;border-color:#fecaca}
    .batch-list{display:flex;flex-direction:column;gap:.25rem;max-height:220px;overflow-y:auto}
    .bl-item{display:flex;align-items:center;gap:.5rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.3rem .6rem}
    .bl-num{font-size:.65rem;color:#9ca3af;min-width:20px;text-align:right;flex-shrink:0}
    .bl-pw{flex:1;font-size:.78rem;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .bl-copy{background:none;border:none;cursor:pointer;font-size:.7rem;flex-shrink:0;opacity:.6}
    .passphrase-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .ps-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.65rem}
    .passphrase-display{display:flex;align-items:center;gap:.75rem;background:white;border:1px solid #bfdbfe;border-radius:8px;padding:.6rem .85rem;margin-bottom:.6rem}
    .pp-text{font-family:monospace;font-size:.92rem;font-weight:700;color:#1d4ed8;flex:1;word-break:break-all}
    .pp-copy{background:none;border:1px solid #bfdbfe;border-radius:5px;color:#2563eb;padding:.2rem .6rem;cursor:pointer;font-size:.72rem;font-weight:700;flex-shrink:0}
    .pp-settings{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
    .num-inp,.sep-inp{padding:.28rem .4rem;border:1px solid #bfdbfe;border-radius:5px;font-size:.82rem;outline:none;width:45px}
    .tips-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .tips-title{font-size:.72rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.6rem}
    .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.5rem}
    .tip{display:flex;gap:.5rem;align-items:flex-start;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;font-size:.78rem;line-height:1.4}
    .tip-icon{font-size:1.1rem;flex-shrink:0}
  `]
})
export class PasswordGeneratorComponent implements OnInit {
  password = signal(''); batch = signal<string[]>([]); passphrase = signal('');
  length = 16; hidePassword = false; noAmbiguous = true; noRepeating = false; mustIncludeAll = true;
  customChars = ''; batchCount = 10; ppWords = 4; ppSep = '-'; ppCapitalize = true; ppNumbers = true;

  charsets = [
    {name:'Uppercase',icon:'🔠',sample:'A–Z',chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',enabled:true},
    {name:'Lowercase',icon:'🔡',sample:'a–z',chars:'abcdefghijklmnopqrstuvwxyz',enabled:true},
    {name:'Numbers',icon:'🔢',sample:'0–9',chars:'0123456789',enabled:true},
    {name:'Symbols',icon:'🔣',sample:'!@#$',chars:'!@#$%^&*()_+-=[]{}|;:,.<>?',enabled:true},
  ];

  ppWordList = ['correct','horse','battery','staple','cloud','river','mountain','tiger','ocean','forest','bright','silver','golden','cosmic','swift','brave','calm','deep','echo','flame','grace','happy','inner','jolly','karma','lucky','magic','noble','open','peace','quest','royal','solar','true','ultra','vivid','wise','xenon','youth','zenith','alpha','brave','crisp','dusk','eagle','fresh','glide','haven','ivory','jewel','keen','lunar','maple','north','olive','prime','quiet','rapid','storm','torch','ultra','vivid','warm','xray','yield','zeal'];

  tips = [
    {icon:'📏',title:'Length matters most',desc:'A 20-char random password is stronger than an 8-char complex one.'},
    {icon:'🎲',title:'Use a password manager',desc:'Never reuse passwords. Let a manager generate and store unique ones.'},
    {icon:'🚫',title:'Avoid personal info',desc:'Birthdays, names, and dictionary words are cracked first.'},
    {icon:'🔄',title:'Change after breaches',desc:'Check haveibeenpwned.com after any data breach notification.'},
    {icon:'2️⃣',title:'Enable 2FA',desc:'A strong password + 2FA protects even if the password leaks.'},
    {icon:'🗝',title:'Passphrases work too',desc:'4 random words give ~52 bits entropy — memorable and secure.'},
  ];

  ngOnInit() { this.generate(); this.generatePassphrase(); }

  getCharPool(): string {
    let pool = this.charsets.filter(c => c.enabled).map(c => c.chars).join('');
    if (this.customChars) pool += this.customChars;
    if (this.noAmbiguous) pool = pool.replace(/[0OlI1]/g, '');
    // Remove duplicates
    return [...new Set(pool)].join('');
  }

  generate() {
    const pool = this.getCharPool();
    if (!pool.length) { this.password.set('Enable at least one charset'); return; }

    let pw = '';
    const len = Math.max(4, Math.min(64, this.length));

    if (this.mustIncludeAll) {
      // Ensure at least one from each enabled charset
      const enabled = this.charsets.filter(c => c.enabled);
      for (const cs of enabled) {
        let chars = cs.chars;
        if (this.noAmbiguous) chars = chars.replace(/[0OlI1]/g, '');
        if (chars) pw += this.randChar(chars);
      }
      // Fill remainder
      const remaining = len - pw.length;
      for (let i = 0; i < remaining; i++) pw += this.randChar(pool);
      // Shuffle
      pw = this.shuffle(pw);
    } else {
      for (let i = 0; i < len; i++) {
        let char: string;
        let attempts = 0;
        do { char = this.randChar(pool); attempts++; }
        while (this.noRepeating && pw.includes(char) && attempts < 100);
        pw += char;
      }
    }
    this.password.set(pw);
  }

  randChar(s: string): string {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return s[arr[0] % s.length];
  }

  shuffle(s: string): string {
    const a = s.split('');
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000 * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.join('');
  }

  isLastEnabled(cs: any): boolean { return this.charsets.filter(c => c.enabled).length === 1 && cs.enabled; }

  entropy(): number {
    const pool = this.getCharPool().length;
    return Math.round(Math.log2(Math.pow(pool, this.length)));
  }

  strengthPct(): number { return Math.min(100, (this.entropy() / 128) * 100); }
  strengthColor(): string {
    const e = this.entropy();
    if (e < 28) return '#ef4444'; if (e < 36) return '#f97316';
    if (e < 60) return '#eab308'; if (e < 90) return '#3b82f6'; return '#22c55e';
  }
  strengthLabel(): string {
    const e = this.entropy();
    if (e < 28) return 'Very Weak'; if (e < 36) return 'Weak';
    if (e < 60) return 'Fair'; if (e < 90) return 'Strong'; return 'Very Strong';
  }
  crackTime(): string {
    const combos = Math.pow(this.getCharPool().length, this.length);
    const perSec = 1e10; // 10 billion/sec (offline fast hash)
    const secs = combos / perSec / 2;
    if (secs < 1) return 'instant'; if (secs < 60) return `${Math.round(secs)}s`;
    if (secs < 3600) return `${Math.round(secs/60)}m`; if (secs < 86400) return `${Math.round(secs/3600)}h`;
    if (secs < 31536000) return `${Math.round(secs/86400)}d`;
    const yrs = secs / 31536000;
    if (yrs < 1e6) return `${Math.round(yrs).toLocaleString()}yr`;
    if (yrs < 1e9) return `${(yrs/1e6).toFixed(1)}M yr`; return 'billions of years';
  }
  maskPassword(): string { return '●'.repeat(this.password().length); }

  generateBatch() { this.batch.set(Array.from({length:this.batchCount},()=>{this.generate();return this.password();})); }
  copyBatch() { navigator.clipboard.writeText(this.batch().join('\n')); }
  downloadBatch() { const b=new Blob([this.batch().join('\n')],{type:'text/plain'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='passwords.txt';a.click(); }

  generatePassphrase() {
    const list = this.ppWordList;
    const words: string[] = [];
    for (let i = 0; i < this.ppWords; i++) {
      let w = list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
      if (this.ppCapitalize) w = w[0].toUpperCase() + w.slice(1);
      words.push(w);
    }
    if (this.ppNumbers) { const idx = crypto.getRandomValues(new Uint32Array(1))[0] % words.length; words[idx] += String(crypto.getRandomValues(new Uint32Array(1))[0] % 100); }
    this.passphrase.set(words.join(this.ppSep));
  }

  copy(t: string) { navigator.clipboard.writeText(t); }
}
