/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { default: JestRuntime } = require('jest-runtime');
/*
const path = require('path');

function getModuleName(filePath) {
  const search = `${path.sep}node_modules${path.sep}`;
  const modulesIndex = filePath.lastIndexOf(search);
  if (modulesIndex === -1) {
    return undefined;
  }

  const modulePath = filePath.slice(modulesIndex + search.length);
  if (modulePath[0] === '@') {
    return modulePath.split(path.sep).slice(0, 2).join('/');
  }
  return modulePath.slice(0, modulePath.indexOf(path.sep));
}

// Probably don't need this actually, seems like jsdom and other environment setup bits don't hit this codepath
function shouldCache(filePath) {
  const moduleName = getModuleName(filePath);
  if (moduleName === 'jsdom') {
    console.log(`DEBUG: SKIPPED`, filePath);
    return false;
  }
  // console.log(`DEBUG: ${moduleName} = ${filePath}`);
  return true;
}
 */
const fileTransformCache = new Map();
const scriptTransformCache = new Map();

module.exports = class MyJestRuntime extends JestRuntime {
  // TODO(Rugvip): Take options into account and detect file updates
  transformFile(filename, options) {
    let result = fileTransformCache.get(filename);
    if (!result) {
      result = super.transformFile(filename, options);
      fileTransformCache.set(filename, result);
    }
    return result;
  }

  // This may or may not be
  createScriptFromCode(scriptSource, filename) {
    let script = scriptTransformCache.get(scriptSource);
    if (!script) {
      script = super.createScriptFromCode(scriptSource, filename);
      // Tried to store the script object in a WeakRef here. It starts out at
      // about 90% hit rate, but eventually drops all the way to 20%, and overall
      // it seemed to increase memory usage by 20% or so.
      scriptTransformCache.set(scriptSource, script);
    }
    return script;
  }
};
