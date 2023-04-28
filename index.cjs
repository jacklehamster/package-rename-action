const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");

try {
  const fileName = core.getInput('file');
  const file = fs.readFileSync(fileName);
  const json = JSON.parse(file);

  const fullRepository = core.getInput('repository');  
  json.name = fullRepository.split("/")[1];
  if (typeof json.repository === "string") {
    json.repository = fullRepository;
  } else if (json.repository?.url) {
    json.repository.url = `git+https://github.com/${fullRepository}.git`;
  }
  if (json.bugs) {
    json.bugs.url = `https://github.com/${fullRepository}/issues`;
  }
  json.homepage = `https://github.com/${fullRepository}#readme`;

  const newJSON = JSON.stringify(json, null, "   ");

  if (file?.trim() !== newJSON.trim()) {
    fs.writeFileSync(fileName, newJSON);
  }
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
