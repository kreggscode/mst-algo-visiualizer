// Minimum Spanning Tree Algorithms
class MSTAlgorithms {
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

    // Prim's Algorithm - Grows from a start node
    async primsAlgorithm(nodes, edges) {
        this.reset();
        const mstEdges = [];
        const visited = new Set();
        const priorityQueue = [];
        
        // Start from first node (top-left)
        const startNode = nodes[0];
        visited.add(startNode.id);
        
        // Add all edges from start node to priority queue
        edges.filter(e => e.from === startNode.id || e.to === startNode.id)
            .forEach(edge => {
                priorityQueue.push(edge);
            });
        
        // Sort priority queue by weight
        priorityQueue.sort((a, b) => a.weight - b.weight);
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        // Mark start node
        this.visualizer.highlightNode(startNode.id, 'start');
        audioEngine.playBarSound(50, 100, 'comparison');
        this.visualizer.drawSync();
        await this.sleep(Math.max(2, 20 * this.visualizer.speed));
        
        while (priorityQueue.length > 0 && visited.size < nodes.length) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            // Allow UI to update (non-blocking)
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            // Small delay to allow rendering and make animation visible
            await this.sleep(Math.max(2, 20 * this.visualizer.speed));
            
            // Find minimum weight edge that connects visited to unvisited
            let minEdge = null;
            let minIndex = -1;
            
            for (let i = 0; i < priorityQueue.length; i++) {
                const edge = priorityQueue[i];
                const fromVisited = visited.has(edge.from);
                const toVisited = visited.has(edge.to);
                
                // Edge must connect visited to unvisited
                if ((fromVisited && !toVisited) || (!fromVisited && toVisited)) {
                    if (minEdge === null || edge.weight < minEdge.weight) {
                        minEdge = edge;
                        minIndex = i;
                    }
                }
            }
            
            if (minEdge === null) break;
            
            // Remove edge from queue
            priorityQueue.splice(minIndex, 1);
            
            // Determine which node is new
            const newNodeId = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
            const newNode = nodes.find(n => n.id === newNodeId);
            
            if (!newNode) continue;
            
            // Add edge to MST
            mstEdges.push(minEdge);
            visited.add(newNodeId);
            totalWeight += minEdge.weight;
            edgesAdded++;
            
            // Update visualization
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            
            // Add edge to MST - shows with final glowing pattern IMMEDIATELY
            this.visualizer.mstEdges.add(`${Math.min(minEdge.from, minEdge.to)}-${Math.max(minEdge.from, minEdge.to)}`);
            this.visualizer.nodeStates.set(newNodeId, 'in-mst');
            
            // Update stats
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            
            // Play sound FIRST (synchronized with visual update)
            const normalizedWeight = (minEdge.weight / 100) * 100;
            audioEngine.playBarSound(normalizedWeight, 100, 'merge');
            
            // Draw asynchronously (non-blocking)
            this.visualizer.drawSync();
            
            // Delay based on speed for visible animation
            // speed is a multiplier: 1.0 = slow (20ms), 0.1 = fast (2ms)
            const delay = Math.max(2, 20 * this.visualizer.speed); // 2-20ms based on speed
            await this.sleep(delay);
            
            // Add new edges from newly visited node
            edges.filter(e => 
                (e.from === newNodeId || e.to === newNodeId) &&
                !visited.has(e.from === newNodeId ? e.to : e.from)
            ).forEach(edge => {
                if (!priorityQueue.find(e => 
                    (e.from === edge.from && e.to === edge.to) ||
                    (e.from === edge.to && e.to === edge.from)
                )) {
                    priorityQueue.push(edge);
                }
            });
            
            priorityQueue.sort((a, b) => a.weight - b.weight);
            
            // No highlights needed - final pattern is already showing
        }
        
        // Mark all nodes instantly - no animation delay
        nodes.forEach(node => {
            if (visited.has(node.id) && !this.shouldStop) {
                this.visualizer.highlightNode(node.id, 'in-mst');
            }
        });
        
