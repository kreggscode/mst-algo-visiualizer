// Visualizer for MST Algorithms using Canvas
class Visualizer {
    constructor(canvasId, color = '#00ff88') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.color = color;
        this.nodes = [];
        this.edges = [];
        this.mstEdges = new Set();
        this.candidateEdges = new Set();
        this.nodeStates = new Map();
        this.edgeStates = new Map();
        this.gridSize = 20;
        this.nodeRadius = 3;
        this.speed = 1.0; // Default speed multiplier
        this.edgesAdded = 0;
        this.totalWeight = 0;
        this.drawPending = false;
        this.shape = 'grid';
        this.edgeColor = '#ffffff';
        this.boundaryEdges = new Set();
        
        // Setup canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 60, container.clientHeight - 60, 600);
        
        // Get device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual size in memory (scaled for device pixel ratio)
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        
        // Set display size (CSS pixels)
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // Scale the drawing context to account for device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Store the display size for calculations
        this.displayWidth = size;
        this.displayHeight = size;
        
        if (this.gridSize > 0) {
            // Recalculate cell sizes
            this.cellWidth = this.displayWidth / this.gridSize;
            this.cellHeight = this.displayHeight / this.gridSize;
        }
        
        this.draw();
    }

    initialize(nodes, edges, gridSize, shape = 'grid') {
        this.nodes = nodes;
        this.edges = edges;
        this.gridSize = gridSize;
        this.shape = shape;
        this.mstEdges.clear();
        this.candidateEdges.clear();
        this.nodeStates.clear();
        this.edgeStates.clear();
        this.edgesAdded = 0;
        this.totalWeight = 0;
        this.boundaryEdges.clear();
        
        // Collect boundary edges
        edges.forEach(edge => {
            if (edge.isBoundary) {
                const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
                this.boundaryEdges.add(edgeKey);
            }
        });
        
        // Recalculate display dimensions if needed
        if (!this.displayWidth) {
            this.resizeCanvas();
        }
        
        // Calculate cell size based on display dimensions
        const width = this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1);
        this.cellWidth = width / gridSize;
        this.cellHeight = height / gridSize;
        
        this.draw();
    }

    draw() {
        // Use requestAnimationFrame for smooth rendering without blocking
        if (this.drawPending) return;
        this.drawPending = true;
        
        requestAnimationFrame(() => {
            // Clear canvas using display dimensions
            const width = this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1);
            const height = this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1);
            this.ctx.fillStyle = '#000000'; // Darker background
            this.ctx.fillRect(0, 0, width, height);
            
            // Draw grid lines (subtle)
            this.drawGrid();
            
            // Draw shape boundary edges (glowing border)
            this.drawShapeBoundary();
            
            // Draw all edges (candidates - faint)
            this.drawAllEdges();
            
            // Draw MST edges (bright and glowing) - FINAL PATTERN
            this.drawMSTEdges();
            
            // Draw nodes
            this.drawNodes();
            
            this.drawPending = false;
        });
    }
    
    drawSync() {
        // Use requestAnimationFrame to avoid blocking main thread
        // This ensures smooth animation and prevents browser hanging
        if (this.drawPending) return;
        this.drawPending = true;
        
        requestAnimationFrame(() => {
            const width = this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1);
            const height = this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, width, height);
            this.drawGrid();
            this.drawShapeBoundary();
            this.drawAllEdges();
            this.drawMSTEdges();
            this.drawNodes();
            this.drawPending = false;
        });
    }

    drawGrid() {
        const width = this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.strokeStyle = '#0f0f0f';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            const x = (i / this.gridSize) * width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            
            // Horizontal lines
            const y = (i / this.gridSize) * height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawShapeBoundary() {
        if (this.shape === 'grid' || this.boundaryEdges.size === 0) return;
        
        const cellW = this.cellWidth || ((this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1)) / this.gridSize);
        const cellH = this.cellHeight || ((this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1)) / this.gridSize);
        
        // Draw glowing boundary edges
        this.boundaryEdges.forEach(edgeKey => {
            const [fromId, toId] = edgeKey.split('-').map(Number);
            const fromNode = this.nodes.find(n => n.id === fromId);
            const toNode = this.nodes.find(n => n.id === toId);
            
            if (!fromNode || !toNode) return;
            
            const x1 = (fromNode.col + 0.5) * cellW;
            const y1 = (fromNode.row + 0.5) * cellH;
            const x2 = (toNode.col + 0.5) * cellW;
            const y2 = (toNode.row + 0.5) * cellH;
            
            // Strong glow effect for boundary
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = this.edgeColor;
            this.ctx.strokeStyle = this.edgeColor;
            this.ctx.globalAlpha = 0.9;
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Draw main boundary edge
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Additional bright core
            this.ctx.shadowBlur = 15;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

    drawAllEdges() {
        // Draw candidate edges first (for Kruskal - disconnected looking)
        this.candidateEdges.forEach(edgeKey => {
            if (this.mstEdges.has(edgeKey)) return; // Skip if already in MST
            
            const [fromId, toId] = edgeKey.split('-').map(Number);
            const fromNode = this.nodes.find(n => n.id === fromId);
            const toNode = this.nodes.find(n => n.id === toId);
            
            if (!fromNode || !toNode) return;
            
            const state = this.edgeStates.get(edgeKey);
            
            if (state === 'considering') {
                // Highlight considering edge
                this.drawEdge(fromNode, toNode, {
                    color: this.color,
                    opacity: 0.8,
                    width: 3,
                    glow: true
                });
            } else if (state === 'rejected') {
                // Draw rejected edge (red, faint)
                this.drawEdge(fromNode, toNode, {
                    color: '#ff4757',
                    opacity: 0.2,
                    width: 1,
                    glow: false
                });
            } else {
                // Draw candidate edges (faint, disconnected looking like screenshot)
                this.drawEdge(fromNode, toNode, {
                    color: this.color,
                    opacity: 0.4,
                    width: 2,
                    glow: false
                });
            }
        });
    }

    drawMSTEdges() {
        // Draw MST edges with intense glow effect - like the second screenshot
        // This creates the dense glowing pattern visible during sorting
        this.mstEdges.forEach(edgeKey => {
            const [fromId, toId] = edgeKey.split('-').map(Number);
            const fromNode = this.nodes.find(n => n.id === fromId);
            const toNode = this.nodes.find(n => n.id === toId);
            
            if (!fromNode || !toNode) return;
            
            // Draw final MST edge with STRONG glow - dense pattern like screenshot
            // This is the final glowing style that appears during sorting
            this.drawEdge(fromNode, toNode, {
                color: this.color,
                opacity: 1.0,
                width: 5, // Thicker for more visible pattern
                glow: true,
                glowIntensity: 3.0 // Very strong glow for dense visible pattern
            });
        });
    }

    drawEdge(fromNode, toNode, style) {
        // Use cellWidth and cellHeight that are based on display dimensions
        const cellW = this.cellWidth || ((this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1)) / this.gridSize);
        const cellH = this.cellHeight || ((this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1)) / this.gridSize);
        
        const x1 = (fromNode.col + 0.5) * cellW;
        const y1 = (fromNode.row + 0.5) * cellH;
        const x2 = (toNode.col + 0.5) * cellW;
        const y2 = (toNode.row + 0.5) * cellH;
        
        // Enhanced glow effect for dense MST pattern
        if (style.glow) {
            const glowSize = style.glowIntensity || 2.0;
            
            // Multiple glow layers for intense effect (like screenshot)
            this.ctx.shadowBlur = 20 * glowSize;
            this.ctx.shadowColor = style.color;
            this.ctx.strokeStyle = style.color;
            this.ctx.globalAlpha = style.opacity;
            this.ctx.lineWidth = style.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Draw main edge
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Additional bright core for extra glow
            this.ctx.shadowBlur = 10 * glowSize;
            this.ctx.lineWidth = style.width * 0.6;
            this.ctx.stroke();
        } else {
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = style.color;
            this.ctx.globalAlpha = style.opacity;
            this.ctx.lineWidth = style.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

    drawNodes() {
        // Use cellWidth and cellHeight that are based on display dimensions
        const cellW = this.cellWidth || ((this.displayWidth || this.canvas.width / (window.devicePixelRatio || 1)) / this.gridSize);
        const cellH = this.cellHeight || ((this.displayHeight || this.canvas.height / (window.devicePixelRatio || 1)) / this.gridSize);
        
        this.nodes.forEach(node => {
            const x = (node.col + 0.5) * cellW;
            const y = (node.row + 0.5) * cellH;
            
            const state = this.nodeStates.get(node.id);
            
            // Enhanced glow effect for nodes in MST (like screenshot)
            if (state === 'start' || state === 'new' || state === 'in-mst') {
                // Strong glow for nodes connected in MST
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.color;
                this.ctx.fillStyle = this.color;
            } else {
                // Subtle nodes for unconnected
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#666';
            }
            
            // Draw node with glow
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        });
    }

    highlightNode(nodeId, state) {
        this.nodeStates.set(nodeId, state);
        // Don't redraw on every node highlight - batch it
        this.needsRedraw = true;
        if (!this.batchMode) {
            this.drawSync();
        }
    }

    highlightEdge(fromId, toId, state) {
        const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
        this.edgeStates.set(edgeKey, state);
        this.draw();
    }

    showEdgeCandidate(fromId, toId, weight) {
        const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
        if (!this.candidateEdges.has(edgeKey)) {
            this.candidateEdges.add(edgeKey);
            this.draw();
        }
    }

    addEdgeToMST(fromId, toId) {
        const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
        this.mstEdges.add(edgeKey);
        // Mark for redraw - batch updates
        this.needsRedraw = true;
        if (!this.batchMode) {
            this.drawSync(); // Immediate draw if not batching
        }
    }
    
    enableBatchMode() {
        this.batchMode = true;
        this.needsRedraw = false;
    }
    
    flushBatch() {
        this.batchMode = false;
        if (this.needsRedraw) {
            this.drawSync();
            this.needsRedraw = false;
        }
    }

    removeEdgeFromMST(fromId, toId) {
        const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
        this.mstEdges.delete(edgeKey);
        this.draw();
    }

    clearHighlights() {
        this.edgeStates.clear();
        // Keep node states but update drawing
        this.draw();
    }

    setEdgesAdded(count) {
        this.edgesAdded = count;
        const edgesEl = document.getElementById('edges-added');
        if (edgesEl) {
            edgesEl.textContent = count;
        }
    }

    setTotalWeight(weight) {
        this.totalWeight = weight;
        const weightEl = document.getElementById('total-weight');
        if (weightEl) {
            weightEl.textContent = weight;
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.updateTimer();
    }

    updateTimer() {
        if (this.startTime === null) return;

        const elapsed = (Date.now() - this.startTime) / 1000;
        const timeEl = document.getElementById('time');
        if (timeEl) {
            timeEl.textContent = elapsed.toFixed(2) + 's';
        }

        if (this.startTime !== null) {
            requestAnimationFrame(() => this.updateTimer());
        }
    }

    stopTimer() {
        if (this.startTime !== null) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.startTime = null;
            const timeEl = document.getElementById('time');
            if (timeEl) {
                timeEl.textContent = elapsed.toFixed(2) + 's';
            }
        }
    }
}