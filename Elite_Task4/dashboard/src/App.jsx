import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

function getWebsiteName(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/analytics")
      .then((res) => setData(res.data));
  }, []);

  const productiveTime = data
    .filter((item) => item.category === "Productive")
    .reduce((sum, item) => sum + item.timeSpent, 0);

  const unproductiveTime = data
    .filter((item) => item.category === "Unproductive")
    .reduce((sum, item) => sum + item.timeSpent, 0);

  return (
    <div className="container">
      <h1 className="title">Productivity Analytics Dashboard</h1>

      <div className="stats">
        <div className="card">
          <h3>Productive Time</h3>
          <p className="productive">{productiveTime}s</p>
        </div>

        <div className="card">
          <h3>Unproductive Time</h3>
          <p className="unproductive">{unproductiveTime}s</p>
        </div>

        <div className="card">
          <h3>Total Records</h3>
          <p>{data.length}</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Website</th>
              <th>Category</th>
              <th>Time Spent</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td className="website-column">
                  {getWebsiteName(item.website)}
                </td>

                <td>
                  <span
                    className={`badge ${
                      item.category === "Productive"
                        ? "productive"
                        : "unproductive"
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                <td>{item.timeSpent} sec</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
