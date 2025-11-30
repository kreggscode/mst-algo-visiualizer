// Sorting Algorithms with Visualization Callbacks
class SortingAlgorithms {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.isPaused = false;
        this.shouldStop = false;
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForResume() {
        while (this.isPaused && !this.shouldStop) {
            await this.sleep(100);
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.shouldStop = true;
        this.isPaused = false;
    }

    reset() {
        this.isPaused = false;
        this.shouldStop = false;
    }

    // Bubble Sort
    async bubbleSort(array) {
        this.reset();
        const n = array.length;
        let comparisons = 0;
        let swaps = 0;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.shouldStop) return { comparisons, swaps };

                await this.waitForResume();
                if (this.shouldStop) return { comparisons, swaps };

                comparisons++;
                this.visualizer.incrementComparisons();

                // Highlight comparing bars
                this.visualizer.highlightBars([j, j + 1], 'comparing');

                if (array[j] > array[j + 1]) {
                    swaps++;
                    this.visualizer.incrementSwaps();

                    // Swap
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];

                    // Play swap sound
                    audioEngine.playBarSound(array[j], Math.max(...array), 'swap');
                    audioEngine.playBarSound(array[j + 1], Math.max(...array), 'swap');

                    // Highlight swapping bars
                    this.visualizer.highlightBars([j, j + 1], 'swapping');
                    await this.visualizer.updateBars(array);
                    await this.sleep(this.visualizer.speed);
                }

