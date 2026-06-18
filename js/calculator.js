function calcRun() {
  const d    = parseFloat(document.getElementById('cDiam').value);
  const t    = parseFloat(document.getElementById('cThick').value);
  const a    = parseFloat(document.getElementById('cAngle').value);
  const errEl  = document.getElementById('cError');
  const resEl  = document.getElementById('cResults');
  const mainEl = document.getElementById('cMainResult');

  setFieldError(errEl, '');
  resEl.style.display = 'none';
  mainEl.style.display = 'none';

  if (isNaN(d) || isNaN(t)) { setFieldError(errEl, 'Wypełnij średnicę i grubość.'); return; }
  if (d <= 0)               { setFieldError(errEl, 'Średnica musi być większa od zera.'); return; }
  if (2 * t >= d)           { setFieldError(errEl, '2 × grubość nie może być ≥ średnicy.'); return; }

  const inner = d - 2 * t;
  // (D − 2t) × sin(kąt ÷ 2), kąt w stopniach → radiany dla Math.sin
  const calc = (deg) => inner * Math.sin((deg / 2) * Math.PI / 180);

  document.getElementById('cVal20').textContent = calc(20).toFixed(3);
  document.getElementById('cVal25').textContent = calc(25).toFixed(3);
  document.getElementById('cVal30').textContent = calc(30).toFixed(3);

  if (!isNaN(a) && a > 0) {
    mainEl.textContent = `Twój kąt ${a}° → ${calc(a).toFixed(3)}`;
    mainEl.style.display = 'block';
  }

  resEl.style.display = 'block';
}
