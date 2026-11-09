import React, { useEffect, useState } from "react";
import { emojiFor, tileColor } from "../utils.js";

// Shows the product picture, or a coloured tile with an emoji when there is none
export default function ProductImage({ product, size = "card" }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [product.image]);

  const cls = `product-img product-img-${size}`;
  if (product.image && !broken) {
    return <img src={product.image} alt={product.name} className={cls} onError={() => setBroken(true)} />;
  }
  return (
    <div className={`${cls} product-tile`} style={{ background: tileColor(product.name) }} role="img" aria-label={product.name}>
      <span>{emojiFor(product.category)}</span>
    </div>
  );
}
