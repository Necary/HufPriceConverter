chrome.storage.local.get(["rate_hufeur", "rate_eurrsd"], (data) => {
  const rate_hufeur = data.rate_hufeur || "0.00238392857142857142857142857143";
  const rate_eurrsd = data.rate_eurrsd || "117";
  console.log("[IponPrices] 💱 Rates loaded: ", rate_hufeur, rate_eurrsd);
  

function parseAndConvertPrice(text) {
  const match = text.match(/([\d\s]+)\s*Ft/);
  if (!match) {
	  const match = text.match(/([\d,\s]+)\s*€/);
	    if (!match) {
          console.log("[IponPrices] ❌ Could not parse:", text);
          return null;
		}
	    const eur = parseInt(match[1].replace(/\s/g, ''));
        const converted_rsd = (eur * rate_eurrsd).toFixed(2);
        return `~RSD${converted_rsd}`;
    }
  const huf = parseInt(match[1].replace(/\s/g, ''));
  const converted = (huf * rate_hufeur).toFixed(2);
  const converted_rsd = (converted * rate_eurrsd).toFixed(2);
  return `~€${converted} / ~RSD${converted_rsd}`;
}

function updatePrices() {
  document.querySelectorAll('h4.product-price, h4.cart-total, div.cart-product-price').forEach(el => {
    if (el.getAttribute('data-converted') === 'true') return;
    const original = el.innerText;
    const converted = parseAndConvertPrice(original);
    if (converted) {
      el.title = `${converted}`;
      el.setAttribute('data-converted', 'true');
    }
  });
}

// Initial run
updatePrices();


// Watch for dynamic changes
const observer = new MutationObserver(updatePrices);
observer.observe(document.body, { childList: true, subtree: true });

});
window.addEventListener("update-prices-now", () => {
  updatePrices();
});
