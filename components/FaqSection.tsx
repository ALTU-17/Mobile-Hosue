import { faqs } from "@/lib/faq";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/Icons";

export function FaqSection() {
  return (
    <section className="section faq" id="faq" aria-labelledby="faq-heading">
      <div className="container faq__layout">
        <div className="faq__intro">
          <span className="eyebrow">07 / Good to know</span>
          <h2 className="section-title" id="faq-heading">
            Good questions. Straight answers.
          </h2>
          <p className="section-intro">
            The things people ask before they visit. If yours is not here, message the shop — the
            reply comes from behind the counter.
          </p>
          <a
            className="btn btn--ghost btn--small"
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            Ask on WhatsApp
          </a>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question} open={index === 0}>
              <summary>{faq.question}</summary>
              <div className="faq-item__answer">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
