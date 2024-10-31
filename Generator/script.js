function generateLabyrinth() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);

    // Initialize maze with each cell containing all walls
    const maze = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                row: r,
                col: c,
                north: true,  // All walls start intact
                east: true,
                west: true,
                south: true
            });
        }
        maze.push(row);
    }

    // Create sets for each cell
    const sets = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            sets.push([{ row: r, col: c }]); // Each cell starts as its own set
        }
    }

    // Get a list of all possible walls
    const walls = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r < rows - 1) walls.push({ cell1: { row: r, col: c }, cell2: { row: r + 1, col: c }, direction: 'south' });
            if (c < cols - 1) walls.push({ cell1: { row: r, col: c }, cell2: { row: r, col: c + 1 }, direction: 'east' });
        }
    }

    // Shuffle the walls array to pick random walls
    walls.sort(() => Math.random() - 0.5);

    // Helper functions
    function findSet(cell) {
        return sets.find(set => set.some(c => c.row === cell.row && c.col === cell.col));
    }

    function unionSets(set1, set2) {
        set1.push(...set2);
        sets.splice(sets.indexOf(set2), 1);
    }

    // Apply Kruskal’s Algorithm to remove walls
    for (const wall of walls) {
        const set1 = findSet(wall.cell1);
        const set2 = findSet(wall.cell2);

        if (set1 !== set2) {
            // Remove the wall between the two cells
            if (wall.direction === 'south') {
                maze[wall.cell1.row][wall.cell1.col].south = false;
                maze[wall.cell2.row][wall.cell2.col].north = false;
            } else if (wall.direction === 'east') {
                maze[wall.cell1.row][wall.cell1.col].east = false;
                maze[wall.cell2.row][wall.cell2.col].west = false;
            }
            // Merge the two sets
            unionSets(set1, set2);
        }
    }

    // Define start and goal positions
    const labyrinth = {
        rows: rows,
        cols: cols,
        start: { row: 0, col: 0 },
        goal: { row: rows - 1, col: cols - 1 },
        maze: maze
    };

    document.getElementById('mazeOutput').textContent = JSON.stringify(labyrinth, null, 2);
    renderLabyrinth(labyrinth);
}



function renderLabyrinth(labyrinth) {
    const mazeContainer = document.getElementById('mazeContainer');
    mazeContainer.innerHTML = '';  // Clear previous maze if any

    // Set up the grid template based on the maze's row and column counts
    mazeContainer.style.gridTemplateRows = `repeat(${labyrinth.rows}, 1fr)`;
    mazeContainer.style.gridTemplateColumns = `repeat(${labyrinth.cols}, 0fr)`;

    // Loop through each cell in the maze and create a visual representation
    labyrinth.maze.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            // Add borders for walls (true = wall exists, so show border)
            cellDiv.style.borderTop = cell.north ? '2px solid black' : 'none';
            cellDiv.style.borderRight = cell.east ? '2px solid black' : 'none';
            cellDiv.style.borderLeft = cell.west ? '2px solid black' : 'none';
            cellDiv.style.borderBottom = cell.south ? '2px solid black' : 'none';

            // Start and goal cell styling
            if (cell.row === labyrinth.start.row && cell.col === labyrinth.start.col) {
                cellDiv.classList.add('start');
            } else if (cell.row === labyrinth.goal.row && cell.col === labyrinth.goal.col) {
                cellDiv.classList.add('goal');
            }

            // Add cell to maze container
            mazeContainer.appendChild(cellDiv);
        });
    });
}
