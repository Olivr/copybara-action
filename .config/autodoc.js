const YAML = require("yaml");
const tablemark = require("tablemark");
const fs = require("fs");

const file = fs.readFileSync("./action.yml", "utf8");

const yml = YAML.parse(file);
const table = [];

Object.keys(yml.inputs).forEach((input) => {
  table.push({
    input,
    required: yml.inputs[input] && yml.inputs[input].required ? "yes" : "",
    default: yml.inputs[input] && yml.inputs[input].default ? yml.inputs[input].default : "",
    description: yml.inputs[input] && yml.inputs[input].description ? yml.inputs[input].description : "",
  });
});

fs.writeFileSync("./docs/inputs.md", tablemark(table));
