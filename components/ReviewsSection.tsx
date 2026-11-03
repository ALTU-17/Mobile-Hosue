import { site } from "@/lib/catalog";
import { ArrowUpRight, GoogleIcon, StarIcon } from "@/components/Icons";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="reviews__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          style={{
            width: "1rem",
            height: "1rem",
            display: "inline-block",
            opacity: index < Math.round(rating) ? 1 : 0.2,
          }}
        />
      ))}
    </span>
  );
}

export function ReviewsSection() {
  const reviewUrl = site.store.reviewUrl;

  return (
    <section className="section reviews" id="reviews" aria-labelledby="reviews-heading">
      <div className="container">
        <div className="reviews__panel">
          <div>
            <span className="eyebrow">04 / The Verdict</span>
            <div className="reviews__score">
              <span className="reviews__number">{site.store.rating}</span>
              <div className="reviews__score-meta">
                <Stars rating={site.store.rating} />
                <span className="reviews__count">
                  {site.store.reviewCount} Google reviews
                </span>
              </div>
            </div>
            <h2 id="reviews-heading">
              {site.store.rating}, and {site.store.reviewCount} reasons why.
            </h2>
            <p>
              The rating is Google&apos;s, not ours. Read the reviews, then come and check the
              counter yourself. If something isn&apos;t right, the owner is one WhatsApp away.
            </p>
            <div className="reviews__actions">
              <a
                className="btn btn--small"
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GoogleIcon />
                Read all {site.store.reviewCount} reviews
              </a>
              <a
                className="btn btn--ghost btn--small"
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave a review
                <ArrowUpRight />
              </a>
            </div>
          </div>

          <div className="reviews__receipt" aria-label="Google review summary">
            <div className="reviews__receipt-head">
              <span>Mobile House / Google rating</span>
              <GoogleIcon style={{ width: "1rem", height: "1rem", color: "var(--marigold)" }} />
            </div>
            <div className="reviews__receipt-row">
              <span>Shop</span>
              <strong>Mobile House, New Usmanpura</strong>
            </div>
            <div className="reviews__receipt-row">
              <span>Average</span>
              <strong>{site.store.rating} / 5</strong>
            </div>
            <div className="reviews__receipt-row">
              <span>Reviews</span>
              <strong>{site.store.reviewCount}</strong>
            </div>
            <div className="reviews__receipt-row">
              <span>Open</span>
              <strong>All days · 10:30–22:30</strong>
            </div>
            <div className="reviews__receipt-total">
              <span>Verified on Google</span>
              <strong>{site.store.rating}</strong>
            </div>
            <p className="reviews__receipt-foot">
              Rating shown as captured on {site.store.updatedAt}. It can change as new reviews
              arrive. No testimonial on this page is invented — quotes appear only when the shop
              supplies the real text.
            </p>
          </div>
        </div>

        {site.reviews.quotes.length > 0 && (
          <div className="review-quotes">
            {site.reviews.quotes.map((quote) => (
              <blockquote className="review-quote" key={`${quote.name}-${quote.text}`}>
                <span className="review-quote__stars" aria-label={`${quote.rating} out of 5 stars`}>
                  {"★".repeat(Math.round(quote.rating))}
                </span>
                <p>&ldquo;{quote.text}&rdquo;</p>
                <cite>{quote.name} · Google review</cite>
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
