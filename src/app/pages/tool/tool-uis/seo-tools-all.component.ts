import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── 1. Meta Tag Generator ────────────────────────────────────────────────────
@Component({
  selector: 'app-meta-tag-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="two-col">
        <div class="form-col">
          <div class="section-title">Basic SEO</div>
          <div class="field"><label>Page Title <span class="len" [class.warn]="title.length>60">{{title.length}}/60</span></label><input [(ngModel)]="title" maxlength="70" placeholder="Your page title..." class="inp" /></div>
          <div class="field"><label>Meta Description <span class="len" [class.warn]="description.length>160">{{description.length}}/160</span></label><textarea [(ngModel)]="description" maxlength="200" rows="3" placeholder="Page description..." class="ta"></textarea></div>
          <div class="field"><label>Keywords (comma separated)</label><input [(ngModel)]="keywords" placeholder="keyword1, keyword2, keyword3" class="inp" /></div>
          <div class="field"><label>Canonical URL</label><input [(ngModel)]="canonical" placeholder="https://example.com/page" class="inp" /></div>
          <div class="field"><label>Robots</label>
            <select [(ngModel)]="robots" class="sel">
              <option>index, follow</option><option>noindex, follow</option><option>index, nofollow</option><option>noindex, nofollow</option>
            </select>
          </div>
          <div class="field"><label>Author</label><input [(ngModel)]="author" placeholder="Author name" class="inp" /></div>
          <div class="section-title mt">Open Graph</div>
          <div class="field"><label>OG Title</label><input [(ngModel)]="ogTitle" placeholder="Social share title..." class="inp" /></div>
          <div class="field"><label>OG Description</label><textarea [(ngModel)]="ogDesc" rows="2" placeholder="Social share description..." class="ta"></textarea></div>
          <div class="field"><label>OG Image URL</label><input [(ngModel)]="ogImage" placeholder="https://example.com/image.jpg" class="inp" /></div>
          <div class="field"><label>OG Type</label><select [(ngModel)]="ogType" class="sel"><option>website</option><option>article</option><option>product</option><option>profile</option></select></div>
          <div class="section-title mt">Twitter Card</div>
          <div class="field"><label>Card Type</label><select [(ngModel)]="twCard" class="sel"><option value="summary">Summary</option><option value="summary_large_image">Summary Large Image</option><option value="app">App</option></select></div>
          <div class="field"><label>Twitter Site &#64;handle</label><input [(ngModel)]="twSite" placeholder="@yoursite" class="inp" /></div>
        </div>
        <div class="output-col">
          <div class="section-title">SERP Preview</div>
          <div class="serp-preview">
            <div class="serp-url">{{canonical||'https://example.com/page'}}</div>
            <div class="serp-title">{{title||'Page Title Here'}}</div>
            <div class="serp-desc">{{description||'Page description will appear here in search results.'}}</div>
          </div>
          <div class="section-title mt">Generated Meta Tags</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copyCode()">{{copied()?'✓ Copied':'📋 Copy All'}}</button>
            <pre class="code-block">{{generateCode()}}</pre>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.section-title.mt{margin-top:1.25rem}.field{margin-bottom:.85rem}.field label{display:flex;justify-content:space-between;font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.3rem}.len{font-weight:700;color:#9ca3af}.len.warn{color:#dc2626}.inp,.sel{width:100%;padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;box-sizing:border-box}.inp:focus{border-color:#2563eb}.ta{width:100%;padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;resize:vertical;outline:none;font-family:inherit;box-sizing:border-box}.ta:focus{border-color:#2563eb}.serp-preview{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1rem}.serp-url{font-size:.75rem;color:#202124;margin-bottom:.2rem;font-family:arial,sans-serif}.serp-title{font-size:1.05rem;color:#1a0dab;font-family:arial,sans-serif;font-weight:400;margin-bottom:.25rem;cursor:pointer}.serp-title:hover{text-decoration:underline}.serp-desc{font-size:.8rem;color:#4d5156;font-family:arial,sans-serif;line-height:1.5}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;border:none;background:#2563eb;color:white;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.72rem;overflow-x:auto;white-space:pre-wrap;word-break:break-all;line-height:1.6;margin:0;max-height:400px;overflow-y:auto}`]
})
export class MetaTagGeneratorComponent {
  title=''; description=''; keywords=''; canonical=''; robots='index, follow'; author='';
  ogTitle=''; ogDesc=''; ogImage=''; ogType='website';
  twCard='summary_large_image'; twSite='';
  copied=signal(false);
  generateCode(){
    const lines=[
      `<!-- Basic SEO -->`,
      `<title>${this.title}</title>`,
      `<meta name="description" content="${this.description}">`,
      this.keywords?`<meta name="keywords" content="${this.keywords}">`:null,
      `<meta name="robots" content="${this.robots}">`,
      this.canonical?`<link rel="canonical" href="${this.canonical}">`:null,
      this.author?`<meta name="author" content="${this.author}">`:null,
      `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      ``,`<!-- Open Graph -->`,
      `<meta property="og:title" content="${this.ogTitle||this.title}">`,
      `<meta property="og:description" content="${this.ogDesc||this.description}">`,
      `<meta property="og:type" content="${this.ogType}">`,
      this.canonical?`<meta property="og:url" content="${this.canonical}">`:null,
      this.ogImage?`<meta property="og:image" content="${this.ogImage}">`:null,
      ``,`<!-- Twitter Card -->`,
      `<meta name="twitter:card" content="${this.twCard}">`,
      `<meta name="twitter:title" content="${this.ogTitle||this.title}">`,
      `<meta name="twitter:description" content="${this.ogDesc||this.description}">`,
      this.twSite?`<meta name="twitter:site" content="${this.twSite}">`:null,
      this.ogImage?`<meta name="twitter:image" content="${this.ogImage}">`:null,
    ];
    return lines.filter(l=>l!==null).join('\n');
  }
  copyCode(){navigator.clipboard.writeText(this.generateCode());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
}

// ─── 2. Keyword Density Checker ───────────────────────────────────────────────
@Component({
  selector: 'app-keyword-density-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="controls-row">
        <div class="field flex1"><label>Content</label><textarea [(ngModel)]="content" rows="8" placeholder="Paste your article or webpage content here..." class="ta"></textarea></div>
        <div class="side-col">
          <div class="field"><label>Target Keyword</label><input [(ngModel)]="targetKw" placeholder="e.g. digital marketing" class="inp" /></div>
          <div class="field"><label>Min Word Length</label><input type="number" [(ngModel)]="minLen" min="1" max="10" class="inp" style="width:80px" /></div>
          <div class="field"><label>Ignore Stop Words</label><input type="checkbox" [(ngModel)]="ignoreStop" /></div>
          <button class="btn-analyze" (click)="analyze()">🔍 Analyze</button>
          <div class="stats-box" *ngIf="analyzed()">
            <div class="stat-row"><span>Total Words</span><strong>{{stats().totalWords}}</strong></div>
            <div class="stat-row"><span>Unique Words</span><strong>{{stats().uniqueWords}}</strong></div>
            <div class="stat-row"><span>Sentences</span><strong>{{stats().sentences}}</strong></div>
            <div class="stat-row" *ngIf="targetKw"><span>Target Density</span><strong [class.ok]="stats().targetDensity>=1&&stats().targetDensity<=2" [class.warn]="stats().targetDensity>2" [class.low]="stats().targetDensity<1&&stats().targetDensity>0">{{stats().targetDensity}}%</strong></div>
          </div>
        </div>
      </div>
      <div class="results-section" *ngIf="analyzed()">
        <div class="res-title">Keyword Frequency (Top {{topWords().length}})</div>
        <div class="kw-list">
          <div class="kw-item" *ngFor="let w of topWords()">
            <div class="kw-word" [class.target]="w.word===targetKw.toLowerCase()">{{w.word}}</div>
            <div class="kw-bar-wrap"><div class="kw-bar" [style.width.%]="w.percent" [class.target-bar]="w.word===targetKw.toLowerCase()"></div></div>
            <div class="kw-count">{{w.count}}x</div>
            <div class="kw-pct">{{w.density}}%</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.controls-row{display:grid;grid-template-columns:1fr 200px;gap:1rem;margin-bottom:1rem}@media(max-width:680px){.controls-row{grid-template-columns:1fr}}.flex1{display:flex;flex-direction:column}.field{margin-bottom:.75rem}.field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:.3rem}.ta,.inp{width:100%;padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;box-sizing:border-box;resize:vertical;font-family:inherit}.ta{flex:1}.inp:focus,.ta:focus{border-color:#2563eb}.side-col{display:flex;flex-direction:column}.btn-analyze{background:#2563eb;color:white;border:none;padding:.65rem;border-radius:9px;font-weight:700;cursor:pointer;font-size:.875rem;margin-bottom:.75rem}.stats-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem}.stat-row{display:flex;justify-content:space-between;font-size:.8rem;padding:.25rem 0;border-bottom:1px solid #f3f4f6}.stat-row:last-child{border-bottom:none}.stat-row strong{font-weight:800}.stat-row strong.ok{color:#059669}.stat-row strong.warn{color:#dc2626}.stat-row strong.low{color:#d97706}.results-section{margin-top:.5rem}.res-title{font-size:.82rem;font-weight:800;margin-bottom:.65rem}.kw-list{display:flex;flex-direction:column;gap:.35rem;max-height:320px;overflow-y:auto}.kw-item{display:grid;grid-template-columns:140px 1fr 40px 45px;gap:.5rem;align-items:center;padding:.35rem .5rem;background:#f8fafc;border-radius:6px}.kw-word{font-size:.78rem;font-weight:600;font-family:monospace;overflow:hidden;text-overflow:ellipsis}.kw-word.target{color:#2563eb;font-weight:800}.kw-bar-wrap{background:#f3f4f6;border-radius:99px;height:6px;overflow:hidden}.kw-bar{height:100%;background:#9ca3af;border-radius:99px;transition:width .3s}.target-bar{background:#2563eb}.kw-count,.kw-pct{font-size:.72rem;font-weight:700;color:#6b7280;text-align:right}`]
})
export class KeywordDensityCheckerComponent {
  content=''; targetKw=''; minLen=3; ignoreStop=true; analyzed=signal(false);
  stats=signal<any>({totalWords:0,uniqueWords:0,sentences:0,targetDensity:0});
  topWords=signal<any[]>([]);
  stopWords=new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','this','that','these','those','it','its','i','you','he','she','we','they','them','their','my','your','his','her','our','what','which','who','how','when','where','why','as','if','than']);

  analyze(){
    if(!this.content.trim())return;
    const words=this.content.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>=this.minLen&&(!this.ignoreStop||!this.stopWords.has(w)));
    const total=words.length; const freq=new Map<string,number>();
    words.forEach(w=>freq.set(w,(freq.get(w)||0)+1));
    const sorted=[...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30);
    const maxCount=sorted[0]?.[1]||1;
    this.topWords.set(sorted.map(([word,count])=>({word,count,density:((count/total)*100).toFixed(2),percent:Math.round((count/maxCount)*100)})));
    const sents=this.content.split(/[.!?]+/).filter(s=>s.trim()).length;
    const unique=new Set(words).size;
    let targetDensity=0;
    if(this.targetKw){const tk=this.targetKw.toLowerCase();const tkCount=(this.content.toLowerCase().match(new RegExp(tk,'g'))||[]).length;targetDensity=parseFloat(((tkCount/total)*100).toFixed(2));}
    this.stats.set({totalWords:total,uniqueWords:unique,sentences:sents,targetDensity});
    this.analyzed.set(true);
  }
}

