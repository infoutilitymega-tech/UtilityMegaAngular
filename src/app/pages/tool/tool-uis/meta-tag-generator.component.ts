import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meta-tag-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mtg-wrap">
      <div class="form-layout">
        <!-- Left: Form -->
        <div class="form-col">
          <div class="section-title">📝 Basic SEO</div>
          <div class="field">
            <div class="field-header">
              <label>Page Title</label>
              <span class="char-count" [class.over]="title.length > 60">{{ title.length }}/60</span>
            </div>
            <input type="text" [(ngModel)]="title" (input)="generate()" class="inp" placeholder="My Awesome Page | Brand Name" maxlength="70" />
            <div class="field-hint">Ideal: 50–60 characters. Most important SEO element.</div>
          </div>

          <div class="field">
            <div class="field-header">
              <label>Meta Description</label>
              <span class="char-count" [class.over]="description.length > 160">{{ description.length }}/160</span>
            </div>
            <textarea [(ngModel)]="description" (input)="generate()" class="inp" rows="3" placeholder="Describe your page clearly. Include your primary keyword and a call to action." maxlength="200"></textarea>
            <div class="field-hint">Ideal: 150–160 characters. Improves click-through rate.</div>
          </div>

          <div class="fields-row">
            <div class="field">
              <label>Author</label>
              <input type="text" [(ngModel)]="author" (input)="generate()" class="inp" placeholder="Author Name" />
            </div>
            <div class="field">
              <label>Canonical URL</label>
              <input type="url" [(ngModel)]="canonical" (input)="generate()" class="inp" placeholder="https://example.com/page" />
            </div>
          </div>

          <div class="fields-row">
            <div class="field">
              <label>Robots</label>
              <select [(ngModel)]="robots" (change)="generate()" class="sel">
                <option value="index, follow">index, follow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
            <div class="field">
              <label>Language</label>
              <select [(ngModel)]="lang" (change)="generate()" class="sel">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
                <option value="mr">Marathi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>

          <div class="section-title">📱 Open Graph (Social)</div>
          <div class="field">
            <label>OG Title</label>
            <input type="text" [(ngModel)]="ogTitle" (input)="generate()" class="inp" placeholder="Title for social sharing" />
          </div>
          <div class="field">
            <label>OG Image URL</label>
            <input type="url" [(ngModel)]="ogImage" (input)="generate()" class="inp" placeholder="https://example.com/og-image.png (1200×630px)" />
          </div>
          <div class="fields-row">
            <div class="field">
              <label>OG Type</label>
              <select [(ngModel)]="ogType" (change)="generate()" class="sel">
                <option>website</option><option>article</option><option>product</option><option>profile</option>
              </select>
            </div>
            <div class="field">
              <label>Twitter Card</label>
              <select [(ngModel)]="twCard" (change)="generate()" class="sel">
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right: Live Preview -->
        <div class="preview-col">
          <div class="section-title">👀 Search Preview</div>
          <div class="serp-preview">
            <div class="serp-url">{{ canonical || 'https://example.com/page' }}</div>
            <div class="serp-title" [class.too-long]="title.length > 60">{{ title || 'Page Title' }}</div>
            <div class="serp-desc">{{ description || 'Meta description will appear here in search results. Write 150–160 characters.' }}</div>
          </div>

          <div class="section-title" style="margin-top:1rem">📘 Facebook Preview</div>
          <div class="fb-preview">
            <div class="fb-img" *ngIf="ogImage">
              <img [src]="ogImage" alt="OG Image" class="fb-thumb" (error)="imgErr($event)" />
            </div>
            <div class="fb-no-img" *ngIf="!ogImage">🖼️ Add OG Image (1200×630px)</div>
            <div class="fb-body">
              <div class="fb-domain">{{ getDomain() }}</div>
              <div class="fb-title">{{ ogTitle || title || 'OG Title' }}</div>
              <div class="fb-desc">{{ description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Code -->
      <div class="code-section">
        <div class="cs-header">
          <span class="cs-title">📋 Generated HTML Meta Tags</span>
          <button class="copy-code-btn" (click)="copyCode()">{{ copied() ? '✓ Copied!' : '📋 Copy All Tags' }}</button>
        </div>
        <pre class="code-block">{{ generatedCode() }}</pre>
      </div>

      <!-- Tag count summary -->
      <div class="tag-summary">
        <div class="ts-item" *ngFor="let t of tagSummary()">
          <span class="ts-icon">{{ t.icon }}</span>
          <span class="ts-label">{{ t.label }}</span>
          <span class="ts-count">{{ t.count }} tags</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mtg-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .form-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    .form-col,.preview-col{display:flex;flex-direction:column;gap:.75rem}
    .section-title{font-size:.8rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;padding:.25rem 0;border-bottom:1px solid var(--border)}
    .field{display:flex;flex-direction:column;gap:.3rem}
    .field-header{display:flex;justify-content:space-between;align-items:center}
    .field label,.field>.label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .char-count{font-size:.7rem;font-weight:700;color:var(--text-muted)}
    .char-count.over{color:var(--red)}
    .inp{padding:.5rem .75rem;border:1.5px solid var(--border);border-radius:8px;font-size:.85rem;background:var(--input-bg);color:var(--text);outline:none;font-family:var(--font);width:100%;box-sizing:border-box;resize:vertical}
    .inp:focus{border-color:var(--primary)}
    .field-hint{font-size:.68rem;color:var(--text-muted)}
    .fields-row{display:grid;grid-template-columns:1fr 1fr;gap:.65rem}
    .sel{padding:.45rem .6rem;border:1.5px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.83rem;outline:none;font-family:var(--font);width:100%}
    .serp-preview{padding:1rem;background:#fff;border-radius:10px;border:1px solid var(--border);color:#000}
    .serp-url{font-size:.73rem;color:#1a6b3a;margin-bottom:.2rem}
    .serp-title{font-size:1.05rem;color:#1a0dab;font-weight:400;margin-bottom:.2rem;cursor:pointer}
    .serp-title:hover{text-decoration:underline}
    .serp-title.too-long{color:var(--red)}
    .serp-desc{font-size:.82rem;color:#4d5156;line-height:1.4}
    .fb-preview{background:#fff;border-radius:10px;border:1px solid #dadde1;overflow:hidden;color:#000}
    .fb-img img,.fb-thumb{width:100%;height:160px;object-fit:cover}
    .fb-no-img{height:100px;display:flex;align-items:center;justify-content:center;background:#f0f2f5;font-size:.85rem;color:#65676b}
    .fb-body{padding:.65rem .85rem}
    .fb-domain{font-size:.72rem;color:#65676b;text-transform:uppercase}
    .fb-title{font-size:.95rem;font-weight:700;color:#1c1e21;margin:.15rem 0}
    .fb-desc{font-size:.78rem;color:#65676b}
    .code-section{border:1.5px solid var(--border);border-radius:12px;overflow:hidden}
    .cs-header{display:flex;align-items:center;justify-content:space-between;padding:.65rem .9rem;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .cs-title{font-size:.82rem;font-weight:700}
    .copy-code-btn{padding:.3rem .75rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.75rem;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s}
    .copy-code-btn:hover{background:var(--primary);border-color:var(--primary);color:#fff}
    .code-block{padding:.85rem;font-family:'Courier New',monospace;font-size:.73rem;line-height:1.6;overflow-x:auto;white-space:pre;color:var(--primary);background:var(--input-bg);margin:0;max-height:300px;overflow-y:auto}
    .tag-summary{display:flex;gap:.5rem;flex-wrap:wrap}
    .ts-item{display:flex;align-items:center;gap:.4rem;padding:.4rem .75rem;background:var(--bg-alt);border-radius:99px;border:1px solid var(--border);font-size:.75rem}
    .ts-icon{font-size:.9rem}
    .ts-label{color:var(--text-muted)}
    .ts-count{font-weight:800;color:var(--primary)}
    @media(max-width:768px){.form-layout{grid-template-columns:1fr}.fields-row{grid-template-columns:1fr}}
  `]
})
export class MetaTagGeneratorComponent {
  title = ''; description = ''; author = ''; canonical = ''; robots = 'index, follow'; lang = 'en';
  ogTitle = ''; ogImage = ''; ogType = 'website'; twCard = 'summary_large_image';
  copied = signal(false);
  private _code = signal('');

  generatedCode = this._code;

  ngOnInit() { this.generate(); }

  generate() {
    const lines: string[] = ['<!-- ── Basic SEO ── -->'];
    if (this.title) lines.push(`<title>${this.esc(this.title)}</title>`);
    if (this.description) lines.push(`<meta name="description" content="${this.esc(this.description)}" />`);
    if (this.author) lines.push(`<meta name="author" content="${this.esc(this.author)}" />`);
    lines.push(`<meta name="robots" content="${this.robots}" />`);
    lines.push(`<meta name="viewport" content="width=device-width, initial-scale=1" />`);
    if (this.canonical) lines.push(`<link rel="canonical" href="${this.canonical}" />`);
    lines.push(`<html lang="${this.lang}">`);
    lines.push('');
    lines.push('<!-- ── Open Graph ── -->');
    lines.push(`<meta property="og:title" content="${this.esc(this.ogTitle || this.title)}" />`);
    lines.push(`<meta property="og:description" content="${this.esc(this.description)}" />`);
    lines.push(`<meta property="og:type" content="${this.ogType}" />`);
    if (this.canonical) lines.push(`<meta property="og:url" content="${this.canonical}" />`);
    if (this.ogImage) lines.push(`<meta property="og:image" content="${this.ogImage}" />`);
    lines.push('');
    lines.push('<!-- ── Twitter Card ── -->');
    lines.push(`<meta name="twitter:card" content="${this.twCard}" />`);
    lines.push(`<meta name="twitter:title" content="${this.esc(this.ogTitle || this.title)}" />`);
    lines.push(`<meta name="twitter:description" content="${this.esc(this.description)}" />`);
    if (this.ogImage) lines.push(`<meta name="twitter:image" content="${this.ogImage}" />`);
    this._code.set(lines.join('\n'));
  }

  esc(s: string) { return s.replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  getDomain() { try { return new URL(this.canonical).hostname; } catch { return 'example.com'; } }
  imgErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }

  tagSummary() {
    const code = this._code();
    return [
      { icon: '🔍', label: 'Basic SEO', count: (code.match(/name="(description|author|robots|viewport)"/g) || []).length + (code.includes('<title>') ? 1 : 0) },
      { icon: '📘', label: 'Open Graph', count: (code.match(/property="og:/g) || []).length },
      { icon: '🐦', label: 'Twitter Card', count: (code.match(/name="twitter:/g) || []).length },
      { icon: '📎', label: 'Total Tags', count: (code.match(/<meta|<link|<title|<html/g) || []).length },
    ];
  }

  copyCode() { navigator.clipboard.writeText(this._code()).then(() => { this.copied.set(true); setTimeout(() => this.copied.set(false), 2000); }); }
}
