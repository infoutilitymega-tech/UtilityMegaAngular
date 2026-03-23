import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── barcode-generator.component.ts ─────────────────────────────────────────
@Component({
  selector: 'app-barcode-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="settings-row">
        <div class="field">
          <label>Barcode Type</label>
          <select [(ngModel)]="barcodeType" (ngModelChange)="generate()" class="sel">
            <option value="CODE128">Code 128 (Universal)</option>
            <option value="EAN13">EAN-13 (Product/Retail)</option>
            <option value="EAN8">EAN-8 (Short Product)</option>
            <option value="UPCA">UPC-A (North America)</option>
            <option value="CODE39">Code 39 (Industrial)</option>
            <option value="ITF14">ITF-14 (Shipping)</option>
            <option value="MSI">MSI (Inventory)</option>
          </select>
        </div>
        <div class="field">
          <label>Bar Color</label>
          <input type="color" [(ngModel)]="barColor" (ngModelChange)="generate()" class="cpick" />
        </div>
        <div class="field">
          <label>Background</label>
          <input type="color" [(ngModel)]="bgColor" (ngModelChange)="generate()" class="cpick" />
        </div>
        <div class="field">
          <label>Bar Width</label>
          <input type="number" [(ngModel)]="barWidth" (ngModelChange)="generate()" class="sm-inp" min="1" max="5" />
        </div>
        <div class="field">
          <label>Height (px)</label>
          <input type="number" [(ngModel)]="barHeight" (ngModelChange)="generate()" class="sm-inp" min="40" max="300" />
        </div>
        <div class="field checkbox">
          <label><input type="checkbox" [(ngModel)]="showText" (ngModelChange)="generate()" /> Show Text</label>
        </div>
      </div>

      <div class="input-row">
        <input [(ngModel)]="barcodeValue" (ngModelChange)="onValueChange()" class="big-inp" [placeholder]="placeholder()" />
        <button class="btn-gen" (click)="generate()">Generate</button>
      </div>

      <div class="error-msg" *ngIf="errorMsg()">⚠️ {{errorMsg()}}</div>

      <div class="preview-box" *ngIf="bars().length && !errorMsg()">
        <canvas #bc id="bc-canvas" [width]="canvasW()" [height]="canvasH()"></canvas>
        <div class="dl-row">
          <button class="btn-dl" (click)="downloadPng()">⬇ PNG</button>
          <button class="btn-dl svg-btn" (click)="downloadSvg()">⬇ SVG</button>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card" *ngFor="let t of typeInfo">
          <div class="ic-name">{{t.type}}</div>
          <div class="ic-desc">{{t.desc}}</div>
          <div class="ic-chars">Chars: {{t.chars}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .settings-row{display:flex;gap:.75rem;flex-wrap:wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:1rem;align-items:flex-end}
    .field{display:flex;flex-direction:column;gap:.3rem}.field label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .field.checkbox label{display:flex;align-items:center;gap:.4rem;font-size:.8rem;text-transform:none;font-weight:600;margin-top:.5rem}
    .sel{padding:.35rem .6rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem}
    .cpick{width:44px;height:30px;border:none;border-radius:5px;cursor:pointer}
    .sm-inp{width:64px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem}
    .input-row{display:flex;gap:.75rem;margin-bottom:1rem}
    .big-inp{flex:1;padding:.55rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;outline:none;font-family:monospace}
    .btn-gen{background:#2563eb;color:white;border:none;padding:.55rem 1.25rem;border-radius:8px;font-weight:700;cursor:pointer}
    .error-msg{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:.6rem .9rem;font-size:.83rem;margin-bottom:1rem}
    .preview-box{background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.25rem}
    canvas{max-width:100%}
    .dl-row{display:flex;gap:.5rem;justify-content:center;margin-top:1rem}
    .btn-dl{background:#2563eb;color:white;border:none;padding:.45rem 1.1rem;border-radius:7px;font-weight:700;cursor:pointer;font-size:.8rem}
    .svg-btn{background:#f8fafc;border:1px solid #e5e7eb;color:#374151}
    .info-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.65rem}
    .info-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.7rem .9rem}
    .ic-name{font-size:.8rem;font-weight:700;color:#111827;margin-bottom:.2rem}
    .ic-desc{font-size:.72rem;color:#6b7280;margin-bottom:.2rem}
    .ic-chars{font-size:.68rem;color:#9ca3af;font-family:monospace}
  `]
})
export class BarcodeGeneratorComponent implements OnInit {
  barcodeType = 'CODE128'; barcodeValue = ''; barColor = '#000000'; bgColor = '#ffffff';
  barWidth = 2; barHeight = 80; showText = true;
  bars = signal<{w:number,dark:boolean}[]>([]);
  errorMsg = signal('');
  canvasW = signal(400); canvasH = signal(120);

  typeInfo = [
    {type:'Code 128',desc:'Most versatile. Encodes full ASCII.',chars:'All ASCII, unlimited length'},
    {type:'EAN-13',desc:'Standard retail barcode worldwide.',chars:'Exactly 12 digits (13th auto)'},
    {type:'EAN-8',desc:'Compact retail for small products.',chars:'Exactly 7 digits (8th auto)'},
    {type:'UPC-A',desc:'North American retail standard.',chars:'Exactly 11 digits (12th auto)'},
    {type:'Code 39',desc:'Industrial and gov applications.',chars:'A-Z, 0-9, space, - . $ / + %'},
    {type:'ITF-14',desc:'Shipping cartons, wholesale.',chars:'Exactly 13 digits (14th auto)'},
    {type:'MSI',desc:'Inventory and warehouse use.',chars:'Digits 0-9 only'},
  ];

  placeholder() {
    const m: Record<string,string> = {CODE128:'Enter any text or numbers',EAN13:'Enter 12 digits',EAN8:'Enter 7 digits',UPCA:'Enter 11 digits',CODE39:'UPPERCASE LETTERS AND NUMBERS',ITF14:'Enter 13 digits',MSI:'Enter digits'};
    return m[this.barcodeType]||'Enter value';
  }

  ngOnInit(){this.barcodeValue='012345678901';this.generate();}

  onValueChange(){this.errorMsg.set('');this.generate();}

  generate(){
    if(!this.barcodeValue){this.bars.set([]);return;}
    try{
      let val=this.barcodeValue;
      // Validate and compute check digits
      if(this.barcodeType==='EAN13'){
        if(!/^\d{12,13}$/.test(val))throw new Error('EAN-13 requires exactly 12 digits');
        val=val.slice(0,12); val+=this.eanCheck(val,13);
      } else if(this.barcodeType==='EAN8'){
        if(!/^\d{7,8}$/.test(val))throw new Error('EAN-8 requires exactly 7 digits');
        val=val.slice(0,7); val+=this.eanCheck(val,8);
      } else if(this.barcodeType==='UPCA'){
        if(!/^\d{11,12}$/.test(val))throw new Error('UPC-A requires exactly 11 digits');
        val=val.slice(0,11); val+=this.eanCheck(val,12);
      } else if(this.barcodeType==='ITF14'){
        if(!/^\d{13,14}$/.test(val))throw new Error('ITF-14 requires exactly 13 digits');
        val=val.slice(0,13); val+=this.eanCheck(val,14);
      } else if(this.barcodeType==='CODE39'){
        val=val.toUpperCase();
        if(!/^[A-Z0-9\-\. \$\/\+\%]+$/.test(val))throw new Error('Code 39 only supports A-Z, 0-9, and - . $ / + %');
      } else if(this.barcodeType==='MSI'){
        if(!/^\d+$/.test(val))throw new Error('MSI only supports digits 0-9');
      }
      const b=this.encode(val,this.barcodeType);
      this.bars.set(b);
      this.errorMsg.set('');
      const totalW=b.reduce((a,x)=>a+x.w*this.barWidth,0)+40;
      this.canvasW.set(Math.max(200,totalW));
      this.canvasH.set(this.barHeight+(this.showText?28:12));
      setTimeout(()=>this.drawCanvas(),30);
    }catch(e:any){this.errorMsg.set(e.message||'Invalid value for this barcode type');this.bars.set([]);}
  }

  private eanCheck(d:string,len:number):string{
    let s=0;
    for(let i=0;i<d.length;i++) s+=parseInt(d[i])*(len===8||(i%2===1&&len!==8)?3:1);
    return String((10-s%10)%10);
  }

  private encode(val:string,type:string):{w:number,dark:boolean}[]{
    const bar=(w:number,dark:boolean)=>({w,dark});
    let bits='';
    if(type==='CODE128'){
      bits='11010011100'; // Start B
      for(let i=0;i<val.length;i++){const c=val.charCodeAt(i)-32;bits+=CODE128B[c]||'10110011100';}
      bits+='1100011101011'; // Stop
    } else if(type==='EAN13'||type==='UPCA'){
      const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
      const G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
      const R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
      const parity=['',' ','01011','01101','01110','10011','10110','11001','11010','11100'];// simplified
      bits='101';
      for(let i=1;i<=6;i++)bits+=L[parseInt(val[i])];
      bits+='01010';
      for(let i=7;i<=12;i++)bits+=R[parseInt(val[i])];
      bits+='101';
    } else if(type==='EAN8'){
      const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
      const R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
      bits='101';
      for(let i=0;i<4;i++)bits+=L[parseInt(val[i])];
      bits+='01010';
      for(let i=4;i<8;i++)bits+=R[parseInt(val[i])];
      bits+='101';
    } else if(type==='CODE39'){
      const c39:Record<string,string>={'0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101','4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011','8':'110100101101','9':'101100101101','A':'110101001011','B':'101101001011','C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101','G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101','K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011','O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001','S':'101101011001','T':'101011011001','U':'110010101011','V':'100110101011','W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101','-':'100101011011','.':'110010101101',' ':'100110101101','$':'100100100101','/':'100100101001','+':'100101001001','%':'101001001001','*':'100101101101'};
      bits='';
      val='*'+val+'*';
      for(const ch of val){bits+=(c39[ch]||'101001101101')+'0';}
    } else {
      // Generic fallback
      for(let i=0;i<val.length*8;i++) bits+=(val.charCodeAt(Math.floor(i/8))>>(7-i%8))&1?'1':'0';
    }
    const out:{w:number,dark:boolean}[]=[];
    let i2=0;
    while(i2<bits.length){const c=bits[i2];let w=0;while(i2<bits.length&&bits[i2]===c){w++;i2++;}out.push({w,dark:c==='1'});}
    return out;
  }

  drawCanvas(){
    const cvs=document.getElementById('bc-canvas') as HTMLCanvasElement;
    if(!cvs)return;
    const ctx=cvs.getContext('2d')!;
    ctx.fillStyle=this.bgColor;ctx.fillRect(0,0,cvs.width,cvs.height);
    let x=20;
    for(const b of this.bars()){
      ctx.fillStyle=b.dark?this.barColor:this.bgColor;
      ctx.fillRect(x,10,b.w*this.barWidth,this.barHeight);
      x+=b.w*this.barWidth;
    }
    if(this.showText){
      ctx.fillStyle=this.barColor;ctx.font=`${Math.max(10,this.barHeight*0.15)}px monospace`;
      ctx.textAlign='center';ctx.fillText(this.barcodeValue,cvs.width/2,this.barHeight+24);
    }
  }

  downloadPng(){const c=document.getElementById('bc-canvas') as HTMLCanvasElement;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='barcode.png';a.click();}
  downloadSvg(){
    const bars=this.bars();let x=20;let rects='';
    for(const b of bars){if(b.dark)rects+=`<rect x="${x}" y="10" width="${b.w*this.barWidth}" height="${this.barHeight}" fill="${this.barColor}"/>`;x+=b.w*this.barWidth;}
    const w=this.canvasW(),h=this.canvasH();
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${this.bgColor}"/>${rects}${this.showText?`<text x="${w/2}" y="${this.barHeight+24}" text-anchor="middle" font-family="monospace" font-size="${Math.max(10,this.barHeight*0.15)}" fill="${this.barColor}">${this.barcodeValue}</text>`:''}</svg>`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));a.download='barcode.svg';a.click();
  }
}

// CODE128B encoding table (subset)
const CODE128B: string[] = [
  '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100',
  '10011001000','10011000100','10001100100','11001001000','11001000100','11000100100',
  '10110011100','10011011100','10011001110','10111001100','10011101100','10011100110',
  '11001110010','11001011100','11001001110','11011100100','11001110100','11101101110',
  '11101001100','11100101100','11100100110','11101100100','11100110100','11100110010',
  '11011011000','11011000110','11000110110','10100011000','10001011000','10001000110',
  '10110001000','10001101000','10001100010','11010001000','11000101000','11000100010',
  '10110111000','10110001110','10001101110','10111011000','10111000110','10001110110',
  '11101110110','10111011110','10111101110','11110101110','11000010100','10001000010',
  '10100100000','10100010000','10010010000','11010111000','11010001110','11000101110',
  '10100111110','10100001110','10000101110','10111100010','10111110100','10011110110',
  '10011110010','11110100010','11110010100','11001011110','10100111100','10010111100',
  '10010011110','10111100100','10011100010','11110101000','10001111010','10111101000',
  '10100011110','11110001010','10011110100','10011110010','11110100100','10011011110',
  '10011101110','11110010010','11010100000','11010010000','11010000100','11000010010',
];
