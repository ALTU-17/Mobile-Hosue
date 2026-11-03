import { site } from "@/lib/catalog";

export function BrandRail() {
  const items = [...site.brands, ...site.brands];

  return (
    <section className="brand-rail" aria-label="Brands stocked at Mobile House">
      <div className="container brand-rail__inner">
        <span className="brand-rail__label">
          {site.brands.length} brands · one counter
        </span>
        <div className="brand-rail__viewport">
          <div className="brand-rail__track" aria-hidden="true">
            {items.map((brand, index) => (
              <span key={`${brand}-${index}`} className="brand-rail__item">
                {brand}
                <span className="brand-rail__dot"> ◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