        // Final draw immediately - show complete MST instantly with final glowing pattern
        if (!this.shouldStop) {
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            this.visualizer.drawSync(); // Synchronous for instant display
        }
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Kruskal's Algorithm - Sorts edges globally
    async kruskalsAlgorithm(nodes, edges) {
        this.reset();
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        // Initialize Union-Find structure
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // Sort all edges by weight (globally)
        const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        // Process edges - batch update for speed, show final glowing pattern immediately
        let batchCount = 0;
        for (const edge of sortedEdges) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            // Small delay to allow rendering and make animation visible
            await this.sleep(Math.max(2, 20 * this.visualizer.speed));
            
            // Find roots of both nodes
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            
            // If roots are different, adding this edge won't create a cycle
            if (rootFrom !== rootTo) {
                // Add edge to MST - show final path immediately
                mstEdges.push(edge);
                totalWeight += edge.weight;
                edgesAdded++;
                
                // Add to MST visualization - shows with final glowing pattern
                this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                
                // Update stats
                batchCount++;
                this.visualizer.setEdgesAdded(edgesAdded);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                
                // Play sound FIRST (synchronized with visual update)
                audioEngine.playBarSound(edge.weight, 100, 'merge');
                
                // Draw asynchronously (non-blocking) - batch updates for performance
                // Only draw every 2-3 edges to reduce blocking
                if (batchCount % 3 === 0 || edgesAdded >= nodes.length - 1) {
                    this.visualizer.drawSync();
                    
                    // Delay based on speed for visible animation
                    // speed is a multiplier: 1.0 = slow (20ms), 0.1 = fast (2ms)
                    const delay = Math.max(2, 20 * this.visualizer.speed); // 2-20ms based on speed
                    await this.sleep(delay);
                } else {
                    // Still draw but don't delay on every edge
                    this.visualizer.drawSync();
                }
                
                // Union the two sets
                this.union(parent, rank, rootFrom, rootTo);
            }
            
            // Stop if we have enough edges (n-1 for n nodes)
            if (edgesAdded >= nodes.length - 1) {
                break;
            }
        }
        
        // Final update
        this.visualizer.setEdgesAdded(edgesAdded);
        this.visualizer.setTotalWeight(Math.round(totalWeight));
        this.visualizer.drawSync();
        
        // Mark all nodes instantly - no animation delay
        nodes.forEach(node => {
            if (!this.shouldStop) {
                this.visualizer.highlightNode(node.id, 'in-mst');
            }
        });
        
        // Final draw immediately - show complete MST instantly with final glowing pattern
        if (!this.shouldStop) {
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            this.visualizer.drawSync(); // Synchronous for instant display
        }
        
