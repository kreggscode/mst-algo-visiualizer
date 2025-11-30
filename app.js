// Main Application Controller for MST Visualization
class App {
    constructor() {
        this.graph = null;
        this.primVisualizer = null;
        this.kruskalVisualizer = null;
        this.singleVisualizer = null;
        this.mstAlgorithms = null;
        this.currentMstAlgorithms = [];
        this.isRunning = false;
        this.isPaused = false;
        this.gridSize = 20;
        this.algorithmColors = {
            'prim': '#00ff88',
            'jarnik': '#00ff88',
            'prim-dijkstra': '#00ff88',
            'kruskal': '#ffd700',
            'boruvka': '#00d4ff',
            'cheriton-tarjan': '#00c9ff',
            'reverse-delete': '#b347ff',
            'fredman-tarjan': '#00ffaa',
            'kkt': '#ffaa00',
            'gabow-galil-spencer-tarjan': '#00ccff',
            'chazelle': '#00ffcc',
            'pettie-ramachandran': '#88ff00',
            'tarjan-verification': '#ff8800',
            'yao': '#ffff00',
            'parallel-boruvka': '#0099ff',
            'integer-weight': '#ff00aa',
            'planar-graph': '#aa00ff'
        };
        
        this.initializeVisualizers();
        this.initializeEventListeners();
        this.generateNewGraph();
    }

    initializeVisualizers() {
        // Create visualizers for comparison view
        const primCanvas = document.getElementById('prim-canvas');
        const kruskalCanvas = document.getElementById('kruskal-canvas');
        const singleCanvas = document.getElementById('single-canvas');
        
        if (primCanvas) {
            this.primVisualizer = new Visualizer('prim-canvas', '#00ff88');
        }
        if (kruskalCanvas) {
            this.kruskalVisualizer = new Visualizer('kruskal-canvas', '#ffd700');
        }
        if (singleCanvas) {
            this.singleVisualizer = new Visualizer('single-canvas', this.algorithmColors['prim']);
        }
    }

