import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="pw-output">
        <div class="pw-display">{{ password() || 'Click generate...' }}</div>
        <button class="copy-btn" (click)="copy()" [class.success]="copied()">
          {{ copied() ? '✓' : '📋' }}
        </button>
        <button class="refresh-btn" (click)="generate()">🔄</button>
      </div>

      <div class="strength-bar">
        <div class="sb-fill" [style.width.%]="strengthPct()" [class]="'sb-' + strength()"></div>
      </div>
      <div class="strength-label">
        Strength: <strong [class]="'st-' + strength()">{{ strengthLabel() }}</strong>
        &nbsp;|&nbsp; Entropy: {{ entropy() }} bits
        &nbsp;|&nbsp; Crack time: ~{{ crackTime() }}
      </div>

      <div class="controls">
        <div class="ctrl-row">
          <label>Password Length: <strong>{{ length }}</strong></label>
          <input type="range" [(ngModel)]="length" (input)="generate()" min="6" max="64" class="length-range" />
        </div>

        <div class="toggles">
          <label class="toggle"><input type="checkbox" [(ngModel)]="useUpper" (change)="generate()" /><span class="tog-label">Uppercase (A-Z)</span></label>
          <label class="toggle"><input type="checkbox" [(ngModel)]="useLower" (change)="generate()" /><span class="tog-label">Lowercase (a-z)</span></label>
          <label class="toggle"><input type="checkbox" [(ngModel)]="useNumbers" (change)="generate()" /><span class="tog-label">Numbers (0-9)</span></label>
          <label class="toggle"><input type="checkbox" [(ngModel)]="useSymbols" (change)="generate()" /><span class="tog-label">{{ 'Symbols (!@#$%)' }}</span></label>
          <label class="toggle"><input type="checkbox" [(ngModel)]="excludeAmbig" (change)="generate()" /><span class="tog-label">Exclude ambiguous (O,0,l,1)</span></label>
        </div>
      </div>

      <!-- Bulk generate -->
      <div class="bulk-area">
        <div class="bulk-header">
          <span class="bulk-title">Bulk Generate</span>
          <div class="bulk-controls">
            <input type="number" [(ngModel)]="bulkCount" min="1" max="100" class="bulk-input" />
            <button class="tb-btn" (click)="bulkGenerate()">Generate {{ bulkCount }}</button>
            <button class="tb-btn" (click)="copyBulk()" *ngIf="bulkList().length">📋 Copy All</button>
          </div>
        </div>
        <div class="bulk-list" *ngIf="bulkList().length">
          <div *ngFor="let pw of bulkList()" class="bulk-item">
            <code>{{ pw }}</code>
            <button (click)="copySingle(pw)" class="mini-copy">📋</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .pw-output { display: flex; align-items: center; gap: .6rem; background: var(--bg-alt); border: 1.5px solid var(--border); border-radius: 10px; padding: .85rem 1rem; }
    .pw-display { flex: 1; font-family: 'Courier New', monospace; font-size: 1rem; font-weight: 700; color: var(--text); word-break: break-all; }
    .copy-btn, .refresh-btn { padding: .45rem .7rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); cursor: pointer; font-size: 1rem; transition: all .15s; font-family: inherit; }
    .copy-btn.success { background: #16a34a; color: #fff; border-color: #16a34a; }
    .copy-btn:hover { border-color: var(--primary); }
    .refresh-btn:hover { border-color: var(--primary); }
    .strength-bar { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .sb-fill { height: 100%; border-radius: 99px; transition: width .3s, background .3s; }
    .sb-weak { background: #ef4444; }
    .sb-fair { background: #f59e0b; }
    .sb-good { background: #3b82f6; }
    .sb-strong { background: #10b981; }
    .strength-label { font-size: .78rem; color: var(--text-muted); }
    .st-weak { color: #ef4444; } .st-fair { color: #f59e0b; } .st-good { color: #3b82f6; } .st-strong { color: #10b981; }
    .controls { display: flex; flex-direction: column; gap: .9rem; }
    .ctrl-row { display: flex; flex-direction: column; gap: .4rem; }
    .ctrl-row label { font-size: .85rem; font-weight: 600; }
    .length-range { width: 100%; accent-color: var(--primary); }
    .toggles { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .5rem; }
    .toggle { display: flex; align-items: center; gap: .5rem; cursor: pointer; font-size: .85rem; }
    .toggle input { accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer; }
    .tog-label { color: var(--text); }
    .bulk-area { border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; }
    .bulk-header { display: flex; align-items: center; justify-content: space-between; padding: .75rem 1rem; background: var(--bg-alt); flex-wrap: wrap; gap: .5rem; }
    .bulk-title { font-size: .85rem; font-weight: 700; }
    .bulk-controls { display: flex; align-items: center; gap: .5rem; }
    .bulk-input { width: 60px; padding: .35rem .5rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: .82rem; background: var(--input-bg); color: var(--text); outline: none; font-family: inherit; text-align: center; }
    .tb-btn { padding: .4rem .8rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text); font-size: .8rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
    .tb-btn:hover { border-color: var(--primary); color: var(--primary); }
    .bulk-list { max-height: 220px; overflow-y: auto; }
    .bulk-item { display: flex; align-items: center; justify-content: space-between; padding: .45rem 1rem; border-top: 1px solid var(--border); }
    .bulk-item code { font-size: .82rem; color: var(--text); }
    .mini-copy { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: .85rem; padding: .2rem .4rem; }
    .mini-copy:hover { color: var(--primary); }
  `]
})
export class PasswordGeneratorComponent implements OnInit {
  length = 16;
  useUpper = true; useLower = true; useNumbers = true; useSymbols = true; excludeAmbig = false;
  password = signal('');
  strength = signal('good');
  strengthPct = signal(75);
  entropy = signal(0);
  crackTime = signal('');
  copied = signal(false);
  bulkList = signal<string[]>([]);
  bulkCount = 10;

  private get charset(): string {
    let c = '';
    if (this.useLower)   c += this.excludeAmbig ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (this.useUpper)   c += this.excludeAmbig ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (this.useNumbers) c += this.excludeAmbig ? '23456789' : '0123456789';
    if (this.useSymbols) c += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    return c || 'abcdefghijklmnopqrstuvwxyz';
  }

  ngOnInit() { this.generate(); }

  generate() {
    const cs = this.charset;
    const arr = new Uint32Array(this.length);
    crypto.getRandomValues(arr);
    this.password.set(Array.from(arr, n => cs[n % cs.length]).join(''));
    this.calcStrength();
    this.bulkList.set([]);
  }

  calcStrength() {
    const cs = this.charset.length;
    const bits = Math.floor(Math.log2(Math.pow(cs, this.length)));
    this.entropy.set(bits);
    const gps = 1e10; // 10 billion guesses/sec
    const secs = Math.pow(2, bits) / (2 * gps);
    this.crackTime.set(this.formatTime(secs));

    if (bits < 40) { this.strength.set('weak'); this.strengthPct.set(25); }
    else if (bits < 60) { this.strength.set('fair'); this.strengthPct.set(50); }
    else if (bits < 80) { this.strength.set('good'); this.strengthPct.set(75); }
    else { this.strength.set('strong'); this.strengthPct.set(100); }
  }

  strengthLabel() {
    const m: Record<string,string> = { weak: 'Weak 😟', fair: 'Fair 😐', good: 'Good 👍', strong: 'Very Strong 💪' };
    return m[this.strength()] ?? '';
  }

  formatTime(secs: number): string {
    if (secs < 60) return Math.round(secs) + ' sec';
    if (secs < 3600) return Math.round(secs/60) + ' min';
    if (secs < 86400) return Math.round(secs/3600) + ' hr';
    if (secs < 31536000) return Math.round(secs/86400) + ' days';
    if (secs < 31536000000) return Math.round(secs/31536000) + ' years';
    return Math.round(secs/31536000/1e9).toLocaleString() + ' billion years';
  }

  copy() {
    navigator.clipboard.writeText(this.password()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  bulkGenerate() {
    const cs = this.charset;
    const list: string[] = [];
    for (let i = 0; i < this.bulkCount; i++) {
      const arr = new Uint32Array(this.length);
      crypto.getRandomValues(arr);
      list.push(Array.from(arr, n => cs[n % cs.length]).join(''));
    }
    this.bulkList.set(list);
  }

  copyBulk() { navigator.clipboard.writeText(this.bulkList().join('\n')); }
  copySingle(pw: string) { navigator.clipboard.writeText(pw); }
}
