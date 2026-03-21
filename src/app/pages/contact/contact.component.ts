import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-wrap">

      <!-- Hero -->
      <section class="contact-hero">
        <div class="container">
          <div class="hero-label">Contact Us</div>
          <h1>Get in Touch</h1>
          <p>Have a question, feedback, or a tool suggestion? We'd love to hear from you.</p>
        </div>
      </section>

      <!-- Content -->
      <section class="section">
        <div class="container">
          <div class="contact-grid">

            <!-- Email Card -->
            <div class="contact-main">
              <div class="contact-card primary-card">
                <div class="contact-icon">✉️</div>
                <h2>Email Us</h2>
                <p>The best way to reach us is by email. We typically respond within 24–48 hours on business days.</p>
                <a href="mailto:info@utilitymega.com" class="email-btn">
                  {{'info@utilitymega.com'}}
                  <span class="btn-arrow">→</span>
                </a>
                <div class="email-note">Opens your default email client</div>
              </div>

              <!-- What to include -->
              <div class="tips-card">
                <h3>📋 What to include in your email</h3>
                <ul class="tips-list">
                  <li><span class="tip-icon">🔧</span> <div><strong>Tool issues:</strong> Name of the tool, your browser, and what went wrong</div></li>
                  <li><span class="tip-icon">💡</span> <div><strong>Tool suggestions:</strong> What the tool should do and who would use it</div></li>
                  <li><span class="tip-icon">🤝</span> <div><strong>Business inquiries:</strong> Your name, company, and what you have in mind</div></li>
                  <li><span class="tip-icon">🐛</span> <div><strong>Bug reports:</strong> Steps to reproduce, expected vs actual behavior</div></li>
                </ul>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="contact-sidebar">

              <div class="sb-card">
                <h3>🕐 Response Time</h3>
                <div class="response-times">
                  <div class="rt-item">
                    <span class="rt-type">General queries</span>
                    <span class="rt-time">24–48 hrs</span>
                  </div>
                  <div class="rt-item">
                    <span class="rt-type">Bug reports</span>
                    <span class="rt-time">Within 48 hrs</span>
                  </div>
                  <div class="rt-item">
                    <span class="rt-type">Business inquiries</span>
                    <span class="rt-time">2–3 days</span>
                  </div>
                </div>
              </div>

              <div class="sb-card">
                <h3>❓ Common Questions</h3>
                <div class="faq-links">
                  <div class="faq-q-item">
                    <strong>Is UtilityMega really free?</strong>
                    <p>Yes — 100% free, no login, no limits.</p>
                  </div>
                  <div class="faq-q-item">
                    <strong>Are my files safe?</strong>
                    <p>All processing happens in your browser. Nothing is uploaded to our servers.</p>
                  </div>
                  <div class="faq-q-item">
                    <strong>Can I suggest a new tool?</strong>
                    <p>Absolutely! Email us your idea and we'll consider adding it.</p>
                  </div>
                </div>
              </div>

              <div class="sb-card policy-links">
                <h3>📄 Policies</h3>
                <a routerLink="/privacy-policy" class="policy-link">Privacy Policy →</a>
                <a routerLink="/terms-of-use" class="policy-link">Terms of Use →</a>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .page-wrap { min-height: 60vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }

    /* Hero */
    .contact-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%); color: white; padding: 4rem 1.25rem 3rem; }
    .hero-label { display: inline-block; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #93c5fd; background: rgba(147,197,253,.1); border: 1px solid rgba(147,197,253,.2); border-radius: 99px; padding: .3rem .9rem; margin-bottom: 1.25rem; }
    .contact-hero h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; margin-bottom: .75rem; }
    .contact-hero p { opacity: .8; font-size: 1.05rem; max-width: 480px; }

    .section { padding: 3.5rem 1.25rem 4rem; }

    /* Grid */
    .contact-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
    .contact-main { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Primary card */
    .primary-card { background: white; border: 1.5px solid #e5e7eb; border-radius: 16px; padding: 2.5rem; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
    .contact-icon { font-size: 3rem; margin-bottom: 1rem; }
    .primary-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: .75rem; }
    .primary-card p { color: #4b5563; line-height: 1.7; margin-bottom: 1.75rem; max-width: 400px; margin-left: auto; margin-right: auto; }
    .email-btn { display: inline-flex; align-items: center; gap: .5rem; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: white; padding: 1rem 2rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1rem; transition: all .2s; box-shadow: 0 4px 14px rgba(29,78,216,.3); }
    .email-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(29,78,216,.4); }
    .btn-arrow { font-size: 1.1rem; }
    .email-note { font-size: .75rem; color: #9ca3af; margin-top: .75rem; }

    /* Tips card */
    .tips-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.75rem; }
    .tips-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
    .tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .9rem; }
    .tips-list li { display: flex; gap: .85rem; align-items: flex-start; }
    .tip-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: .1rem; }
    .tips-list strong { font-size: .875rem; display: block; margin-bottom: .1rem; }
    .tips-list div { font-size: .825rem; color: #6b7280; line-height: 1.5; }

    /* Sidebar */
    .contact-sidebar { display: flex; flex-direction: column; gap: 1rem; }
    .sb-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; }
    .sb-card h3 { font-size: .875rem; font-weight: 700; margin-bottom: .9rem; }

    /* Response times */
    .response-times { display: flex; flex-direction: column; gap: .5rem; }
    .rt-item { display: flex; justify-content: space-between; align-items: center; padding: .45rem 0; border-bottom: 1px solid #f3f4f6; }
    .rt-item:last-child { border-bottom: none; }
    .rt-type { font-size: .8rem; color: #4b5563; }
    .rt-time { font-size: .78rem; font-weight: 700; color: #059669; background: #ecfdf5; padding: .15rem .5rem; border-radius: 99px; }

    /* FAQ items */
    .faq-links { display: flex; flex-direction: column; gap: .85rem; }
    .faq-q-item strong { font-size: .82rem; display: block; margin-bottom: .2rem; color: #111827; }
    .faq-q-item p { font-size: .78rem; color: #6b7280; margin: 0; line-height: 1.5; }

    /* Policy links */
    .policy-links { display: flex; flex-direction: column; gap: .3rem; }
    .policy-link { display: block; color: #2563eb; text-decoration: none; font-size: .85rem; font-weight: 600; padding: .4rem 0; border-bottom: 1px solid #f3f4f6; transition: color .15s; }
    .policy-link:last-child { border-bottom: none; }
    .policy-link:hover { color: #1e40af; }

    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.updateMeta({
      title: 'Contact Us — UtilityMega',
      description: 'Contact UtilityMega for tool suggestions, bug reports, or business inquiries. Email us at info@utilitymega.com.',
      url: 'https://utilitymega.com/contact'
    });
  }
}
