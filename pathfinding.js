class PathfindingGrid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.startPos = { row: 5, col: 5 };
        this.endPos = { row: 15, col: 15 };
        this.walls = new Set();
        this.isDragging = false;
        this.dragType = null;

        this.initGrid();
        this.renderGrid();
        this.findPath();
    }

    initGrid() {
        const container = document.getElementById('grid-container');
        const gridElement = document.createElement('div');
        gridElement.className = 'grid';
        gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        gridElement.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;

        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;

                tile.addEventListener('mousedown', (e) => this.handleMouseDown(e, row, col));
                tile.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, row, col));
                tile.addEventListener('mouseup', () => this.handleMouseUp());

                gridElement.appendChild(tile);
                this.grid[row][col] = tile;
            }
        }

        container.appendChild(gridElement);

        document.addEventListener('mouseup', () => this.handleMouseUp());

        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => this.clearWalls());
    }

    handleMouseDown(e, row, col) {
        e.preventDefault();

        if (this.isStart(row, col)) {
            this.isDragging = true;
            this.dragType = 'start';
        } else if (this.isEnd(row, col)) {
            this.isDragging = true;
            this.dragType = 'end';
        } else {
            this.toggleWall(row, col);
        }
    }

    handleMouseEnter(e, row, col) {
        if (this.isDragging && this.dragType) {
            if (this.dragType === 'start' && !this.isEnd(row, col)) {
                this.startPos = { row, col };
                this.findPath();
            } else if (this.dragType === 'end' && !this.isStart(row, col)) {
                this.endPos = { row, col };
                this.findPath();
            }
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.dragType = null;
    }

    toggleWall(row, col) {
        if (this.isStart(row, col) || this.isEnd(row, col)) {
            return;
        }

        const key = `${row},${col}`;
        if (this.walls.has(key)) {
            this.walls.delete(key);
        } else {
            this.walls.add(key);
        }

        this.findPath();
    }

    clearWalls() {
        this.walls.clear();
        this.findPath();
    }

    isStart(row, col) {
        return this.startPos.row === row && this.startPos.col === col;
    }

    isEnd(row, col) {
        return this.endPos.row === row && this.endPos.col === col;
    }

    isWall(row, col) {
        return this.walls.has(`${row},${col}`);
    }

    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]  // up, down, left, right
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < this.rows &&
                newCol >= 0 && newCol < this.cols &&
                !this.isWall(newRow, newCol)) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    }

    heuristic(pos1, pos2) {
        // Manhattan distance
        return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    }

    findPath() {
        const start = this.startPos;
        const end = this.endPos;

        const openSet = [start];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const key = (pos) => `${pos.row},${pos.col}`;

        gScore.set(key(start), 0);
        fScore.set(key(start), this.heuristic(start, end));

        const visited = new Set();

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIdx = 0;

            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(key(openSet[i])) < fScore.get(key(current))) {
                    current = openSet[i];
                    currentIdx = i;
                }
            }

            if (current.row === end.row && current.col === end.col) {
                // Reconstruct path
                const path = [];
                let temp = current;
                while (cameFrom.has(key(temp))) {
                    path.unshift(temp);
                    temp = cameFrom.get(key(temp));
                }
                this.renderGrid(path, visited);
                return path;
            }

            openSet.splice(currentIdx, 1);
            visited.add(key(current));

            const neighbors = this.getNeighbors(current.row, current.col);

            for (const neighbor of neighbors) {
                const neighborKey = key(neighbor);
                const tentativeGScore = gScore.get(key(current)) + 1;

                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));

                    if (!openSet.some(pos => key(pos) === neighborKey)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // No path found
        this.renderGrid([], visited);
        return null;
    }

    renderGrid(path = [], visited = new Set()) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.grid[row][col];
                tile.className = 'tile';

                if (this.isStart(row, col)) {
                    tile.classList.add('start');
                } else if (this.isEnd(row, col)) {
                    tile.classList.add('end');
                } else if (this.isWall(row, col)) {
                    tile.classList.add('wall');
                } else if (path.some(p => p.row === row && p.col === col)) {
                    tile.classList.add('path');
                } else if (visited.has(`${row},${col}`)) {
                    tile.classList.add('visited');
                }
            }
        }
    }
}

// Initialize the grid when the page loads
document.addEventListener('DOMContentLoaded', () => {
20});
