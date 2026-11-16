import { defineConfig } from "vite";
import deno from "../../src/index";
import path from "node:path";

export default defineConfig({
  plugins: [deno(), {
    name: "fixture-optional-virtual-module",
    async resolveId(id) {
      if (id !== "virtual:optional-module") return;
      const optionalFile = path.join(import.meta.dirname, "absent-middleware");
      const resolved = await this.resolve(optionalFile);
      return resolved
        ? "\0fixture-optional-file-present"
        : "\0fixture-optional-file-absent";
    },
    load(id) {
      if (id === "\0fixture-optional-file-absent") {
        return `export default 'it works'`;
      }
      if (id === "\0fixture-optional-file-present") {
        return `import unexpected from './absent-middleware'; export default unexpected`;
      }
    },
  }, {
    name: "fixture-virtual-modules",
    resolveId(id) {
      if (
        id === "virtual:fixture-message" ||
        id === "framework-internal::fixture-message"
      ) {
        return `\0${id}`;
      }
    },
    load(id) {
      if (
        id === "\0virtual:fixture-message" ||
        id === "\0framework-internal::fixture-message"
      ) {
        return `export default 'it works'`;
      }
    },
  }, {
    name: "mapped-transform",
    // @ts-ignore not sure
    transform(code, id) {
      if (id.startsWith("\0")) return;
      if (!id.includes("mapped") || path.basename(id) !== "foo.ts") return;

      return code.replace("it doesn't work", "it works");
    },
  }],
  build: {
    lib: {
      formats: ["es"],
      entry: {
        importMapAlias: "alias.ts",
        importMapAliasMapped: "alias-mapped.ts",
        importMapAliasHashPrefix: "alias-hash-prefix.ts",
        importMapNpm: "npm.ts",
        importMapJsr: "jsr.ts",
        importMapHttp: "http.ts",
        inlineExternal: "inlineExternal.ts",
        inlineNpm: "inlineNpm.ts",
        inlineJsr: "inlineJsr.ts",
        inlineHttp: "inlineHttp.ts",
        inlineHttpJson: "inlineHttpJson.ts",
        resolveInRootDir: "resolveInRootDir.ts",
        linking: "linking.ts",
        virtualModule: "virtualModule.ts",
        privateSchemeModule: "privateSchemeModule.ts",
        optionalVirtualModule: "optionalVirtualModule.ts",
      },
    },
  },
});
