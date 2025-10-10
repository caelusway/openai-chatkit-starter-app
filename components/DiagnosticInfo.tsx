"use client";

import { useEffect, useState } from "react";

export function DiagnosticInfo() {
  const [info, setInfo] = useState({
    workflowId: "",
    hasChatKit: false,
    errors: [] as string[],
  });

  useEffect(() => {
    const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || "NOT SET";
    const hasChatKit = !!document.querySelector("openai-chatkit");

    const errors: string[] = [];

    // Listen for console errors
    const originalError = console.error;
    console.error = (...args) => {
      errors.push(args.join(" "));
      originalError(...args);
    };

    setInfo({
      workflowId,
      hasChatKit,
      errors,
    });

    // Check every 2 seconds
    const interval = setInterval(() => {
      setInfo({
        workflowId,
        hasChatKit: !!document.querySelector("openai-chatkit"),
        errors,
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      console.error = originalError;
    };
  }, []);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md rounded-lg bg-gray-900 p-4 text-xs text-gray-300 shadow-lg border border-gray-700 z-50">
      <div className="font-bold mb-2">Diagnostic Info</div>
      <div>Workflow ID: {info.workflowId}</div>
      <div>ChatKit Element: {info.hasChatKit ? "✓" : "✗"}</div>
      {info.errors.length > 0 && (
        <div className="mt-2">
          <div className="font-bold">Errors:</div>
          {info.errors.slice(-3).map((err, i) => (
            <div key={i} className="text-red-400 text-xs truncate">
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
