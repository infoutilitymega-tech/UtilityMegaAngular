import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">

        <div class="footer-grid">

          <!-- Brand -->
          <div class="footer-brand">
            <a routerLink="/" class="brand-logo">⚡ UtilityMega</a>
            <p class="brand-desc">100+ free online tools for everyone. No login. No limits. No cost. All processing happens in your browser.</p>
            <div class="brand-badges">
              <span class="fbadge">🆓 100% Free</span>
              <span class="fbadge">🔒 Private</span>
              <span class="fbadge">⚡ Instant</span>
            </div>
          </div>

          <!-- Categories -->
          <div class="footer-col">
            <h4>Tools</h4>
            <a routerLink="/calculators">🧮 Calculators</a>
            <a routerLink="/image-tools">🖼️ Image Tools</a>
            <a routerLink="/video-tools">🎬 Video Tools</a>
            <a routerLink="/developer-tools">💻 Developer Tools</a>
            <a routerLink="/text-tools">📝 Text Tools</a>
          </div>

          <div class="footer-col">
            <h4>More Tools</h4>
            <a routerLink="/security-tools">🔒 Security Tools</a>
            <a routerLink="/seo-tools">📈 SEO Tools</a>
            <a routerLink="/unit-converters">⚖️ Unit Converters</a>
            <a routerLink="/utility-tools">🔧 Utility Tools</a>
            <a routerLink="/farmers-tools">🌾 Farmers Tools</a>
          </div>

          <!-- Company -->
          <div class="footer-col">
            <h4>Company</h4>
            <a routerLink="/about">About Us</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/sitemap">Sitemap</a>
            <a routerLink="/privacy-policy">Privacy Policy</a>
            <a routerLink="/terms-of-use">Terms of Use</a>
          </div>

        </div>

        <div class="footer-bottom">
          <p class="copyright">© {{ year }} UtilityMega. All rights reserved. Made with ❤️ for the internet.</p>
          <div class="bottom-links">
            <a routerLink="/privacy-policy">Privacy</a>
            <span class="sep">·</span>
            <a routerLink="/terms-of-use">Terms</a>
            <span class="sep">·</span>
            <a routerLink="/contact">Contact</a>
            <span class="sep">·</span>
            <a routerLink="/sitemap">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #0f172a; color: #cbd5e1; padding: 3.5rem 1.25rem 0; margin-top: auto; }
    .container { max-width: 1200px; margin: 0 auto; }

    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 2.5rem; padding-bottom: 3rem; border-bottom: 1px solid #1e293b; }

    /* Brand */
    .brand-logo { display: block; font-size: 1.2rem; font-weight: 800; color: white; text-decoration: none; margin-bottom: .75rem; }
    .brand-desc { font-size: .8rem; line-height: 1.7; color: #64748b; margin-bottom: 1rem; }
    .brand-badges { display: flex; flex-wrap: wrap; gap: .4rem; }
    .fbadge { font-size: .7rem; padding: .2rem .6rem; border-radius: 99px; background: rgba(255,255,255,.07); color: #94a3b8; font-weight: 600; border: 1px solid rgba(255,255,255,.08); }

    /* Columns */
    .footer-col h4 { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #475569; margin-bottom: .9rem; }
    .footer-col a { display: block; color: #94a3b8; text-decoration: none; font-size: .82rem; padding: .28rem 0; transition: color .12s; }
    .footer-col a:hover { color: #e2e8f0; }

    /* Bottom */
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 0; flex-wrap: wrap; gap: .75rem; }
    .copyright { font-size: .75rem; color: #475569; }
    .bottom-links { display: flex; align-items: center; gap: .5rem; }
    .bottom-links a { font-size: .75rem; color: #475569; text-decoration: none; transition: color .12s; }
    .bottom-links a:hover { color: #94a3b8; }
    .sep { color: #334155; font-size: .75rem; }

    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 560px) {
      .footer-grid { grid-template-columns: 1fr; gap: 1.75rem; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
