/*
Copyright 2026 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Project site path for GitHub Pages: https://<user>.github.io/mountain-lion-habitat-analysis-js/
  base: "/mountain-lion-habitat-analysis-js/",
  plugins: [],
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
    // Transpile for Safari compatibility to reduce TDZ edge cases in circular module graphs.
    target: "safari14",
    // Helps map Safari stack traces back to source while validating the fix.
    sourcemap: true,
    // Safari can throw TDZ errors in minified ArcGIS bundles.
    // Keep default chunking, but avoid minification transforms.
    minify: false,
    // Avoid Safari modulepreload ordering quirks with large ESM dependency graphs.
    modulePreload: false,
  },
});