        return { mstEdges, totalWeight, edgesAdded };
    }
    
    // Union-Find helper functions
    find(parent, node) {
        if (parent[node] !== node) {
            parent[node] = this.find(parent, parent[node]); // Path compression
        }
        return parent[node];
    }
    
    union(parent, rank, root1, root2) {
        if (rank[root1] < rank[root2]) {
            parent[root1] = root2;
        } else if (rank[root1] > rank[root2]) {
            parent[root2] = root1;
        } else {
            parent[root2] = root1;
            rank[root1]++;
        }
    }

    // Borůvka's Algorithm - Parallel component growth
    async boruvkasAlgorithm(nodes, edges) {
        this.reset();
        const mstEdges = [];
        const parent = {};
        const rank = {};
        let components = new Map();
        let totalWeight = 0;
        let edgesAdded = 0;
        
        // Initialize each node as its own component
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
            components.set(node.id, [node.id]);
        });
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        while (components.size > 1 && edges.length > 0) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const cheapestEdge = new Map(); // component -> cheapest edge
            
            // Find cheapest edge for each component
            for (const edge of edges) {
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                
                const rootFrom = this.find(parent, edge.from);
                const rootTo = this.find(parent, edge.to);
                
                if (rootFrom === rootTo) continue;
                
                // Update cheapest edge for each component
                if (!cheapestEdge.has(rootFrom) || cheapestEdge.get(rootFrom).weight > edge.weight) {
                    cheapestEdge.set(rootFrom, { edge, otherRoot: rootTo });
                }
                if (!cheapestEdge.has(rootTo) || cheapestEdge.get(rootTo).weight > edge.weight) {
                    cheapestEdge.set(rootTo, { edge, otherRoot: rootFrom });
                }
            }
            
            // Add cheapest edges
            for (const [componentRoot, { edge, otherRoot }] of cheapestEdge) {
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                
                const rootFrom = this.find(parent, edge.from);
                const rootTo = this.find(parent, edge.to);
                
                if (rootFrom !== rootTo) {
                    // Add edge to MST
                    mstEdges.push(edge);
                    totalWeight += edge.weight;
                    edgesAdded++;
                    
                    this.visualizer.setEdgesAdded(edgesAdded);
                    this.visualizer.setTotalWeight(Math.round(totalWeight));
                    
                    // Add edge to MST - shows with final glowing pattern
                    this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                    this.visualizer.nodeStates.set(edge.from, 'in-mst');
                    this.visualizer.nodeStates.set(edge.to, 'in-mst');
                    
                    // Play sound synchronized with visual update
                    const normalizedWeight = (edge.weight / 100) * 100;
                    audioEngine.playBarSound(normalizedWeight, 100, 'merge');
                    
                    // Draw and delay for visible animation
                    this.visualizer.drawSync();
                    const delay = Math.max(2, 20 * this.visualizer.speed);
                    await this.sleep(delay);
                    
                    // Union components
                    this.union(parent, rank, rootFrom, rootTo);
                    const newRoot = this.find(parent, rootFrom);
                    
                    // Update components
                    const comp1 = components.get(rootFrom) || [];
                    const comp2 = components.get(rootTo) || [];
                    components.delete(rootFrom);
                    components.delete(rootTo);
                    components.set(newRoot, [...comp1, ...comp2]);
                    
                    // No clearing needed - final pattern is showing
                    // Minimal delay
                }
            }
        }
        
        // Mark all nodes instantly - no animation delay
        nodes.forEach(node => {
            if (!this.shouldStop) {
                this.visualizer.highlightNode(node.id, 'in-mst');
            }
        });
        
        // Final draw immediately - show complete MST instantly with final glowing pattern
        if (!this.shouldStop) {
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            this.visualizer.drawSync(); // Synchronous for instant display
        }
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Reverse-Delete Algorithm - Remove edges in reverse order
    async reverseDeleteAlgorithm(nodes, edges) {
        this.reset();
        const mstEdges = [...edges];
        const sortedEdges = [...edges].sort((a, b) => b.weight - a.weight); // Sort descending
        let totalWeight = edges.reduce((sum, e) => sum + e.weight, 0);
        
        // Initialize: show all edges as MST edges
        edges.forEach(edge => {
            this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
        });
        this.visualizer.setEdgesAdded(edges.length);
        this.visualizer.setTotalWeight(Math.round(totalWeight));
        this.visualizer.drawSync();
        await this.sleep(Math.max(2, 20 * this.visualizer.speed));
        
        // Process edges in descending order
        for (const edge of sortedEdges) {
            if (this.shouldStop) break;
            
            await this.waitForResume();
            if (this.shouldStop) break;
            
            // Skip if edge already removed
            const edgeIndex = mstEdges.findIndex(e => 
                (e.from === edge.from && e.to === edge.to) ||
                (e.from === edge.to && e.to === edge.from)
            );
            
            if (edgeIndex === -1) {
                // Edge already removed, skip
                continue;
            }
            
            // Process edge instantly - no highlighting needed
            // Temporarily remove edge
            mstEdges.splice(edgeIndex, 1);
            
            // Optimized connectivity check - skip if too many edges
            if (mstEdges.length < nodes.length - 1) {
                // Definitely disconnected - restore edge
                mstEdges.push(edge);
                // No highlighting needed - continue
                continue;
            }
            
            // Quick connectivity check (optimized)
            const isStillConnected = this.isConnectedFast(nodes, mstEdges);
            
            if (isStillConnected) {
                // Can safely remove this edge
                totalWeight -= edge.weight;
                this.visualizer.setEdgesAdded(mstEdges.length);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                // Skip rejected edges - don't show
                
                // Remove from MST visualization
                this.visualizer.removeEdgeFromMST(edge.from, edge.to);
                
                audioEngine.playBarSound(edge.weight, 100, 'swap');
                
                // Draw and delay for visible animation
                this.visualizer.drawSync();
                const delay = Math.max(2, 20 * this.visualizer.speed);
                await this.sleep(delay);
            } else {
                // Need to keep this edge (graph would be disconnected)
                mstEdges.push(edge);
                // No highlighting - edge already in MST
            }
        }
        
        const edgesAdded = mstEdges.length;
        this.visualizer.setEdgesAdded(edgesAdded);
        
        // Mark all nodes instantly - no animation delay
        nodes.forEach(node => {
            if (!this.shouldStop) {
                this.visualizer.highlightNode(node.id, 'in-mst');
            }
        });
        
        // Final draw immediately - show complete MST instantly with final glowing pattern
        if (!this.shouldStop) {
            this.visualizer.setEdgesAdded(edgesAdded);
            this.visualizer.setTotalWeight(Math.round(totalWeight));
            this.visualizer.drawSync(); // Synchronous for instant display
        }
        
        return { mstEdges, totalWeight, edgesAdded };
    }
    
    // Check if graph is connected using optimized Union-Find
    isConnected(nodes, edges) {
        if (nodes.length === 0) return true;
        if (edges.length < nodes.length - 1) return false;
        
        const parent = {};
        nodes.forEach(node => {
            parent[node.id] = node.id;
        });
        
        // Quick union all edges
        for (const edge of edges) {
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            if (rootFrom !== rootTo) {
                parent[rootFrom] = rootTo;
            }
        }
        
        // Check if all nodes have same root
        const rootSet = new Set();
        nodes.forEach(node => {
            rootSet.add(this.find(parent, node.id));
        });
        
        return rootSet.size === 1;
    }
    
    // Fast connectivity check for Reverse-Delete (optimized)
    isConnectedFast(nodes, edges) {
        if (nodes.length === 0) return true;
        if (edges.length < nodes.length - 1) return false;
        
        const parent = {};
        let componentCount = nodes.length;
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
        });
        
        // Union with early exit
        for (const edge of edges) {
            let rootFrom = edge.from;
            let rootTo = edge.to;
            
            // Path compression on find
            while (parent[rootFrom] !== rootFrom) rootFrom = parent[rootFrom];
            while (parent[rootTo] !== rootTo) rootTo = parent[rootTo];
            
            if (rootFrom !== rootTo) {
                parent[rootFrom] = rootTo;
                componentCount--;
                if (componentCount === 1) return true; // Early exit
            }
        }
        
        return componentCount === 1;
    }

    // Jarník's Algorithm - Original name for Prim's (1930)
    async jarniksAlgorithm(nodes, edges) {
        // Jarník's is the same as Prim's algorithm
        return await this.primsAlgorithm(nodes, edges);
    }

    // Cheriton-Tarjan Algorithm - Optimized Borůvka's with better data structures
    async cheritonTarjansAlgorithm(nodes, edges) {
        this.reset();
        const mstEdges = [];
        const parent = {};
        const rank = {};
        let components = new Map();
        let totalWeight = 0;
        let edgesAdded = 0;
        
        // Initialize each node as its own component
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
            components.set(node.id, [node.id]);
        });
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        while (components.size > 1) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const cheapestEdge = new Map();
            
            // Find cheapest edge for each component (optimized)
            for (const edge of edges) {
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                
                const rootFrom = this.find(parent, edge.from);
                const rootTo = this.find(parent, edge.to);
                
                if (rootFrom === rootTo) continue;
                
                // Update cheapest edge (optimized check)
                if (!cheapestEdge.has(rootFrom) || cheapestEdge.get(rootFrom).weight > edge.weight) {
                    cheapestEdge.set(rootFrom, { edge, otherRoot: rootTo });
                }
                if (!cheapestEdge.has(rootTo) || cheapestEdge.get(rootTo).weight > edge.weight) {
                    cheapestEdge.set(rootTo, { edge, otherRoot: rootFrom });
                }
            }
            
            // Break if no edges found
            if (cheapestEdge.size === 0) break;
            
            // Add cheapest edges (Cheriton-Tarjan optimization: process in batches)
            const addedThisRound = new Set();
            for (const [componentRoot, { edge, otherRoot }] of cheapestEdge) {
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                
                const rootFrom = this.find(parent, edge.from);
                const rootTo = this.find(parent, edge.to);
                
                // Skip if already added this round
                const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
                if (addedThisRound.has(edgeKey)) continue;
                
                if (rootFrom !== rootTo) {
                    mstEdges.push(edge);
                    totalWeight += edge.weight;
                    edgesAdded++;
                    addedThisRound.add(edgeKey);
                    
                    this.visualizer.setEdgesAdded(edgesAdded);
                    this.visualizer.setTotalWeight(Math.round(totalWeight));
                    
                    // Add edge to MST - shows with final glowing pattern
                    this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                    this.visualizer.nodeStates.set(edge.from, 'in-mst');
                    this.visualizer.nodeStates.set(edge.to, 'in-mst');
                    
                    // Play sound synchronized with visual update
                    const normalizedWeight = (edge.weight / 100) * 100;
                    audioEngine.playBarSound(normalizedWeight, 100, 'merge');
                    
                    // Draw and delay for visible animation
                    this.visualizer.drawSync();
                    const delay = Math.max(2, 20 * this.visualizer.speed);
                    await this.sleep(delay);
                    
                    this.union(parent, rank, rootFrom, rootTo);
                    const newRoot = this.find(parent, rootFrom);
                    
                    const comp1 = components.get(rootFrom) || [];
                    const comp2 = components.get(rootTo) || [];
                    components.delete(rootFrom);
                    components.delete(rootTo);
                    components.set(newRoot, [...comp1, ...comp2]);
                    
                    // No clearing needed - final pattern is showing
                    // Minimal delay
                }
            }
            
            // Break if no edges were added this round
            if (addedThisRound.size === 0) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Fredman-Tarjan Algorithm - Uses priority queue optimization (simulated with sorted edges)
    async fredmanTarjansAlgorithm(nodes, edges) {
        // Fredman-Tarjan uses Fibonacci heaps, we'll simulate with optimized priority queue
        // This is similar to Prim's but with better data structure usage
        this.reset();
        const mstEdges = [];
        const visited = new Set();
        const key = {};
        const parent = {};
        
        // Initialize keys
        nodes.forEach(node => {
            key[node.id] = Infinity;
            parent[node.id] = null;
        });
        
        // Start from first node
        const startNode = nodes[0];
        key[startNode.id] = 0;
        visited.add(startNode.id);
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        this.visualizer.highlightNode(startNode.id, 'start');
        audioEngine.playBarSound(50, 100, 'comparison');
        this.visualizer.drawSync();
        await this.sleep(Math.max(2, 20 * this.visualizer.speed));
        
        // Build adjacency list for efficiency
        const adjList = new Map();
        nodes.forEach(node => adjList.set(node.id, []));
        edges.forEach(edge => {
            adjList.get(edge.from).push({ to: edge.to, weight: edge.weight });
            adjList.get(edge.to).push({ to: edge.from, weight: edge.weight });
        });
        
        // Priority queue simulation (Fredman-Tarjan uses Fibonacci heap)
        const priorityQueue = [];
        
        while (visited.size < nodes.length && priorityQueue.length >= 0) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            // Find minimum key node not in MST
            let minNode = null;
            let minKey = Infinity;
            
            for (const node of nodes) {
                if (!visited.has(node.id) && key[node.id] < minKey) {
                    minKey = key[node.id];
                    minNode = node;
                }
            }
            
            if (!minNode || minKey === Infinity) break;
            
            visited.add(minNode.id);
            
            if (parent[minNode.id] !== null) {
                const edge = edges.find(e =>
                    ((e.from === parent[minNode.id] && e.to === minNode.id) ||
                     (e.to === parent[minNode.id] && e.from === minNode.id))
                );
                
                if (edge) {
                    mstEdges.push(edge);
                    totalWeight += edge.weight;
                    edgesAdded++;
                    
                    this.visualizer.setEdgesAdded(edgesAdded);
                    this.visualizer.setTotalWeight(Math.round(totalWeight));
                    
                    // Add edge to MST - shows with final glowing pattern
                    this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                    this.visualizer.nodeStates.set(edge.from, 'in-mst');
                    this.visualizer.nodeStates.set(edge.to, 'in-mst');
                    
                    // Play sound synchronized with visual update
                    audioEngine.playBarSound(edge.weight, 100, 'merge');
                    
                    // Draw and delay for visible animation
                    this.visualizer.drawSync();
                    const delay = Math.max(2, 20 * this.visualizer.speed);
                    await this.sleep(delay);
                }
            }
            
            // Update keys for neighbors
            for (const neighbor of adjList.get(minNode.id)) {
                if (!visited.has(neighbor.to) && neighbor.weight < key[neighbor.to]) {
                    key[neighbor.to] = neighbor.weight;
                    parent[neighbor.to] = minNode.id;
                }
            }
            
            this.visualizer.highlightNode(minNode.id, 'new');
            // Small delay for smooth animation
            await this.sleep(Math.max(1, 5 * this.visualizer.speed));
        }
        
        nodes.forEach(node => {
            if (visited.has(node.id)) {
                this.visualizer.highlightNode(node.id, 'in-mst');
            }
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // KKT Randomized Algorithm - Karger, Klein, and Tarjan's randomized linear-time algorithm
    async kktRandomizedAlgorithm(nodes, edges) {
        this.reset();
        
        // KKT is a complex randomized algorithm that achieves O(m + n) expected time
        // For visualization, we'll use a simplified randomized approach
        // that demonstrates the concept while maintaining correctness
        
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // Randomize edge order (KKT uses randomization for efficiency)
        const randomizedEdges = [...edges].sort(() => Math.random() - 0.5);
        
        // Sort by weight after randomization (simplified KKT approach)
        randomizedEdges.sort((a, b) => a.weight - b.weight);
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        for (const edge of randomizedEdges) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            
            this.visualizer.highlightEdge(edge.from, edge.to, 'considering');
            audioEngine.playBarSound(50, 100, 'comparison');
            
            // Small delay for visible animation
            await this.sleep(Math.max(1, 10 * this.visualizer.speed));
            
            if (rootFrom !== rootTo) {
                mstEdges.push(edge);
                totalWeight += edge.weight;
                edgesAdded++;
                
                this.visualizer.setEdgesAdded(edgesAdded);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                
                // Add edge to MST - shows with final glowing pattern
                this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                this.visualizer.nodeStates.set(edge.from, 'in-mst');
                this.visualizer.nodeStates.set(edge.to, 'in-mst');
                
                // Play sound synchronized with visual update
                audioEngine.playBarSound(edge.weight, 100, 'merge');
                
                // Draw and delay for visible animation
                this.visualizer.drawSync();
                const delay = Math.max(2, 20 * this.visualizer.speed);
                await this.sleep(delay);
                
                this.union(parent, rank, rootFrom, rootTo);
            } else {
                // Skip rejected edges - don't show
                await this.sleep(Math.max(1, 5 * this.visualizer.speed));
            }
            
            if (edgesAdded >= nodes.length - 1) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Prim-Dijkstra Algorithm (DJP) - Prim's with Dijkstra's optimization
    async primDijkstraAlgorithm(nodes, edges) {
        // Prim-Dijkstra is essentially Prim's with priority queue optimization
        return await this.primsAlgorithm(nodes, edges);
    }

    // Yao's Algorithm - Uses angular ordering for geometric graphs
    async yaosAlgorithm(nodes, edges) {
        this.reset();
        // Yao's algorithm sorts edges by angular order
        // For general graphs, we use a variation with angle-based sorting
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // Calculate angles from center and sort
        const center = { x: 0, y: 0 };
        nodes.forEach(node => {
            center.x += node.col;
            center.y += node.row;
        });
        center.x /= nodes.length;
        center.y /= nodes.length;
        
        // Sort edges by angle from center (Yao's approach)
        const edgesWithAngles = edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            const midX = (fromNode.col + toNode.col) / 2 - center.x;
            const midY = (fromNode.row + toNode.row) / 2 - center.y;
            const angle = Math.atan2(midY, midX);
            return { ...edge, angle, weight: edge.weight };
        });
        
        // Sort by angle, then by weight
        edgesWithAngles.sort((a, b) => {
            if (Math.abs(a.angle - b.angle) > 0.1) return a.angle - b.angle;
            return a.weight - b.weight;
        });
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        for (const edge of edgesWithAngles) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            
            if (rootFrom !== rootTo) {
                mstEdges.push(edge);
                totalWeight += edge.weight;
                edgesAdded++;
                
                this.visualizer.setEdgesAdded(edgesAdded);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                // Add edge to MST - shows with final glowing pattern
                this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                this.visualizer.nodeStates.set(edge.from, 'in-mst');
                this.visualizer.nodeStates.set(edge.to, 'in-mst');
                
                // Play sound synchronized with visual update
                audioEngine.playBarSound(edge.weight, 100, 'merge');
                
                // Draw and delay for visible animation
                this.visualizer.drawSync();
                const delay = Math.max(2, 20 * this.visualizer.speed);
                await this.sleep(delay);
                
                this.union(parent, rank, rootFrom, rootTo);
            }
            
            if (edgesAdded >= nodes.length - 1) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Parallel Borůvka's Algorithm - Parallelized component growth
    async parallelBoruvkasAlgorithm(nodes, edges) {
        // Parallel version processes components in parallel batches
        // For visualization, we simulate by processing multiple components at once
        return await this.boruvkasAlgorithm(nodes, edges);
    }

    // Gabow-Galil-Spencer-Tarjan Algorithm - Advanced MST with improved bounds
    async gabowGalilSpencerTarjansAlgorithm(nodes, edges) {
        this.reset();
        // GGS-T uses sophisticated data structures
        // Simplified version using their approach
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // Sort edges with GGS-T's sorting strategy
        const sortedEdges = [...edges].sort((a, b) => {
            // GGS-T uses multi-level sorting
            if (Math.abs(a.weight - b.weight) < 0.1) {
                return (a.from + a.to) - (b.from + b.to);
            }
            return a.weight - b.weight;
        });
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        for (const edge of sortedEdges) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            
            if (rootFrom !== rootTo) {
                mstEdges.push(edge);
                totalWeight += edge.weight;
                edgesAdded++;
                
                this.visualizer.setEdgesAdded(edgesAdded);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                // Add edge to MST - shows with final glowing pattern
                this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                this.visualizer.nodeStates.set(edge.from, 'in-mst');
                this.visualizer.nodeStates.set(edge.to, 'in-mst');
                
                // Play sound synchronized with visual update
                audioEngine.playBarSound(edge.weight, 100, 'merge');
                
                // Draw and delay for visible animation
                this.visualizer.drawSync();
                const delay = Math.max(2, 20 * this.visualizer.speed);
                await this.sleep(delay);
                
                this.union(parent, rank, rootFrom, rootTo);
            }
            
            if (edgesAdded >= nodes.length - 1) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Integer-Weight MST Algorithm - Optimized for integer weights
    async integerWeightMSTAlgorithm(nodes, edges) {
        this.reset();
        // Uses counting sort for integer weights
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // Integer weights - use counting sort
        const maxWeight = Math.max(...edges.map(e => Math.floor(e.weight)));
        const buckets = Array(Math.floor(maxWeight) + 1).fill(null).map(() => []);
        
        edges.forEach(edge => {
            buckets[Math.floor(edge.weight)].push(edge);
        });
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        for (const bucket of buckets) {
            for (const edge of bucket) {
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                if (edgesAdded >= nodes.length - 1) break;
                
                await this.waitForResume();
                if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
                
                const rootFrom = this.find(parent, edge.from);
                const rootTo = this.find(parent, edge.to);
                
                if (rootFrom !== rootTo) {
                    mstEdges.push(edge);
                    totalWeight += edge.weight;
                    edgesAdded++;
                    
                    this.visualizer.setEdgesAdded(edgesAdded);
                    this.visualizer.setTotalWeight(Math.round(totalWeight));
                    // Add edge to MST - shows with final glowing pattern
                    this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                    this.visualizer.nodeStates.set(edge.from, 'in-mst');
                    this.visualizer.nodeStates.set(edge.to, 'in-mst');
                    
                    // Play sound synchronized with visual update
                    audioEngine.playBarSound(edge.weight, 100, 'merge');
                    
                    // Draw and delay for visible animation
                    this.visualizer.drawSync();
                    const delay = Math.max(2, 20 * this.visualizer.speed);
                    await this.sleep(delay);
                    
                    this.union(parent, rank, rootFrom, rootTo);
                }
            }
            if (edgesAdded >= nodes.length - 1) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Planar Graph MST Algorithm - O(n) for planar graphs
    async planarGraphMSTAlgorithm(nodes, edges) {
        this.reset();
        // Planar graph MST uses graph planarity properties
        // Simplified version - treats grid as planar
        const mstEdges = [];
        const parent = {};
        const rank = {};
        
        nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });
        
        // For planar graphs, process edges in a specific order
        const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        
        let totalWeight = 0;
        let edgesAdded = 0;
        
        this.visualizer.setEdgesAdded(0);
        this.visualizer.setTotalWeight(0);
        
        for (const edge of sortedEdges) {
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            await this.waitForResume();
            if (this.shouldStop) return { mstEdges, totalWeight, edgesAdded };
            
            const rootFrom = this.find(parent, edge.from);
            const rootTo = this.find(parent, edge.to);
            
            if (rootFrom !== rootTo) {
                mstEdges.push(edge);
                totalWeight += edge.weight;
                edgesAdded++;
                
                this.visualizer.setEdgesAdded(edgesAdded);
                this.visualizer.setTotalWeight(Math.round(totalWeight));
                // Add edge to MST - shows with final glowing pattern
                this.visualizer.mstEdges.add(`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`);
                this.visualizer.nodeStates.set(edge.from, 'in-mst');
                this.visualizer.nodeStates.set(edge.to, 'in-mst');
                
                // Play sound synchronized with visual update
                audioEngine.playBarSound(edge.weight, 100, 'merge');
                
                // Draw and delay for visible animation
                this.visualizer.drawSync();
                const delay = Math.max(2, 20 * this.visualizer.speed);
                await this.sleep(delay);
                
                this.union(parent, rank, rootFrom, rootTo);
            }
            
            if (edgesAdded >= nodes.length - 1) break;
        }
        
        nodes.forEach(node => {
            this.visualizer.highlightNode(node.id, 'in-mst');
        });
        
        return { mstEdges, totalWeight, edgesAdded };
    }

    // Chazelle's Algorithm - Near-linear time deterministic
    async chazellesAlgorithm(nodes, edges) {
        this.reset();
        // Chazelle's uses soft heaps and advanced techniques
        // Simplified visualization using priority queue approach
        return await this.primsAlgorithm(nodes, edges);
    }

    // Pettie-Ramachandran Algorithm - Optimal deterministic
    async pettieRamachandransAlgorithm(nodes, edges) {
        this.reset();
        // Pettie-Ramachandran is theoretically optimal but complex
        // Simplified version for visualization
        return await this.kruskalsAlgorithm(nodes, edges);
    }

    // Tarjan's Verification Algorithm - Verifies if tree is MST
    async tarjansVerificationAlgorithm(nodes, edges) {
        this.reset();
        // This verifies an MST, but for visualization we'll build one
        // and verify it using Tarjan's techniques
        const result = await this.kruskalsAlgorithm(nodes, edges);
        
        // Verification step - check if all edges are optimal
        // This is simplified for visualization
        return result;
    }
}
