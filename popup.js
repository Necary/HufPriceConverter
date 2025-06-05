document.addEventListener("DOMContentLoaded", () => {
	const hufeurInput = document.getElementById("hufeur");
	const eurrsdInput = document.getElementById("eurrsd");
	const saveBtn = document.getElementById("save");
	const stts = document.getElementById("status");
	// Load saved formulas
	chrome.storage.local.get(["hufeur", "eurrsd"], (data) => {
	hufeurInput.value = data.hufeur || "/392*0.917";
	eurrsdInput.value = data.eurrsd || "*117.5";
	});
	// Save handler
	
function parseFormula(formula) {
	if (!formula || typeof formula !== 'string') return NaN;

	// Prepend '*' if it doesn't start with an operator
	if (!/^[*/+\-]/.test(formula)) {
		formula = '*' + formula;
	}

	const safeExpr = '1' + formula;

	// Validate entire expression contains only math-friendly characters
	if (!/^[\d+\-*/().\s]+$/.test(safeExpr)) {
		return NaN; // Invalid characters found
	}

	// Tokenize and compute
	const tokens = formula.match(/[*/+\-]?\s*[\d.]+/g);
	if (!tokens) return NaN;

	let result = 1;
	for (let token of tokens) {
		token = token.trim();
		const value = parseFloat(token.slice(1));
		if (isNaN(value)) return NaN;

		const op = token[0];
		if (op === '*') result *= value;
		else if (op === '/') result /= value;
		else if (op === '+') result += value;
		else if (op === '-') result -= value;
		else result *= parseFloat(token); // Fallback
	}

	return result;
}

function setStatus(txt, color, type) {
	switch(type) {
		case "error":
			console.error(txt);
			break;
		default:
			console.log(txt);
	}
	
	console.log(txt);
	stts.style.display = "block";
	stts.style.color = color;
	stts.textContent = txt;
	setTimeout(() => {
		stts.style.display = "none";
	}, 5000);
}


	saveBtn.addEventListener('click', () => {
		const hufeurFormula = hufeurInput.value.trim();
		const eurrsdFormula = eurrsdInput.value.trim();

		try {
			const rate_hufeur = parseFormula(`1${hufeurFormula}`);
			const rate_eurrsd = parseFormula(`1${eurrsdFormula}`);
		
			if (isNaN(rate_hufeur) || isNaN(rate_eurrsd)) throw new Error("Invalid rate");
			
			console.log(rate_hufeur+" "+rate_eurrsd+" "+hufeurFormula+" "+eurrsdFormula);
			chrome.storage.local.set({
				hufeur: hufeurFormula,
				eurrsd: eurrsdFormula,
				rate_hufeur,
				rate_eurrsd
			}, () => {
			setStatus("Saved!", "green");
			});

		} catch (e) {
		setStatus("Invalid formula! "+e, "red", "error");
	}
	});
});