import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-wrap">

      <!-- Hero -->
      <section class="about-hero">
        <div class="container">
          <div class="hero-label">About Us</div>
          <h1 class="hero-title">Built for Everyone.<br><span class="accent">Free, Fast & Private.</span></h1>
          <p class="hero-sub">UtilityMega is a collection of 100+ free online tools designed to make everyday tasks — from financial planning to image compression — instant, accessible, and completely private.</p>
        </div>
        <div class="hero-grid-bg"></div>
      </section>

      <!-- Mission -->
      <section class="section">
        <div class="container">
          <div class="two-col">
            <div class="col-text">
              <div class="section-label">Our Mission</div>
              <h2>Utility tools shouldn't cost money or compromise your privacy.</h2>
              <p>We built UtilityMega because we were tired of tools that required sign-ups, showed watermarks, uploaded your files to servers, or locked basic features behind paywalls. Every tool here is free, runs in your browser, and never sees your data.</p>
              <p>Whether you're a developer formatting JSON at midnight, a farmer calculating fertilizer needs, a student converting units, or a marketer generating meta tags — there's a tool here for you.</p>
            </div>
            <div class="col-stats">
              <div class="stat-card">
                <div class="stat-num">100+</div>
                <div class="stat-label">Free Tools</div>
              </div>
              <div class="stat-card">
                <div class="stat-num">10</div>
                <div class="stat-label">Categories</div>
              </div>
              <div class="stat-card">
                <div class="stat-num">0</div>
                <div class="stat-label">Logins Required</div>
              </div>
              <div class="stat-card">
                <div class="stat-num">∞</div>
                <div class="stat-label">Usage Limits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="section section-alt">
        <div class="container">
          <div class="section-label center">What We Stand For</div>
          <h2 class="section-title center">Our Core Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">⚡</div>
              <h3>Speed First</h3>
              <p>Every tool runs client-side. No server uploads, no processing queues. Results are instant because your browser does the work.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🔒</div>
              <h3>Privacy by Default</h3>
              <p>Your files, text, and data never leave your device. We don't log, store, or analyze any content you process with our tools.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🆓</div>
              <h3>Permanently Free</h3>
              <p>No freemium traps. No "upgrade to unlock." Every feature of every tool is available to everyone, always, at no cost.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">📱</div>
              <h3>Works Everywhere</h3>
              <p>Fully responsive on mobile, tablet, and desktop. Built with accessibility in mind so everyone can use these tools effectively.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🌾</div>
              <h3>Inclusive Design</h3>
              <p>Tools built for developers, students, farmers, marketers, and everyone in between. Utility should be universal.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🔄</div>
              <h3>Always Improving</h3>
              <p>We continuously add new tools and refine existing ones based on user needs. The toolkit grows with your requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section">
        <div class="container">
          <div class="section-label center">What We Offer</div>
          <h2 class="section-title center">10 Categories, 100+ Tools</h2>
          <div class="cat-list">
            <a routerLink="/calculators" class="cat-item">🧮 <span>Calculators</span></a>
            <a routerLink="/image-tools" class="cat-item">🖼️ <span>Image Tools</span></a>
            <a routerLink="/video-tools" class="cat-item">🎬 <span>Video Tools</span></a>
            <a routerLink="/developer-tools" class="cat-item">💻 <span>Developer Tools</span></a>
            <a routerLink="/text-tools" class="cat-item">📝 <span>Text Tools</span></a>
            <a routerLink="/security-tools" class="cat-item">🔒 <span>Security Tools</span></a>
            <a routerLink="/seo-tools" class="cat-item">📈 <span>SEO Tools</span></a>
            <a routerLink="/unit-converters" class="cat-item">⚖️ <span>Unit Converters</span></a>
            <a routerLink="/utility-tools" class="cat-item">🔧 <span>Utility Tools</span></a>
            <a routerLink="/farmers-tools" class="cat-item">🌾 <span>Farmers Tools</span></a>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section section-cta">
        <div class="container">
          <h2>Start using our tools today</h2>
          <p>No account needed. No credit card. Just tools that work.</p>
          <div class="cta-btns">
            <a routerLink="/" class="btn-primary">Browse All Tools →</a>
            <a routerLink="/contact" class="btn-secondary">Get in Touch</a>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .page-wrap { min-height: 60vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }

    /* Hero */
    .about-hero { position: relative; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%); color: white; padding: 5rem 1.25rem 4rem; overflow: hidden; }
    .hero-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
    .about-hero .container { position: relative; max-width: 700px; }
    .hero-label { display: inline-block; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #93c5fd; background: rgba(147,197,253,.1); border: 1px solid rgba(147,197,253,.2); border-radius: 99px; padding: .3rem .9rem; margin-bottom: 1.25rem; }
    .hero-title { font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.25rem; }
    .accent { background: linear-gradient(90deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 1.05rem; opacity: .8; line-height: 1.75; max-width: 580px; }

    /* Sections */
    .section { padding: 4rem 1.25rem; }
    .section-alt { background: #f8fafc; }
    .section-label { font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--primary, #2563eb); margin-bottom: .6rem; }
    .section-label.center { text-align: center; }
    .section-title { font-size: clamp(1.4rem, 2.5vw, 2rem); font-weight: 800; margin-bottom: 2.5rem; }
    .section-title.center { text-align: center; }

    /* Two col */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .col-text h2 { font-size: clamp(1.3rem, 2.5vw, 1.85rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.25; }
    .col-text p { color: #4b5563; line-height: 1.8; margin-bottom: 1rem; font-size: .95rem; }
    .col-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
    .stat-num { font-size: 2.25rem; font-weight: 900; color: var(--primary, #2563eb); line-height: 1; margin-bottom: .3rem; }
    .stat-label { font-size: .78rem; color: #6b7280; font-weight: 600; }

    /* Values */
    .values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .value-card { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.5rem; transition: all .2s; }
    .value-card:hover { border-color: #2563eb; box-shadow: 0 4px 20px rgba(37,99,235,.1); transform: translateY(-2px); }
    .value-icon { font-size: 2rem; margin-bottom: .75rem; }
    .value-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; }
    .value-card p { font-size: .875rem; color: #6b7280; line-height: 1.65; }

    /* Category list */
    .cat-list { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }
    .cat-item { display: flex; align-items: center; gap: .5rem; padding: .65rem 1.25rem; background: white; border: 1px solid #e5e7eb; border-radius: 99px; text-decoration: none; color: #374151; font-size: .875rem; font-weight: 600; transition: all .15s; }
    .cat-item:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

    /* CTA */
    .section-cta { background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; text-align: center; }
    .section-cta h2 { font-size: 2rem; font-weight: 800; margin-bottom: .75rem; }
    .section-cta p { opacity: .8; margin-bottom: 2rem; font-size: 1.05rem; }
    .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary { background: white; color: #1e40af; padding: .85rem 2rem; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: .95rem; transition: all .15s; }
    .btn-primary:hover { background: #eff6ff; }
    .btn-secondary { background: rgba(255,255,255,.15); color: white; border: 1px solid rgba(255,255,255,.3); padding: .85rem 2rem; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: .95rem; transition: all .15s; }
    .btn-secondary:hover { background: rgba(255,255,255,.25); }

    @media (max-width: 768px) {
      .two-col { grid-template-columns: 1fr; gap: 2.5rem; }
      .col-stats { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.updateMeta({
      title: 'About Us — UtilityMega',
      description: 'Learn about UtilityMega — 100+ free online tools for calculators, image tools, developer utilities, SEO tools and more. Free, fast, private.',
      url: 'https://utilitymega.com/about'
    });
  }
}
