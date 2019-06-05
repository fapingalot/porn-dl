function PromisePool(generator, limit = 4, shortCurcuit = true) {
    this.count = 0;
    this.canStart = () => {
        console.log(`Pool [${this.count}/${limit}]`);
        return this.count < limit;
    }
    this.startNext = (res, rej) => {
        while (this.canStart()) {
            const pro = generator();
            if (pro) {
                this.count++;
                pro.then(() => {
                    this.count--;
                    return this.startNext(res, rej);
                }).catch((err) => {
                    this.count--;
                    if (shortCurcuit && err) return rej(err);
                    return this.startNext(res, rej);
                })
            } else {
                if (this.count === 0) return res();
                break;
            }
        }
    }
    this.start = () => new Promise(this.startNext);
}

module.exports = {
    PromisePool
}