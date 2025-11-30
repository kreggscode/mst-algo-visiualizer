// Graph Utilities for MST Visualization
class GraphUtils {
    // Generate a grid graph (maze-like structure)
    static generateGridGraph(size) {
        const nodes = [];
        const edges = [];
        
        // Create nodes in a grid
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const id = row * size + col;
                nodes.push({
                    id: id,
                    row: row,
                    col: col,
                    x: col,
                    y: row
                });
            }
        }
        
        // Create edges (connect adjacent nodes with some randomness)
        // This creates a more maze-like structure
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const nodeId = row * size + col;
                
                // Right neighbor - 85% chance of connection
                if (col < size - 1 && Math.random() > 0.15) {
                    const rightId = row * size + (col + 1);
                    edges.push({
                        from: nodeId,
                        to: rightId,
                        weight: Math.random() * 100 + 1 // Random weight 1-100
                    });
                }
                
                // Bottom neighbor - 85% chance of connection
                if (row < size - 1 && Math.random() > 0.15) {
                    const bottomId = (row + 1) * size + col;
                    edges.push({
                        from: nodeId,
                        to: bottomId,
                        weight: Math.random() * 100 + 1 // Random weight 1-100
                    });
                }
            }
        }
        
        // Ensure connectivity by adding critical paths
        // Add horizontal connections in first row
        for (let col = 0; col < size - 1; col++) {
            const nodeId = col;
            const rightId = col + 1;
            // Check if edge already exists
            const exists = edges.some(e => 
                (e.from === nodeId && e.to === rightId) ||
                (e.from === rightId && e.to === nodeId)
            );
            if (!exists) {
                edges.push({
                    from: nodeId,
                    to: rightId,
                    weight: Math.random() * 100 + 1
                });
            }
        }
        
        // Add vertical connections in first column
        for (let row = 0; row < size - 1; row++) {
            const nodeId = row * size;
            const bottomId = (row + 1) * size;
            const exists = edges.some(e => 
                (e.from === nodeId && e.to === bottomId) ||
                (e.from === bottomId && e.to === nodeId)
            );
            if (!exists) {
                edges.push({
                    from: nodeId,
                    to: bottomId,
                    weight: Math.random() * 100 + 1
                });
            }
        }
        
        // Shuffle edges for more interesting visualization
        edges.sort(() => Math.random() - 0.5);
        
        return { nodes, edges };
    }
    
    // Generate a more maze-like structure with some randomness
    static generateMazeGraph(size) {
        const nodes = [];
        const allEdges = [];
        
        // Create nodes
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const id = row * size + col;
                nodes.push({
                    id: id,
                    row: row,
                    col: col,
                    x: col,
                    y: row
                });
            }
        }
        
        // Create potential edges with random weights
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const nodeId = row * size + col;
                
                // Right neighbor
                if (col < size - 1) {
                    const rightId = row * size + (col + 1);
                    // Higher probability of connection
                    if (Math.random() > 0.15) {
                        allEdges.push({
                            from: nodeId,
                            to: rightId,
                            weight: Math.random() * 100 + 1
                        });
                    }
                }
                
                // Bottom neighbor
                if (row < size - 1) {
                    const bottomId = (row + 1) * size + col;
                    // Higher probability of connection
                    if (Math.random() > 0.15) {
                        allEdges.push({
                            from: nodeId,
                            to: bottomId,
                            weight: Math.random() * 100 + 1
                        });
                    }
                }
            }
        }
        
        // Ensure graph is connected by adding critical edges
        for (let i = 0; i < size - 1; i++) {
            // Ensure at least one path across
            const criticalRight = {
                from: i * size + Math.floor(Math.random() * size),
                to: i * size + Math.floor(Math.random() * size),
                weight: Math.random() * 50 + 1
            };
            if (criticalRight.from < criticalRight.to && criticalRight.to - criticalRight.from === 1) {
                allEdges.push(criticalRight);
            }
        }
        
        return { nodes, edges: allEdges };
    }
    
    // Find node by ID
    static findNode(nodes, id) {
        return nodes.find(n => n.id === id);
    }
    
    // Get neighbors of a node
    static getNeighbors(nodeId, edges) {
        const neighbors = [];
        edges.forEach(edge => {
            if (edge.from === nodeId) {
                neighbors.push(edge.to);
            } else if (edge.to === nodeId) {
                neighbors.push(edge.from);
            }
        });
        return neighbors;
    }
    
    // Check if two nodes are connected
    static areConnected(node1, node2, mstEdges) {
        return mstEdges.some(e => 
            (e.from === node1 && e.to === node2) ||
            (e.from === node2 && e.to === node1)
        );
    }
}
