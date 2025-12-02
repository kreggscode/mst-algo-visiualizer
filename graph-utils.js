// Graph Utilities for MST Visualization
class GraphUtils {
    // Main function to generate graph based on shape
    static generateGraph(shape, size) {
        let result;
        switch(shape) {
            case 'heart': result = this.generateHeartGraph(size); break;
            case 'diamond': result = this.generateDiamondGraph(size); break;
            case 'triangle': result = this.generateTriangleGraph(size); break;
            case 'hexagon': result = this.generateHexagonGraph(size); break;
            case 'star': result = this.generateStarGraph(size); break;
            case 'circle': result = this.generateCircleGraph(size); break;
            case 'pentagon': result = this.generatePentagonGraph(size); break;
            default: result = this.generateGridGraph(size);
        }
        // Store shape info in result
        result.shape = shape;
        return result;
    }

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

    // Helper function to check if a point is within shape boundaries
    static isPointInShape(row, col, shape, size) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        switch(shape) {
            case 'heart': {
                const scale = size / 3.2;
                const x = (col - centerX) / scale;
                const y = -(row - centerY) / scale;
                const x2 = x * x;
                const y2 = y * y;
                const heartValue = Math.pow(x2 + y2 - 1, 3) - x2 * Math.pow(y, 3);
                return heartValue <= 0.1;
            }
            case 'diamond': {
                const maxRadius = size * 0.45;
                return Math.abs(row - centerY) + Math.abs(col - centerX) <= maxRadius;
            }
            case 'triangle': {
                const topY = size * 0.1;
                const bottomY = size * 0.9;
                if (row < topY || row > bottomY) return false;
                const progress = (row - topY) / (bottomY - topY);
                const maxWidth = size * 0.9;
                const triangleWidth = maxWidth * progress;
                const startCol = centerX - triangleWidth / 2;
                const endCol = centerX + triangleWidth / 2;
                return col >= startCol && col <= endCol;
            }
            case 'hexagon': {
                const radius = size * 0.42;
                const numSides = 6;
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > radius) return false;
                const angle = Math.atan2(dy, dx);
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                const sector = Math.floor(normalizedAngle / (Math.PI / 3));
                const sectorAngle = (sector * Math.PI / 3) - Math.PI / 6;
                const angleInSector = normalizedAngle - sectorAngle;
                const apothem = radius * Math.cos(Math.PI / numSides);
                const edgeDist = apothem / Math.cos(angleInSector - Math.PI / 6);
                return dist <= edgeDist;
            }
            case 'star': {
                const outerRadius = size * 0.40;
                const innerRadius = size * 0.20;
                const numPoints = 5;
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > outerRadius) return false;
                const angle = Math.atan2(dy, dx) + Math.PI / 2;
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                const pointIndex = Math.floor(normalizedAngle / (Math.PI / numPoints));
                const isOuterPoint = pointIndex % 2 === 0;
                const targetRadius = isOuterPoint ? outerRadius : innerRadius;
                const pointAngle = normalizedAngle % (Math.PI / numPoints);
                const halfPointAngle = Math.PI / (numPoints * 2);
                const edgeDist = targetRadius * Math.cos(halfPointAngle) / Math.cos(pointAngle - halfPointAngle);
                return dist <= edgeDist;
            }
            case 'circle': {
                const radius = size * 0.42;
                const dx = col - centerX;
                const dy = row - centerY;
                return Math.sqrt(dx * dx + dy * dy) <= radius;
            }
            case 'pentagon': {
                const radius = size * 0.42;
                const numSides = 5;
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > radius) return false;
                const angle = Math.atan2(dy, dx) + Math.PI / 2;
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                const sector = Math.floor(normalizedAngle / (2 * Math.PI / numSides));
                const sectorAngle = (sector * 2 * Math.PI / numSides) - Math.PI / numSides;
                const angleInSector = normalizedAngle - sectorAngle;
                const apothem = radius * Math.cos(Math.PI / numSides);
                const edgeDist = apothem / Math.cos(angleInSector - Math.PI / numSides);
                return dist <= edgeDist;
            }
            default: return true; // Grid - all points valid
        }
    }

    // Helper function to check if edge is on shape boundary
    static isEdgeOnBoundary(fromNode, toNode, shape, size) {
        if (shape === 'grid') return false;
        
        // Check if either node is on the boundary
        const fromInShape = this.isPointInShape(fromNode.row, fromNode.col, shape, size);
        const toInShape = this.isPointInShape(toNode.row, toNode.col, shape, size);
        
        if (!fromInShape || !toInShape) return false;
        
        // Check neighbors - if any neighbor is outside shape, this edge is on boundary
        const neighbors = [
            { row: fromNode.row, col: fromNode.col + 1 },
            { row: fromNode.row, col: fromNode.col - 1 },
            { row: fromNode.row + 1, col: fromNode.col },
            { row: fromNode.row - 1, col: fromNode.col },
            { row: toNode.row, col: toNode.col + 1 },
            { row: toNode.row, col: toNode.col - 1 },
            { row: toNode.row + 1, col: toNode.col },
            { row: toNode.row - 1, col: toNode.col }
        ];
        
        for (const neighbor of neighbors) {
            if (!this.isPointInShape(neighbor.row, neighbor.col, shape, size)) {
                return true; // Edge is on boundary
            }
        }
        
        return false;
    }

    // Helper function to create edges between nearby nodes (only within shape)
    static createEdgesForNodes(nodes, size, shape = 'grid', connectionChance = 0.85) {
        const edges = [];
        const nodeMap = new Map();
        nodes.forEach(node => {
            nodeMap.set(`${node.row}-${node.col}`, node);
        });

        nodes.forEach(node => {
            // Only check immediate neighbors (up, down, left, right)
            const neighbors = [
                { row: node.row, col: node.col + 1 },
                { row: node.row, col: node.col - 1 },
                { row: node.row + 1, col: node.col },
                { row: node.row - 1, col: node.col }
            ];

            neighbors.forEach(neighbor => {
                const neighborKey = `${neighbor.row}-${neighbor.col}`;
                const neighborNode = nodeMap.get(neighborKey);
                
                // Only create edge if both nodes are in the shape
                if (neighborNode && 
                    this.isPointInShape(neighbor.row, neighbor.col, shape, size) &&
                    Math.random() > (1 - connectionChance)) {
                    
                    const edgeKey1 = `${node.id}-${neighborNode.id}`;
                    const edgeKey2 = `${neighborNode.id}-${node.id}`;
                    if (!edges.some(e => (e.from === node.id && e.to === neighborNode.id) || 
                                         (e.from === neighborNode.id && e.to === node.id))) {
                        const isBoundary = this.isEdgeOnBoundary(node, neighborNode, shape, size);
                        edges.push({
                            from: node.id,
                            to: neighborNode.id,
                            weight: Math.random() * 100 + 1,
                            isBoundary: isBoundary
                        });
                    }
                }
            });
        });

        // Ensure connectivity - only connect nodes that are close and in shape
        for (let i = 0; i < nodes.length - 1; i++) {
            const node1 = nodes[i];
            const node2 = nodes[i + 1];
            const dist = Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col);
            
            // Only connect if nodes are adjacent (distance <= 1)
            if (dist <= 1) {
                const exists = edges.some(e => 
                    (e.from === node1.id && e.to === node2.id) ||
                    (e.from === node2.id && e.to === node1.id)
                );
                if (!exists && 
                    this.isPointInShape(node1.row, node1.col, shape, size) &&
                    this.isPointInShape(node2.row, node2.col, shape, size)) {
                    const isBoundary = this.isEdgeOnBoundary(node1, node2, shape, size);
                    edges.push({
                        from: node1.id,
                        to: node2.id,
                        weight: Math.random() * 100 + 1,
                        isBoundary: isBoundary
                    });
                }
            }
        }

        edges.sort(() => Math.random() - 0.5);
        return edges;
    }

    // Generate Heart shape graph
    static generateHeartGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const scale = size / 3.2; // Smaller scale to prevent cropping

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = (col - centerX) / scale;
                const y = -(row - centerY) / scale; // Flip Y for screen coordinates
                
                // Improved heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
                const x2 = x * x;
                const y2 = y * y;
                const y3 = y * y2;
                const heartValue = Math.pow(x2 + y2 - 1, 3) - x2 * y3;
                
                // More precise threshold for better shape
                if (heartValue <= 0.1) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'heart');
        return { nodes, edges };
    }

    // Generate Diamond shape graph
    static generateDiamondGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const maxRadius = size * 0.45; // Smaller to prevent cropping

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                // Manhattan distance for perfect diamond
                const distFromCenter = Math.abs(row - centerY) + Math.abs(col - centerX);
                if (distFromCenter <= maxRadius) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'diamond');
        return { nodes, edges };
    }

    // Generate Triangle shape graph
    static generateTriangleGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const topY = size * 0.1; // Start a bit from top
        const bottomY = size * 0.9; // End a bit from bottom
        const triangleHeight = bottomY - topY;

        for (let row = 0; row < size; row++) {
            if (row < topY || row > bottomY) continue;
            
            // Calculate width at this row (triangle widens from top to bottom)
            const progress = (row - topY) / triangleHeight; // 0 at top, 1 at bottom
            const maxWidth = size * 0.9; // 90% of size to prevent cropping
            const triangleWidth = maxWidth * progress;
            const startCol = centerX - triangleWidth / 2;
            const endCol = centerX + triangleWidth / 2;

            for (let col = 0; col < size; col++) {
                if (col >= startCol && col <= endCol) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'triangle');
        return { nodes, edges };
    }

    // Generate Hexagon shape graph
    static generateHexagonGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.42; // Smaller to prevent cropping
        const numSides = 6;
        const apothem = radius * Math.cos(Math.PI / numSides); // Distance from center to edge

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > radius) continue;
                
                const angle = Math.atan2(dy, dx);
                // Normalize angle to [0, 2π)
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                
                // Find which sector (0-5)
                const sector = Math.floor(normalizedAngle / (Math.PI / 3));
                const sectorAngle = (sector * Math.PI / 3) - Math.PI / 6;
                const angleInSector = normalizedAngle - sectorAngle;
                
                // Distance to edge at this angle
                const edgeDist = apothem / Math.cos(angleInSector - Math.PI / 6);
                
                if (dist <= edgeDist) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'hexagon');
        return { nodes, edges };
    }

    // Generate Star shape graph
    static generateStarGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = size * 0.40; // Smaller to prevent cropping
        const innerRadius = size * 0.20;
        const numPoints = 5;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > outerRadius) continue;
                
                const angle = Math.atan2(dy, dx) + Math.PI / 2; // Rotate to start at top
                // Normalize to [0, 2π)
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                
                // Find which point we're in (0-9, alternating outer/inner)
                const pointIndex = Math.floor(normalizedAngle / (Math.PI / numPoints));
                const isOuterPoint = pointIndex % 2 === 0;
                const targetRadius = isOuterPoint ? outerRadius : innerRadius;
                
                // Angle within current point
                const pointAngle = normalizedAngle % (Math.PI / numPoints);
                const halfPointAngle = Math.PI / (numPoints * 2);
                
                // Calculate distance to edge at this angle
                const edgeDist = targetRadius * Math.cos(halfPointAngle) / Math.cos(pointAngle - halfPointAngle);
                
                if (dist <= edgeDist) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'star');
        return { nodes, edges };
    }

    // Generate Circle shape graph
    static generateCircleGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.42; // Smaller to prevent cropping

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Perfect circle check
                if (dist <= radius) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'circle');
        return { nodes, edges };
    }

    // Generate Pentagon shape graph
    static generatePentagonGraph(size) {
        const nodes = [];
        let id = 0;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.42; // Smaller to prevent cropping
        const numSides = 5;
        const apothem = radius * Math.cos(Math.PI / numSides); // Distance from center to edge

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const dx = col - centerX;
                const dy = row - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > radius) continue;
                
                const angle = Math.atan2(dy, dx) + Math.PI / 2; // Rotate to start at top
                // Normalize angle to [0, 2π)
                const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
                
                // Find which sector (0-4)
                const sector = Math.floor(normalizedAngle / (2 * Math.PI / numSides));
                const sectorAngle = (sector * 2 * Math.PI / numSides) - Math.PI / numSides;
                const angleInSector = normalizedAngle - sectorAngle;
                
                // Distance to edge at this angle
                const edgeDist = apothem / Math.cos(angleInSector - Math.PI / numSides);
                
                if (dist <= edgeDist) {
                    nodes.push({
                        id: id++,
                        row: row,
                        col: col,
                        x: col,
                        y: row
                    });
                }
            }
        }

        const edges = this.createEdgesForNodes(nodes, size, 'pentagon');
        return { nodes, edges };
    }
}
