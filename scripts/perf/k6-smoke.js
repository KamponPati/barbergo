import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"]
  }
};

const API_BASE_URL = __ENV.API_BASE_URL || "http://localhost:3000/api/v1";

export default function () {
  const res = http.get(`${API_BASE_URL}/discovery/nearby?sort=rating_desc`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has data": (r) => String(r.body).includes("\"data\"")
  });
  sleep(0.2);
}
