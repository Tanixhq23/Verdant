document.addEventListener("DOMContentLoaded", function () {
  const mainSelect = document.getElementById("mainSelect");
  const clothingSection = document.getElementById("clothingSection");
  const grocerySection = document.getElementById("grocerySection");
  const electricSection = document.getElementById("electricSection");
  const resultsDiv = document.getElementById("results");

  mainSelect.addEventListener("change", function () {
    clothingSection.classList.add("d-none");
    grocerySection.classList.add("d-none");
    electricSection.classList.add("d-none");
    resultsDiv.classList.add("d-none");

    if (this.value === "clothing") {
      clothingSection.classList.remove("d-none");
    } else if (this.value === "grocery") {
      grocerySection.classList.remove("d-none");
    } else if (this.value === "electric") {
      electricSection.classList.remove("d-none");
    }
  });

  function addRow(containerId) {
    const container = document.getElementById(containerId);
    const firstRow = container.querySelector(".ingredient-row");
    const newRow = firstRow.cloneNode(true);
    newRow.querySelectorAll("input, select").forEach((el) => {
      if (el.tagName === "INPUT") {
        el.value = "";
      }
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      }
    });
    container.appendChild(newRow);

    const removeBtn = newRow.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.style.display = "inline-block";
      removeBtn.addEventListener("click", () => newRow.remove());
    }
  }

  document.getElementById("addClothing").addEventListener("click", () => addRow("clothingFields"));
  document.getElementById("addGrocery").addEventListener("click", () => addRow("groceryFields"));
  document.getElementById("addElectric").addEventListener("click", () => addRow("electricFields"));

  document.body.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      const row = e.target.closest(".ingredient-row");
      if (row) {
        row.remove();
      }
    }
  });

  document.querySelectorAll("#clothingFields .ingredient-row .remove-btn").forEach((btn) => {
    btn.style.display = "none";
  });
  document.querySelectorAll("#groceryFields .ingredient-row .remove-btn").forEach((btn) => {
    btn.style.display = "none";
  });
  document.querySelectorAll("#electricFields .ingredient-row .remove-btn").forEach((btn) => {
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

    if (form.id === "clothingForm") {
      rows.forEach((row) => {
        const itemType = row.querySelector('select[name="clothing_item[]"]').value;
        const fabric = row.querySelector('select[name="fabric[]"]').value;
        const quantity = row.querySelector('input[name="quality[]"]').value;
        if (itemType && fabric && quantity) {
          inputs.push({
            type: itemType,
            fabric,
            quantity: parseFloat(quantity),
            category: "clothing",
          });
        }
      });
    } else if (form.id === "groceryForm") {
      rows.forEach((row) => {
        const itemType = row.querySelector('select[name="grocery_item[]"]').value;
        const quantity = row.querySelector('input[name="grocery_quantity[]"]').value;
        if (itemType && quantity) {
          inputs.push({
            type: itemType,
            quantity: parseFloat(quantity),
            category: "grocery",
          });
        }
      });
    } else if (form.id === "electricForm") {
      rows.forEach((row) => {
        const itemType = row.querySelector('select[name="electric_item[]"]').value;
        const quantity = row.querySelector('input[name="electric_quantity[]"]').value;
        if (itemType && quantity) {
          inputs.push({
            type: itemType,
            quantity: parseFloat(quantity),
            category: "electric",
          });
        }
      });
    }

    if (inputs.length === 0) {
      resultsDiv.innerHTML =
        "<p class=\"text-danger\">Please add at least one item to calculate your footprint.</p>";
      submitBtn.disabled = false;
      resultsDiv.classList.remove("d-none");
      resultsDiv.scrollIntoView({ behavior: "smooth" });
      return;
    }

    try {
      const response = await fetch("/api/v1/footprint/shopping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const suggestionsHTML = result.data.suggestions
          .map((s) => `<li><strong>${s.title}:</strong> ${s.description}</li>`)
          .join("");

        resultsDiv.innerHTML = `
          <h4 class="fw-bold" style="color: #0b342e;">Your Shopping Footprint:</h4>
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
      resultsDiv.innerHTML = "<p class=\"text-danger\">A network error occurred. Please try again.</p>";
    } finally {
      submitBtn.disabled = false;
      resultsDiv.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.getElementById("clothingForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("groceryForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("electricForm").addEventListener("submit", handleFormSubmit);
});