// ─── 3. Readability Checker ───────────────────────────────────────────────────
@Component({
  selector: 'app-readability-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="editor-grid">
        <div class="input-col">
          <div class="field-label">Paste your content</div>
          <textarea [(ngModel)]="content" rows="12" (ngModelChange)="analyze()" placeholder="Paste your article or blog post content here to analyze readability..." class="big-ta"></textarea>
          <div class="word-count">{{wordCount()}} words · {{sentenceCount()}} sentences · {{charCount()}} characters</div>
        </div>
        <div class="results-col">
          <div class="score-card" [class]="getScoreClass()">
            <div class="score-label">Flesch Reading Score</div>
            <div class="score-num">{{fleschScore()}}</div>
            <div class="score-grade">{{getGrade()}}</div>
          </div>
          <div class="metrics-list">
            <div class="metric" *ngFor="let m of getMetrics()">
              <div class="metric-label">{{m.label}}</div>
              <div class="metric-val">{{m.value}}</div>
            </div>
          </div>
          <div class="suggestions-box" *ngIf="getSuggestions().length">
            <div class="sug-title">💡 Suggestions</div>
            <div class="sug-item" *ngFor="let s of getSuggestions()">{{s}}</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.editor-grid{display:grid;grid-template-columns:1fr 280px;gap:1.25rem}@media(max-width:768px){.editor-grid{grid-template-columns:1fr}}.input-col{display:flex;flex-direction:column;gap:.5rem}.field-label{font-size:.78rem;font-weight:800;color:#374151;text-transform:uppercase}.big-ta{width:100%;padding:.85rem;border:1px solid #d1d5db;border-radius:10px;font-size:.9rem;line-height:1.7;resize:vertical;outline:none;font-family:inherit;box-sizing:border-box;flex:1}.big-ta:focus{border-color:#2563eb}.word-count{font-size:.72rem;color:#9ca3af}.results-col{display:flex;flex-direction:column;gap:1rem}.score-card{border-radius:12px;padding:1.25rem;text-align:center;border:2px solid transparent}.score-card.excellent{background:#ecfdf5;border-color:#a7f3d0}.score-card.good{background:#eff6ff;border-color:#bfdbfe}.score-card.fair{background:#fffbeb;border-color:#fde68a}.score-card.hard{background:#fef2f2;border-color:#fecaca}.score-label{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.4rem}.score-num{font-size:3rem;font-weight:900;line-height:1}.score-grade{font-size:.85rem;font-weight:700;margin-top:.25rem}.metrics-list{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem;display:flex;flex-direction:column;gap:0}.metric{display:flex;justify-content:space-between;align-items:center;padding:.45rem .25rem;border-bottom:1px solid #f3f4f6;font-size:.8rem}.metric:last-child{border-bottom:none}.metric-label{color:#6b7280}.metric-val{font-weight:800;color:#111827}.suggestions-box{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.85rem}.sug-title{font-size:.78rem;font-weight:800;color:#92400e;margin-bottom:.5rem}.sug-item{font-size:.78rem;color:#78350f;padding:.2rem 0;padding-left:.75rem;position:relative}.sug-item::before{content:'•';position:absolute;left:0}`]
})
export class ReadabilityCheckerComponent {
  content='';
  wordCount=signal(0); sentenceCount=signal(0); charCount=signal(0);
  fleschScore=signal(0);

  analyze(){
    const text=this.content;
    if(!text.trim()){this.wordCount.set(0);this.sentenceCount.set(0);this.charCount.set(0);this.fleschScore.set(0);return;}
    const words=text.trim().split(/\s+/).filter(w=>w.length>0);
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0);
    const syllables=words.reduce((sum,w)=>sum+this.countSyllables(w),0);
    this.wordCount.set(words.length); this.sentenceCount.set(sentences.length); this.charCount.set(text.length);
    if(words.length>0&&sentences.length>0){
      const score=206.835-(1.015*(words.length/sentences.length))-(84.6*(syllables/words.length));
      this.fleschScore.set(Math.max(0,Math.min(100,Math.round(score))));
    }
  }
  countSyllables(word: string): number {
    word=word.toLowerCase().replace(/[^a-z]/g,'');
    if(!word)return 0;
    const matches=word.match(/[aeiou]+/g);
    return Math.max(1,(matches?.length||0)-(word.endsWith('e')?1:0));
  }
  getScoreClass(){const s=this.fleschScore();if(s>=70)return'score-card excellent';if(s>=60)return'score-card good';if(s>=50)return'score-card fair';return'score-card hard';}
  getGrade(){const s=this.fleschScore();if(s>=90)return'5th Grade · Very Easy';if(s>=80)return'6th Grade · Easy';if(s>=70)return'7th Grade · Fairly Easy';if(s>=60)return'8th-9th Grade · Standard';if(s>=50)return'10th-12th Grade · Fairly Hard';if(s>=30)return'College · Difficult';return'Graduate · Very Difficult';}
  getMetrics(){
    const wc=this.wordCount(),sc=this.sentenceCount();
    const avgWords=sc>0?(wc/sc).toFixed(1):0;
    const readTime=Math.ceil(wc/225);
    return [
      {label:'Avg Words/Sentence',value:avgWords},
      {label:'Est. Reading Time',value:readTime+' min'},
      {label:'Sentences',value:sc},
      {label:'Characters',value:this.charCount()},
      {label:'Flesch Score',value:this.fleschScore()+'/100'},
    ];
  }
  getSuggestions(){
    const sug=[];const wc=this.wordCount(),sc=this.sentenceCount();
    if(sc>0&&wc/sc>25)sug.push('Shorten sentences — avg '+Math.round(wc/sc)+' words. Aim for under 20.');
    if(this.fleschScore()<60)sug.push('Simplify vocabulary — use shorter, common words.');
    if(wc<300)sug.push('Content is short. For SEO, aim for 1500+ words on competitive topics.');
    if(sc>0&&wc/sc<8)sug.push('Sentences are very short. Vary length for better flow.');
    return sug;
  }
}

