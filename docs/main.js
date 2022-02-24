var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _PromiseCopy_instances, _PromiseCopy_state, _PromiseCopy_result, _PromiseCopy_handlers, _PromiseCopy_queued, _PromiseCopy_dispatchCallbacks;
import { isThenable } from './utils.js';
var State;
(function (State) {
    State["pending"] = "PENDING";
    State["fulfilled"] = "FULFILLED";
    State["rejected"] = "REJECTED";
})(State || (State = {}));
class PromiseCopy {
    constructor(executer) {
        _PromiseCopy_instances.add(this);
        _PromiseCopy_state.set(this, State.pending);
        _PromiseCopy_result.set(this, undefined);
        _PromiseCopy_handlers.set(this, []);
        _PromiseCopy_queued.set(this, false);
        try {
            executer(PromiseCopy.resolve.bind(this), PromiseCopy.reject.bind(this));
        }
        catch (e) {
            PromiseCopy.reject.call(this, e);
        }
    }
    get state() {
        return __classPrivateFieldGet(this, _PromiseCopy_state, "f");
    }
    get result() {
        return __classPrivateFieldGet(this, _PromiseCopy_result, "f");
    }
    static resolve(value) {
        if (!(this instanceof PromiseCopy))
            return new PromiseCopy(res => res(value));
        if (__classPrivateFieldGet(this, _PromiseCopy_state, "f") !== State.pending)
            return;
        if (isThenable(value))
            return value.then(PromiseCopy.resolve.bind(this), PromiseCopy.reject.bind(this));
        __classPrivateFieldSet(this, _PromiseCopy_state, State.fulfilled, "f");
        __classPrivateFieldSet(this, _PromiseCopy_result, value, "f");
        this.fulfilled = value;
        __classPrivateFieldGet(this, _PromiseCopy_instances, "m", _PromiseCopy_dispatchCallbacks).call(this);
    }
    static reject(value) {
        if (!(this instanceof PromiseCopy))
            return new PromiseCopy((_, rej) => rej(value));
        if (__classPrivateFieldGet(this, _PromiseCopy_state, "f") !== State.pending)
            return;
        __classPrivateFieldSet(this, _PromiseCopy_state, State.rejected, "f");
        __classPrivateFieldSet(this, _PromiseCopy_result, value, "f");
        this.rejected = value;
        __classPrivateFieldGet(this, _PromiseCopy_instances, "m", _PromiseCopy_dispatchCallbacks).call(this);
    }
    then(successCB, failCB) {
        return new PromiseCopy((res, rej) => {
            __classPrivateFieldGet(this, _PromiseCopy_handlers, "f").push({
                success(value) {
                    if (!successCB)
                        return res(value);
                    try {
                        res(successCB(value));
                    }
                    catch (e) {
                        rej(e);
                    }
                },
                fail(error) {
                    if (!failCB)
                        return rej(error);
                    try {
                        res(failCB(error));
                    }
                    catch (e) {
                        rej(e);
                    }
                }
            });
            __classPrivateFieldGet(this, _PromiseCopy_instances, "m", _PromiseCopy_dispatchCallbacks).call(this);
        });
    }
    catch(failCB) {
        return this.then(undefined, failCB);
    }
    finally(callback) {
        const successCB = (value) => {
            const response = callback?.();
            return (isThenable(response)) ? response.then(_ => value) : value;
        };
        const errorCB = (error) => {
            const response = callback?.();
            const errorPromise = () => PromiseCopy.reject(error);
            return (isThenable(response)) ? response.then(_ => errorPromise()) : errorPromise();
        };
        return this.then(successCB, errorCB);
    }
}
_PromiseCopy_state = new WeakMap(), _PromiseCopy_result = new WeakMap(), _PromiseCopy_handlers = new WeakMap(), _PromiseCopy_queued = new WeakMap(), _PromiseCopy_instances = new WeakSet(), _PromiseCopy_dispatchCallbacks = function _PromiseCopy_dispatchCallbacks() {
    if (__classPrivateFieldGet(this, _PromiseCopy_state, "f") === State.pending)
        return;
    if (__classPrivateFieldGet(this, _PromiseCopy_queued, "f"))
        return;
    const method = __classPrivateFieldGet(this, _PromiseCopy_state, "f") === State.fulfilled ? 'success' : 'fail';
    queueMicrotask(() => {
        if (__classPrivateFieldGet(this, _PromiseCopy_state, "f") === State.rejected && !__classPrivateFieldGet(this, _PromiseCopy_handlers, "f").length)
            console.error('Uncaught (in promisecopy)', __classPrivateFieldGet(this, _PromiseCopy_result, "f"));
        for (let handler of __classPrivateFieldGet(this, _PromiseCopy_handlers, "f")) {
            handler[method](__classPrivateFieldGet(this, _PromiseCopy_result, "f"));
        }
        __classPrivateFieldSet(this, _PromiseCopy_handlers, [], "f");
        __classPrivateFieldSet(this, _PromiseCopy_queued, false, "f");
    });
    __classPrivateFieldSet(this, _PromiseCopy_queued, true, "f");
};
window.PromiseCopy = PromiseCopy;
//# sourceMappingURL=main.js.map