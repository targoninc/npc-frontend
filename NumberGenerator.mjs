export class NumberGenerator {
    /**
     * Generates a random float between min and max.
     * @param min
     * @param max
     * @param seed
     * @param toInt
     * @returns {number}
     */
    static random(min, max, seed, toInt = false) {
        if (min > max) {
            [min, max] = [max, min];
        }
        const value = this.getRandomNumber(seed) * (max - min) + min;
        return toInt ? Math.floor(value) : value;
    }

    static getRandomSeed() {
        return Math.random() * 10000;
    }

    static getRandomNumber(seed) {
        if (seed === undefined || seed === null) {
            seed = this.getRandomSeed();
        }
        const x = Math.sin(seed) * 10000;
        const value = x - Math.floor(x);
        seed = x;
        return value;
    }

    static randomWithBias(min, max, seed, bias, influence = 0.5, toInt = false) {
        if (min > max) {
            [min, max] = [max, min];
        }
        const value = NumberGenerator.getRandomNumber(seed) * (max - min) + min;
        const mix = NumberGenerator.getRandomNumber(seed) * influence;
        return toInt ? Math.floor(value * (1 - mix) + bias * mix) : value * (1 - mix) + bias * mix;
    }

    static antiExponentialDistribution(n, steepness = 1.2, randomize = 0, seed) {
        if (n <= 0) {
            return [];
        }

        let distribution = [1];
        for (let i = 1; i < n; i++) {
            let nextVal = distribution[0] * steepness + NumberGenerator.random(-randomize, randomize, seed);
            distribution.unshift(nextVal);
        }

        let maxVal = distribution[0];
        for (let i = 0; i < n; i++) {
            distribution[i] /= maxVal;
            distribution[i] = Math.max(0, distribution[i]);
        }

        return distribution;
    }
}