// ─── 4. Robots.txt Generator ──────────────────────────────────────────────────
@Component({
  selector: 'app-robots-txt-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="two-col">
        <div class="form-col">
          <div class="section-title">Robots.txt Builder</div>
          <div class="rule-section" *ngFor="let rule of rules(); let i=index">
            <div class="rule-header">
              <span class="rule-num">Rule {{i+1}}</span>
              <button class="rule-del" (click)="removeRule(i)">✕</button>
            </div>
            <div class="field"><label>User-agent</label>
              <select [(ngModel)]="rule.agent" (ngModelChange)="generate()" class="sel">
                <option value="*">* (All bots)</option>
                <option>Googlebot</option><option>Bingbot</option><option>Slurp</option>
                <option>DuckDuckBot</option><option>Baiduspider</option><option>YandexBot</option>
              </select>
            </div>
            <div class="field"><label>Disallow paths (one per line)</label>
              <textarea [(ngModel)]="rule.disallow" (ngModelChange)="generate()" rows="3" placeholder="/admin/&#10;/private/&#10;/tmp/" class="ta-sm"></textarea>
            </div>
            <div class="field"><label>Allow paths (one per line)</label>
              <textarea [(ngModel)]="rule.allow" (ngModelChange)="generate()" rows="2" placeholder="/api/public/" class="ta-sm"></textarea>
            </div>
            <div class="field"><label>Crawl Delay (seconds)</label>
              <input type="number" [(ngModel)]="rule.crawlDelay" (ngModelChange)="generate()" placeholder="0" class="sm-inp" />
            </div>
          </div>
          <button class="btn-add" (click)="addRule()">+ Add User-agent Rule</button>
          <div class="sitemap-field mt">
            <div class="field"><label>Sitemap URL</label><input [(ngModel)]="sitemapUrl" (ngModelChange)="generate()" placeholder="https://example.com/sitemap.xml" class="inp" /></div>
          </div>
        </div>
        <div class="output-col">
          <div class="section-title">Generated robots.txt</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copy()">{{copied()?'✓':'📋'}} {{copied()?'Copied':'Copy'}}</button>
            <pre class="code-block">{{output()}}</pre>
          </div>
          <button class="btn-dl" (click)="download()">⬇ Download robots.txt</button>
          <div class="tips-box">
            <div class="tip-title">💡 Tips</div>
            <div class="tip">Use <code>/admin/</code> to block a directory (trailing slash = directory)</div>
            <div class="tip">Disallow: / blocks ALL crawling (use carefully)</div>
            <div class="tip">Always submit your sitemap URL here</div>
            <div class="tip">Test your robots.txt in Google Search Console</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.rule-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:.85rem}.rule-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.rule-num{font-size:.8rem;font-weight:800;color:#374151}.rule-del{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:.9rem;padding:.1rem .3rem}.rule-del:hover{color:#dc2626}.field{margin-bottom:.65rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:.25rem}.sel,.inp,.sm-inp{width:100%;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;outline:none;box-sizing:border-box}.sm-inp{width:80px}.ta-sm{width:100%;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.8rem;resize:vertical;outline:none;font-family:monospace;box-sizing:border-box}.btn-add{width:100%;padding:.6rem;border:2px dashed #d1d5db;border-radius:8px;background:transparent;cursor:pointer;font-size:.82rem;font-weight:700;color:#6b7280;transition:all .15s}.btn-add:hover{border-color:#2563eb;color:#2563eb}.mt{margin-top:.85rem}.output-col{display:flex;flex-direction:column;gap:1rem}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.75rem;line-height:1.7;white-space:pre-wrap;margin:0;min-height:200px;overflow:auto}.btn-dl{background:#059669;color:white;border:none;padding:.6rem 1.25rem;border-radius:9px;font-weight:700;cursor:pointer;font-size:.85rem}.tips-box{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.85rem}.tip-title{font-size:.75rem;font-weight:800;color:#92400e;margin-bottom:.5rem}.tip{font-size:.75rem;color:#78350f;padding:.2rem 0;padding-left:.75rem;position:relative}.tip::before{content:'•';position:absolute;left:0}.tip code{background:#fef3c7;padding:.05rem .25rem;border-radius:3px;font-size:.72rem}`]
})
export class RobotsTxtGeneratorComponent implements OnInit {
  rules = signal<any[]>([{agent:'*',disallow:'/admin/\n/private/',allow:'',crawlDelay:''}]);
  sitemapUrl=''; output=signal(''); copied=signal(false);
  ngOnInit(){this.generate();}
  addRule(){this.rules.update(r=>[...r,{agent:'*',disallow:'',allow:'',crawlDelay:''}]);this.generate();}
  removeRule(i:number){this.rules.update(r=>r.filter((_,idx)=>idx!==i));this.generate();}
  generate(){
    const lines:string[]=[];
    for(const rule of this.rules()){
      lines.push(`User-agent: ${rule.agent}`);
      (rule.disallow||'').split('\n').filter((l:string)=>l.trim()).forEach((l:string)=>lines.push(`Disallow: ${l.trim()}`));
      (rule.allow||'').split('\n').filter((l:string)=>l.trim()).forEach((l:string)=>lines.push(`Allow: ${l.trim()}`));
      if(rule.crawlDelay)lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      lines.push('');
    }
    if(this.sitemapUrl)lines.push(`Sitemap: ${this.sitemapUrl}`);
    this.output.set(lines.join('\n').trim());
  }
  copy(){navigator.clipboard.writeText(this.output());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
  download(){const blob=new Blob([this.output()],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='robots.txt';a.click();}
}

// ─── 5. Sitemap Generator ─────────────────────────────────────────────────────
@Component({
  selector: 'app-sitemap-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="two-col">
        <div class="form-col">
          <div class="section-title">Sitemap Builder</div>
          <div class="field"><label>Base URL</label><input [(ngModel)]="baseUrl" placeholder="https://example.com" class="inp" (ngModelChange)="generate()" /></div>
          <div class="urls-section">
            <div class="urls-header"><span class="section-title">Pages</span><button class="btn-add-url" (click)="addUrl()">+ Add</button></div>
            <div class="url-row" *ngFor="let u of urls(); let i=index">
              <input [(ngModel)]="u.path" (ngModelChange)="generate()" placeholder="/about" class="path-inp" />
              <select [(ngModel)]="u.changefreq" (ngModelChange)="generate()" class="sel-sm">
                <option>always</option><option>hourly</option><option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option><option>never</option>
              </select>
              <select [(ngModel)]="u.priority" (ngModelChange)="generate()" class="sel-sm">
                <option>1.0</option><option>0.9</option><option>0.8</option><option>0.7</option><option>0.6</option><option>0.5</option><option>0.4</option><option>0.3</option>
              </select>
              <button class="del-btn" (click)="removeUrl(i)">✕</button>
            </div>
          </div>
          <div class="options-section">
            <div class="field"><label><input type="checkbox" [(ngModel)]="includeLastmod" (ngModelChange)="generate()" /> Include lastmod (today)</label></div>
          </div>
        </div>
        <div class="output-col">
          <div class="section-title">Generated sitemap.xml</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copy()">{{copied()?'✓ Copied':'📋 Copy'}}</button>
            <pre class="code-block">{{output()}}</pre>
          </div>
          <div class="dl-row">
            <button class="btn-dl" (click)="download()">⬇ Download sitemap.xml</button>
            <span class="url-count">{{urls().length}} URLs</span>
          </div>
          <div class="tips-box">
            <div class="tip-title">💡 After generating</div>
            <div class="tip">Submit to Google Search Console → Sitemaps</div>
            <div class="tip">Submit to Bing Webmaster Tools</div>
            <div class="tip">Add Sitemap URL to your robots.txt</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.form-col,.output-col{display:flex;flex-direction:column;gap:.75rem}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}.inp{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}.inp:focus{border-color:#2563eb}.urls-section{display:flex;flex-direction:column;gap:.35rem}.urls-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem}.btn-add-url{padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.75rem;font-weight:700;cursor:pointer}.url-row{display:flex;gap:.4rem;align-items:center}.path-inp{flex:1;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;font-family:monospace;outline:none}.sel-sm{padding:.35rem .3rem;border:1px solid #d1d5db;border-radius:6px;font-size:.75rem}.del-btn{background:none;border:none;color:#9ca3af;cursor:pointer;padding:.2rem .3rem}.del-btn:hover{color:#dc2626}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.7rem;line-height:1.6;white-space:pre-wrap;margin:0;max-height:350px;overflow:auto}.dl-row{display:flex;align-items:center;gap:.75rem}.btn-dl{background:#059669;color:white;border:none;padding:.6rem 1.25rem;border-radius:9px;font-weight:700;cursor:pointer;font-size:.85rem}.url-count{font-size:.8rem;color:#6b7280;font-weight:700}.tips-box{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.85rem}.tip-title{font-size:.75rem;font-weight:800;color:#92400e;margin-bottom:.5rem}.tip{font-size:.75rem;color:#78350f;padding:.2rem 0;padding-left:.75rem;position:relative}.tip::before{content:'•';position:absolute;left:0}`]
})
export class SitemapGeneratorComponent implements OnInit {
  baseUrl='https://utilitymega.com'; includeLastmod=true; copied=signal(false); output=signal('');
  urls=signal([{path:'/',changefreq:'weekly',priority:'1.0'},{path:'/about',changefreq:'monthly',priority:'0.8'},{path:'/contact',changefreq:'yearly',priority:'0.7'}]);
  ngOnInit(){this.generate();}
  addUrl(){this.urls.update(u=>[...u,{path:'/',changefreq:'monthly',priority:'0.5'}]);this.generate();}
  removeUrl(i:number){this.urls.update(u=>u.filter((_,idx)=>idx!==i));this.generate();}
  generate(){
    const today=new Date().toISOString().split('T')[0];
    const lines=[`<?xml version="1.0" encoding="UTF-8"?>`,`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`];
    for(const u of this.urls()){
      const full=(this.baseUrl||'https://example.com').replace(/\/$/,'')+u.path;
      lines.push(`  <url>`);
      lines.push(`    <loc>${full}</loc>`);
      if(this.includeLastmod)lines.push(`    <lastmod>${today}</lastmod>`);
      lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      lines.push(`    <priority>${u.priority}</priority>`);
      lines.push(`  </url>`);
    }
    lines.push(`</urlset>`);
    this.output.set(lines.join('\n'));
  }
  copy(){navigator.clipboard.writeText(this.output());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
  download(){const blob=new Blob([this.output()],{type:'application/xml'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sitemap.xml';a.click();}
}

// ─── 6. Open Graph Generator ──────────────────────────────────────────────────
@Component({
  selector: 'app-og-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="two-col">
        <div class="form-col">
          <div class="section-title">Open Graph Tags</div>
          <div class="field"><label>og:title <span class="len" [class.warn]="ogTitle.length>60">{{ogTitle.length}}/60</span></label><input [(ngModel)]="ogTitle" maxlength="90" placeholder="Share title..." class="inp" /></div>
          <div class="field"><label>og:description <span class="len" [class.warn]="ogDesc.length>160">{{ogDesc.length}}/160</span></label><textarea [(ngModel)]="ogDesc" maxlength="200" rows="3" class="ta" placeholder="Share description..."></textarea></div>
          <div class="field"><label>og:image URL</label><input [(ngModel)]="ogImage" placeholder="https://example.com/share.jpg (1200×630 recommended)" class="inp" /></div>
          <div class="field"><label>og:url</label><input [(ngModel)]="ogUrl" placeholder="https://example.com/page" class="inp" /></div>
          <div class="field"><label>og:type</label><select [(ngModel)]="ogType" class="sel"><option>website</option><option>article</option><option>product</option><option>profile</option><option>video.movie</option><option>music.song</option></select></div>
          <div class="field"><label>og:site_name</label><input [(ngModel)]="siteName" placeholder="Your Website Name" class="inp" /></div>
          <div class="field"><label>og:locale</label><input [(ngModel)]="locale" placeholder="en_US" class="inp" /></div>
          <div class="section-title mt">Article-specific (if og:type = article)</div>
          <div class="field"><label>Published Time</label><input type="datetime-local" [(ngModel)]="publishedTime" class="inp" /></div>
          <div class="field"><label>Author</label><input [(ngModel)]="articleAuthor" placeholder="Author name" class="inp" /></div>
          <div class="field"><label>Section / Category</label><input [(ngModel)]="section" placeholder="Technology" class="inp" /></div>
        </div>
        <div class="preview-col">
          <div class="section-title">Social Preview</div>
          <div class="fb-preview">
            <div class="preview-img-wrap" [style.background]="ogImage?'':'#e5e7eb'">
              <img *ngIf="ogImage" [src]="ogImage" alt="OG Image" class="preview-img" (error)="imgError=true" />
              <div *ngIf="!ogImage||imgError" class="no-img">1200 × 630<br>Image Preview</div>
            </div>
            <div class="preview-meta">
              <div class="preview-domain">{{getDomain()}}</div>
              <div class="preview-title">{{ogTitle||'Share Title'}}</div>
              <div class="preview-desc">{{ogDesc||'Share description goes here...'}}</div>
            </div>
          </div>
          <div class="section-title mt">Generated Tags</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copy()">{{copied()?'✓':'📋'}} {{copied()?'Copied':'Copy'}}</button>
            <pre class="code-block">{{generateCode()}}</pre>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.section-title.mt{margin-top:1rem}.form-col{display:flex;flex-direction:column;gap:.5rem}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:flex;justify-content:space-between}.len{font-weight:700}.len.warn{color:#dc2626}.inp,.sel{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}.inp:focus{border-color:#2563eb}.ta{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;resize:vertical;outline:none;font-family:inherit;width:100%;box-sizing:border-box}.preview-col{display:flex;flex-direction:column;gap:.75rem}.fb-preview{border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:white}.preview-img-wrap{height:160px;display:flex;align-items:center;justify-content:center;overflow:hidden}.preview-img{width:100%;height:100%;object-fit:cover}.no-img{color:#9ca3af;font-size:.8rem;text-align:center;line-height:1.5}.preview-meta{padding:.75rem 1rem;background:#f8f8f8}.preview-domain{font-size:.68rem;color:#606770;text-transform:uppercase;margin-bottom:.2rem}.preview-title{font-size:.9rem;font-weight:700;color:#1c1e21;margin-bottom:.2rem;line-height:1.3}.preview-desc{font-size:.78rem;color:#606770;line-height:1.4}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.72rem;line-height:1.6;white-space:pre-wrap;margin:0;max-height:280px;overflow:auto}`]
})
export class OgGeneratorComponent {
  ogTitle=''; ogDesc=''; ogImage=''; ogUrl=''; ogType='website'; siteName=''; locale='en_US';
  publishedTime=''; articleAuthor=''; section=''; imgError=false; copied=signal(false);
  getDomain(){try{return new URL(this.ogUrl||'https://example.com').hostname;}catch{return 'example.com';}}
  generateCode(){
    const lines=[
      `<meta property="og:title" content="${this.ogTitle}">`,
      `<meta property="og:description" content="${this.ogDesc}">`,
      `<meta property="og:type" content="${this.ogType}">`,
      this.ogUrl?`<meta property="og:url" content="${this.ogUrl}">`:null,
      this.ogImage?`<meta property="og:image" content="${this.ogImage}">`:null,
      this.ogImage?`<meta property="og:image:width" content="1200">`:null,
      this.ogImage?`<meta property="og:image:height" content="630">`:null,
      this.siteName?`<meta property="og:site_name" content="${this.siteName}">`:null,
      this.locale?`<meta property="og:locale" content="${this.locale}">`:null,
      this.ogType==='article'&&this.publishedTime?`<meta property="article:published_time" content="${this.publishedTime}">`:null,
      this.ogType==='article'&&this.articleAuthor?`<meta property="article:author" content="${this.articleAuthor}">`:null,
      this.ogType==='article'&&this.section?`<meta property="article:section" content="${this.section}">`:null,
    ];
    return lines.filter(l=>l!==null).join('\n');
  }
  copy(){navigator.clipboard.writeText(this.generateCode());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
}

// ─── 7. Twitter Card Generator ────────────────────────────────────────────────
@Component({
  selector: 'app-twitter-card-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="two-col">
        <div class="form-col">
          <div class="section-title">Twitter Card Tags</div>
          <div class="field"><label>Card Type</label>
            <select [(ngModel)]="cardType" class="sel">
              <option value="summary">Summary (Small image)</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App Card</option>
              <option value="player">Player Card</option>
            </select>
          </div>
          <div class="field"><label>twitter:title <span class="len" [class.warn]="twTitle.length>70">{{twTitle.length}}/70</span></label><input [(ngModel)]="twTitle" maxlength="70" placeholder="Card title..." class="inp" /></div>
          <div class="field"><label>twitter:description <span class="len" [class.warn]="twDesc.length>200">{{twDesc.length}}/200</span></label><textarea [(ngModel)]="twDesc" maxlength="200" rows="3" class="ta" placeholder="Card description..."></textarea></div>
          <div class="field"><label>twitter:image URL</label><input [(ngModel)]="twImage" placeholder="https://example.com/card.jpg" class="inp" /></div>
          <div class="field"><label>twitter:image:alt</label><input [(ngModel)]="twImageAlt" placeholder="Image description for accessibility" class="inp" /></div>
          <div class="field"><label>twitter:site &#64;handle</label><input [(ngModel)]="twSite" placeholder="@yoursite" class="inp" /></div>
          <div class="field"><label>twitter:creator &#64;handle</label><input [(ngModel)]="twCreator" placeholder="@author" class="inp" /></div>
        </div>
        <div class="preview-col">
          <div class="section-title">Twitter Preview</div>
          <div class="tw-preview" [class.large]="cardType==='summary_large_image'">
            <div class="tw-img-wrap" *ngIf="twImage">
              <img [src]="twImage" class="tw-img" [class.large]="cardType==='summary_large_image'" alt="Preview" (error)="imgErr=true" />
            </div>
            <div class="tw-no-img" *ngIf="!twImage">{{cardType==='summary_large_image'?'1200×628 recommended':'400×400 recommended'}}</div>
            <div class="tw-content">
              <div class="tw-title">{{twTitle||'Card Title'}}</div>
              <div class="tw-desc">{{twDesc||'Card description...'}}</div>
              <div class="tw-domain">{{twSite||'example.com'}}</div>
            </div>
          </div>
          <div class="section-title mt">Generated Tags</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copy()">{{copied()?'✓ Copied':'📋 Copy'}}</button>
            <pre class="code-block">{{generateCode()}}</pre>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.section-title.mt{margin-top:1rem}.form-col,.preview-col{display:flex;flex-direction:column;gap:.6rem}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:flex;justify-content:space-between}.len{font-weight:700}.len.warn{color:#dc2626}.inp,.sel{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}.inp:focus{border-color:#2563eb}.ta{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;resize:vertical;outline:none;font-family:inherit;width:100%;box-sizing:border-box}.tw-preview{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:white}.tw-img-wrap{overflow:hidden;height:130px;background:#f3f4f6}.tw-img{width:100%;height:100%;object-fit:cover}.tw-img.large{height:180px}.tw-no-img{height:100px;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#9ca3af;background:#f3f4f6}.tw-content{padding:.75rem}.tw-title{font-size:.875rem;font-weight:700;color:#0f1419;margin-bottom:.2rem;line-height:1.3}.tw-desc{font-size:.78rem;color:#536471;margin-bottom:.4rem;line-height:1.4}.tw-domain{font-size:.72rem;color:#536471}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.72rem;line-height:1.6;white-space:pre-wrap;margin:0;max-height:280px;overflow:auto}`]
})
export class TwitterCardGeneratorComponent {
  cardType='summary_large_image'; twTitle=''; twDesc=''; twImage=''; twImageAlt=''; twSite=''; twCreator='';
  imgErr=false; copied=signal(false);
  generateCode(){
    const lines=[
      `<meta name="twitter:card" content="${this.cardType}">`,
      `<meta name="twitter:title" content="${this.twTitle}">`,
      `<meta name="twitter:description" content="${this.twDesc}">`,
      this.twImage?`<meta name="twitter:image" content="${this.twImage}">`:null,
      this.twImageAlt?`<meta name="twitter:image:alt" content="${this.twImageAlt}">`:null,
      this.twSite?`<meta name="twitter:site" content="${this.twSite}">`:null,
      this.twCreator?`<meta name="twitter:creator" content="${this.twCreator}">`:null,
    ];
    return lines.filter(l=>l!==null).join('\n');
  }
  copy(){navigator.clipboard.writeText(this.generateCode());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
}

// ─── 8. Page Speed Analyzer ───────────────────────────────────────────────────
@Component({
  selector: 'app-page-speed-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="hero-section">
        <div class="section-title">Page Speed Checklist</div>
        <p class="hero-desc">Use this comprehensive checklist to optimize your website's Core Web Vitals and page speed performance. Check each item to track your progress.</p>
        <div class="url-test">
          <input [(ngModel)]="testUrl" placeholder="https://yoursite.com" class="url-inp" />
          <a [href]="'https://pagespeed.web.dev/report?url='+encodeUrl()" target="_blank" class="btn-test" *ngIf="testUrl">🚀 Test on PageSpeed Insights</a>
        </div>
      </div>
      <div class="score-summary">
        <div class="score-card">
          <div class="sc-num" [class]="getScoreClass()">{{getScore()}}</div>
          <div class="sc-label">Items Complete</div>
        </div>
        <div class="score-card">
          <div class="sc-num perf">{{getRemainingCount()}}</div>
          <div class="sc-label">Remaining</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" [style.width.%]="getProgressPct()"></div></div>
      </div>
      <div class="checklist-sections">
        <div class="cl-section" *ngFor="let section of checklist">
          <div class="cl-section-title">{{section.icon}} {{section.name}}</div>
          <div class="cl-item" *ngFor="let item of section.items" [class.checked]="item.checked" (click)="item.checked=!item.checked">
            <div class="cl-check">{{item.checked?'✅':'⬜'}}</div>
            <div class="cl-content">
              <div class="cl-label">{{item.label}}</div>
              <div class="cl-desc">{{item.desc}}</div>
            </div>
            <div class="cl-impact" [class]="'impact-'+item.impact">{{item.impact}}</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.hero-section{margin-bottom:1.5rem}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.5rem}.hero-desc{font-size:.875rem;color:#6b7280;line-height:1.6;margin-bottom:1rem}.url-test{display:flex;gap:.5rem;flex-wrap:wrap}.url-inp{flex:1;min-width:200px;padding:.6rem .85rem;border:1px solid #d1d5db;border-radius:9px;font-size:.875rem;outline:none}.url-inp:focus{border-color:#2563eb}.btn-test{padding:.6rem 1.25rem;background:#2563eb;color:white;border-radius:9px;text-decoration:none;font-weight:700;font-size:.85rem;white-space:nowrap}.score-summary{display:flex;align-items:center;gap:1rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;flex-wrap:wrap}.score-card{text-align:center;min-width:70px}.sc-num{font-size:1.75rem;font-weight:900;color:#6b7280}.sc-num.good{color:#059669}.sc-num.perf{color:#dc2626}.sc-label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}.progress-bar{flex:1;min-width:150px;height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden}.progress-fill{height:100%;background:#059669;border-radius:99px;transition:width .4s}.checklist-sections{display:flex;flex-direction:column;gap:1.25rem}.cl-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.cl-section-title{font-size:.82rem;font-weight:800;padding:.75rem 1rem;background:white;border-bottom:1px solid #e5e7eb}.cl-item{display:flex;align-items:flex-start;gap:.75rem;padding:.75rem 1rem;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background .12s}.cl-item:last-child{border-bottom:none}.cl-item:hover{background:#f0f9ff}.cl-item.checked{background:#ecfdf5}.cl-check{font-size:1.1rem;flex-shrink:0;margin-top:.05rem}.cl-content{flex:1}.cl-label{font-size:.83rem;font-weight:600;color:#111827;margin-bottom:.15rem}.cl-desc{font-size:.75rem;color:#6b7280;line-height:1.4}.cl-impact{font-size:.65rem;font-weight:800;text-transform:uppercase;padding:.15rem .45rem;border-radius:99px;white-space:nowrap;align-self:flex-start;margin-top:.1rem}.impact-High{background:#fef2f2;color:#dc2626}.impact-Medium{background:#fffbeb;color:#d97706}.impact-Low{background:#f0fdf4;color:#059669}`]
})
export class PageSpeedAnalyzerComponent {
  testUrl='';
  encodeUrl(){return encodeURIComponent(this.testUrl);}
  getScore(){return this.checklist.reduce((s,sec)=>s+sec.items.filter(i=>i.checked).length,0);}
  getRemainingCount(){return this.checklist.reduce((s,sec)=>s+sec.items.filter(i=>!i.checked).length,0);}
  getProgressPct(){const total=this.checklist.reduce((s,sec)=>s+sec.items.length,0);return total?Math.round(this.getScore()/total*100):0;}
  getScoreClass(){const p=this.getProgressPct();return p>=80?'sc-num good':p>=50?'sc-num':'sc-num';}
  checklist=[
    {name:'Images',icon:'🖼️',items:[
      {label:'Compress all images',desc:'Use WebP format. Compress JPEG/PNG with 80% quality.',impact:'High',checked:false},
      {label:'Serve images in next-gen formats',desc:'Use WebP or AVIF instead of JPEG/PNG.',impact:'High',checked:false},
      {label:'Lazy-load images below the fold',desc:'Add loading="lazy" attribute to images below viewport.',impact:'Medium',checked:false},
      {label:'Set explicit width/height on images',desc:'Prevents layout shift (CLS). Add width and height attributes.',impact:'Medium',checked:false},
      {label:'Use responsive images',desc:'Use srcset for different screen sizes to avoid oversized images.',impact:'Medium',checked:false},
    ]},
    {name:'JavaScript',icon:'⚡',items:[
      {label:'Minify JavaScript files',desc:'Remove whitespace, comments, and shorten variables.',impact:'High',checked:false},
      {label:'Remove unused JavaScript',desc:'Use code splitting to only load JS needed for current page.',impact:'High',checked:false},
      {label:'Defer non-critical scripts',desc:'Use defer or async attributes on non-essential script tags.',impact:'High',checked:false},
      {label:'Avoid render-blocking scripts',desc:'Move scripts to end of body or use defer.',impact:'Medium',checked:false},
    ]},
    {name:'CSS',icon:'🎨',items:[
      {label:'Minify CSS',desc:'Remove whitespace, comments, and redundant rules.',impact:'Medium',checked:false},
      {label:'Remove unused CSS',desc:'Use PurgeCSS or similar tools to strip unused styles.',impact:'Medium',checked:false},
      {label:'Inline critical CSS',desc:'Inline above-the-fold CSS to avoid render-blocking.',impact:'High',checked:false},
    ]},
    {name:'Server & Caching',icon:'🔧',items:[
      {label:'Enable GZIP/Brotli compression',desc:'Reduces text file transfer sizes by 60–80%.',impact:'High',checked:false},
      {label:'Set cache-control headers',desc:'Cache static assets for at least 1 year with versioning.',impact:'High',checked:false},
      {label:'Use a CDN',desc:'Serve assets from servers geographically close to users.',impact:'High',checked:false},
      {label:'Enable HTTP/2 or HTTP/3',desc:'Allows parallel requests, reducing connection overhead.',impact:'Medium',checked:false},
    ]},
    {name:'Core Web Vitals',icon:'📊',items:[
      {label:'Optimize LCP (Largest Contentful Paint)',desc:'LCP should be under 2.5s. Optimize hero images and server response time.',impact:'High',checked:false},
      {label:'Minimize CLS (Cumulative Layout Shift)',desc:'CLS should be under 0.1. Set dimensions on images, ads, embeds.',impact:'High',checked:false},
      {label:'Reduce INP (Interaction to Next Paint)',desc:'INP should be under 200ms. Reduce main thread blocking.',impact:'High',checked:false},
      {label:'Reduce Time to First Byte (TTFB)',desc:'TTFB should be under 600ms. Optimize server response time.',impact:'Medium',checked:false},
    ]},
  ];
}

// ─── 9. JSON-LD Generator ─────────────────────────────────────────────────────
@Component({
  selector: 'app-jsonld-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="type-tabs">
        <button *ngFor="let t of schemaTypes" [class.active]="schemaType()===t.key" (click)="schemaType.set(t.key);generate()">{{t.icon}} {{t.label}}</button>
      </div>
      <div class="two-col">
        <div class="form-col">
          <!-- Organization -->
          <ng-container *ngIf="schemaType()==='organization'">
            <div class="field"><label>Organization Name</label><input [(ngModel)]="org.name" (ngModelChange)="generate()" placeholder="Acme Corp" class="inp" /></div>
            <div class="field"><label>URL</label><input [(ngModel)]="org.url" (ngModelChange)="generate()" placeholder="https://acme.com" class="inp" /></div>
            <div class="field"><label>Logo URL</label><input [(ngModel)]="org.logo" (ngModelChange)="generate()" placeholder="https://acme.com/logo.png" class="inp" /></div>
            <div class="field"><label>Phone</label><input [(ngModel)]="org.phone" (ngModelChange)="generate()" placeholder="+1-800-123-4567" class="inp" /></div>
            <div class="field"><label>Email</label><input [(ngModel)]="org.email" (ngModelChange)="generate()" placeholder="info@acme.com" class="inp" /></div>
            <div class="field"><label>Address</label><input [(ngModel)]="org.address" (ngModelChange)="generate()" placeholder="123 Main St, City, State, Country" class="inp" /></div>
            <div class="field"><label>Social Profiles (one per line)</label><textarea [(ngModel)]="org.social" (ngModelChange)="generate()" rows="3" placeholder="https://twitter.com/acme&#10;https://linkedin.com/company/acme" class="ta"></textarea></div>
          </ng-container>
          <!-- Article -->
          <ng-container *ngIf="schemaType()==='article'">
            <div class="field"><label>Headline</label><input [(ngModel)]="art.headline" (ngModelChange)="generate()" placeholder="Article title" class="inp" /></div>
            <div class="field"><label>Author Name</label><input [(ngModel)]="art.author" (ngModelChange)="generate()" placeholder="John Doe" class="inp" /></div>
            <div class="field"><label>Publisher</label><input [(ngModel)]="art.publisher" (ngModelChange)="generate()" placeholder="Website Name" class="inp" /></div>
            <div class="field"><label>Published Date</label><input type="date" [(ngModel)]="art.datePublished" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Modified Date</label><input type="date" [(ngModel)]="art.dateModified" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Image URL</label><input [(ngModel)]="art.image" (ngModelChange)="generate()" placeholder="https://example.com/article.jpg" class="inp" /></div>
            <div class="field"><label>URL</label><input [(ngModel)]="art.url" (ngModelChange)="generate()" placeholder="https://example.com/article" class="inp" /></div>
            <div class="field"><label>Description</label><textarea [(ngModel)]="art.description" (ngModelChange)="generate()" rows="2" class="ta" placeholder="Article summary..."></textarea></div>
          </ng-container>
          <!-- Product -->
          <ng-container *ngIf="schemaType()==='product'">
            <div class="field"><label>Product Name</label><input [(ngModel)]="prod.name" (ngModelChange)="generate()" placeholder="Product Name" class="inp" /></div>
            <div class="field"><label>Description</label><textarea [(ngModel)]="prod.description" (ngModelChange)="generate()" rows="2" class="ta"></textarea></div>
            <div class="field"><label>Image URL</label><input [(ngModel)]="prod.image" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Brand</label><input [(ngModel)]="prod.brand" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>SKU</label><input [(ngModel)]="prod.sku" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Price</label><input [(ngModel)]="prod.price" (ngModelChange)="generate()" placeholder="299.99" class="inp" /></div>
            <div class="field"><label>Currency</label><input [(ngModel)]="prod.currency" (ngModelChange)="generate()" placeholder="INR" class="inp" /></div>
            <div class="field"><label>Availability</label><select [(ngModel)]="prod.availability" (ngModelChange)="generate()" class="sel"><option value="InStock">In Stock</option><option value="OutOfStock">Out of Stock</option><option value="PreOrder">Pre-Order</option></select></div>
          </ng-container>
          <!-- FAQ -->
          <ng-container *ngIf="schemaType()==='faq'">
            <div class="faq-items">
              <div class="faq-item" *ngFor="let q of faqs(); let i=index">
                <div class="faq-hdr"><span>Q{{i+1}}</span><button class="del-btn" (click)="removeFaq(i)">✕</button></div>
                <div class="field"><label>Question</label><input [(ngModel)]="q.q" (ngModelChange)="generate()" placeholder="What is...?" class="inp" /></div>
                <div class="field"><label>Answer</label><textarea [(ngModel)]="q.a" (ngModelChange)="generate()" rows="2" class="ta"></textarea></div>
              </div>
            </div>
            <button class="btn-add" (click)="addFaq()">+ Add FAQ</button>
          </ng-container>
          <!-- BreadcrumbList -->
          <ng-container *ngIf="schemaType()==='breadcrumb'">
            <div class="faq-items">
              <div class="faq-item" *ngFor="let b of breadcrumbs(); let i=index">
                <div class="faq-hdr"><span>Item {{i+1}}</span><button class="del-btn" (click)="removeBreadcrumb(i)">✕</button></div>
                <div class="field"><label>Name</label><input [(ngModel)]="b.name" (ngModelChange)="generate()" placeholder="Home" class="inp" /></div>
                <div class="field"><label>URL</label><input [(ngModel)]="b.url" (ngModelChange)="generate()" placeholder="https://example.com" class="inp" /></div>
              </div>
            </div>
            <button class="btn-add" (click)="addBreadcrumb()">+ Add Item</button>
          </ng-container>
        </div>
        <div class="output-col">
          <div class="section-title">Generated JSON-LD</div>
          <div class="code-wrap">
            <button class="copy-btn" (click)="copy()">{{copied()?'✓ Copied':'📋 Copy'}}</button>
            <pre class="code-block">{{output()}}</pre>
          </div>
          <div class="tips-box">
            <div class="tip-title">📌 How to use</div>
            <div class="tip">Paste inside a &lt;script type="application/ld+json"&gt; tag in your HTML &lt;head&gt;</div>
            <div class="tip">Test with Google's Rich Results Test tool</div>
            <div class="tip">Valid structured data can get rich snippets in search results</div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.type-tabs{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1.25rem;background:#f3f4f6;border-radius:10px;padding:.35rem}.type-tabs button{flex:1;padding:.4rem .5rem;border:none;background:none;border-radius:7px;font-size:.75rem;font-weight:600;cursor:pointer;color:#6b7280;transition:all .15s;white-space:nowrap}.type-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.two-col{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.75rem}.form-col,.output-col{display:flex;flex-direction:column;gap:.5rem}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}.inp,.sel{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}.inp:focus{border-color:#2563eb}.ta{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;resize:vertical;outline:none;font-family:inherit;width:100%;box-sizing:border-box}.faq-items{display:flex;flex-direction:column;gap:.75rem}.faq-item{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem}.faq-hdr{display:flex;justify-content:space-between;align-items:center;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:.5rem}.del-btn{background:none;border:none;color:#9ca3af;cursor:pointer}.del-btn:hover{color:#dc2626}.btn-add{width:100%;padding:.55rem;border:2px dashed #d1d5db;border-radius:8px;background:transparent;cursor:pointer;font-size:.82rem;font-weight:700;color:#6b7280}.btn-add:hover{border-color:#2563eb;color:#2563eb}.code-wrap{position:relative}.copy-btn{position:absolute;top:.5rem;right:.5rem;padding:.3rem .75rem;background:#2563eb;color:white;border:none;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;z-index:1}.code-block{background:#1e293b;color:#a3e635;border-radius:10px;padding:1rem;font-size:.72rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin:0;max-height:400px;overflow:auto}.tips-box{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.85rem}.tip-title{font-size:.75rem;font-weight:800;color:#92400e;margin-bottom:.5rem}.tip{font-size:.75rem;color:#78350f;padding:.2rem 0;padding-left:.75rem;position:relative}.tip::before{content:'•';position:absolute;left:0}`]
})
export class JsonLdGeneratorComponent implements OnInit {
  schemaTypes=[{key:'organization',label:'Organization',icon:'🏢'},{key:'article',label:'Article',icon:'📰'},{key:'product',label:'Product',icon:'🛒'},{key:'faq',label:'FAQ',icon:'❓'},{key:'breadcrumb',label:'Breadcrumb',icon:'🔗'}];
  schemaType=signal('organization'); output=signal(''); copied=signal(false);
  org={name:'',url:'',logo:'',phone:'',email:'',address:'',social:''};
  art={headline:'',author:'',publisher:'',datePublished:'',dateModified:'',image:'',url:'',description:''};
  prod={name:'',description:'',image:'',brand:'',sku:'',price:'',currency:'INR',availability:'InStock'};
  faqs=signal([{q:'',a:''}]); breadcrumbs=signal([{name:'Home',url:'https://example.com'},{name:'Category',url:''},{name:'Page',url:''}]);
  ngOnInit(){this.generate();}
  addFaq(){this.faqs.update(f=>[...f,{q:'',a:''}]);this.generate();}
  removeFaq(i:number){this.faqs.update(f=>f.filter((_,idx)=>idx!==i));this.generate();}
  addBreadcrumb(){this.breadcrumbs.update(b=>[...b,{name:'',url:''}]);this.generate();}
  removeBreadcrumb(i:number){this.breadcrumbs.update(b=>b.filter((_,idx)=>idx!==i));this.generate();}
   generate() {
    let schema: any = {};

    switch (this.schemaType()) {

      case 'organization':
        schema = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: this.org.name,
          url: this.org.url,
          logo: this.org.logo
            ? { '@type': 'ImageObject', url: this.org.logo }
            : undefined,
          telephone: this.org.phone || undefined,
          email: this.org.email || undefined,
          address: this.org.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: this.org.address
              }
            : undefined,
          sameAs: this.org.social
            ? this.org.social.split('\n').filter(s => s.trim())
            : undefined
        };
        break;

      case 'article':
        schema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: this.art.headline,
          author: this.art.author
            ? { '@type': 'Person', name: this.art.author }
            : undefined,
          publisher: this.art.publisher
            ? { '@type': 'Organization', name: this.art.publisher }
            : undefined,
          datePublished: this.art.datePublished || undefined,
          dateModified: this.art.dateModified || undefined,
          image: this.art.image || undefined,
          url: this.art.url || undefined,
          description: this.art.description || undefined
        };
        break;

      case 'product':
        schema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: this.prod.name,
          description: this.prod.description,
          image: this.prod.image || undefined,
          brand: this.prod.brand
            ? { '@type': 'Brand', name: this.prod.brand }
            : undefined,
          sku: this.prod.sku || undefined,
          offers: {
            '@type': 'Offer',
            price: this.prod.price,
            priceCurrency: this.prod.currency,
            availability: `https://schema.org/${this.prod.availability}`
          }
        };
        break;

      case 'faq':
        schema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs()
            .filter(q => q.q && q.a)
            .map(q => ({
              '@type': 'Question',
              name: q.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: q.a
              }
            }))
        };
        break;

      case 'breadcrumb':
        schema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: this.breadcrumbs()
            .filter(b => b.name && b.url)
            .map((b, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: b.name,
              item: b.url
            }))
        };
        break;
    }

    // Remove undefined values cleanly
    this.output.set(
      JSON.stringify(schema, (key, value) => value === undefined ? undefined : value, 2)
    );
  }
  copy(){navigator.clipboard.writeText(this.output());this.copied.set(true);setTimeout(()=>this.copied.set(false),2000);}
}

// ─── 10. Title & Description Analyzer ────────────────────────────────────────
@Component({
  selector: 'app-title-description-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="analyzer-grid">
        <div class="input-section">
          <div class="section-title">Title Tag Analyzer</div>
          <textarea [(ngModel)]="title" (ngModelChange)="analyze()" rows="2" placeholder="Enter your page title tag..." class="big-inp"></textarea>
          <div class="char-bar">
            <div class="char-fill" [style.width.%]="getTitlePct()" [class]="getTitleClass()"></div>
          </div>
          <div class="char-info" [class]="getTitleClass()">{{title.length}} / 60 characters {{getTitleMsg()}}</div>
          <div class="section-title mt">Meta Description Analyzer</div>
          <textarea [(ngModel)]="description" (ngModelChange)="analyze()" rows="3" placeholder="Enter your meta description..." class="big-inp"></textarea>
          <div class="char-bar">
            <div class="char-fill" [style.width.%]="getDescPct()" [class]="getDescClass()"></div>
          </div>
          <div class="char-info" [class]="getDescClass()">{{description.length}} / 160 characters {{getDescMsg()}}</div>
          <div class="field mt"><label>Target Keyword</label><input [(ngModel)]="keyword" (ngModelChange)="analyze()" placeholder="e.g. best SEO tools" class="inp" /></div>
        </div>
        <div class="preview-section">
          <div class="section-title">Google SERP Preview</div>
          <div class="serp-box">
            <div class="serp-url">https://example.com/page</div>
            <div class="serp-title" [class.too-long]="title.length>60">{{getDisplayTitle()}}</div>
            <div class="serp-desc" [class.too-long]="description.length>160">{{getDisplayDesc()}}</div>
          </div>
          <div class="section-title mt">Analysis Results</div>
          <div class="analysis-items">
            <div class="analysis-item" *ngFor="let a of getAnalysis()" [class]="'analysis-'+a.type">
              <div class="ai-icon">{{a.icon}}</div>
              <div class="ai-body"><div class="ai-label">{{a.label}}</div><div class="ai-desc">{{a.desc}}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
  styles:[`.tool-wrap{padding:1.25rem}.analyzer-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}@media(max-width:768px){.analyzer-grid{grid-template-columns:1fr}}.section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.5rem}.section-title.mt{margin-top:1rem}.input-section,.preview-section{display:flex;flex-direction:column;gap:.4rem}.big-inp{width:100%;padding:.75rem;border:1px solid #d1d5db;border-radius:9px;font-size:.9rem;resize:vertical;outline:none;font-family:inherit;box-sizing:border-box;line-height:1.5}.big-inp:focus{border-color:#2563eb}.char-bar{height:6px;background:#f3f4f6;border-radius:99px;overflow:hidden}.char-fill{height:100%;border-radius:99px;transition:width .2s,background .2s}.char-fill.good{background:#059669}.char-fill.warn{background:#d97706}.char-fill.bad{background:#dc2626}.char-info{font-size:.72rem;font-weight:700}.char-info.good{color:#059669}.char-info.warn{color:#d97706}.char-info.bad{color:#dc2626}.field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}.inp{padding:.5rem .7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}.inp:focus{border-color:#2563eb}.serp-box{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.25rem}.serp-url{font-size:.73rem;color:#202124;margin-bottom:.2rem}.serp-title{font-size:1rem;color:#1a0dab;margin-bottom:.25rem;cursor:pointer;line-height:1.3}.serp-title:hover{text-decoration:underline}.serp-title.too-long{color:#dc2626}.serp-desc{font-size:.8rem;color:#4d5156;line-height:1.5}.serp-desc.too-long::after{content:'...'}.analysis-items{display:flex;flex-direction:column;gap:.45rem}.analysis-item{display:flex;gap:.6rem;padding:.65rem .85rem;border-radius:8px;align-items:flex-start}.analysis-pass{background:#ecfdf5;border:1px solid #a7f3d0}.analysis-fail{background:#fef2f2;border:1px solid #fecaca}.analysis-warn{background:#fffbeb;border:1px solid #fde68a}.analysis-info{background:#eff6ff;border:1px solid #bfdbfe}.ai-icon{font-size:1rem;flex-shrink:0;margin-top:.1rem}.ai-label{font-size:.78rem;font-weight:700;margin-bottom:.1rem}.ai-desc{font-size:.72rem;color:#6b7280}`]
})
export class TitleDescriptionAnalyzerComponent {
  title=''; description=''; keyword='';
  getTitlePct(){return Math.min(100,Math.round(this.title.length/60*100));}
  getTitleClass(){const l=this.title.length;if(l===0)return'';if(l<=60)return'good';if(l<=70)return'warn';return'bad';}
  getTitleMsg(){const l=this.title.length;if(l===0)return'';if(l<=60)return'✓ Good length';if(l<=70)return'⚠ Slightly long — may be truncated';return'✗ Too long — will be truncated';}
  getDescPct(){return Math.min(100,Math.round(this.description.length/160*100));}
  getDescClass(){const l=this.description.length;if(l===0)return'';if(l<=160)return'good';if(l<=180)return'warn';return'bad';}
  getDescMsg(){const l=this.description.length;if(l===0)return'';if(l<=160)return'✓ Good length';if(l<=180)return'⚠ Slightly long';return'✗ Too long — will be truncated';}
  getDisplayTitle(){return this.title.length>60?this.title.slice(0,57)+'...':this.title||'Page Title';}
  getDisplayDesc(){return this.description.length>160?this.description.slice(0,157)+'...':this.description||'Meta description will appear here in search results...';}
  getAnalysis(){
    const items=[];const kw=this.keyword.toLowerCase();const t=this.title.toLowerCase();const d=this.description.toLowerCase();
    items.push(this.title.length>0&&this.title.length<=60?{type:'pass',icon:'✅',label:'Title length OK',desc:`${this.title.length} characters (recommended: 50–60)`}:this.title.length>60?{type:'fail',icon:'❌',label:'Title too long',desc:`${this.title.length} chars. Shorten to under 60.`}:{type:'warn',icon:'⚠️',label:'Title is empty',desc:'Every page needs a unique title tag.'});
    items.push(this.description.length>0&&this.description.length<=160?{type:'pass',icon:'✅',label:'Description length OK',desc:`${this.description.length} characters (recommended: 140–160)`}:this.description.length>160?{type:'warn',icon:'⚠️',label:'Description too long',desc:`${this.description.length} chars. Keep under 160.`}:{type:'warn',icon:'⚠️',label:'Description empty',desc:'Add a meta description to improve CTR.'});
    if(kw){
      items.push(t.includes(kw)?{type:'pass',icon:'✅',label:'Keyword in title',desc:`"${this.keyword}" found in title tag — good for SEO.`}:{type:'fail',icon:'❌',label:'Keyword missing from title',desc:`Add "${this.keyword}" to your title tag for better SEO.`});
      items.push(d.includes(kw)?{type:'pass',icon:'✅',label:'Keyword in description',desc:`"${this.keyword}" found in description.`}:{type:'warn',icon:'⚠️',label:'Keyword missing from description',desc:`Consider adding "${this.keyword}" to your description.`});
      items.push(t.startsWith(kw)?{type:'pass',icon:'✅',label:'Keyword at title start',desc:'Keyword appears at the beginning of title — stronger SEO signal.'}:{type:'info',icon:'💡',label:'Keyword placement',desc:'For maximum SEO impact, place keyword at the beginning of the title.'});
    }
    items.push(this.title===this.title.toLowerCase()?{type:'warn',icon:'⚠️',label:'Title capitalization',desc:'Consider using Title Case for better click-through rates.'}:{type:'pass',icon:'✅',label:'Title capitalized',desc:'Good use of capitalization.'});
    return items;
  }
  analyze(){}
}


// ─── schema-markup-generator.component.ts ───────────────────────────────────
@Component({
  selector: 'app-schema-markup-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="schema-type-row">
        <button *ngFor="let t of schemaTypes" [class.active]="selectedType()===t.key" (click)="selectedType.set(t.key);generate()" class="type-btn">
          <span class="ti">{{t.icon}}</span> {{t.label}}
        </button>
      </div>

      <div class="two-col-layout">
        <div class="inputs-col">
          <!-- Article -->
          <div *ngIf="selectedType()==='article'" class="fields-section">
            <div class="field"><label>Headline</label><input [(ngModel)]="art.headline" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Author Name</label><input [(ngModel)]="art.author" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Date Published</label><input type="date" [(ngModel)]="art.datePublished" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Date Modified</label><input type="date" [(ngModel)]="art.dateModified" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Description</label><textarea [(ngModel)]="art.description" (ngModelChange)="generate()" class="textarea" rows="2"></textarea></div>
            <div class="field"><label>Publisher (Organization)</label><input [(ngModel)]="art.publisher" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Publisher Logo URL</label><input [(ngModel)]="art.logoUrl" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Image URL</label><input [(ngModel)]="art.imageUrl" (ngModelChange)="generate()" class="inp" /></div>
          </div>

          <!-- Product -->
          <div *ngIf="selectedType()==='product'" class="fields-section">
            <div class="field"><label>Product Name</label><input [(ngModel)]="prod.name" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Description</label><textarea [(ngModel)]="prod.description" (ngModelChange)="generate()" class="textarea" rows="2"></textarea></div>
            <div class="field"><label>Brand</label><input [(ngModel)]="prod.brand" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>SKU</label><input [(ngModel)]="prod.sku" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Price</label><input [(ngModel)]="prod.price" (ngModelChange)="generate()" class="inp" type="number" /></div>
            <div class="field"><label>Currency</label><input [(ngModel)]="prod.currency" (ngModelChange)="generate()" class="inp" placeholder="INR" /></div>
            <div class="field"><label>Availability</label>
              <select [(ngModel)]="prod.availability" (ngModelChange)="generate()" class="sel">
                <option value="InStock">In Stock</option><option value="OutOfStock">Out of Stock</option><option value="PreOrder">Pre-Order</option>
              </select></div>
            <div class="field"><label>Rating (1–5)</label><input type="number" [(ngModel)]="prod.rating" (ngModelChange)="generate()" class="inp" min="1" max="5" step="0.1" /></div>
            <div class="field"><label>Review Count</label><input type="number" [(ngModel)]="prod.reviewCount" (ngModelChange)="generate()" class="inp" /></div>
          </div>

          <!-- FAQ -->
          <div *ngIf="selectedType()==='faq'" class="fields-section">
            <div class="faq-item" *ngFor="let f of faqs; let i = index">
              <div class="faq-num">Q{{i+1}}</div>
              <div class="faq-fields">
                <input [(ngModel)]="f.q" (ngModelChange)="generate()" class="inp" placeholder="Question" />
                <textarea [(ngModel)]="f.a" (ngModelChange)="generate()" class="textarea mt-xs" rows="2" placeholder="Answer"></textarea>
              </div>
              <button class="remove-btn" *ngIf="faqs.length>1" (click)="faqs.splice(i,1);generate()">✕</button>
            </div>
            <button class="btn-add-faq" (click)="faqs.push({q:'',a:''});generate()">+ Add FAQ</button>
          </div>

          <!-- BreadcrumbList -->
          <div *ngIf="selectedType()==='breadcrumb'" class="fields-section">
            <div class="bc-item" *ngFor="let b of breadcrumbs; let i = index">
              <span class="bc-pos">{{i+1}}</span>
              <input [(ngModel)]="b.name" (ngModelChange)="generate()" class="inp" placeholder="Page Name" />
              <input [(ngModel)]="b.url" (ngModelChange)="generate()" class="inp" placeholder="https://..." />
              <button class="remove-btn" *ngIf="breadcrumbs.length>1" (click)="breadcrumbs.splice(i,1);generate()">✕</button>
            </div>
            <button class="btn-add-faq" (click)="breadcrumbs.push({name:'',url:''});generate()">+ Add Item</button>
          </div>

          <!-- Organization -->
          <div *ngIf="selectedType()==='organization'" class="fields-section">
            <div class="field"><label>Organization Name</label><input [(ngModel)]="org.name" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Website URL</label><input [(ngModel)]="org.url" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Logo URL</label><input [(ngModel)]="org.logo" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Description</label><textarea [(ngModel)]="org.description" (ngModelChange)="generate()" class="textarea" rows="2"></textarea></div>
            <div class="field"><label>Email</label><input [(ngModel)]="org.email" (ngModelChange)="generate()" class="inp" /></div>
            <div class="field"><label>Telephone</label><input [(ngModel)]="org.phone" (ngModelChange)="generate()" class="inp" /></div>
          </div>
        </div>

        <div class="output-col">
          <div class="section">
            <div class="sec-title">Generated JSON-LD Script
              <span><button class="btn-action" (click)="copy()">📋 Copy</button></span>
            </div>
            <pre class="code-block">{{generated()}}</pre>
          </div>
          <div class="section info-box">
            <div class="sec-title">How to Use</div>
            <div class="ib-text">Copy the generated code and paste it inside your HTML <code>&lt;head&gt;</code> section. Google reads JSON-LD schema even if placed in the body.</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .schema-type-row{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem;background:#f3f4f6;border-radius:8px;padding:.3rem}
    .type-btn{flex:1;min-width:90px;padding:.4rem .5rem;border:none;background:none;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer;color:#6b7280;display:flex;align-items:center;gap:.3rem;justify-content:center}
    .type-btn.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}.ti{font-size:1rem}
    .two-col-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
    @media(max-width:800px){.two-col-layout{grid-template-columns:1fr}}
    .fields-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem}
    .sec-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem;display:flex;justify-content:space-between}
    .field{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.6rem}
    .field label{font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .inp,.sel{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;box-sizing:border-box;outline:none}
    .textarea{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;resize:vertical;box-sizing:border-box;outline:none}.mt-xs{margin-top:.3rem}
    .faq-item{display:flex;gap:.5rem;margin-bottom:.75rem;align-items:flex-start}
    .faq-num{font-size:.72rem;font-weight:700;color:#9ca3af;margin-top:.5rem;min-width:20px}
    .faq-fields{flex:1;display:flex;flex-direction:column;gap:.3rem}
    .bc-item{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem}
    .bc-pos{font-size:.72rem;font-weight:700;color:#9ca3af;min-width:16px}
    .remove-btn{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:5px;padding:.2rem .5rem;cursor:pointer;font-size:.72rem;flex-shrink:0}
    .btn-add-faq{width:100%;padding:.45rem;border:2px dashed #d1d5db;border-radius:7px;background:none;cursor:pointer;font-size:.82rem;font-weight:600;color:#6b7280;margin-top:.5rem}
    .code-block{background:#1e293b;color:#a3e635;border-radius:8px;padding:.85rem;font-size:.68rem;overflow:auto;max-height:400px;white-space:pre;margin:0;font-family:monospace;line-height:1.5}
    .btn-action{background:#2563eb;color:white;border:none;padding:.22rem .65rem;border-radius:5px;cursor:pointer;font-size:.68rem;font-weight:700}
    .info-box .sec-title{margin-bottom:.4rem}
    .ib-text{font-size:.8rem;color:#374151;line-height:1.5}
    .ib-text code{background:#e5e7eb;padding:.1rem .3rem;border-radius:3px;font-size:.78rem}
  `]
})
export class SchemaMarkupGeneratorComponent {
  selectedType=signal('article');
  schemaTypes=[{key:'article',label:'Article',icon:'📰'},{key:'product',label:'Product',icon:'🛒'},{key:'faq',label:'FAQ',icon:'❓'},{key:'breadcrumb',label:'Breadcrumb',icon:'🍞'},{key:'organization',label:'Organization',icon:'🏢'}];
  art={headline:'My Article Title',author:'John Doe',datePublished:new Date().toISOString().slice(0,10),dateModified:new Date().toISOString().slice(0,10),description:'',publisher:'My Site',logoUrl:'',imageUrl:''};
  prod={name:'Product Name',description:'',brand:'My Brand',sku:'SKU001',price:'999',currency:'INR',availability:'InStock',rating:'4.5',reviewCount:'100'};
  faqs=[{q:'What is this?',a:'This is our answer.'},{q:'How does it work?',a:''}];
  breadcrumbs=[{name:'Home',url:'https://example.com'},{name:'Category',url:'https://example.com/category'},{name:'Page',url:'https://example.com/category/page'}];
  org={name:'My Company',url:'https://example.com',logo:'',description:'',email:'',phone:''};
  generated=signal('');

  constructor(){this.generate();}

  generate(){
  let json:any={};

  if(this.selectedType()==='article'){
    json={
      "@context":"https://schema.org",
      "@type":"Article",
      "headline":this.art.headline,
      "author":{"@type":"Person","name":this.art.author},
      "datePublished":this.art.datePublished,
      "dateModified":this.art.dateModified,
      "description":this.art.description,
      "publisher":{
        "@type":"Organization",
        "name":this.art.publisher,
        "logo":{"@type":"ImageObject","url":this.art.logoUrl}
      },
      "image":this.art.imageUrl
    };

  } else if(this.selectedType()==='product'){
    json={
      "@context":"https://schema.org",
      "@type":"Product",
      "name":this.prod.name,
      "description":this.prod.description,
      "brand":{"@type":"Brand","name":this.prod.brand},
      "sku":this.prod.sku,
      "offers":{
        "@type":"Offer",
        "price":this.prod.price,
        "priceCurrency":this.prod.currency,
        "availability":"https://schema.org/"+this.prod.availability
      },
      "aggregateRating":{
        "@type":"AggregateRating",
        "ratingValue":this.prod.rating,
        "reviewCount":this.prod.reviewCount
      }
    };

  } else if(this.selectedType()==='faq'){
    json={
      "@context":"https://schema.org",
      "@type":"FAQPage",
      "mainEntity": this.faqs
        .filter(f => f.q)
        .map(f => ({
          "@type":"Question",
          "name":f.q,
          "acceptedAnswer":{
            "@type":"Answer",
            "text":f.a
          }
        }))
    };

  } else if(this.selectedType()==='breadcrumb'){
    json={
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement":this.breadcrumbs.map((b,i)=>({
        "@type":"ListItem",
        "position":i+1,
        "name":b.name,
        "item":b.url
      }))
    };

  } else if(this.selectedType()==='organization'){
    json={
      "@context":"https://schema.org",
      "@type":"Organization",
      "name":this.org.name,
      "url":this.org.url,
      "logo":this.org.logo,
      "description":this.org.description,
      "contactPoint":{
        "@type":"ContactPoint",
        "email":this.org.email,
        "telephone":this.org.phone
      }
    };
  }

  this.generated.set(
    `<script type="application/ld+json">\n${JSON.stringify(json,null,2)}\n</script>`
  );
}
  copy(){navigator.clipboard.writeText(this.generated());}
}



// ─── open-graph-tester.component.ts ─────────────────────────────────────────
@Component({
  selector: 'app-open-graph-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="input-section">
        <div class="inp-row">
          <input [ngModel]="manualMode() ? '' : url" class="inp" placeholder="Enter URL to fetch OG tags (or fill manually below)" [disabled]="manualMode()" />
          <button class="btn-fetch" (click)="fetchOg()" [disabled]="loading()||manualMode()">{{loading()?'Fetching...':'🔍 Fetch OG Tags'}}</button>
          <button class="btn-manual" [class.active]="manualMode()" (click)="toggleManualMode()">{{manualMode()?'Auto Mode':'Fill Manually'}}</button>
        </div>
        <div class="fetch-note">Note: Fetching live URLs may be blocked by CORS. For best results, fill tags manually below.</div>
      </div>

      <div class="manual-inputs" *ngIf="manualMode()">
        <div class="mi-grid">
          <div class="field"><label>og:title</label><input [(ngModel)]="og.title" (ngModelChange)="updatePreviews()" class="inp" /></div>
          <div class="field"><label>og:description</label><textarea [(ngModel)]="og.description" (ngModelChange)="updatePreviews()" class="textarea" rows="2"></textarea></div>
          <div class="field"><label>og:image URL</label><input [(ngModel)]="og.image" (ngModelChange)="updatePreviews()" class="inp" placeholder="https://example.com/image.jpg" /></div>
          <div class="field"><label>og:url</label><input [(ngModel)]="og.url" (ngModelChange)="updatePreviews()" class="inp" /></div>
          <div class="field"><label>og:site_name</label><input [(ngModel)]="og.siteName" (ngModelChange)="updatePreviews()" class="inp" /></div>
          <div class="field"><label>twitter:card</label>
            <select [(ngModel)]="og.twitterCard" (ngModelChange)="updatePreviews()" class="sel">
              <option value="summary">summary</option><option value="summary_large_image">summary_large_image</option>
            </select></div>
        </div>
      </div>

      <!-- Previews -->
      <div class="previews-grid" *ngIf="og.title||og.description">
        <!-- Facebook -->
        <div class="preview-card">
          <div class="preview-platform">📘 Facebook / LinkedIn Preview</div>
          <div class="fb-card">
            <div class="fb-img" *ngIf="og.image"><img [src]="og.image" class="fb-img-el" alt="OG Image" /></div>
            <div class="fb-img placeholder" *ngIf="!og.image">🖼️ No image set</div>
            <div class="fb-body">
              <div class="fb-domain">{{og.url||'example.com'}}</div>
              <div class="fb-title">{{og.title||'Page Title'}}</div>
              <div class="fb-desc">{{(og.description||'Description').slice(0,120)}}{{og.description.length>120?'...':''}}</div>
            </div>
          </div>
        </div>

        <!-- Twitter Large -->
        <div class="preview-card" *ngIf="og.twitterCard==='summary_large_image'">
          <div class="preview-platform">🐦 Twitter/X Large Card Preview</div>
          <div class="tw-card">
            <div class="tw-img" *ngIf="og.image"><img [src]="og.image" class="tw-img-el" alt="Twitter Image" /></div>
            <div class="tw-body">
              <div class="tw-title">{{og.title||'Page Title'}}</div>
              <div class="tw-desc">{{(og.description||'').slice(0,100)}}{{og.description.length>100?'...':''}}</div>
              <div class="tw-domain">{{og.url||'example.com'}}</div>
            </div>
          </div>
        </div>

        <!-- Twitter Small -->
        <div class="preview-card" *ngIf="og.twitterCard==='summary'">
          <div class="preview-platform">🐦 Twitter/X Small Card Preview</div>
          <div class="tw-small-card">
            <div class="tw-small-img" *ngIf="og.image"><img [src]="og.image" class="tw-si-el" alt="" /></div>
            <div class="tw-small-body">
              <div class="tw-title">{{og.title||'Page Title'}}</div>
              <div class="tw-desc">{{(og.description||'').slice(0,100)}}</div>
              <div class="tw-domain">{{og.url||'example.com'}}</div>
            </div>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="preview-card">
          <div class="preview-platform">💬 WhatsApp Preview</div>
          <div class="wa-card">
            <div class="wa-img" *ngIf="og.image"><img [src]="og.image" class="wa-img-el" alt="" /></div>
            <div class="wa-body">
              <div class="wa-title">{{og.title||'Page Title'}}</div>
              <div class="wa-desc">{{(og.description||'').slice(0,80)}}</div>
              <div class="wa-url">{{og.url||'example.com'}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tag Audit -->
      <div class="audit-section" *ngIf="og.title||og.description">
        <div class="audit-title">🔍 OG Tag Audit</div>
        <div class="audit-item" *ngFor="let a of audit()">
          <span class="ai-icon">{{a.status==='ok'?'✅':a.status==='warn'?'⚠️':'❌'}}</span>
          <span class="ai-tag">{{a.tag}}</span>
          <span class="ai-msg">{{a.message}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .input-section{margin-bottom:1rem}
    .inp-row{display:flex;gap:.5rem;margin-bottom:.35rem;flex-wrap:wrap}
    .inp{flex:1;padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.88rem;outline:none;min-width:0}
    .btn-fetch,.btn-manual{padding:.5rem 1rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem;white-space:nowrap}
    .btn-fetch{background:#2563eb;color:white}.btn-fetch:disabled{opacity:.6;cursor:not-allowed}
    .btn-manual{background:#f3f4f6;border:1px solid #e5e7eb;color:#374151}
    .btn-manual.active{background:#eff6ff;border-color:#2563eb;color:#2563eb}
    .fetch-note{font-size:.7rem;color:#9ca3af}
    .manual-inputs{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .mi-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    @media(max-width:600px){.mi-grid{grid-template-columns:1fr}}
    .field{display:flex;flex-direction:column;gap:.3rem}
    .field label{font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .inp,.sel{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;box-sizing:border-box;outline:none}
    .textarea{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;resize:vertical;box-sizing:border-box;outline:none}
    .previews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-bottom:1.25rem}
    .preview-card{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
    .preview-platform{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;padding:.5rem .85rem;background:#f8fafc;border-bottom:1px solid #e5e7eb}
    .fb-card,.tw-card,.wa-card{background:white}
    .fb-img,.tw-img,.wa-img{background:#e5e7eb;min-height:120px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#9ca3af}
    .fb-img.placeholder{padding:1.5rem;font-size:.8rem;color:#9ca3af}
    .fb-img-el,.tw-img-el,.wa-img-el{width:100%;height:150px;object-fit:cover;display:block}
    .wa-img-el{height:120px}
    .fb-body,.tw-body,.wa-body{padding:.65rem .85rem}
    .fb-domain,.tw-domain,.wa-url{font-size:.68rem;color:#9ca3af;text-transform:uppercase;margin-bottom:.2rem}
    .fb-title,.tw-title,.wa-title{font-size:.88rem;font-weight:700;color:#111827;margin-bottom:.2rem}
    .fb-desc,.tw-desc,.wa-desc{font-size:.75rem;color:#6b7280;line-height:1.35}
    .tw-small-card{display:flex;background:white}.tw-small-img{flex-shrink:0;width:70px;background:#e5e7eb;display:flex;align-items:center;justify-content:center}
    .tw-si-el{width:70px;height:70px;object-fit:cover}.tw-small-body{padding:.6rem .75rem}
    .audit-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .audit-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .audit-item{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;font-size:.78rem;padding:.3rem .5rem;background:white;border:1px solid #f3f4f6;border-radius:6px}
    .ai-tag{font-family:monospace;font-size:.72rem;color:#2563eb;min-width:120px}.ai-msg{color:#374151}
  `]
})
export class OpenGraphTesterComponent {
  url=''; loading=signal(false); manualMode=signal(true);
  og={title:'UtilityMega - Free Online Tools',description:'100+ free browser-based tools for everyone. No signup. No upload. Complete privacy.',image:'',url:'https://utilitymega.com',siteName:'UtilityMega',twitterCard:'summary_large_image'};
  audit=signal<any[]>([]);

  constructor(){this.updatePreviews();}

  updatePreviews(){
    const a:any[]=[];
    a.push({tag:'og:title',status:this.og.title?(this.og.title.length<=70?'ok':'warn'):'error',message:this.og.title?(this.og.title.length<=70?`Good (${this.og.title.length} chars)`:`Too long (${this.og.title.length} chars, aim ≤70)`):'Missing og:title'});
    a.push({tag:'og:description',status:this.og.description?(this.og.description.length<=200?'ok':'warn'):'warn',message:this.og.description?(this.og.description.length<=200?`Good (${this.og.description.length} chars)`:`Long (${this.og.description.length} chars, aim ≤200)`):'Missing — use og:description for better sharing'});
    a.push({tag:'og:image',status:this.og.image?'ok':'warn',message:this.og.image?'Image URL set — verify 1200×630px':'Missing — add og:image for rich social sharing'});
    a.push({tag:'og:url',status:this.og.url?'ok':'warn',message:this.og.url?'Canonical URL set':'Missing og:url'});
    a.push({tag:'og:site_name',status:this.og.siteName?'ok':'warn',message:this.og.siteName?'Site name set':'Consider adding og:site_name'});
    a.push({tag:'twitter:card',status:'ok',message:`Set to "${this.og.twitterCard}"`});
    this.audit.set(a);
  }
toggleManualMode() {
  this.manualMode.update(v => !v);
}
  async fetchOg(){
    this.loading.set(true);
    try{
      const r=await fetch(`https://api.microlink.io?url=${encodeURIComponent(this.url)}`);
      const d=await r.json();
      if(d.data){
        this.og.title=d.data.title||''; this.og.description=d.data.description||'';
        this.og.image=d.data.image?.url||''; this.og.url=d.data.url||this.url;
      }
      this.updatePreviews();
    }catch{alert('Could not fetch OG data. Please fill tags manually.');}
    this.loading.set(false);
  }
}