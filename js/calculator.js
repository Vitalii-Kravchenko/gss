function calcRun() {
  const d    = parseFloat(document.getElementById('cDiam').value);
  const t    = parseFloat(document.getElementById('cThick').value);
  const a    = parseFloat(document.getElementById('cAngle').value);
  const errEl  = document.getElementById('cError');
  const resEl  = document.getElementById('cResults');
  const mainEl = document.getElementById('cMainResult');

  errEl.textContent = '';
  resEl.style.display = 'none';
  mainEl.style.display = 'none';

  if (isNaN(d) || isNaN(t)) { errEl.textContent = '⚠️ Wypełnij średnicę i grubość.'; return; }
  if (d <= 0)               { errEl.textContent = '⚠️ Średnica musi być większa od zera.'; return; }
  if (2 * t >= d)           { errEl.textContent = '⚠️ 2 × grubość nie może być ≥ średnicy.'; return; }

  const base = (d - 2 * t) * Math.PI / 360;
  document.getElementById('cVal20').textContent = (base * 20).toFixed(3);
  document.getElementById('cVal25').textContent = (base * 25).toFixed(3);
  document.getElementById('cVal30').textContent = (base * 30).toFixed(3);

  if (!isNaN(a) && a > 0) {
    mainEl.textContent = `Twój kąt ${a}° → ${(base * a).toFixed(3)}`;
    mainEl.style.display = 'block';
  }

  resEl.style.display = 'block';
}
