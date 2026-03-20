import { Component, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AdSlot = 'leaderboard' | 'rectangle' | 'sidebar' | 'in-article' | 'footer';

const AD_SIZES: Record<AdSlot, { w: string; h: string; label: string }> = {
  leaderboard: { w: '100%', h: '90px',  label: '728×90 Leaderboard' },
  rectangle:   { w: '336px', h: '280px', label: '336×280 Rectangle' },
  sidebar:     { w: '300px', h: '250px', label: '300×250 Sidebar' },
  'in-article':{ w: '100%', h: '250px', label: 'In-Article' },
  footer:      { w: '100%', h: '90px',  label: '728×90 Footer' },
};

@Component({
  selector: 'app-adsense',
  standalone: true,
  template: `
    <div class="ad-wrap ad-{{ slot }}" [style.minHeight]="size.h" [attr.aria-label]="'Advertisement'">
      <!-- Production: replace below with real AdSense tag -->
      <!-- <ins class="adsbygoogle" style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="{{ adSlotId }}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins> -->
      <div class="ad-placeholder" [style.height]="size.h">
        <span class="ad-label">Advertisement</span>
        <span class="ad-size">{{ size.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .ad-wrap { display:flex; justify-content:center; width:100%; }
    .ad-placeholder {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      width:100%; max-width:100%;
      background: repeating-linear-gradient(45deg, var(--bg-alt) 0px, var(--bg-alt) 10px, var(--border) 10px, var(--border) 11px);
      border:1px dashed var(--border); border-radius:8px;
      gap:.25rem;
    }
    .ad-label { font-size:.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:.06em; }
    .ad-size { font-size:.65rem; color:var(--text-muted); }
    .ad-leaderboard { margin: .5rem 0; }
    .ad-footer { margin: 1rem 0; }
    .ad-sidebar .ad-placeholder { max-width:300px; }
    .ad-rectangle .ad-placeholder { max-width:336px; }
    @media(max-width:600px) { .ad-leaderboard,.ad-footer { display:none; } }
  `]
})
export class AdsenseComponent implements OnInit {
  @Input() slot: AdSlot = 'rectangle';
  @Input() adSlotId = '0000000000';

  size = AD_SIZES.rectangle;
  private platform = inject(PLATFORM_ID);

  ngOnInit() {
    this.size = AD_SIZES[this.slot] ?? AD_SIZES.rectangle;
    if (isPlatformBrowser(this.platform)) {
      // Uncomment when AdSense is active:
      // setTimeout(() => { try { (window as any).adsbygoogle.push({}); } catch(e) {} }, 100);
    }
  }
}
