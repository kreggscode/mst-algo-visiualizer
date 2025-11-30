# MST Algorithm Visualizer

A beautiful, interactive web application for visualizing Minimum Spanning Tree (MST) algorithms with synchronized sound effects and glowing visual effects.

![MST Visualizer](https://img.shields.io/badge/MST-Visualizer-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Canvas](https://img.shields.io/badge/Canvas-API-orange)

## Features

### 🎯 Multiple MST Algorithms
- **Prim's Algorithm** - Grows MST from a starting vertex
- **Kruskal's Algorithm** - Adds edges in weight order
- **Borůvka's Algorithm** - Parallel component growth
- **Reverse-Delete Algorithm** - Removes edges in reverse order
- **Jarník's Algorithm** - Original Prim's algorithm
- **Prim-Dijkstra Algorithm** - Optimized Prim's
- **Fredman-Tarjan Algorithm** - Uses Fibonacci heap optimization
- **Cheriton-Tarjan Algorithm** - Optimized Borůvka's
- **Gabow-Galil-Spencer-Tarjan Algorithm** - Advanced MST bounds
- **Chazelle's Algorithm** - Near-linear time deterministic
- **Pettie-Ramachandran Algorithm** - Optimal deterministic
- **KKT Randomized Algorithm** - Linear time randomized
- **Tarjan's Verification Algorithm** - MST verification
- **Yao's Algorithm** - Angular ordering approach
- **Parallel Borůvka's Algorithm** - Parallelized version
- **Integer-Weight MST Algorithm** - Optimized for integer weights
- **Planar Graph MST Algorithm** - O(n) for planar graphs

### ✨ Visual Features
- **Dark Theme** - Beautiful dark background
- **Glowing Effects** - Dense glowing pattern for MST edges
- **Maze-like Grid** - Visualizes algorithms on a grid graph
- **Smooth Animations** - Real-time edge additions with visible progress
- **Customizable Colors** - Change algorithm visualization colors
- **Responsive Design** - Adapts to different screen sizes

### 🎵 Audio Features
- **Synchronized Sound Effects** - Sounds match algorithm operations
- **Musical Notes** - Harmonious tones based on edge weights
- **Completion Sound** - Triumphant chord progression when finished
- **Toggle Control** - Enable/disable sound effects

### 🎮 Controls
- **Algorithm Selection** - Choose from 17+ MST algorithms
- **Grid Size** - Adjust maze complexity (10x10 to 40x40)
- **Speed Slider** - Control animation speed
- **Start/Pause/Stop** - Full animation control
- **Color Picker** - Customize visualization colors
- **Generate** - Create new random mazes

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kreggscode/mst-algo-visiualizer.git
cd mst-algo-visiualizer
```

2. Open `index.html` in a modern web browser:
```bash
# Simply open the file in your browser
open index.html
# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Usage

1. **Select an Algorithm** - Choose from the dropdown menu
2. **Adjust Grid Size** - Set the complexity (default: 20x20)
3. **Set Speed** - Use the slider to control animation speed
4. **Pick a Color** - Customize the visualization color
5. **Generate Maze** - Click "Generate" to create a new graph
6. **Start Animation** - Click "Start Animation" to begin
7. **Control Playback** - Use Pause/Stop as needed

## File Structure

```
mst-algo-visiualizer/
├── index.html          # Main HTML structure
├── styles.css          # Dark theme styling and glow effects
├── audio-engine.js     # Web Audio API sound generation
├── graph-utils.js      # Graph generation and utilities
├── mst-algorithms.js   # All MST algorithm implementations
├── visualizer.js       # Canvas rendering and visualization
├── app.js              # Main application controller
└── README.md           # This file
```

## Technologies Used

- **HTML5** - Structure and canvas
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Core logic
- **Canvas API** - Rendering
- **Web Audio API** - Sound generation

## Algorithm Details

Each algorithm includes:
- **Step-by-step visualization** showing edge selection
- **Real-time statistics** (edges added, total weight, time)
- **Synchronized sound effects** for each operation
- **Final glowing MST pattern** visible during execution

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

**Note**: Web Audio API support is required for sound effects.

## Performance

- Optimized rendering using `requestAnimationFrame`
- Non-blocking canvas updates
- Efficient Union-Find data structures
- Batched visual updates for smooth animations

## Contributing

Contributions are welcome! Feel free to:
- Add more MST algorithms
- Improve visualizations
- Enhance sound effects
- Optimize performance
- Fix bugs

## License

This project is open source and available for educational purposes.

## Author

**kreggscode**

Created with passion for algorithm visualization and beautiful user experiences.

---

**Enjoy visualizing Minimum Spanning Trees!** 🌳✨
