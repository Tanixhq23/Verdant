document.addEventListener("DOMContentLoaded", function () {
  const mainSelect = document.getElementById("mainSelect");
  const personalSection = document.getElementById("personalSection");
  const publicSection = document.getElementById("publicSection");
  const resultsDiv = document.getElementById("results");

  mainSelect.addEventListener("change", function () {
    personalSection.classList.add("d-none");
    publicSection.classList.add("d-none");
    resultsDiv.classList.add("d-none");

    if (this.value === "personal") {
      personalSection.classList.remove("d-none");
    } else if (this.value === "public") {
      publicSection.classList.remove("d-none");
    }
  });

  function addRow(containerId) {
    const container = document.getElementById(containerId);
    const firstRow = container.querySelector(".ingredient-row");
    const newRow = firstRow.cloneNode(true);
    newRow.querySelectorAll("select, input").forEach((el) => {
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      }
      if (el.tagName === "INPUT") {
        el.value = "";
      }
    });
    container.appendChild(newRow);

    const removeBtn = newRow.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.style.display = "inline-block";
      removeBtn.addEventListener("click", () => newRow.remove());
    }
  }

  document.getElementById("addPersonal").addEventListener("click", () => addRow("personalFields"));
  document.getElementById("addPublic").addEventListener("click", () => addRow("publicFields"));

  document.querySelectorAll("#personalFields .ingredient-row .remove-btn").forEach((btn) => {
    btn.style.display = "none";
  });
  document.querySelectorAll("#publicFields .ingredient-row .remove-btn").forEach((btn) => {
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

    if (form.id === "personalForm") {
      rows.forEach((row) => {
        const vehicle = row.querySelector('select[name="vehicle[]"]').value;
        const fuel = row.querySelector('select[name="fuel[]"]').value;
        const distance = row.querySelector('input[name="distance[]"]').value;
        const unit = row.querySelector('select[name="unit[]"]').value;
        if (vehicle && fuel && distance && unit) {
          inputs.push({
            type: vehicle,
            fuel,
            distance: parseFloat(distance),
            unit,
            category: "personal",
          });
        }
      });
    } else if (form.id === "publicForm") {
      rows.forEach((row) => {
        const vehicle = row.querySelector('select[name="vehicle[]"]').value;
        const fuel = row.querySelector('select[name="fuel[]"]').value;
        const distance = row.querySelector('input[name="distance[]"]').value;
        const unit = row.querySelector('select[name="unit[]"]').value;
        if (vehicle && fuel && distance && unit) {
          inputs.push({
            type: vehicle,
            fuel,
            distance: parseFloat(distance),
            unit,
            category: "public",
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
      const response = await fetch("/api/v1/footprint/transport", {
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
          <h4 class="fw-bold" style="color: #0b342e;">Your Transport Footprint:</h4>
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

  document.getElementById("personalForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("publicForm").addEventListener("submit", handleFormSubmit);
});
