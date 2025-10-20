type ChangeHandler<T> = <K extends keyof T>(key: K, value: T[K]) => void;


export function observableProxy<T extends object>(target: T, handler: ChangeHandler<T>) {

  return new Proxy(target, {
    get: (obj, prop) => {
      return Reflect.get(obj, prop);
    },
    set: (obj, prop, value) => {
      const key = prop as keyof T;
      const oldValue = obj[key];
      if (oldValue !== value) {
        handler(key, value);
      }
      return Reflect.set(obj, prop, value);
    },
  });
}
