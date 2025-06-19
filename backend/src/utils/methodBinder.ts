export class MethodBinder {
  static bind(controller: any) {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller),
    );
    methods.forEach((method) => {
      if (
        method !== 'constructor' &&
        typeof controller[method] === 'function'
      ) {
        controller[method] = controller[method].bind(controller);
      }
    });
  }
}
