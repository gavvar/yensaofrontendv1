import React, { useState } from "react";
import { getFullImageUrl } from "@/utils/image";

export default function ImageUrlChecker() {
  const [urlToCheck, setUrlToCheck] = useState(
    "/uploads/products/thumbnail-1743033340594-226299347.jpg"
  );
  const [checkResult, setCheckResult] = useState<{
    url: string;
    status: string;
  }>({ url: "", status: "" });

  const checkUrl = async () => {
    const fullUrl = getFullImageUrl(urlToCheck);

    try {
      const response = await fetch(fullUrl, { method: "HEAD" });
      setCheckResult({
        url: fullUrl,
        status: response.ok
          ? `OK (${response.status})`
          : `Error (${response.status})`,
      });
    } catch (error) {
      setCheckResult({
        url: fullUrl,
        status: `Fetch error: ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-2">Image URL Checker</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={urlToCheck}
          onChange={(e) => setUrlToCheck(e.target.value)}
          className="flex-grow p-2 border rounded-l"
          placeholder="Enter image URL path"
        />
        <button
          onClick={checkUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Check
        </button>
      </div>

      {checkResult.url && (
        <div className="mt-2">
          <p>
            <strong>Full URL:</strong> {checkResult.url}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                checkResult.status.includes("OK")
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {checkResult.status}
            </span>
          </p>

          {checkResult.url && (
            <div className="mt-2">
              <p>
                <strong>Image Preview:</strong>
              </p>
              <div className="border p-2 mt-1">
                <img
                  src={checkResult.url}
                  alt="URL Preview"
                  className="max-w-full h-auto max-h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/product-placeholder.png";
                    e.currentTarget.style.border = "1px solid red";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
