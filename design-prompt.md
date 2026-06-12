Design a **mobile-first UI** (mobile-only is fine) for **"GSS Panewki"** — an internal single-page web tool used by factory workers on the shop floor to look up bearing-shell (panewka) grinding data for three machines: GSS 1, GSS 2, GSS 3. It is used one-handed on a phone, often in poor lighting, so it needs: high contrast, large touch targets (min 44px), and big, instantly legible numbers (a monospace font for numeric values is recommended).

**UI language is Polish — use the exact texts given below.**

**Deliverable:** one static HTML file + CSS (embedded or separate), **no JavaScript, no frameworks**. Show every screen, modal and state as separate stacked sections on one page (label each section) so the markup can be wired to existing logic later. Use CSS variables for all colors. The current app is dark/industrial with an amber accent — feel free to redesign completely, but keep a dark theme.

The app is one screen with two tabs plus modals:

1. **Header**: app title "GSS".
2. **Tab navigation**: "🔍 Panewki" (active) and "🧮 Kalkulator".
3. **Collapsed admin row** (visually quiet): "⚙️ Ustawienia (tylko dla administratora)" → expands to a password input "GitHub Token (tylko dla admina)" and a button "💾 Zapisz token".
4. **Machine selector**: three equal buttons "GSS 1", "GSS 2", "GSS 3"; design the active state.
5. **Search field**: placeholder "Szukaj numeru...", clear button "✕", and a suggestions dropdown. Each suggestion row: left — the part number with the typed prefix highlighted (e.g. "# **18**013X1032"); right side — diameter "⌀106.330" and, **only when the item is stored in the locker, a slot badge "📦 14" next to the diameter**. Also design the empty state: ❌ Numer "1234" nie istnieje w bazie.
6. **Result card** (the main component):
   - number "# 1402291079" + machine label "GSS 1"
   - slot status, two variants: stored → "📦 Ten wzornik leży w schowku pod numerem **5**" with a small edit icon-button; missing → "⚠️ Wzornik gdzieś się zgubił. Może poszukać go w szafce na dole?" with a button "+ Dodaj wzornik"
   - two info values: "Średnica panewki — 111.022 mm" and "Siła docisku — 12000 N"
   - three angle boxes: **20° / 25° / 30°**, each with a large value like **13.0** — this is the most-read data on the card, make it dominant
   - admin actions: "✏️ Edytuj", "🗑️ Usuń"
   - hint state when nothing is searched yet: "Wpisz numer, aby wyszukać"
7. **Floating "+" button** (add new entry), bottom-right.
8. **Tab "Kalkulator"**: heading "🧮 Kalkulator do suwmiarki", subtitle "Oblicz wartości dla wybranych kątów.", inputs "Średnica (mm)", "Grubość (mm)", "Własny kąt (opcjonalnie)", button "Oblicz", an inline error line, result rows for 20° / 25° / 30°, a highlighted result for the custom angle (e.g. "Twój kąt 23° → 6.682"), footer note "Formuła: (średnica − 2 × grubość) × π ÷ 360 × kąt".
9. **Modal "➕ Nowa panewka"** with the machine name under the title and three sections: "Dane podstawowe" (inputs: Dziesięciocyfrówka, Średnica (mm), Siła docisku N), "Schowek" (input "Numer w schowku (opcjonalny)" + hint "Jeśli pole puste — wzornik zostanie dodany bez numeru schowku." + an inline error state), "Wartość dla kątów" (three inputs 20°, 25°, 30° in one row). Buttons: "Anuluj", "💾 Zapisz". Close "✕" in the corner.
10. **Modal "✏️ Edycja"** — identical fields to the add modal; the Schowek hint reads "Wyczyść pole, aby usunąć wzornik ze schowku".
11. **Slot modal**: title "📦 Dodaj wzornik do schowku" (or "📦 Zmień numer w schowku"), numeric input "Numer w schowku", hint "Następny wolny numer: 15", inline error "⚠️ Numer 5 jest już zajęty w schowku", destructive button "🗑️ Usuń wzornik ze schowku", buttons "Anuluj" / "💾 Zapisz".
12. **Confirm dialogs** (small, centered): "🗑️ Usunąć wpis?" — "Numer #1402291079 zostanie trwale usunięty z bazy danych. Tej operacji nie można cofnąć." and "🗑️ Usunąć wzornik ze schowku?" — "Wzornik pod numerem 5 zostanie usunięty ze schowku. Można go później dodać ponownie." Buttons: "Anuluj" / "Usuń".
13. **Feedback**: a toast in success and error variants (e.g. "✅ Numer 1402291079 zapisany", "❌ Błąd. Sprawdź token") and a fullscreen loading overlay (e.g. "⏳ Zapisuję...").
