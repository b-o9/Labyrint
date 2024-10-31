function loadJson() {
    fetch('maze.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();  // Parse JSON data
        })
        .then(data => {
            renderLabyrinth(data);  // Pass JSON data to render function
            localStorage.setItem('labyrinth', JSON.stringify(data)); // Store labyrinth data in localStorage
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


function renderLabyrinth(labyrinth) {
    const mazeContainer = document.getElementById('mazeContainer');
    mazeContainer.innerHTML = '';  // Clear previous maze if any

    // Set up the grid template based on the maze's row and column counts
    mazeContainer.style.gridTemplateRows = `repeat(${labyrinth.rows}, 1fr)`;
    mazeContainer.style.gridTemplateColumns = `repeat(${labyrinth.cols}, 0fr)`;  // Use 1fr for equal sizing

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

async function solveMaze() {
    const mazeContainer = document.getElementById('mazeContainer');
    const cells = mazeContainer.getElementsByClassName('cell');

    // Reset all cell colors
    for (let cell of cells) {
        cell.style.backgroundColor = ''; 
    }

    const labyrinth = JSON.parse(localStorage.getItem('labyrinth'));  
    if (!labyrinth) {
        console.error('Labyrinth is not loaded. Please load the maze first.');
        return; 
    }

    let currentPos = [0, 0]; // Start at the top-left corner
    let allPossible = {}; // Store all possible moves from each position
    let exploredMap = new Map(); // To track explored positions
    let pathStack = []; // Stack for backtracking
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Initial scanning for possible moves from the starting position
    allPossible[currentPos.join(',')] = getPossibleMoves(labyrinth, currentPos[0], currentPos[1]);

    while (true) {
        // Mark the current position as explored
        exploredMap.set(currentPos.join(','), true);

        // Get the possible moves from the current position
        const options = allPossible[currentPos.join(',')] || [];

        // Filter out already explored options
        const endOptions = options.filter(pos => {
            const posKey = pos.join(',');
            return !exploredMap.has(posKey); // Check if the position has been explored
        });

        // If there are no further moves, check if we can backtrack
        if (endOptions.length === 0) {
            if (pathStack.length === 0) {
                console.log('No further moves possible and no path to backtrack, exiting.');
                break; // Exit if no moves and nowhere to backtrack
            }

            // Backtrack to the last position
            currentPos = pathStack.pop();
            console.log(`Backtracking to position: ${currentPos}`);
            continue; // Continue to the next iteration with the backtracked position
        }

        // Store the current position in the path stack
        pathStack.push(currentPos);

        // Find the highest position from allPossible
        let highestPosition = null;
        for (const [key, value] of Object.entries(allPossible)) {
            // Filter out explored positions
            const unexploredPositions = value.filter(pos => !exploredMap.has(pos.join(',')));
            if (unexploredPositions.length > 0) {
                // Sort available positions by row number (Y-coordinate), highest first
                unexploredPositions.sort((a, b) => b[0] - a[0]); // Sort by row (Y coordinate) descending

                // Select the highest position from the sorted list
                const candidate = unexploredPositions[0];
                if (!highestPosition || candidate[0] > highestPosition[0]) {
                    highestPosition = candidate;
                }
            }
        }

        // If no highest position is found, exit
        if (!highestPosition) {
            console.log('No further unexplored moves available, exiting.');
            break;
        }

        // Move to the highest position found
        currentPos = highestPosition;

        // Visualize the current position by coloring the cell
        const currentCell = cells[currentPos[0] * labyrinth.cols + currentPos[1]];
        currentCell.style.backgroundColor = 'lightblue';


        console.log(currentPos,labyrinth.goal)
        if (currentPos[0] == labyrinth.goal.row && currentPos[1] == labyrinth.goal.col){
            break;
        }

        // Scan for new options at the end of the loop
        const newOptions = getPossibleMoves(labyrinth, currentPos[0], currentPos[1]);
        console.log('New options after moving:', newOptions);

        // Add new possible moves to allPossible
        allPossible[currentPos.join(',')] = newOptions;

        await delay(500); // Wait for 0.5 seconds before the next iteration
    }
}



function getPossibleMoves(labyrinth, row, col) {
    const possibleMoves = [];

    // North: Move up if there is no north wall
    if (row > 0 && !labyrinth.maze[row][col].north) {
        possibleMoves.push([row - 1, col]);  // Move up (North)
    }

    // East: Move right if there is no east wall
    if (col < labyrinth.cols - 1 && !labyrinth.maze[row][col].east) {
        possibleMoves.push([row, col + 1]);  // Move right (East)
    }

    // South: Move down if there is no south wall
    if (row < labyrinth.rows - 1 && !labyrinth.maze[row][col].south) {
        possibleMoves.push([row + 1, col]);  // Move down (South)
    }

    // West: Move left if there is no west wall
    if (col > 0 && !labyrinth.maze[row][col].west) {
        possibleMoves.push([row, col - 1]);  // Move left (West)
    }

    return possibleMoves;
}
