import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Cron Expression Generator ───────────────────────────────────────────────
@Component({
  selector: 'app-cron-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="cron-display">
        <div class="cd-label">Cron Expression</div>
        <div class="cd-expr">
          <input [(ngModel)]="cronExpr" (ngModelChange)="parseCron()" class="cron-inp mono" />
          <button class="copy-btn" (click)="copy(cronExpr)">📋</button>
        </div>
        <div class="cd-human">{{humanDescription()}}</div>
      </div>

      <div class="builder-grid">
        <div class="field-card" *ngFor="let f of fields; let i=index">
          <div class="fc-header">
            <span class="fc-name">{{f.name}}</span>
            <span class="fc-range">{{f.range}}</span>
          </div>
          <input [(ngModel)]="fieldValues[i]" (ngModelChange)="buildFromFields()" class="fc-inp mono" [placeholder]="f.placeholder" />
          <div class="fc-presets">
            <button *ngFor="let p of f.presets" class="preset-btn" (click)="fieldValues[i]=p.val;buildFromFields()">{{p.label}}</button>
          </div>
        </div>
      </div>

      <div class="presets-section">
        <div class="ps-title">Common Schedules</div>
        <div class="ps-grid">
          <button *ngFor="let p of schedulePresets" class="schedule-btn" (click)="loadPreset(p)">
            <span class="sb-label">{{p.label}}</span>
            <span class="sb-expr mono">{{p.expr}}</span>
          </button>
        </div>
      </div>

      <div class="next-runs" *ngIf="nextRuns().length">
        <div class="nr-title">⏰ Next {{nextRuns().length}} Run Times</div>
        <div class="nr-list">
          <div class="nr-item" *ngFor="let r of nextRuns(); let i=index">
            <span class="nr-num">{{i+1}}</span>
            <span class="nr-date">{{r.date}}</span>
            <span class="nr-rel">{{r.rel}}</span>
          </div>
        </div>
      </div>

      <div class="error-box" *ngIf="errorMsg()">⚠️ {{errorMsg()}}</div>

      <div class="cron-ref">
        <div class="cr-title">Cron Syntax Reference</div>
        <div class="ref-table">
          <div class="rt-row header"><span>Field</span><span>Values</span><span>Special</span></div>
          <div class="rt-row" *ngFor="let r of refRows"><span>{{r.field}}</span><span class="mono">{{r.vals}}</span><span class="mono small">{{r.special}}</span></div>
        </div>
        <div class="special-chars">
          <div class="sc-item" *ngFor="let s of specials"><span class="sc-sym mono">{{s.sym}}</span><span class="sc-desc">{{s.desc}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .cron-display{background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:14px;padding:1.25rem 1.5rem;color:white;margin-bottom:1.25rem}
    .cd-label{font-size:.72rem;font-weight:700;text-transform:uppercase;opacity:.7;margin-bottom:.4rem}
    .cd-expr{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
    .cron-inp{flex:1;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:.5rem .85rem;color:white;font-size:1.1rem;font-family:monospace;outline:none}
    .cron-inp::placeholder{color:rgba(255,255,255,.5)}
    .copy-btn{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;border-radius:7px;padding:.4rem .8rem;cursor:pointer;font-size:.82rem}
    .cd-human{font-size:.88rem;opacity:.85;min-height:1.3em}
    .builder-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.75rem;margin-bottom:1.25rem}
    @media(max-width:700px){.builder-grid{grid-template-columns:repeat(2,1fr)}}
    .field-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem .85rem}
    .fc-header{display:flex;justify-content:space-between;margin-bottom:.35rem}
    .fc-name{font-size:.72rem;font-weight:800;text-transform:uppercase;color:#374151}
    .fc-range{font-size:.65rem;color:#9ca3af}
    .fc-inp{width:100%;padding:.4rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-size:.88rem;box-sizing:border-box;outline:none;margin-bottom:.4rem}
    .fc-presets{display:flex;gap:.25rem;flex-wrap:wrap}
    .preset-btn{padding:.15rem .45rem;border:1px solid #e5e7eb;border-radius:4px;background:white;cursor:pointer;font-size:.65rem;font-weight:600;color:#6b7280;transition:all .1s}
    .preset-btn:hover{border-color:#2563eb;color:#2563eb}
    .presets-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.4rem}
    .schedule-btn{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .75rem;cursor:pointer;text-align:left;transition:all .15s;display:flex;flex-direction:column;gap:.2rem}
    .schedule-btn:hover{border-color:#2563eb}
    .sb-label{font-size:.8rem;font-weight:700;color:#111827}
    .sb-expr{font-size:.72rem;color:#6b7280}
    .next-runs{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .nr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .nr-list{display:flex;flex-direction:column;gap:.25rem}
    .nr-item{display:flex;align-items:center;gap:.75rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .75rem;font-size:.8rem}
    .nr-num{font-size:.68rem;color:#9ca3af;min-width:20px}
    .nr-date{font-weight:600;flex:1}.nr-rel{font-size:.72rem;color:#6b7280}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.55rem .85rem;color:#dc2626;font-size:.82rem;margin-bottom:1rem}
    .cron-ref{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .cr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ref-table{margin-bottom:.75rem}
    .rt-row{display:grid;grid-template-columns:100px 1fr 1fr;gap:.5rem;padding:.3rem .5rem;font-size:.78rem;border-bottom:1px solid #f3f4f6}
    .rt-row.header{background:#e5e7eb;border-radius:5px;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:none}
    .mono{font-family:monospace}.small{font-size:.68rem}
    .special-chars{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.4rem}
    .sc-item{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .65rem;display:flex;gap:.5rem;align-items:center}
    .sc-sym{font-size:.85rem;font-weight:700;color:#2563eb;min-width:20px}
    .sc-desc{font-size:.72rem;color:#374151}
  `]
})
export class CronGeneratorComponent implements OnInit {
  cronExpr = '0 9 * * 1-5';
  fieldValues = ['0','9','*','*','1-5'];
  fields = [
    {name:'Minute',range:'0-59',placeholder:'0',presets:[{label:'*',val:'*'},{label:'0',val:'0'},{label:'*/5',val:'*/5'},{label:'*/15',val:'*/15'},{label:'*/30',val:'*/30'}]},
    {name:'Hour',range:'0-23',placeholder:'9',presets:[{label:'*',val:'*'},{label:'0',val:'0'},{label:'6',val:'6'},{label:'12',val:'12'},{label:'18',val:'18'}]},
    {name:'Day',range:'1-31',placeholder:'*',presets:[{label:'*',val:'*'},{label:'1',val:'1'},{label:'15',val:'15'},{label:'L',val:'L'},{label:'1,15',val:'1,15'}]},
    {name:'Month',range:'1-12',placeholder:'*',presets:[{label:'*',val:'*'},{label:'1',val:'1'},{label:'6',val:'6'},{label:'Q',val:'*/3'},{label:'1,7',val:'1,7'}]},
    {name:'Weekday',range:'0-7',placeholder:'1-5',presets:[{label:'*',val:'*'},{label:'Mon-Fri',val:'1-5'},{label:'Sat-Sun',val:'6,0'},{label:'Mon',val:'1'},{label:'Fri',val:'5'}]},
  ];
  schedulePresets = [
    {label:'Every minute',expr:'* * * * *'},{label:'Every 5 minutes',expr:'*/5 * * * *'},{label:'Every 15 minutes',expr:'*/15 * * * *'},{label:'Every 30 minutes',expr:'*/30 * * * *'},
    {label:'Every hour',expr:'0 * * * *'},{label:'Daily at midnight',expr:'0 0 * * *'},{label:'Daily at 9am',expr:'0 9 * * *'},{label:'Daily at noon',expr:'0 12 * * *'},
    {label:'Weekdays at 9am',expr:'0 9 * * 1-5'},{label:'Mon 9am',expr:'0 9 * * 1'},{label:'Weekly Sunday',expr:'0 0 * * 0'},{label:'Monthly 1st',expr:'0 0 1 * *'},
    {label:'Quarterly',expr:'0 0 1 1,4,7,10 *'},{label:'Yearly Jan 1',expr:'0 0 1 1 *'},{label:'Every 6 hours',expr:'0 */6 * * *'},{label:'Twice daily',expr:'0 8,20 * * *'},
  ];
  refRows = [
    {field:'Minute',vals:'0-59',special:'*, -, /, ,'},
    {field:'Hour',vals:'0-23',special:'*, -, /, ,'},
    {field:'Day',vals:'1-31',special:'*, -, /, ,, L, W'},
    {field:'Month',vals:'1-12 or JAN-DEC',special:'*, -, /, ,'},
    {field:'Weekday',vals:'0-7 (0,7=Sun) or SUN-SAT',special:'*, -, /, ,, L, #'},
  ];
  specials = [
    {sym:'*',desc:'Any value'},{sym:',',desc:'List of values (1,3,5)'},{sym:'-',desc:'Range (1-5)'},{sym:'/',desc:'Step (*/5 = every 5)'},{sym:'L',desc:'Last (day of month/week)'},{sym:'W',desc:'Nearest weekday'},{sym:'#',desc:'Nth weekday (2#3 = 3rd Tue)'},
  ];
  nextRuns = signal<{date:string,rel:string}[]>([]);
  errorMsg = signal('');

  ngOnInit() { this.parseCron(); }

  buildFromFields() {
    this.cronExpr = this.fieldValues.join(' ');
    this.parseCron();
  }

  parseCron() {
    this.errorMsg.set('');
    const parts = this.cronExpr.trim().split(/\s+/);
    if (parts.length === 5) {
      this.fieldValues = parts;
      this.computeNextRuns();
    } else if (parts.length > 0) {
      this.errorMsg.set(`Expected 5 fields, got ${parts.length}`);
    }
  }

  humanDescription(): string {
    const [min, hr, dom, mon, dow] = this.fieldValues;
    try {
      const parts: string[] = [];
      if (min === '*' && hr === '*') parts.push('every minute');
      else if (min.startsWith('*/')) parts.push(`every ${min.slice(2)} minutes`);
      else if (hr === '*') parts.push(`at minute ${min} of every hour`);
      else parts.push(`at ${hr.padStart(2,'0')}:${min.padStart(2,'0')}`);
      if (dow !== '*') {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        if (dow === '1-5') parts.push('on weekdays');
        else if (dow === '6,0' || dow === '0,6') parts.push('on weekends');
        else parts.push(`on ${dow.split(',').map(d => days[parseInt(d)] || d).join(', ')}`);
      }
      if (dom !== '*') parts.push(`on day ${dom} of the month`);
      if (mon !== '*') {
        const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        parts.push(`in ${mon.split(',').map(m => months[parseInt(m)] || m).join(', ')}`);
      }
      return parts.join(', ').replace(/^./, c => c.toUpperCase());
    } catch { return 'Invalid expression'; }
  }

  computeNextRuns() {
    // Simplified next-run calculator
    const now = new Date();
    const runs: {date:string,rel:string}[] = [];
    const d = new Date(now.getTime() + 60000);
    d.setSeconds(0, 0);
    let attempts = 0;
    while (runs.length < 8 && attempts < 10000) {
      attempts++;
      if (this.matchesCron(d)) {
        const diff = d.getTime() - now.getTime();
        const rel = diff < 3600000 ? `in ${Math.round(diff/60000)}m` : diff < 86400000 ? `in ${Math.round(diff/3600000)}h` : `in ${Math.round(diff/86400000)}d`;
        runs.push({date: d.toLocaleString('en-IN', {dateStyle:'medium',timeStyle:'short'}), rel});
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    this.nextRuns.set(runs);
  }

  matchesCron(d: Date): boolean {
    const [min, hr, dom, mon, dow] = this.fieldValues;
    return this.matchField(d.getMinutes(), min, 0, 59) &&
           this.matchField(d.getHours(), hr, 0, 23) &&
           this.matchField(d.getDate(), dom, 1, 31) &&
           this.matchField(d.getMonth()+1, mon, 1, 12) &&
           this.matchField(d.getDay(), dow, 0, 6);
  }

  matchField(val: number, expr: string, min: number, max: number): boolean {
    if (expr === '*' || expr === '?') return true;
    for (const part of expr.split(',')) {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        const s = parseInt(step);
        const start = range === '*' ? min : parseInt(range.split('-')[0]);
        if (!isNaN(s) && val >= start && (val - start) % s === 0) return true;
      } else if (part.includes('-')) {
        const [lo, hi] = part.split('-').map(Number);
        if (val >= lo && val <= hi) return true;
      } else {
        if (parseInt(part) === val || (part === '0' && val === 7)) return true;
      }
    }
    return false;
  }

  loadPreset(p: any) { this.cronExpr = p.expr; this.parseCron(); }
  copy(s: string) { navigator.clipboard.writeText(s); }
}

// ─── Color Converter ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-color-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-layout">
        <div class="input-col">
          <div class="section">
            <div class="sec-title">Color Input</div>
            <input type="color" [(ngModel)]="hexColor" (ngModelChange)="fromHex()" class="big-swatch" />
            <div class="hex-row">
              <span class="hash">#</span>
              <input [(ngModel)]="hexInput" (ngModelChange)="onHexType()" class="hex-inp mono" maxlength="8" placeholder="2563eb" />
            </div>
          </div>
          <div class="section">
            <div class="sec-title">Input Format</div>
            <div class="format-tabs">
              <button *ngFor="let f of formats" [class.active]="inputFormat()===f" (click)="inputFormat.set(f)">{{f}}</button>
            </div>
            <input *ngIf="inputFormat()==='RGB'" [(ngModel)]="rgbInput" (ngModelChange)="fromRgbStr()" class="inp mono" placeholder="rgb(37, 99, 235)" />
            <input *ngIf="inputFormat()==='HSL'" [(ngModel)]="hslInput" (ngModelChange)="fromHslStr()" class="inp mono" placeholder="hsl(221, 83%, 53%)" />
            <input *ngIf="inputFormat()==='HSV'" [(ngModel)]="hsvInput" (ngModelChange)="fromHsvStr()" class="inp mono" placeholder="hsv(221, 84%, 92%)" />
            <input *ngIf="inputFormat()==='CMYK'" [(ngModel)]="cmykInput" (ngModelChange)="fromCmykStr()" class="inp mono" placeholder="cmyk(84%, 58%, 0%, 8%)" />
          </div>
        </div>
        <div class="output-col">
          <div class="preview-box" [style.background]="hexColor"></div>
          <div class="section">
            <div class="sec-title">All Formats</div>
            <div class="format-list">
              <div class="fmt-item" *ngFor="let cv of colorValues()">
                <span class="fmt-label">{{cv.label}}</span>
                <span class="fmt-val mono">{{cv.value}}</span>
                <button class="copy-sm" (click)="copy(cv.value)">📋</button>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="sec-title">Shades & Tints</div>
            <div class="swatches-row">
              <div *ngFor="let s of shades()" class="swatch" [style.background]="s" [title]="s" (click)="setHex(s)"></div>
            </div>
            <div class="swatches-row" style="margin-top:3px">
              <div *ngFor="let t of tints()" class="swatch" [style.background]="t" [title]="t" (click)="setHex(t)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Named colors palette -->
      <div class="named-section">
        <div class="ns-title">CSS Named Colors</div>
        <div class="named-grid">
          <div *ngFor="let c of namedColors" class="named-item" [style.background]="c.value" [title]="c.name+' '+c.value" (click)="setHex(c.value)">
            <span class="ni-name">{{c.name}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .main-layout{display:grid;grid-template-columns:240px 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:680px){.main-layout{grid-template-columns:1fr}}
    .section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem}
    .sec-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .big-swatch{width:100%;height:70px;border:none;border-radius:8px;cursor:pointer;display:block;margin-bottom:.6rem}
    .hex-row{display:flex;align-items:center;background:white;border:1px solid #d1d5db;border-radius:7px;overflow:hidden}
    .hash{padding:.4rem .5rem .4rem .75rem;font-weight:700;color:#6b7280;font-family:monospace}
    .hex-inp{flex:1;padding:.4rem .5rem;border:none;font-size:.92rem;font-family:monospace;font-weight:700;outline:none}
    .format-tabs{display:flex;gap:.25rem;flex-wrap:wrap;margin-bottom:.6rem}
    .format-tabs button{padding:.25rem .6rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.72rem;font-weight:600}
    .format-tabs button.active{background:#2563eb;border-color:#2563eb;color:white}
    .inp{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;box-sizing:border-box;outline:none}
    .mono{font-family:monospace}
    .preview-box{height:80px;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:.75rem;transition:background .1s}
    .format-list{display:flex;flex-direction:column;gap:.3rem}
    .fmt-item{display:flex;align-items:center;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.3rem .65rem}
    .fmt-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;min-width:55px;flex-shrink:0}
    .fmt-val{flex:1;font-size:.78rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy-sm{background:none;border:none;cursor:pointer;font-size:.72rem;opacity:.6;flex-shrink:0}
    .swatches-row{display:flex;gap:2px}
    .swatch{flex:1;height:24px;border-radius:3px;cursor:pointer;transition:transform .1s}
    .swatch:hover{transform:scale(1.15);z-index:1}
    .named-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .ns-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .named-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.35rem}
    .named-item{height:44px;border-radius:6px;cursor:pointer;display:flex;align-items:flex-end;padding:.25rem .4rem;position:relative;overflow:hidden;transition:transform .1s}
    .named-item:hover{transform:scale(1.05);z-index:1}
    .ni-name{font-size:.58rem;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,.5);line-height:1;background:rgba(0,0,0,.3);border-radius:3px;padding:.1rem .3rem}
  `]
})
export class ColorConverterComponent {
  hexColor = '#2563eb'; hexInput = '2563eb';
  inputFormat = signal<'RGB'|'HSL'|'HSV'|'CMYK'>('RGB');
  rgbInput = 'rgb(37, 99, 235)'; hslInput = 'hsl(221, 83%, 53%)'; hsvInput = 'hsv(221, 84%, 92%)'; cmykInput = 'cmyk(84%, 58%, 0%, 8%)';
  formats: ('RGB'|'HSL'|'HSV'|'CMYK')[] = ['RGB','HSL','HSV','CMYK'];
  private r=37; private g=99; private b=235;

  colorValues = signal<{label:string,value:string}[]>([]);
  shades = signal<string[]>([]); tints = signal<string[]>([]);

  namedColors = [
    {name:'Red',value:'#ef4444'},{name:'Orange',value:'#f97316'},{name:'Amber',value:'#f59e0b'},{name:'Yellow',value:'#eab308'},{name:'Lime',value:'#84cc16'},{name:'Green',value:'#22c55e'},{name:'Teal',value:'#14b8a6'},{name:'Cyan',value:'#06b6d4'},{name:'Blue',value:'#3b82f6'},{name:'Indigo',value:'#6366f1'},{name:'Violet',value:'#8b5cf6'},{name:'Purple',value:'#a855f7'},{name:'Pink',value:'#ec4899'},{name:'Rose',value:'#f43f5e'},{name:'Slate',value:'#64748b'},{name:'Gray',value:'#6b7280'},{name:'Black',value:'#000000'},{name:'White',value:'#ffffff'},
  ];

  constructor() { this.update(); }

  fromHex() { this.hexInput = this.hexColor.slice(1); this.parseHex(this.hexInput); }
  onHexType() { this.parseHex(this.hexInput); }

  parseHex(h: string) {
    h = h.replace(/[^0-9a-f]/gi,'');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length >= 6) { this.r=parseInt(h.slice(0,2),16); this.g=parseInt(h.slice(2,4),16); this.b=parseInt(h.slice(4,6),16); this.hexColor='#'+h.slice(0,6); this.update(); }
  }

  fromRgbStr() {
    const m = this.rgbInput.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) { this.r=+m[1]; this.g=+m[2]; this.b=+m[3]; this.hexColor=this.toHex(this.r,this.g,this.b); this.update(); }
  }
  fromHslStr() {
    const m = this.hslInput.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (m) { const {r,g,b}=this.hslToRgb(+m[1],+m[2],+m[3]); this.r=r;this.g=g;this.b=b; this.hexColor=this.toHex(r,g,b); this.update(); }
  }
  fromHsvStr() {
    const m = this.hsvInput.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (m) { const {r,g,b}=this.hsvToRgb(+m[1],+m[2]/100,+m[3]/100); this.r=r;this.g=g;this.b=b; this.hexColor=this.toHex(r,g,b); this.update(); }
  }
  fromCmykStr() {
    const m = this.cmykInput.match(/cmyk\((\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+)%/);
    if (m) { const c=+m[1]/100,y2=+m[2]/100,ym=+m[3]/100,k=+m[4]/100; this.r=Math.round(255*(1-c)*(1-k)); this.g=Math.round(255*(1-y2)*(1-k)); this.b=Math.round(255*(1-ym)*(1-k)); this.hexColor=this.toHex(this.r,this.g,this.b); this.update(); }
  }

  update() {
    const {h,s,l}=this.rgbToHsl(this.r,this.g,this.b);
    const {h:hh,s:hs,v}=this.rgbToHsv(this.r,this.g,this.b);
    const k=1-Math.max(this.r,this.g,this.b)/255;
    const C=k<1?Math.round((1-this.r/255-k)/(1-k)*100):0;
    const M=k<1?Math.round((1-this.g/255-k)/(1-k)*100):0;
    const Y=k<1?Math.round((1-this.b/255-k)/(1-k)*100):0;
    const K=Math.round(k*100);
    this.rgbInput=`rgb(${this.r}, ${this.g}, ${this.b})`;
    this.hslInput=`hsl(${h}, ${s}%, ${l}%)`;
    this.hsvInput=`hsv(${hh}, ${Math.round(hs*100)}%, ${Math.round(v*100)}%)`;
    this.cmykInput=`cmyk(${C}%, ${M}%, ${Y}%, ${K}%)`;
    this.colorValues.set([
      {label:'HEX',value:this.hexColor.toUpperCase()},
      {label:'RGB',value:`rgb(${this.r}, ${this.g}, ${this.b})`},
      {label:'RGBA',value:`rgba(${this.r}, ${this.g}, ${this.b}, 1)`},
      {label:'HSL',value:`hsl(${h}, ${s}%, ${l}%)`},
      {label:'HSLA',value:`hsla(${h}, ${s}%, ${l}%, 1)`},
      {label:'HSV',value:`hsv(${hh}, ${Math.round(hs*100)}%, ${Math.round(v*100)}%)`},
      {label:'CMYK',value:`cmyk(${C}%, ${M}%, ${Y}%, ${K}%)`},
      {label:'CSS Var',value:`--color: ${this.hexColor};`},
      {label:'Tailwind',value:`bg-[${this.hexColor}]`},
    ]);
    this.shades.set(Array.from({length:9},(_,i)=>{const nl=Math.max(0,l-((i+1)*l/10));const{r,g,b}=this.hslToRgb(h,s,nl);return this.toHex(r,g,b);}));
    this.tints.set(Array.from({length:9},(_,i)=>{const nl=Math.min(100,l+((i+1)*(100-l)/10));const{r,g,b}=this.hslToRgb(h,s,nl);return this.toHex(r,g,b);}));
  }

  setHex(h: string) { this.hexColor=h; this.hexInput=h.slice(1); this.parseHex(h.slice(1)); }

  toHex(r:number,g:number,b:number){return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
  rgbToHsl(r:number,g:number,b:number){const rn=r/255,gn=g/255,bn=b/255;const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);let h=0,s=0;const l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case rn:h=((gn-bn)/d+(gn<bn?6:0))/6;break;case gn:h=((bn-rn)/d+2)/6;break;case bn:h=((rn-gn)/d+4)/6;}}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
  hslToRgb(h:number,s:number,l:number){h/=360;s/=100;l/=100;if(s===0){const v=Math.round(l*255);return{r:v,g:v,b:v};}const hue2rgb=(p:number,q:number,t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;return{r:Math.round(hue2rgb(p,q,h+1/3)*255),g:Math.round(hue2rgb(p,q,h)*255),b:Math.round(hue2rgb(p,q,h-1/3)*255)};}
  rgbToHsv(r:number,g:number,b:number){const rn=r/255,gn=g/255,bn=b/255;const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn),d=max-min;let h=0;if(d!==0){if(max===rn)h=((gn-bn)/d)%6;else if(max===gn)h=(bn-rn)/d+2;else h=(rn-gn)/d+4;h=Math.round(h*60);if(h<0)h+=360;}return{h,s:max===0?0:d/max,v:max};}
  hsvToRgb(h:number,s:number,v:number){const f=(n:number)=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1));};return{r:Math.round(f(5)*255),g:Math.round(f(3)*255),b:Math.round(f(1)*255)};}

  copy(v: string) { navigator.clipboard.writeText(v); }
}

// ─── Diff Checker ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-diff-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="toolbar">
        <div class="tb-left">
          <button class="btn-action" (click)="compare()">🔍 Compare</button>
          <button class="btn-action secondary" (click)="swap()">⇄ Swap</button>
          <button class="btn-action warn" (click)="clear()">🗑 Clear</button>
          <div class="view-toggle">
            <button [class.active]="view()==='side'" (click)="view.set('side')">⊟ Side by Side</button>
            <button [class.active]="view()==='unified'" (click)="view.set('unified')">≡ Unified</button>
          </div>
        </div>
        <div class="tb-right" *ngIf="diffStats()">
          <span class="stat added">+{{diffStats()!.added}} added</span>
          <span class="stat removed">-{{diffStats()!.removed}} removed</span>
          <span class="stat unchanged">={{diffStats()!.unchanged}} unchanged</span>
        </div>
      </div>

      <div class="io-grid">
        <div class="io-box">
          <label class="io-label">Original</label>
          <textarea [(ngModel)]="text1" class="io-ta" rows="10" placeholder="Paste original text here..."></textarea>
        </div>
        <div class="io-box">
          <label class="io-label">Modified</label>
          <textarea [(ngModel)]="text2" class="io-ta" rows="10" placeholder="Paste modified text here..."></textarea>
        </div>
      </div>

      <!-- Side by side diff -->
      <div class="diff-result" *ngIf="diffLines().length && view()==='side'">
        <div class="dr-header"><span class="dr-orig">Original</span><span class="dr-mod">Modified</span></div>
        <div class="diff-table">
          <div *ngFor="let row of diffLines()" class="diff-row">
            <div class="diff-cell left" [class.added]="row.type==='added'" [class.removed]="row.type==='removed'" [class.unchanged]="row.type==='unchanged'">
              <span class="line-num">{{row.leftNum||''}}</span>
              <span class="line-content" [innerHTML]="row.leftContent"></span>
            </div>
            <div class="diff-cell right" [class.added]="row.type==='added'" [class.removed]="row.type==='removed'" [class.unchanged]="row.type==='unchanged'">
              <span class="line-num">{{row.rightNum||''}}</span>
              <span class="line-content" [innerHTML]="row.rightContent"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Unified diff -->
      <div class="diff-result unified" *ngIf="diffLines().length && view()==='unified'">
        <div class="unified-table">
          <div *ngFor="let row of unifiedLines()" class="unified-row" [class.added]="row.type==='added'" [class.removed]="row.type==='removed'">
            <span class="u-sign">{{row.type==='added'?'+':row.type==='removed'?'-':' '}}</span>
            <span class="u-num">{{row.num}}</span>
            <span class="u-content mono" [innerHTML]="row.content"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem 1rem;margin-bottom:1rem}
    .tb-left,.tb-right{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .btn-action{padding:.35rem .85rem;border:none;border-radius:6px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:.8rem}
    .btn-action.secondary{background:#f3f4f6;border:1px solid #e5e7eb;color:#374151}
    .btn-action.warn{background:#dc2626;color:white}
    .view-toggle{display:flex;background:#e5e7eb;border-radius:6px;overflow:hidden;margin-left:.3rem}
    .view-toggle button{padding:.3rem .75rem;border:none;background:none;cursor:pointer;font-size:.75rem;font-weight:600;color:#6b7280}
    .view-toggle button.active{background:#2563eb;color:white}
    .stat{font-size:.75rem;font-weight:700;padding:.2rem .55rem;border-radius:99px}
    .stat.added{background:#ecfdf5;color:#059669}
    .stat.removed{background:#fef2f2;color:#dc2626}
    .stat.unchanged{background:#f3f4f6;color:#6b7280}
    .io-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
    @media(max-width:680px){.io-grid{grid-template-columns:1fr}}
    .io-box{display:flex;flex-direction:column;gap:.3rem}
    .io-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .io-ta{width:100%;padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .diff-result{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:1rem}
    .dr-header{display:grid;grid-template-columns:1fr 1fr;background:#e5e7eb;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;padding:.4rem}
    .dr-orig,.dr-mod{padding:0 .75rem}
    .diff-table{max-height:400px;overflow-y:auto}
    .diff-row{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f3f4f6}
    .diff-cell{display:flex;align-items:flex-start;gap:.4rem;padding:.25rem .5rem;font-size:.78rem;font-family:monospace;line-height:1.5;min-height:24px}
    .diff-cell.added{background:#ecfdf5}
    .diff-cell.removed{background:#fef2f2}
    .diff-cell.unchanged{background:white}
    .line-num{min-width:30px;color:#9ca3af;text-align:right;flex-shrink:0;font-size:.65rem;padding-top:.1rem}
    .line-content{flex:1;word-break:break-all;white-space:pre-wrap}
    :host ::ng-deep .word-add{background:#bbf7d0;border-radius:2px}
    :host ::ng-deep .word-del{background:#fecaca;border-radius:2px;text-decoration:line-through}
    .unified.diff-result{}
    .unified-table{max-height:400px;overflow-y:auto}
    .unified-row{display:flex;align-items:flex-start;gap:.4rem;padding:.2rem .5rem;font-size:.78rem;font-family:monospace;line-height:1.5;border-bottom:1px solid #f3f4f6}
    .unified-row.added{background:#ecfdf5}
    .unified-row.removed{background:#fef2f2}
    .u-sign{min-width:12px;font-weight:700;flex-shrink:0}
    .unified-row.added .u-sign{color:#059669}
    .unified-row.removed .u-sign{color:#dc2626}
    .u-num{min-width:32px;color:#9ca3af;flex-shrink:0;font-size:.65rem}
    .u-content{flex:1;word-break:break-all;white-space:pre-wrap}
    .mono{font-family:monospace}
  `]
})
export class DiffCheckerComponent {
  text1 = `function greet(name) {
  console.log("Hello " + name);
  return true;
}

const result = greet("World");`;

  text2 = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  console.log("How are you?");
  return { success: true };
}

const result = greet("World", "Hi");`;

  view = signal<'side'|'unified'>('side');
  diffLines = signal<any[]>([]);
  unifiedLines = signal<any[]>([]);
  diffStats = signal<{added:number,removed:number,unchanged:number}|null>(null);

  constructor() { this.compare(); }

  compare() {
    const lines1 = this.text1.split('\n');
    const lines2 = this.text2.split('\n');
    const lcs = this.computeLCS(lines1, lines2);
    const rows: any[] = [];
    const unified: any[] = [];
    let i=0,j=0,ln1=1,ln2=1,added=0,removed=0,unchanged=0;

    while (i<lines1.length || j<lines2.length) {
      const match = lcs.get(i);

      if (i<lines1.length && j<lines2.length && match===j) {
        rows.push({type:'unchanged',leftNum:ln1++,rightNum:ln2++,leftContent:this.esc(lines1[i]),rightContent:this.esc(lines2[j])});
        unified.push({type:'unchanged',num:ln1-1,content:this.esc(lines1[i])});
        unchanged++; i++; j++;
      } else if (i<lines1.length && (j>=lines2.length || !lcs.has(i) || lcs.get(i)! > j)) {
        rows.push({type:'removed',leftNum:ln1++,rightNum:'',leftContent:`<span class="word-del">${this.esc(lines1[i])}</span>`,rightContent:''});
        unified.push({type:'removed',num:ln1-1,content:this.esc(lines1[i])});
        removed++; i++;
      } else {
        rows.push({type:'added',leftNum:'',rightNum:ln2++,leftContent:'',rightContent:`<span class="word-add">${this.esc(lines2[j])}</span>`});
        unified.push({type:'added',num:ln2-1,content:this.esc(lines2[j])});
        added++; j++;
      }
    }
    this.diffLines.set(rows);
    this.unifiedLines.set(unified);
    this.diffStats.set({added,removed,unchanged});
  }

  computeLCS(a: string[], b: string[]): Map<number,number> {
    // Greedy LCS using patience-like approach for speed
    const map = new Map<number,number>();
    const bIdx = new Map<string,number[]>();
    for (let j=b.length-1;j>=0;j--) { const k=b[j]; if (!bIdx.has(k)) bIdx.set(k,[]); bIdx.get(k)!.push(j); }
    let prev = new Map<number,number>(); // i → j
    const dp: {i:number,j:number}[] = [];
    for (let i=0;i<a.length;i++) {
      const js = bIdx.get(a[i]) || [];
      for (const j of js) {
        if (!prev.has(i) || prev.get(i)! > j) prev.set(i, j);
      }
    }
    // Simple greedy match
    let lastJ = -1;
    for (let i=0;i<a.length;i++) {
      const js = (bIdx.get(a[i]) || []).filter(j => j > lastJ);
      if (js.length) { const j = js[js.length-1]; map.set(i,j); lastJ=j; }
    }
    return map;
  }

  swap() { [this.text1, this.text2] = [this.text2, this.text1]; this.compare(); }
  clear() { this.text1=''; this.text2=''; this.diffLines.set([]); this.unifiedLines.set([]); this.diffStats.set(null); }
  esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}