                // Reset highlights
                this.visualizer.clearHighlights([j, j + 1]);
                await this.sleep(this.visualizer.speed);
            }

            // Mark sorted position
            this.visualizer.markSorted(n - i - 1);
            audioEngine.playBarSound(array[n - i - 1], Math.max(...array), 'sorted');
        }

        // Mark first element as sorted
        this.visualizer.markSorted(0);
        audioEngine.playBarSound(array[0], Math.max(...array), 'sorted');

        return { comparisons, swaps };
    }

    // Quick Sort
    async quickSort(array, low = 0, high = array.length - 1) {
        if (this.shouldStop) return { comparisons: 0, swaps: 0 };
        if (low >= high) return { comparisons: 0, swaps: 0 };

        await this.waitForResume();
        if (this.shouldStop) return { comparisons: 0, swaps: 0 };

        const partitionResult = await this.partition(array, low, high);
        if (this.shouldStop) return { comparisons: partitionResult.comparisons, swaps: partitionResult.swaps };

        const pivotIndex = partitionResult.pivotIndex;
        const left = await this.quickSort(array, low, pivotIndex - 1);
        const right = await this.quickSort(array, pivotIndex + 1, high);

        return {
            comparisons: partitionResult.comparisons + left.comparisons + right.comparisons,
            swaps: partitionResult.swaps + left.swaps + right.swaps
        };
    }

    async partition(array, low, high) {
        let comparisons = 0;
        let swaps = 0;
        const pivot = array[high];
        
        // Highlight pivot
        this.visualizer.highlightBars([high], 'pivot');
        audioEngine.playBarSound(pivot, Math.max(...array), 'pivot');
        await this.sleep(this.visualizer.speed);

        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (this.shouldStop) return { pivotIndex: i + 1, comparisons, swaps };

            await this.waitForResume();
            if (this.shouldStop) return { pivotIndex: i + 1, comparisons, swaps };

            comparisons++;
            this.visualizer.incrementComparisons();

            this.visualizer.highlightBars([j, high], 'comparing');

            if (array[j] < pivot) {
                i++;
                swaps++;
                this.visualizer.incrementSwaps();

                [array[i], array[j]] = [array[j], array[i]];

                audioEngine.playBarSound(array[i], Math.max(...array), 'swap');
                audioEngine.playBarSound(array[j], Math.max(...array), 'swap');

                this.visualizer.highlightBars([i, j], 'swapping');
                await this.visualizer.updateBars(array);
                await this.sleep(this.visualizer.speed);
            }

            this.visualizer.clearHighlights([j]);
            await this.sleep(this.visualizer.speed);
        }

        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        swaps++;
        this.visualizer.incrementSwaps();

        audioEngine.playBarSound(array[i + 1], Math.max(...array), 'swap');
        audioEngine.playBarSound(array[high], Math.max(...array), 'swap');

        this.visualizer.highlightBars([i + 1, high], 'swapping');
        this.visualizer.clearHighlights([high]);
        this.visualizer.markSorted(i + 1);
        await this.visualizer.updateBars(array);
        await this.sleep(this.visualizer.speed);

        return { pivotIndex: i + 1, comparisons, swaps };
    }

    // Merge Sort
    async mergeSort(array, left = 0, right = array.length - 1) {
        if (this.shouldStop) return { comparisons: 0, swaps: 0 };
        if (left >= right) return { comparisons: 0, swaps: 0 };

        await this.waitForResume();
        if (this.shouldStop) return { comparisons: 0, swaps: 0 };

        const mid = Math.floor((left + right) / 2);

        const leftResult = await this.mergeSort(array, left, mid);
        const rightResult = await this.mergeSort(array, mid + 1, right);
        const mergeResult = await this.merge(array, left, mid, right);

        return {
            comparisons: leftResult.comparisons + rightResult.comparisons + mergeResult.comparisons,
            swaps: leftResult.swaps + rightResult.swaps + mergeResult.swaps
        };
    }

    async merge(array, left, mid, right) {
        let comparisons = 0;
        let swaps = 0;

        const leftArray = array.slice(left, mid + 1);
        const rightArray = array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArray.length && j < rightArray.length) {
            if (this.shouldStop) return { comparisons, swaps };

            await this.waitForResume();
            if (this.shouldStop) return { comparisons, swaps };

            comparisons++;
            this.visualizer.incrementComparisons();

            this.visualizer.highlightBars([left + i, mid + 1 + j], 'comparing');

            if (leftArray[i] <= rightArray[j]) {
                array[k] = leftArray[i];
                i++;
            } else {
                array[k] = rightArray[j];
                j++;
            }

            swaps++;
            this.visualizer.incrementSwaps();

            audioEngine.playBarSound(array[k], Math.max(...array), 'merge');

            this.visualizer.highlightBars([k], 'swapping');
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);

            k++;
        }

        while (i < leftArray.length) {
            if (this.shouldStop) return { comparisons, swaps };
            array[k] = leftArray[i];
            audioEngine.playBarSound(array[k], Math.max(...array), 'merge');
            this.visualizer.highlightBars([k], 'swapping');
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);
            i++;
            k++;
        }

        while (j < rightArray.length) {
            if (this.shouldStop) return { comparisons, swaps };
            array[k] = rightArray[j];
            audioEngine.playBarSound(array[k], Math.max(...array), 'merge');
            this.visualizer.highlightBars([k], 'swapping');
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);
            j++;
            k++;
        }

        this.visualizer.clearHighlights();
        return { comparisons, swaps };
    }

    // Insertion Sort
    async insertionSort(array) {
        this.reset();
        let comparisons = 0;
        let swaps = 0;

        for (let i = 1; i < array.length; i++) {
            if (this.shouldStop) return { comparisons, swaps };

            await this.waitForResume();
            if (this.shouldStop) return { comparisons, swaps };

            const key = array[i];
            let j = i - 1;

            this.visualizer.highlightBars([i], 'comparing');

            while (j >= 0 && array[j] > key) {
                if (this.shouldStop) return { comparisons, swaps };

                await this.waitForResume();
                if (this.shouldStop) return { comparisons, swaps };

            comparisons++;
            this.visualizer.incrementComparisons();

            this.visualizer.highlightBars([j, j + 1], 'comparing');

            array[j + 1] = array[j];
            swaps++;
            this.visualizer.incrementSwaps();

                audioEngine.playBarSound(array[j + 1], Math.max(...array), 'swap');

                this.visualizer.highlightBars([j, j + 1], 'swapping');
                await this.visualizer.updateBars(array);
                await this.sleep(this.visualizer.speed);

                j--;
            }

            array[j + 1] = key;
            this.visualizer.clearHighlights([i, j + 1]);
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);
        }

        // Mark all as sorted
        for (let i = 0; i < array.length; i++) {
            this.visualizer.markSorted(i);
            await this.sleep(this.visualizer.speed / 2);
        }

        return { comparisons, swaps };
    }

    // Selection Sort
    async selectionSort(array) {
        this.reset();
        let comparisons = 0;
        let swaps = 0;

        for (let i = 0; i < array.length - 1; i++) {
            if (this.shouldStop) return { comparisons, swaps };

            await this.waitForResume();
            if (this.shouldStop) return { comparisons, swaps };

            let minIdx = i;

            for (let j = i + 1; j < array.length; j++) {
                if (this.shouldStop) return { comparisons, swaps };

                await this.waitForResume();
                if (this.shouldStop) return { comparisons, swaps };

            comparisons++;
            this.visualizer.incrementComparisons();

            this.visualizer.highlightBars([minIdx, j], 'comparing');

                if (array[j] < array[minIdx]) {
                    minIdx = j;
                }

                await this.sleep(this.visualizer.speed);
            }

            if (minIdx !== i) {
                swaps++;
                this.visualizer.incrementSwaps();

                [array[i], array[minIdx]] = [array[minIdx], array[i]];

                audioEngine.playBarSound(array[i], Math.max(...array), 'swap');
                audioEngine.playBarSound(array[minIdx], Math.max(...array), 'swap');

                this.visualizer.highlightBars([i, minIdx], 'swapping');
                await this.visualizer.updateBars(array);
                await this.sleep(this.visualizer.speed);
            }

            this.visualizer.clearHighlights();
            this.visualizer.markSorted(i);
            audioEngine.playBarSound(array[i], Math.max(...array), 'sorted');
            await this.sleep(this.visualizer.speed);
        }

        this.visualizer.markSorted(array.length - 1);
        audioEngine.playBarSound(array[array.length - 1], Math.max(...array), 'sorted');

        return { comparisons, swaps };
    }

    // Heap Sort
    async heapSort(array) {
        this.reset();
        let comparisons = 0;
        let swaps = 0;

        // Build max heap
        for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
            if (this.shouldStop) return { comparisons, swaps };
            await this.waitForResume();
            const result = await this.heapify(array, array.length, i);
            comparisons += result.comparisons;
            swaps += result.swaps;
        }

        // Extract elements from heap one by one
        for (let i = array.length - 1; i > 0; i--) {
            if (this.shouldStop) return { comparisons, swaps };

            await this.waitForResume();
            if (this.shouldStop) return { comparisons, swaps };

            swaps++;
            this.visualizer.incrementSwaps();

            [array[0], array[i]] = [array[i], array[0]];

            audioEngine.playBarSound(array[0], Math.max(...array), 'swap');
            audioEngine.playBarSound(array[i], Math.max(...array), 'swap');

            this.visualizer.highlightBars([0, i], 'swapping');
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);

            this.visualizer.markSorted(i);
            audioEngine.playBarSound(array[i], Math.max(...array), 'sorted');

            const result = await this.heapify(array, i, 0);
            comparisons += result.comparisons;
            swaps += result.swaps;
        }

        this.visualizer.markSorted(0);
        audioEngine.playBarSound(array[0], Math.max(...array), 'sorted');

        return { comparisons, swaps };
    }

    async heapify(array, n, i) {
        let comparisons = 0;
        let swaps = 0;

        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            comparisons++;
            this.visualizer.incrementComparisons();
            this.visualizer.highlightBars([largest, left], 'comparing');

            if (array[left] > array[largest]) {
                largest = left;
            }

            await this.sleep(this.visualizer.speed);
        }

        if (right < n) {
            comparisons++;
            this.visualizer.incrementComparisons();
            this.visualizer.highlightBars([largest, right], 'comparing');

            if (array[right] > array[largest]) {
                largest = right;
            }

            await this.sleep(this.visualizer.speed);
        }

        if (largest !== i) {
            swaps++;
            this.visualizer.incrementSwaps();

            [array[i], array[largest]] = [array[largest], array[i]];

            audioEngine.playBarSound(array[i], Math.max(...array), 'swap');
            audioEngine.playBarSound(array[largest], Math.max(...array), 'swap');

            this.visualizer.highlightBars([i, largest], 'swapping');
            await this.visualizer.updateBars(array);
            await this.sleep(this.visualizer.speed);

            this.visualizer.clearHighlights();
            const result = await this.heapify(array, n, largest);
            comparisons += result.comparisons;
            swaps += result.swaps;
        }

        this.visualizer.clearHighlights();
        return { comparisons, swaps };
    }
}
