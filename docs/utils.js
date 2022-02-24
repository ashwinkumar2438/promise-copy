const isThenable = (value) => {
    return (value instanceof Object) && (value.then instanceof Function);
};
export { isThenable };
//# sourceMappingURL=utils.js.map