const { execFile } = require("child_process");
const path = require("path");

function resolvePythonExecutable() {
  return process.env.PYTHON_EXECUTABLE || process.env.PYTHON_BIN || "python";
}

function resolveScraperScriptPath() {
  return path.resolve(__dirname, "..", "..", "..", "scraper", "main.py");
}

function parseSummary(stdout) {
  const summary = {
    totalArticles: 0,
    inserted: 0,
    skipped: 0,
    clusters: 0,
  };

  if (!stdout) {
    return summary;
  }

  const totalMatch = stdout.match(/Total Articles\s*:\s*(\d+)/i);
  const insertedMatch = stdout.match(/Inserted\s*:\s*(\d+)/i);
  const skippedMatch = stdout.match(/Skipped\s*:\s*(\d+)/i);
  const clustersMatch = stdout.match(/Clusters\s*:\s*(\d+)/i);

  if (totalMatch) {
    summary.totalArticles = Number(totalMatch[1]);
  }

  if (insertedMatch) {
    summary.inserted = Number(insertedMatch[1]);
  }

  if (skippedMatch) {
    summary.skipped = Number(skippedMatch[1]);
  }

  if (clustersMatch) {
    summary.clusters = Number(clustersMatch[1]);
  }

  return summary;
}

function triggerIngestion() {
  return new Promise((resolve, reject) => {
    const pythonExecutable = resolvePythonExecutable();
    const scriptPath = resolveScraperScriptPath();

    const childProcess = execFile(pythonExecutable, [scriptPath], {
      windowsHide: true,
      timeout: 0,
      maxBuffer: 10 * 1024 * 1024,
    });

    let stdout = "";
    let stderr = "";

    childProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    childProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    childProcess.on("error", (error) => {
      reject({
        type: "spawn_error",
        message: error.message,
        stderr: stderr || error.message,
      });
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve({
          exitCode: code,
          stdout,
          stderr,
          summary: parseSummary(stdout),
        });
        return;
      }

      reject({
        type: "process_error",
        exitCode: code,
        stdout,
        stderr: stderr || `Scraper exited with code ${code}`,
        summary: parseSummary(stdout),
      });
    });
  });
}

module.exports = {
  triggerIngestion,
  resolvePythonExecutable,
  resolveScraperScriptPath,
  parseSummary,
};