    initializeEventListeners() {
        // Algorithm selection
        document.getElementById('algorithm').addEventListener('change', (e) => {
            if (!this.isRunning) {
                this.updateView(e.target.value);
                this.updateAlgorithmInfo(e.target.value);
                this.updateColorPicker(e.target.value);
            }
        });

        // Color picker
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('change', (e) => {
            if (!this.isRunning) {
                const algorithm = document.getElementById('algorithm').value;
                const color = e.target.value;
                this.algorithmColors[algorithm] = color;
                this.updateVisualizerColor(algorithm, color);
            }
        });

        // Stop button
        document.getElementById('stop').addEventListener('click', () => {
            if (this.isRunning) {
                this.stopAnimation();
            }
        });

        // Grid size control
        const sizeSlider = document.getElementById('grid-size');
        const sizeValue = document.getElementById('size-value');
        sizeSlider.addEventListener('input', (e) => {
            if (!this.isRunning) {
                const size = parseInt(e.target.value);
                sizeValue.textContent = size;
                this.gridSize = size;
                this.generateNewGraph();
            }
        });

        // Speed control - faster default, more responsive
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            speedValue.textContent = speed;
            // Convert slider value to speed multiplier (1-100 maps to 5x-0.5x)
            // Higher slider = faster animation (lower delay multiplier)
            const speedMultiplier = 1 - ((speed - 1) / 99) * 0.9; // 1.0 (slow) to 0.1 (fast)
            if (this.primVisualizer) this.primVisualizer.speed = speedMultiplier;
            if (this.kruskalVisualizer) this.kruskalVisualizer.speed = speedMultiplier;
            if (this.singleVisualizer) this.singleVisualizer.speed = speedMultiplier;
        });

        // Generate new graph button
        document.getElementById('generate').addEventListener('click', () => {
            if (!this.isRunning) {
                this.generateNewGraph();
            }
        });

        // Start button
        document.getElementById('start').addEventListener('click', () => {
            if (!this.isRunning) {
                this.startAnimation();
            }
        });

        // Pause button
        document.getElementById('pause').addEventListener('click', () => {
            if (this.isPaused) {
                this.resumeAnimation();
            } else {
                this.pauseAnimation();
            }
        });

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.addEventListener('click', () => {
            const isEnabled = audioEngine.toggle();
            soundToggle.classList.toggle('active', isEnabled);
        });
    }

    updateView(algorithm) {
        const comparisonContainer = document.getElementById('comparison-container');
        const singleContainer = document.getElementById('single-container');
        
        if (algorithm === 'both') {
            comparisonContainer.style.display = 'grid';
            singleContainer.style.display = 'none';
        } else {
            comparisonContainer.style.display = 'none';
            singleContainer.style.display = 'block';
            
            // Update single visualizer color based on algorithm
            const color = this.algorithmColors[algorithm] || '#00ff88';
            this.singleVisualizer.color = color;
            this.updateVisualizerColor(algorithm, color);
        }
    }

    updateAlgorithmInfo(algorithm) {
        const info = {
            'prim': { name: "Prim's Algorithm", desc: "Grows from a start node" },
            'jarnik': { name: "Jarník's Algorithm", desc: "Original name for Prim's (1930)" },
            'prim-dijkstra': { name: "Prim-Dijkstra Algorithm (DJP)", desc: "Prim's with Dijkstra's optimization" },
            'kruskal': { name: "Kruskal's Algorithm", desc: "Sorts edges globally" },
            'boruvka': { name: "Borůvka's Algorithm", desc: "Parallel component growth" },
            'cheriton-tarjan': { name: "Cheriton-Tarjan Algorithm", desc: "Optimized Borůvka's with O(m log log n)" },
            'reverse-delete': { name: "Reverse-Delete Algorithm", desc: "Removes edges in reverse order" },
            'fredman-tarjan': { name: "Fredman-Tarjan Algorithm", desc: "Uses Fibonacci heaps for O(m + n log n)" },
            'gabow-galil-spencer-tarjan': { name: "Gabow-Galil-Spencer-Tarjan", desc: "Advanced MST with improved bounds" },
            'chazelle': { name: "Chazelle's Algorithm", desc: "Near-linear time deterministic O(m α(m,n))" },
            'pettie-ramachandran': { name: "Pettie-Ramachandran Algorithm", desc: "Optimal deterministic comparison-based" },
            'kkt': { name: "KKT Randomized Algorithm", desc: "Karger, Klein, Tarjan - O(m + n) expected time" },
            'tarjan-verification': { name: "Tarjan's Verification Algorithm", desc: "Verifies if a tree is an MST" },
            'yao': { name: "Yao's Algorithm", desc: "Uses angular ordering for geometric graphs" },
            'parallel-boruvka': { name: "Parallel Borůvka's Algorithm", desc: "Parallelized component growth" },
            'integer-weight': { name: "Integer-Weight MST Algorithm", desc: "Optimized for integer weights" },
            'planar-graph': { name: "Planar Graph MST Algorithm", desc: "O(n) time for planar graphs" }
        };
        
        if (info[algorithm]) {
            document.getElementById('algorithm-name').textContent = info[algorithm].name;
            document.getElementById('algorithm-description').textContent = info[algorithm].desc;
        }
    }

    updateColorPicker(algorithm) {
        const colorPickerContainer = document.getElementById('color-picker-container');
        const colorPicker = document.getElementById('color-picker');
        
        if (algorithm === 'both') {
            colorPickerContainer.style.display = 'none';
        } else {
            colorPickerContainer.style.display = 'flex';
            colorPicker.value = this.algorithmColors[algorithm] || '#00ff88';
        }
    }

    updateVisualizerColor(algorithm, color) {
        if (algorithm === 'both') {
            if (this.primVisualizer) this.primVisualizer.color = this.algorithmColors['prim'];
            if (this.kruskalVisualizer) this.kruskalVisualizer.color = this.algorithmColors['kruskal'];
        } else {
            if (this.singleVisualizer) {
                this.singleVisualizer.color = color;
                this.singleVisualizer.draw();
            }
        }
    }

    generateNewGraph() {
        // Generate new graph
        this.graph = GraphUtils.generateGridGraph(this.gridSize);
        
        // Update all visualizers
        if (this.primVisualizer) {
            this.primVisualizer.initialize(this.graph.nodes, this.graph.edges, this.gridSize);
        }
        if (this.kruskalVisualizer) {
            this.kruskalVisualizer.initialize(this.graph.nodes, this.graph.edges, this.gridSize);
        }
        if (this.singleVisualizer) {
            this.singleVisualizer.initialize(this.graph.nodes, this.graph.edges, this.gridSize);
        }
        
        // Reset stats
        document.getElementById('edges-added').textContent = '0';
        document.getElementById('time').textContent = '0.00s';
        document.getElementById('total-weight').textContent = '0';
    }

    async startAnimation() {
        if (this.isRunning) {
            console.log('Animation already running');
            return;
        }
        
        // Validate graph exists
        if (!this.graph || !this.graph.nodes || this.graph.nodes.length === 0) {
            console.error('No graph available. Generating new graph...');
            this.generateNewGraph();
            if (!this.graph || !this.graph.nodes || this.graph.nodes.length === 0) {
                alert('Error: Could not generate graph. Please try again.');
                return;
            }
        }
        
        console.log('Starting animation...');
        
        // Resume audio context (browsers require user interaction)
        if (audioEngine.audioContext && audioEngine.audioContext.state === 'suspended') {
            audioEngine.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            });
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.currentMstAlgorithms = []; // Reset algorithms list
        
        // Disable controls
        document.getElementById('algorithm').disabled = true;
        document.getElementById('generate').disabled = true;
        document.getElementById('start').disabled = true;
        document.getElementById('pause').disabled = false;
        document.getElementById('stop').disabled = false;
        document.getElementById('grid-size').disabled = true;
        document.getElementById('color-picker').disabled = true;
        
        const algorithm = document.getElementById('algorithm').value;
        const nodes = [...this.graph.nodes];
        const edges = [...this.graph.edges];
        
        console.log(`Running algorithm: ${algorithm}, Nodes: ${nodes.length}, Edges: ${edges.length}`);
        
        try {
            if (algorithm === 'both') {
                // Run both algorithms simultaneously
                await Promise.all([
                    this.runPrim(nodes, edges),
                    this.runKruskal(nodes, edges)
                ]);
            } else if (algorithm === 'prim') {
                await this.runPrim(nodes, edges);
            } else if (algorithm === 'jarnik') {
                await this.runJarnik(nodes, edges);
            } else if (algorithm === 'prim-dijkstra') {
                await this.runPrimDijkstra(nodes, edges);
            } else if (algorithm === 'kruskal') {
                await this.runKruskal(nodes, edges);
            } else if (algorithm === 'boruvka') {
                await this.runBoruvka(nodes, edges);
            } else if (algorithm === 'cheriton-tarjan') {
                await this.runCheritonTarjan(nodes, edges);
            } else if (algorithm === 'reverse-delete') {
                await this.runReverseDelete(nodes, edges);
            } else if (algorithm === 'fredman-tarjan') {
                await this.runFredmanTarjan(nodes, edges);
            } else if (algorithm === 'gabow-galil-spencer-tarjan') {
                await this.runGabowGalilSpencerTarjan(nodes, edges);
            } else if (algorithm === 'chazelle') {
                await this.runChazelle(nodes, edges);
            } else if (algorithm === 'pettie-ramachandran') {
                await this.runPettieRamachandran(nodes, edges);
            } else if (algorithm === 'kkt') {
                await this.runKKT(nodes, edges);
            } else if (algorithm === 'tarjan-verification') {
                await this.runTarjanVerification(nodes, edges);
            } else if (algorithm === 'yao') {
                await this.runYao(nodes, edges);
            } else if (algorithm === 'parallel-boruvka') {
                await this.runParallelBoruvka(nodes, edges);
            } else if (algorithm === 'integer-weight') {
                await this.runIntegerWeight(nodes, edges);
            } else if (algorithm === 'planar-graph') {
                await this.runPlanarGraph(nodes, edges);
            }
            
            // Final visualization update - show complete dense MST pattern
            const visualizer = document.getElementById('comparison-container').style.display !== 'none' 
                ? (algorithm === 'prim' ? this.primVisualizer : this.kruskalVisualizer)
                : this.singleVisualizer;
            
            if (visualizer) {
                // Mark all nodes
                nodes.forEach(node => {
                    visualizer.highlightNode(node.id, 'in-mst');
                });
                
                // Final draw asynchronously (non-blocking)
                visualizer.drawSync();
                
                // Wait for next frame to ensure draw completes and prevent blocking
                await new Promise(resolve => requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolve());
                }));
            }
            
            // Play completion sound
            audioEngine.playComplete();
            
        } catch (error) {
            console.error('Animation error:', error);
            console.error(error.stack);
            alert('Animation error: ' + error.message);
        } finally {
            console.log('Animation finished, cleaning up...');
            this.finishAnimation();
        }
    }

    async runPrim(nodes, edges) {
        const visualizer = document.getElementById('comparison-container').style.display !== 'none' 
            ? this.primVisualizer 
            : this.singleVisualizer;
        
        if (!visualizer) {
            console.error('Visualizer not available for Prim');
            return;
        }
        
        // Ensure visualizer has nodes and edges
        if (!visualizer.nodes || visualizer.nodes.length === 0) {
            visualizer.initialize(nodes, edges, this.gridSize);
        }
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms.push(mstAlgorithms);
        
        visualizer.startTimer();
        console.log('Running Prim\'s algorithm...');
        const result = await mstAlgorithms.primsAlgorithm(nodes, edges);
        visualizer.stopTimer();
        console.log('Prim\'s algorithm completed');
        
        return result;
    }

    async runKruskal(nodes, edges) {
        const visualizer = document.getElementById('comparison-container').style.display !== 'none' 
            ? this.kruskalVisualizer 
            : this.singleVisualizer;
        
        if (!visualizer) {
            console.error('Visualizer not available for Kruskal');
            return;
        }
        
        // Ensure visualizer has nodes and edges
        if (!visualizer.nodes || visualizer.nodes.length === 0) {
            visualizer.initialize(nodes, edges, this.gridSize);
        }
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms.push(mstAlgorithms);
        
        visualizer.startTimer();
        console.log('Running Kruskal\'s algorithm...');
        const result = await mstAlgorithms.kruskalsAlgorithm(nodes, edges);
        visualizer.stopTimer();
        console.log('Kruskal\'s algorithm completed');
        
        return result;
    }

    pauseAnimation() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        this.currentMstAlgorithms.forEach(algo => {
            if (algo) algo.pause();
        });
        document.getElementById('pause').textContent = 'Resume';
    }

    resumeAnimation() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.currentMstAlgorithms.forEach(algo => {
            if (algo) algo.resume();
        });
        document.getElementById('pause').textContent = 'Pause';
    }

    stopAnimation() {
        if (!this.isRunning) return;
        
        // Stop all algorithms
        this.currentMstAlgorithms.forEach(algo => {
            if (algo) algo.stop();
        });
        
        this.finishAnimation();
    }

    async runBoruvka(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.boruvkasAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runJarnik(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.jarniksAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runCheritonTarjan(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.cheritonTarjansAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runFredmanTarjan(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.fredmanTarjansAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runKKT(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.kktRandomizedAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runPrimDijkstra(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.primDijkstraAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runGabowGalilSpencerTarjan(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.gabowGalilSpencerTarjansAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runChazelle(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.chazellesAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runPettieRamachandran(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.pettieRamachandransAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runTarjanVerification(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.tarjansVerificationAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runYao(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.yaosAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runParallelBoruvka(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.parallelBoruvkasAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runIntegerWeight(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.integerWeightMSTAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runPlanarGraph(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.planarGraphMSTAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    async runReverseDelete(nodes, edges) {
        const visualizer = this.singleVisualizer;
        if (!visualizer) return;
        
        const mstAlgorithms = new MSTAlgorithms(visualizer);
        mstAlgorithms.reset();
        this.currentMstAlgorithms = [mstAlgorithms];
        
        visualizer.startTimer();
        const result = await mstAlgorithms.reverseDeleteAlgorithm(nodes, edges);
        visualizer.stopTimer();
        
        return result;
    }

    finishAnimation() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentMstAlgorithms = [];
        
        // Re-enable controls
        document.getElementById('algorithm').disabled = false;
        document.getElementById('generate').disabled = false;
        document.getElementById('start').disabled = false;
        document.getElementById('pause').disabled = true;
        document.getElementById('pause').textContent = 'Pause';
        document.getElementById('stop').disabled = true;
        document.getElementById('grid-size').disabled = false;
        document.getElementById('color-picker').disabled = false;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
        // Set initial view
        const initialAlgorithm = document.getElementById('algorithm').value;
        window.app.updateView(initialAlgorithm);
        window.app.updateAlgorithmInfo(initialAlgorithm);
        window.app.updateColorPicker(initialAlgorithm);
    
    // Initialize speed
    const speed = parseInt(document.getElementById('speed').value);
    const delay = Math.max(0, (101 - speed) * 0.05); // Max 5ms delay for speed
    if (window.app.primVisualizer) window.app.primVisualizer.speed = delay;
    if (window.app.kruskalVisualizer) window.app.kruskalVisualizer.speed = delay;
    if (window.app.singleVisualizer) window.app.singleVisualizer.speed = delay;
});