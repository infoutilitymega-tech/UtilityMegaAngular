import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-case-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tcc-wrap">
      <div class="case-buttons">
        <button *ngFor="let c of cases" class="case-btn" [class.active]="activeCase===c.key" (click)="convert(c.key)">
          <span class="cb-icon">{{ c.icon }}</span>
          <span class="cb-name">{{ c.name }}</span>
          <span class="cb-example">{{ c.example }}</span>
        </button>
      </div>

      <div class="editor-area">
        <div class="ed-header">
          <span class="ed-lbl">Input Text</span>
          <div class="ed-actions">
            <button class="ed-btn" (click)="pasteFromClipboard()">📋 Paste</button>
            <button class="ed-btn" (click)="clear()">🗑 Clear</button>
            <span class="ed-count">{{ input.length }} chars · {{ wordCount() }} words</span>
          </div>
        </div>
        <textarea class="text-area" [(ngModel)]="input" (input)="autoConvert()" placeholder="Type or paste your text here...&#10;&#10;Example: hello world this is utility mega"></textarea>
      </div>

      <div class="output-area" *ngIf="output()">
        <div class="out-header">
          <span class="out-lbl">Output — <strong class="case-name">{{ activeCaseName() }}</strong></span>
          <div class="out-actions">
            <button class="ed-btn primary" (click)="copyOutput()">{{ copied() ? '✓ Copied!' : '📋 Copy' }}</button>
            <button class="ed-btn" (click)="input=output();autoConvert()">Use as Input</button>
          </div>
        </div>
        <div class="output-text">{{ output() }}</div>
      </div>

      <!-- Stats comparison -->
      <div class="stats-bar" *ngIf="input">
        <div class="stat-item"><span class="sl">Words</span><span class="sv">{{ wordCount() }}</span></div>
        <div class="stat-item"><span class="sl">Characters</span><span class="sv">{{ input.length }}</span></div>
        <div class="stat-item"><span class="sl">Sentences</span><span class="sv">{{ sentenceCount() }}</span></div>
        <div class="stat-item"><span class="sl">Lines</span><span class="sv">{{ lineCount() }}</span></div>
      </div>

      <!-- Quick converts row -->
      <div class="quick-row">
        <span class="qr-lbl">Quick convert:</span>
        <button *ngFor="let c of cases" class="qr-btn" (click)="convert(c.key)">{{ c.name }}</button>
      </div>
    </div>
  `,
  styles: [`
    .tcc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .case-buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}
    .case-btn{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.65rem .5rem;border-radius:10px;border:1.5px solid var(--border);background:var(--card-bg);cursor:pointer;font-family:var(--font);transition:all .15s}
    .case-btn:hover{border-color:var(--primary);background:var(--primary-light)}
    .case-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .cb-icon{font-size:1.1rem}
    .cb-name{font-size:.78rem;font-weight:700}
    .cb-example{font-size:.65rem;opacity:.65;font-family:'Courier New',monospace}
    .editor-area,.output-area{display:flex;flex-direction:column;gap:.35rem}
    .ed-header,.out-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem}
    .ed-lbl,.out-lbl{font-size:.8rem;font-weight:700;color:var(--text-muted)}
    .ed-actions,.out-actions{display:flex;align-items:center;gap:.4rem}
    .ed-count{font-size:.72rem;color:var(--text-muted)}
    .ed-btn{padding:.3rem .65rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .ed-btn:hover{border-color:var(--primary);color:var(--primary)}
    .ed-btn.primary{background:var(--primary);border-color:var(--primary);color:#fff}
    .text-area{width:100%;height:160px;padding:.85rem;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;line-height:1.7;background:var(--input-bg);color:var(--text);resize:vertical;outline:none;font-family:var(--font);box-sizing:border-box}
    .text-area:focus{border-color:var(--primary)}
    .case-name{color:var(--primary)}
    .output-text{padding:.85rem;background:var(--bg-alt);border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;line-height:1.7;white-space:pre-wrap;word-break:break-all;min-height:80px;font-family:'Courier New',monospace}
    .stats-bar{display:flex;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden}
    .stat-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.6rem;border-right:1px solid var(--border)}
    .stat-item:last-child{border-right:none}
    .sl{font-size:.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase}
    .sv{font-size:1rem;font-weight:800;color:var(--text)}
    .quick-row{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;padding:.5rem 0}
    .qr-lbl{font-size:.78rem;color:var(--text-muted);font-weight:600;flex-shrink:0}
    .qr-btn{padding:.25rem .6rem;border-radius:99px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text-muted);font-size:.72rem;cursor:pointer;font-family:var(--font);transition:all .15s}
    .qr-btn:hover{border-color:var(--primary);color:var(--primary)}
    @media(max-width:600px){.case-buttons{grid-template-columns:repeat(2,1fr)}.stats-bar{flex-wrap:wrap}}
  `]
})
export class TextCaseConverterComponent {
  input = '';
  output = signal('');
  activeCase = '';
  copied = signal(false);

  cases = [
    { key: 'upper', icon: 'AA', name: 'UPPERCASE', example: 'HELLO WORLD' },
    { key: 'lower', icon: 'aa', name: 'lowercase', example: 'hello world' },
    { key: 'title', icon: 'Aa', name: 'Title Case', example: 'Hello World' },
    { key: 'sentence', icon: 'Aa.', name: 'Sentence case', example: 'Hello world' },
    { key: 'camel', icon: 'aC', name: 'camelCase', example: 'helloWorld' },
    { key: 'pascal', icon: 'AC', name: 'PascalCase', example: 'HelloWorld' },
    { key: 'snake', icon: 'a_b', name: 'snake_case', example: 'hello_world' },
    { key: 'kebab', icon: 'a-b', name: 'kebab-case', example: 'hello-world' },
  ];

  activeCaseName() { return this.cases.find(c => c.key === this.activeCase)?.name ?? ''; }

  autoConvert() { if (this.activeCase) this.convert(this.activeCase); }

  convert(key: string) {
    this.activeCase = key;
    const text = this.input;
    if (!text) return;
    let result = '';
    const words = this.splitWords(text);
    switch (key) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'title': result = text.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'sentence': result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/([.!?]\s+)(\w)/g, (m, p, c) => p + c.toUpperCase()); break;
      case 'camel': result = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'pascal': result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
      case 'snake': result = words.map(w => w.toLowerCase()).join('_'); break;
      case 'kebab': result = words.map(w => w.toLowerCase()).join('-'); break;
    }
    this.output.set(result);
  }

  splitWords(text: string): string[] {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_\-\s]+/g, ' ')
      .trim().split(' ')
      .filter(w => w.length > 0);
  }

  wordCount() { return this.input.trim() ? this.input.trim().split(/\s+/).filter(Boolean).length : 0; }
  sentenceCount() { return this.input.split(/[.!?]+/).filter(s => s.trim()).length; }
  lineCount() { return this.input ? this.input.split('\n').length : 0; }

  copyOutput() { navigator.clipboard.writeText(this.output()).then(() => { this.copied.set(true); setTimeout(() => this.copied.set(false), 2000); }); }
  clear() { this.input = ''; this.output.set(''); }
  pasteFromClipboard() { navigator.clipboard.readText().then(t => { this.input = t; this.autoConvert(); }); }
}
