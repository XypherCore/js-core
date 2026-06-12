// Simplified Observable with:
// - static fromArray(arr) — emit each item then complete
// - static fromAsync(fn, intervalMs) — call fn every intervalMs, yield result
// - static fromGenerator(gen) — consume a generator as a stream
// - map(fn), filter(pred), take(n)
// - pipe(...transforms) — chain transforms
// - subscribe({ next, error, complete })
// - toArray() — collect all emissions into a Promise<array>

import { Result } from "./result.js";

export class Observable {
    constructor(producer) {
        this.producer = producer;
    }

    subscribe(observer = {}) {
        let closed = false;

        const safeObserver = {
            get closed() {
                return closed;
            },
            next(value) {
                if (!closed) {
                    observer.next?.(value);
                }
            },
            error(err) {
                if (!closed) {
                    closed = true;
                    observer.error?.(err);
                }
            },
            complete() {
                if (!closed) {
                    closed = true;
                    observer.complete?.();
                }
            }
        };

        let cleanup;

        try {
            cleanup = this.producer(safeObserver);
        } catch (err) {
            safeObserver.error(err);
        }

        return {
            unsubscribe() {
                closed = true;

                if (typeof cleanup === "function") {
                    cleanup();
                    return;
                }

                cleanup?.unsubscribe?.();
            }
        };
    }

    static fromArray(arr) {
        return new Observable(observer => {
            for (const item of arr) {
                if (observer.closed) {
                    break;
                }

                observer.next(item);
            }

            observer.complete();

            return {
                unsubscribe() {}
            };
        });
    }

    static fromAsync(fn, intervalMs) {
        return new Observable(observer => {
            let running = false;

            const id = setInterval(async () => {
                if (running) {
                    return;
                }

                running = true;

                try {
                    const value = await fn();
                    observer.next(value);
                } catch (err) {
                    clearInterval(id);
                    observer.error(err);
                } finally {
                    running = false;
                }
            }, intervalMs);

            return {
                unsubscribe() {
                    clearInterval(id);
                }
            };
        });
    }

    static fromGenerator(gen) {
        return new Observable(observer => {
            const iterator = typeof gen === "function" ? gen() : gen;

            try {
                for (const value of iterator) {
                    if (observer.closed) {
                        break;
                    }

                    observer.next(value);
                }

                observer.complete();
            } catch (err) {
                observer.error(err);
            }

            return {
                unsubscribe() {
                    iterator.return?.();
                }
            };
        });
    }

    map(fn) {
        return new Observable(observer => {
            let done = false;
            let subscription;
            let shouldUnsubscribe = false;

            const stop = () => {
                if (subscription) {
                    subscription.unsubscribe();
                    return;
                }

                shouldUnsubscribe = true;
            };

            subscription = this.subscribe({
                next: value => {
                    if (done) {
                        return;
                    }

                    try {
                        observer.next(fn(value));
                    } catch (err) {
                        done = true;
                        observer.error(err);
                        stop();
                    }
                },
                error: err => {
                    if (!done) {
                        done = true;
                        observer.error(err);
                    }
                },
                complete: () => {
                    if (!done) {
                        done = true;
                        observer.complete();
                    }
                }
            });

            if (shouldUnsubscribe) {
                subscription.unsubscribe();
            }

            return {
                unsubscribe() {
                    done = true;
                    stop();
                }
            };
        });
    }

    filter(pred) {
        return new Observable(observer => {
            let done = false;
            let subscription;
            let shouldUnsubscribe = false;

            const stop = () => {
                if (subscription) {
                    subscription.unsubscribe();
                    return;
                }

                shouldUnsubscribe = true;
            };

            subscription = this.subscribe({
                next: value => {
                    if (done) {
                        return;
                    }

                    try {
                        if (pred(value)) {
                            observer.next(value);
                        }
                    } catch (err) {
                        done = true;
                        observer.error(err);
                        stop();
                    }
                },
                error: err => {
                    if (!done) {
                        done = true;
                        observer.error(err);
                    }
                },
                complete: () => {
                    if (!done) {
                        done = true;
                        observer.complete();
                    }
                }
            });

            if (shouldUnsubscribe) {
                subscription.unsubscribe();
            }

            return {
                unsubscribe() {
                    done = true;
                    stop();
                }
            };
        });
    }

    take(n) {
        return new Observable(observer => {
            let count = 0;
            let done = false;
            let subscription;
            let shouldUnsubscribe = false;

            const stop = () => {
                if (subscription) {
                    subscription.unsubscribe();
                    return;
                }

                shouldUnsubscribe = true;
            };

            if (n <= 0) {
                observer.complete();
                return {
                    unsubscribe() {}
                };
            }

            subscription = this.subscribe({
                next: value => {
                    if (done) {
                        return;
                    }

                    count++;
                    observer.next(value);

                    if (count >= n) {
                        done = true;
                        observer.complete();
                        stop();
                    }
                },
                error: err => {
                    if (!done) {
                        done = true;
                        observer.error(err);
                    }
                },
                complete: () => {
                    if (!done) {
                        done = true;
                        observer.complete();
                    }
                }
            });

            if (shouldUnsubscribe) {
                subscription.unsubscribe();
            }

            return {
                unsubscribe() {
                    done = true;
                    stop();
                }
            };
        });
    }

    pipe(...transforms) {
        return this.map(value => {
            let result = Result.success(value);

            for (const transform of transforms) {
                result = result.flatMap(transform);
            }

            if (!result.ok) {
                throw new Error(result.error);
            }

            return result.value;
        });
    }

    toArray() {
        return new Promise((resolve, reject) => {
            const values = [];

            this.subscribe({
                next: value => {
                    values.push(value);
                },
                error: err => {
                    reject(err);
                },
                complete: () => {
                    resolve(values);
                }
            });
        });
    }
}