const fs = require('fs');
const path = require('path');

const confboxDir = path.join(__dirname, '..', 'node_modules', 'confbox');
const pkgJsonPath = path.join(confboxDir, 'package.json');

if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    
    // Remove ESM specifics
    delete pkgJson.type;
    pkgJson.main = 'dist/index.cjs';
    pkgJson.exports = {
        ".": "./dist/index.cjs"
    };
    
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    
    const shimCode = `
const yaml = require('js-yaml');
const json5 = require('json5');

function parseYAML(raw) {
    return yaml.load(raw);
}

function stringifyYAML(data, options = {}) {
    return yaml.dump(data, {
        indent: options.indent || 2,
        ...options
    });
}

function parseJSON5(raw) {
    return json5.parse(raw);
}

function stringifyJSON5(data, options = {}) {
    return json5.stringify(data, null, options.indent || 2);
}

function parseJSON(raw) { return JSON.parse(raw); }
function stringifyJSON(data, options = {}) { return JSON.stringify(data, null, options.indent || 2); }

function parseJSONC(raw) { return json5.parse(raw); }
function stringifyJSONC(data, options = {}) { return json5.stringify(data, null, options.indent || 2); }

module.exports = {
    parseYAML,
    stringifyYAML,
    parseJSON5,
    stringifyJSON5,
    parseJSON,
    stringifyJSON,
    parseJSONC,
    stringifyJSONC,
    parseTOML: (raw) => { throw new Error("parseTOML shim not implemented"); },
    stringifyTOML: (data) => { throw new Error("stringifyTOML shim not implemented"); },
    parseINI: (raw) => { throw new Error("parseINI shim not implemented"); },
    stringifyINI: (data) => { throw new Error("stringifyINI shim not implemented"); }
};
`;
    fs.writeFileSync(path.join(confboxDir, 'dist', 'index.cjs'), shimCode);
    console.log("Patched confbox to use CJS shim.");
} else {
    console.log("confbox not found, skipping patch.");
}
