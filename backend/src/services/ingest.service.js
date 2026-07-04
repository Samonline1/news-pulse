const { spawn } = require("child_process");
const path = require("path");

let activeIngestionProcess = null;

function resolvePythonExecutable() {
  if (process.platform === "win32") {
    return "python";
  }

  return "python3";
}

function resolveScraperScriptPath() {
  return path.resolve(__dirname, "..", "..", "..", "scraper", "main.py");
}

function logIngestionCompletion(exitCode, stdout, stderr) {
  const success = exitCode === 0;
  const statusLabel = success ? "success" : "failure";

  console.log(
    `[ingest] scraper ${statusLabel} | exitCode=${exitCode === null ? "null" : exitCode}`
  );

  if (stdout) {
    console.log("[ingest] scraper stdout:\n" + stdout.trimEnd());
  }

  if (stderr) {
    console.error("[ingest] scraper stderr:\n" + stderr.trimEnd());
  }
}

function clearActiveIngestionProcess(childProcess) {
  if (activeIngestionProcess === childProcess) {
    activeIngestionProcess = null;
  }
}

function triggerIngestion() {
  if (activeIngestionProcess) {
    return {
      started: false,
      reason: "already_running",
    };
  }

  const pythonExecutable = resolvePythonExecutable();
  const scriptPath = resolveScraperScriptPath();

  const childProcess = spawn(pythonExecutable, [scriptPath], {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  activeIngestionProcess = childProcess;

  let stdout = "";
  let stderr = "";

  childProcess.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  childProcess.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  childProcess.on("error", (error) => {
    console.error(`[ingest] scraper failed to start: ${error.message}`);
    clearActiveIngestionProcess(childProcess);
  });

  childProcess.on("close", (code, signal) => {
    const exitCode = typeof code === "number" ? code : signal ? 1 : null;
    logIngestionCompletion(exitCode, stdout, stderr);
    clearActiveIngestionProcess(childProcess);
  });

  return {
    started: true,
    processId: childProcess.pid,
  };
}

module.exports = {
  triggerIngestion,
  resolvePythonExecutable,
  resolveScraperScriptPath,
};
