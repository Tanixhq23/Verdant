from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import google.generativeai as genai
import json
from markupsafe import Markup
from mongodb import get_latest_audit_report  # ⮅️ your custom MongoDB utility
import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

load_dotenv()

app = FastAPI()
# ✅ Correct templates path
templates = Jinja2Templates(directory=BASE_DIR / "templates")

def tojson_filter(value):
    return Markup(json.dumps(value))
templates.env.filters["tojson"] = tojson_filter

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-pro")

# ✅ Summarize the report before sending to Gemini
def summarize_report(report: dict) -> dict:
    """
    Extract only the most important fields from the audit report
    so the AI doesn't get overloaded with tokens.
    """
    return {
        "url": report.get("url"),
        "carbonAnalysis": report.get("carbonAnalysis"),
        "lighthouseScore": report.get("lighthouseScore"),
        "breakdown": report.get("breakdown"),
        "greenHosting": report.get("greenHosting"),
        # Include top 5 heaviest resources only
        "topResources": sorted(
            report.get("resourceData", []),
            key=lambda r: r.get("size", 0),
            reverse=True
        )[:5]
    }

def generate_ai_suggestions(report):
    prompt = f"""
    Analyze this website audit report and give 7-8 clear actionable suggestions of 2 lines
    to improve performance, reduce carbon emissions, and make the site more eco-friendly.
    The suggestions should be short, concise, and easy to understand.
    Don't use hashes, stars, or markdown formatting.
    Just return the suggestions.

    Report:
    {report}
    """

    response = model.generate_content(prompt)

    # ✅ Fix: safely handle empty responses
    if response.candidates and response.candidates[0].content.parts:
        suggestions_text = response.text.strip()
        return [line.strip("-• ") for line in suggestions_text.split("\n") if line.strip()]
    else:
        return ["No AI suggestions generated."]

@app.get("/", response_class=HTMLResponse)
async def analyze(request: Request):
    report = get_latest_audit_report()

    # Define a default report dictionary to prevent errors when no report is found.
    default_report = {
        "url": "No report found",
        "carbonAnalysis": {"co2PerVisit": 0.0, "cleanerThan": "0.00%"},
        "lighthouseScore": 0,
        "breakdown": {"js": 0, "css": 0, "images": 0, "fonts": 0, "videos": 0, "others": 0},
        "greenHosting": False,
    }

    if not report:
        return templates.TemplateResponse("report.html", {
            "request": request,
            "summary": "No report found",
            "chart_data": {},
            "suggestions": [],
            "report": {}
        })

    # ✅ Summarize the report before passing to AI
    short_report = summarize_report(report)

    # ✅ Extract metrics for chart
    co2 = report["carbonAnalysis"].get("co2PerVisit", 0)
    lighthouse = report.get("lighthouseScore", 0)
    total_size = sum([r["size"] for r in report.get("resourceData", [])]) / (1024 * 1024)  # Convert bytes to MB

    chart_data = {
        "labels": ["CO₂ per Visit (g)", "Total Page Size (MB)", "Lighthouse Score"],
        "values": [
            float(round(co2, 4)) if co2 is not None else 0.0,
            float(round(total_size, 2)) if total_size is not None else 0.0,
            int(lighthouse) if lighthouse is not None else 0
        ]
    }

    # ⬅️ Pass summarized report to AI
    ai_suggestions = generate_ai_suggestions(short_report)

    return templates.TemplateResponse("report.html", {
        "request": request,
        "summary": f"This website emits {chart_data['values'][0]}g CO₂ per visit. Lighthouse Score: {chart_data['values'][2]}",
        "chart_data": chart_data,
        "suggestions": ai_suggestions,
        "report": report  # full report still available for frontend
    })
