function isThenable(value) {
    return (value instanceof Object) && (value.then instanceof Function);
}
export default isThenable;
//# sourceMappingURL=thenable.js.map