document.getElementById("auditForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const url = document.getElementById("urlInput").value;
  const analyzeButton = document.getElementById("analyzeButton");
  const loadingSpinner = document.getElementById("loadingSpinner");

  if (!url) {
    alert("Please enter a URL to audit.");
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";
  loadingSpinner.style.display = "flex";

  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());
      throw new Error(
        `Server error: ${
          typeof errorData === "object" && errorData.error ? errorData.error : errorData
        }`
      );
    }

    const result = await response.json();
    downloadJSON(result, "audit-report.json");
    window.location.href = "/report";
  } catch (error) {
    console.error("Audit failed:", error);
    alert(`Audit failed: ${error.message}`);
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze";
    loadingSpinner.style.display = "none";
  }
});

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
