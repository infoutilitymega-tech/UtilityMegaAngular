import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-codec-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="tab-row">
        <button class="tab-btn" [class.active]="mode()==='compare'" (click)="mode.set('compare')">Compare Codecs</button>
        <button class="tab-btn" [class.active]="mode()==='picker'" (click)="mode.set('picker')">Codec Picker</button>
        <button class="tab-btn" [class.active]="mode()==='ref'" (click)="mode.set('ref')">Full Reference</button>
      </div>

      <!-- COMPARE -->
      <ng-container *ngIf="mode()==='compare'">
        <div class="two-col">
          <div class="input-group">
            <label class="inp-label">Codec A</label>
            <select [(ngModel)]="codecA" class="inp-field">
              <option *ngFor="let c of codecs" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="input-group">
            <label class="inp-label">Codec B</label>
            <select [(ngModel)]="codecB" class="inp-field">
              <option *ngFor="let c of codecs" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>

        <div class="compare-table" *ngIf="codecAData() && codecBData()">
          <div class="ct-header">
            <span class="ct-attr">Attribute</span>
            <span class="ct-a">{{ codecAData()!.name }}</span>
            <span class="ct-b">{{ codecBData()!.name }}</span>
          </div>
          <div class="ct-row" *ngFor="let attr of compareAttrs">
            <span class="ct-attr">{{ attr.label }}</span>
            <span class="ct-a" [class.better]="attr.betterFn && attr.betterFn(codecAData()!, codecBData()!)===1">{{ getAttr(codecAData()!, attr.key) }}</span>
            <span class="ct-b" [class.better]="attr.betterFn && attr.betterFn(codecAData()!, codecBData()!)===-1">{{ getAttr(codecBData()!, attr.key) }}</span>
          </div>
        </div>
      </ng-container>

      <!-- PICKER -->
      <ng-container *ngIf="mode()==='picker'">
        <div class="picker-questions">
          <div class="pq-item">
            <label class="inp-label">Primary Use Case</label>
            <select [(ngModel)]="pickerUse" class="inp-field">
              <option value="">Select use case...</option>
              <option value="streaming">Online Streaming (YouTube, Vimeo)</option>
              <option value="social">Social Media (TikTok, Instagram)</option>
              <option value="broadcast">Broadcast TV</option>
              <option value="cinema">Cinema / Film Production</option>
              <option value="archive">Long-term Archival</option>
              <option value="editing">Video Editing / Post-production</option>
              <option value="webrtc">Live Streaming / WebRTC</option>
            </select>
          </div>
          <div class="pq-item">
            <label class="inp-label">Priority</label>
            <select [(ngModel)]="pickerPriority" class="inp-field">
              <option value="">Select priority...</option>
              <option value="quality">Maximum Quality</option>
              <option value="filesize">Smallest File Size</option>
              <option value="compatibility">Maximum Compatibility</option>
              <option value="speed">Fastest Encoding Speed</option>
              <option value="hdr">HDR Support</option>
            </select>
          </div>
        </div>

        <div class="picker-result" *ngIf="pickerRecommendations().length">
          <div class="pr-title">🎯 Recommended Codecs</div>
          <div class="pr-cards">
            <div class="pr-card" *ngFor="let r of pickerRecommendations(); let i=index" [class.top]="i===0">
              <div class="prc-rank">{{ i===0?'🥇':i===1?'🥈':'🥉' }}</div>
              <div class="prc-name">{{ r.name }}</div>
              <div class="prc-reason">{{ r.reason }}</div>
              <div class="prc-tags">
                <span class="tag" *ngFor="let t of r.tags">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- FULL REFERENCE -->
      <ng-container *ngIf="mode()==='ref'">
        <div class="codec-cards">
          <div class="codec-card" *ngFor="let c of codecs">
            <div class="cc-header">
              <div class="cc-name">{{ c.name }}</div>
              <div class="cc-type">{{ c.type }}</div>
            </div>
            <div class="cc-body">
              <div class="cc-row"><span class="cc-lbl">Developer</span><span class="cc-val">{{ c.developer }}</span></div>
              <div class="cc-row"><span class="cc-lbl">Year</span><span class="cc-val">{{ c.year }}</span></div>
              <div class="cc-row"><span class="cc-lbl">Max Resolution</span><span class="cc-val">{{ c.maxRes }}</span></div>
              <div class="cc-row"><span class="cc-lbl">HDR Support</span><span class="cc-val" [class.yes]="c.hdr==='Yes'">{{ c.hdr }}</span></div>
              <div class="cc-row"><span class="cc-lbl">Patent/License</span><span class="cc-val">{{ c.license }}</span></div>
              <div class="cc-desc">{{ c.desc }}</div>
            </div>
          </div>
        </div>
      </ng-container>

      <div class="ref-table">
        <div class="rt-title">📋 Codec Quick Reference</div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Codec</th><th>Container</th><th>Quality/Size</th><th>Hardware Support</th><th>Best For</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of codecs">
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.containers }}</td>
                <td>{{ c.qualityRatio }}</td>
                <td>{{ c.hwSupport }}</td>
                <td>{{ c.bestFor }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
    .tab-row{display:flex;gap:.4rem;flex-wrap:wrap}
    .tab-btn{padding:.45rem 1rem;border-radius:8px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.8rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .tab-btn.active{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
    .input-group,.pq-item{display:flex;flex-direction:column;gap:.35rem}
    .inp-label{font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
    .inp-field{padding:.6rem .85rem;border:1.5px solid var(--border);border-radius:10px;background:var(--card-bg);color:var(--text);font-size:.88rem;outline:none;font-family:var(--font)}
    .inp-field:focus{border-color:var(--primary)}
    .compare-table{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .ct-header{display:grid;grid-template-columns:140px 1fr 1fr;padding:.5rem .75rem;background:var(--bg-alt);border-bottom:1px solid var(--border);font-size:.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase}
    .ct-row{display:grid;grid-template-columns:140px 1fr 1fr;padding:.45rem .75rem;border-bottom:1px solid var(--border);font-size:.82rem}
    .ct-row:last-child{border-bottom:none}
    .ct-row:hover{background:var(--bg-alt)}
    .ct-attr{font-size:.78rem;color:var(--text-muted);font-weight:600}
    .ct-a,.ct-b{font-weight:700;color:var(--text)}
    .ct-a.better,.ct-b.better{color:var(--green)}
    .picker-questions{display:flex;flex-direction:column;gap:.85rem}
    .picker-result{display:flex;flex-direction:column;gap:.75rem}
    .pr-title{font-size:.82rem;font-weight:700;color:var(--text-muted)}
    .pr-cards{display:flex;flex-direction:column;gap:.5rem}
    .pr-card{border:1.5px solid var(--border);border-radius:12px;padding:.85rem;display:flex;flex-direction:column;gap:.3rem}
    .pr-card.top{border-color:var(--primary);background:var(--primary-light)}
    .prc-rank{font-size:1.1rem}
    .prc-name{font-size:.95rem;font-weight:800;color:var(--text)}
    .pr-card.top .prc-name{color:var(--primary)}
    .prc-reason{font-size:.78rem;color:var(--text-muted)}
    .prc-tags{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.2rem}
    .tag{padding:.15rem .55rem;border-radius:99px;background:var(--border);color:var(--text-muted);font-size:.68rem;font-weight:700}
    .codec-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:.85rem}
    .codec-card{border:1.5px solid var(--border);border-radius:12px;overflow:hidden}
    .cc-header{padding:.65rem .85rem;background:var(--bg-alt);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
    .cc-name{font-size:.88rem;font-weight:800;color:var(--text)}
    .cc-type{font-size:.68rem;padding:.15rem .55rem;border-radius:99px;background:var(--primary-light);color:var(--primary);font-weight:700}
    .cc-body{padding:.75rem .85rem;display:flex;flex-direction:column;gap:.3rem}
    .cc-row{display:flex;justify-content:space-between;gap:.5rem;font-size:.78rem}
    .cc-lbl{color:var(--text-muted);font-weight:600}
    .cc-val{font-weight:700;color:var(--text);text-align:right}
    .cc-val.yes{color:var(--green)}
    .cc-desc{font-size:.74rem;color:var(--text-muted);margin-top:.3rem;border-top:1px solid var(--border);padding-top:.4rem}
    .rt-title{font-size:.82rem;font-weight:700;margin-bottom:.6rem}
    .table-scroll{overflow-x:auto}
    .data-table{width:100%;border-collapse:collapse;font-size:.8rem}
    .data-table th{padding:.5rem .75rem;text-align:left;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;background:var(--bg-alt);border-bottom:1px solid var(--border)}
    .data-table td{padding:.45rem .75rem;border-bottom:1px solid var(--border)}
    .data-table tr:hover td{background:var(--bg-alt)}
    @media(max-width:640px){.two-col{grid-template-columns:1fr}.codec-cards{grid-template-columns:1fr}.ct-header,.ct-row{grid-template-columns:100px 1fr 1fr}}
  `]
})
export class CodecComparisonComponent {
  mode = signal<'compare'|'picker'|'ref'>('compare');
  codecA = 'h264'; codecB = 'h265';
  pickerUse = ''; pickerPriority = '';

  codecs = [
    {id:'h264',name:'H.264 / AVC',type:'Video',developer:'MPEG/ITU',year:'2003',maxRes:'8K',hdr:'Limited',license:'Patented (HEVC Advance)',containers:'MP4, MKV, MOV',qualityRatio:'Baseline',hwSupport:'Universal',bestFor:'Web streaming, compatibility',desc:'The most widely supported codec. Excellent compatibility with virtually all devices and platforms.',efficiency:'Medium',speed:'Fast',complexity:'Low'},
    {id:'h265',name:'H.265 / HEVC',type:'Video',developer:'MPEG/ITU',year:'2013',maxRes:'8K',hdr:'Yes',license:'Patented (royalties)',containers:'MP4, MKV, MOV',qualityRatio:'2× H.264',hwSupport:'Modern devices',bestFor:'4K streaming, archival',desc:'50% better compression than H.264 at same quality. Requires more CPU for encoding.',efficiency:'High',speed:'Slow',complexity:'High'},
    {id:'av1',name:'AV1',type:'Video',developer:'AOM (Google, Netflix…)',year:'2018',maxRes:'8K',hdr:'Yes',license:'Royalty-free',containers:'WebM, MP4, MKV',qualityRatio:'2.5× H.264',hwSupport:'Growing',bestFor:'YouTube, Netflix, web',desc:'Royalty-free successor to VP9. Best quality/size ratio but very slow software encoding.',efficiency:'Very High',speed:'Very Slow',complexity:'Very High'},
    {id:'vp9',name:'VP9',type:'Video',developer:'Google',year:'2013',maxRes:'8K',hdr:'Yes',license:'Royalty-free',containers:'WebM, MKV',qualityRatio:'1.5× H.264',hwSupport:'Good',bestFor:'YouTube 1080p+, Chrome',desc:'Google\'s open codec used extensively on YouTube. Good balance of quality and speed.',efficiency:'High',speed:'Medium',complexity:'Medium'},
    {id:'prores',name:'Apple ProRes',type:'Video (Mezzanine)',developer:'Apple',year:'2007',maxRes:'8K',hdr:'Yes',license:'Proprietary',containers:'MOV, MXF',qualityRatio:'Lossless-like',hwSupport:'Apple hardware',bestFor:'Post-production, editing',desc:'Professional intermediate codec for editing. Large files but fast decode and excellent quality.',efficiency:'Low',speed:'Very Fast',complexity:'Low'},
    {id:'dnxhd',name:'Avid DNxHD/HR',type:'Video (Mezzanine)',developer:'Avid',year:'2004',maxRes:'8K (HR)',hdr:'Yes (HR)',license:'Proprietary',containers:'MXF, MOV',qualityRatio:'Lossless-like',hwSupport:'Avid hardware',bestFor:'Broadcast post-production',desc:'Professional intermediate codec widely used in broadcast and film post-production workflows.',efficiency:'Low',speed:'Very Fast',complexity:'Low'},
    {id:'vvc',name:'H.266 / VVC',type:'Video',developer:'MPEG/ITU',year:'2020',maxRes:'16K',hdr:'Yes',license:'Patented',containers:'MP4',qualityRatio:'3× H.264',hwSupport:'Limited',bestFor:'Future streaming, VR/360°',desc:'Newest standard. ~50% better than HEVC but extremely slow encoding. Emerging hardware support.',efficiency:'Very High',speed:'Extremely Slow',complexity:'Extreme'},
    {id:'xvid',name:'XviD / DivX',type:'Video',developer:'Various',year:'2001',maxRes:'1080p',hdr:'No',license:'GPL/Proprietary',containers:'AVI, MKV',qualityRatio:'Similar H.264',hwSupport:'Legacy',bestFor:'Legacy content, archival',desc:'MPEG-4 Part 2 codec, popular in early 2000s. Largely replaced by H.264 but still encountered.',efficiency:'Medium',speed:'Fast',complexity:'Low'},
  ];

  compareAttrs = [
    {key:'efficiency',label:'Compression Efficiency',betterFn:(a:any,b:any)=>this.compareStr(a.efficiency,b.efficiency,['Very High','High','Medium','Low'],true)},
    {key:'speed',label:'Encoding Speed',betterFn:(a:any,b:any)=>this.compareStr(a.speed,b.speed,['Very Fast','Fast','Medium','Slow','Very Slow','Extremely Slow'],true)},
    {key:'hdr',label:'HDR Support',betterFn:null},
    {key:'maxRes',label:'Max Resolution',betterFn:null},
    {key:'license',label:'License',betterFn:null},
    {key:'hwSupport',label:'Hardware Support',betterFn:null},
    {key:'containers',label:'Containers',betterFn:null},
    {key:'year',label:'Year Introduced',betterFn:null},
    {key:'bestFor',label:'Best For',betterFn:null},
  ];

  pickerData: Record<string, Record<string, {name:string;reason:string;tags:string[]}[]>> = {
    streaming:{
      quality:[
        {name:'AV1',reason:'Best quality per bit for online streaming',tags:['YouTube','Netflix','Royalty-free']},
        {name:'H.265/HEVC',reason:'Excellent quality, widely supported',tags:['4K','HDR','Streaming']},
        {name:'VP9',reason:'Good quality, free license, YouTube native',tags:['YouTube','Free','HD+']},
      ],
      filesize:[
        {name:'AV1',reason:'Smallest file size of any mainstream codec',tags:['Smallest','Royalty-free']},
        {name:'H.265/HEVC',reason:'50% smaller than H.264',tags:['Compact','HDR']},
        {name:'VP9',reason:'30-50% smaller than H.264',tags:['Free','Good support']},
      ],
      compatibility:[
        {name:'H.264/AVC',reason:'Plays on every device made after 2010',tags:['Universal','Fast','Proven']},
        {name:'VP9',reason:'Great browser and smart TV support',tags:['Free','Browsers']},
        {name:'H.265/HEVC',reason:'Wide but not universal support',tags:['4K','HDR']},
      ],
      speed:[
        {name:'H.264/AVC',reason:'Fastest encoding, hardware acceleration everywhere',tags:['Fast encode','Hardware']},
        {name:'VP9',reason:'Faster than H.265, hardware encoders available',tags:['Medium speed']},
        {name:'H.265/HEVC',reason:'Hardware encoders in modern GPUs',tags:['GPU support']},
      ],
      hdr:[
        {name:'H.265/HEVC',reason:'HDR10, Dolby Vision support',tags:['HDR10','Dolby Vision']},
        {name:'AV1',reason:'Full HDR10, HDR10+, Dolby Vision',tags:['All HDR formats']},
        {name:'VP9',reason:'HDR10 via YouTube',tags:['HDR10','YouTube']},
      ],
    },
    editing:{
      quality:[
        {name:'Apple ProRes',reason:'Lossless-quality intermediate for editing',tags:['Lossless-like','Apple','Fast decode']},
        {name:'Avid DNxHD/HR',reason:'Professional broadcast intermediate',tags:['Broadcast','Fast decode']},
        {name:'H.264/AVC',reason:'Proxy editing — smaller files',tags:['Proxy','Compatibility']},
      ],
      filesize:[
        {name:'H.264/AVC',reason:'Proxy files for faster editing workflow',tags:['Proxy','Small']},
        {name:'H.265/HEVC',reason:'Smaller intermediate files',tags:['Compact']},
        {name:'VP9',reason:'Free and efficient proxy codec',tags:['Free']},
      ],
      compatibility:[
        {name:'H.264/AVC',reason:'Editable in every NLE application',tags:['Universal','All NLEs']},
        {name:'Apple ProRes',reason:'Native support in Premiere, FCPX, Resolve',tags:['Apple','NLE native']},
        {name:'Avid DNxHD',reason:'Native Avid, also supported in Premiere, Resolve',tags:['Avid','Broadcast']},
      ],
      speed:[
        {name:'Apple ProRes',reason:'Designed for fast decode during editing',tags:['Fast decode','Intraframe']},
        {name:'Avid DNxHD',reason:'Fast intraframe codec for editing',tags:['Fast','Intraframe']},
        {name:'H.264/AVC',reason:'Hardware decode on all platforms',tags:['Hardware']},
      ],
      hdr:[
        {name:'Apple ProRes',reason:'ProRes 4444 supports full HDR color',tags:['HDR','Wide gamut']},
        {name:'Avid DNxHD/HR',reason:'DNxHR supports 4K HDR workflows',tags:['HDR','4K+']},
        {name:'H.265/HEVC',reason:'HDR10 support in most NLEs',tags:['HDR10']},
      ],
    },
  };

  codecAData = signal<any>(null);
  codecBData = signal<any>(null);
  pickerRecommendations = signal<any[]>([]);

  compareStr(aVal:string,bVal:string,order:string[],higherBetter:boolean):number{
    const ai=order.indexOf(aVal),bi=order.indexOf(bVal);
    if(ai===-1||bi===-1)return 0;
    return higherBetter?(ai<bi?1:(ai>bi?-1:0)):(ai<bi?-1:(ai>bi?1:0));
  }

  getAttr(c:any,key:string):string{return c?c[key]||'—':'—';}

  ngOnChanges(){this.updateCompare();}

  updateCompare(){
    this.codecAData.set(this.codecs.find(c=>c.id===this.codecA)||null);
    this.codecBData.set(this.codecs.find(c=>c.id===this.codecB)||null);
  }

  updatePicker(){
    const u=this.pickerUse,p=this.pickerPriority;
    const cat=u==='streaming'||u==='social'?'streaming':u==='editing'||u==='cinema'||u==='archive'?'editing':'streaming';
    const pri=p||'compatibility';
    const data=this.pickerData[cat]?.[pri]||this.pickerData['streaming']['compatibility'];
    this.pickerRecommendations.set(data);
  }

  ngOnInit(){this.updateCompare();}
  ngDoCheck(){this.updateCompare();if(this.pickerUse||this.pickerPriority)this.updatePicker();}
}
