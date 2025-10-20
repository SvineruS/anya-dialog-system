
export function safeEval(code: string, state: any = {}) {
  const readLog: string[] = [];

  const sandbox = new Proxy({}, {
    has: () => true,
    get: (_target, key, _receiver) => {
      const strKey = String(key);
      readLog.push(strKey);
      if (Object.keys(state).includes(strKey)) {
        return state[key];
      }

      if (!["Math", "Number", "String", "Array", "Boolean", Symbol.unscopables].includes(key))
        throw new Error(`Unknown "${strKey}"`);

      return (globalThis as any)[key];
    },
  });



  try {
    const result = Function("sandbox", `with(sandbox) { return (${code}); }`)(sandbox);
    return { result, readLog }
  } catch (e) {
    return { error: (e as Error).message, readLog }
  }
}

