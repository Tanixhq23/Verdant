document.addEventListener("DOMContentLoaded", function () {
  const mainSelect = document.getElementById("mainSelect");
  const vegetarianSection = document.getElementById("vegetarianSection");
  const nonVegSection = document.getElementById("nonVegSection");
  const resultsDiv = document.getElementById("results");

  mainSelect.addEventListener("change", function () {
    vegetarianSection.classList.add("d-none");
    nonVegSection.classList.add("d-none");
    resultsDiv.classList.add("d-none");

    if (this.value === "clothing") {
      vegetarianSection.classList.remove("d-none");
    } else if (this.value === "grocery") {
      nonVegSection.classList.remove("d-none");
    }
  });

  function addRow(containerId) {
    const container = document.getElementById(containerId);
    const firstRow = container.querySelector(".ingredient-row");
    const newRow = firstRow.cloneNode(true);

    newRow.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
    newRow.querySelectorAll("select").forEach((select) => {
      select.selectedIndex = 0;
    });
    container.appendChild(newRow);

    const removeBtn = newRow.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.style.display = "inline-block";
      removeBtn.addEventListener("click", () => {
        newRow.remove();
      });
    }
  }

  document.getElementById("addVegetarian").addEventListener("click", () => addRow("vegetarianFields"));
  document.getElementById("addNonVeg").addEventListener("click", () => addRow("nonVegFields"));

  document.querySelectorAll(".ingredient-row .remove-btn").forEach((btn) => {
    btn.style.display = "none";
  });

  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    resultsDiv.classList.add("d-none");
    resultsDiv.innerHTML = "<p>Calculating...</p>";
    resultsDiv.classList.remove("d-none");

    const inputs = [];
    const rows = form.querySelectorAll(".ingredient-row");
    rows.forEach((row) => {
      const item = row.querySelector("select[name='ingredient[]']").value;
      const quantity = row.querySelector("input[name='Quantity[]']").value;
      const unit = row.querySelector("select[name='weightUnit[]']").value;
      if (item && quantity && unit) {
        inputs.push({
          type: item,
          quantity: parseFloat(quantity),
          unit: unit,
        });
      }
    });

    try {
      const response = await fetch("/api/v1/footprint/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const suggestionsHTML = result.data.suggestions
          .map((s) => `<li><strong>${s.title}:</strong> ${s.description}</li>`)
          .join("");

        resultsDiv.innerHTML = `
          <h4 class="fw-bold" style="color: #0b342e;">Your Food Footprint:</h4>
          <p style="font-size: 2rem; font-weight: bold; color: #0b342e;">${result.data.footprint.toFixed(
            2
          )} kg CO₂e</p>
          <h5 class="mt-4 fw-bold" style="color: #0b342e;">Personalized Suggestions:</h5>
          <ul>${suggestionsHTML}</ul>
        `;
      } else {
        resultsDiv.innerHTML = `<p class="text-danger">Error: ${result.message}</p>`;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      resultsDiv.innerHTML = `<p class="text-danger">A network error occurred. Please try again.</p>`;
    } finally {
      submitBtn.disabled = false;
      resultsDiv.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.querySelector("#vegetarianSection form").addEventListener("submit", handleFormSubmit);
  document.querySelector("#nonVegSection form").addEventListener("submit", handleFormSubmit);
});
