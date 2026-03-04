const mainSelect = document.getElementById("mainSelect");
const sections = {
  electricity: document.getElementById("electricitySection"),
  liquid: document.getElementById("liquidSection"),
  gaseous: document.getElementById("gaseousSection"),
  solid: document.getElementById("solidSection"),
};

mainSelect.addEventListener("change", function () {
  const value = this.value;
  Object.values(sections).forEach((section) => section.classList.add("d-none"));
  if (sections[value]) {
    sections[value].classList.remove("d-none");
  }
});

function addMoreHandler(buttonId, fieldId) {
  document.getElementById(buttonId).addEventListener("click", function () {
    const fields = document.getElementById(fieldId);
    const firstRow = fields.querySelector(".ingredient-row");
    const newRow = firstRow.cloneNode(true);

    newRow.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
    newRow.querySelectorAll("select").forEach((select) => {
      select.selectedIndex = 0;
    });
    fields.appendChild(newRow);

    const removeBtn = newRow.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.style.display = "inline-block";
    }
  });
}

addMoreHandler("addElectricity", "electricityFields");
addMoreHandler("addLiquid", "liquidFields");
addMoreHandler("addGaseous", "gaseousFields");
addMoreHandler("addSolid", "solidFields");

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-btn")) {
    const row = e.target.closest(".ingredient-row");
    if (row && row.parentNode.querySelectorAll(".ingredient-row").length > 1) {
      row.remove();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  ["electricityFields", "liquidFields", "gaseousFields", "solidFields"].forEach((id) => {
    const firstRemoveBtn = document.querySelector(`#${id} .ingredient-row .remove-btn`);
    if (firstRemoveBtn) {
      firstRemoveBtn.style.display = "none";
    }
  });
});

const allForms = document.querySelectorAll("form");
const resultsDiv = document.getElementById("results");

allForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const inputs = [];
    const rows = form.querySelectorAll(".ingredient-row");

    rows.forEach((row) => {
      const quantityInput = row.querySelector('input[type="number"]');
      const unitSelect = row.querySelector('select[name="Unit[]"]');
      const itemSelect = row.querySelector('select:not([name="Unit[]"])');

      if (quantityInput && quantityInput.value && unitSelect && unitSelect.value) {
        inputs.push({
          type: itemSelect ? itemSelect.value : "electricity",
          quantity: parseFloat(quantityInput.value),
          unit: unitSelect.value,
        });
      }
    });

    if (inputs.length === 0) {
      alert("Please fill out the form fields.");
      return;
    }

    resultsDiv.classList.remove("d-none");
    resultsDiv.innerHTML = "<h5>Calculating your footprint...</h5>";

    try {
      const response = await fetch("/api/v1/footprint/energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });

      const result = await response.json();

      if (result.success) {
        const suggestionsHTML = result.data.suggestions
          .map((s) => `<li><strong>${s.title}:</strong> ${s.description}</li>`)
          .join("");

        resultsDiv.innerHTML = `
          <h4 class="fw-bold" style="color: #0b342e;">Your Monthly Energy Footprint:</h4>
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
    }

    resultsDiv.scrollIntoView({ behavior: "smooth" });
  });
});
