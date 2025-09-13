import ts from "typescript";

export function validateTypeScript(code: string): void {
  const fileName = "src/virtual.ts";

  const options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    lib: ["lib.es2020.d.ts"], // must exist in node_modules/typescript/lib/
    types: [],
  };

  const host = ts.createCompilerHost(options);

  host.readFile = (file: string) => {
    if (file === fileName) return code; // your virtual TS code
    return ts.sys.readFile(file);       // fallback to TypeScript's built-in lib files
  };

  host.fileExists = (file: string) => {
    if (file === fileName) return true;
    return ts.sys.fileExists(file);
  };

  host.getSourceFile = (fileNameParam, languageVersion) => {
    const sourceText = host.readFile(fileNameParam);
    if (sourceText === undefined) return undefined;
    return ts.createSourceFile(fileNameParam, sourceText, languageVersion, true);
  };


  const program = ts.createProgram([fileName], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length === 0) {
    console.log("✅ Valid TypeScript");
  } else {
    for (const d of diagnostics) {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      console.error(`❌ Error ${msg}`);
    }
  }
}
