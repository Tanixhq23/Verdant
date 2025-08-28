import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";

const WebsiteResults = ({ reportId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/analyze-report/${reportId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [reportId]);

  const summaryPara = document.querySelector(".summary");
  if (!data) return summaryPara.innerHTML= "Loading...";

  return <> 
  <div>
      <h2>Analysis for {data.url}</h2>
      <Bar data={{
        labels: data.charts.labels,
        datasets: [{
          label: "Website Metrics",
          data: data.charts.data,
          backgroundColor: ['green', 'orange', 'red']
        }]
      }} />
      <h3>Suggestions</h3>
      <ul>
        {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div> 
    </>;
};

export default WebsiteResults;
