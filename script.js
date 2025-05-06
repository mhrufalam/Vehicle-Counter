let startTime = null;
let stopTime = null;
let elapsed = 0;
let vehicleChart;
let timerInterval = null;
let autoSaveInterval = null;
let liveChart;
let currentRoad = "";
let counts = {
    car: 0,
    bike: 0,
    truck: 0,
    bus: 0
};

function updateLiveChart() {
    const ctx = document.getElementById('liveChart').getContext('2d');

    const data = {
        labels: ['Cars', 'Bikes', 'Trucks', 'Buses'],
        datasets: [{
            label: 'Current Counts',
            data: [
                counts.car,
                counts.bike,
                counts.truck,
                counts.bus
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    };

    if (liveChart) {
        liveChart.destroy();
    }

    liveChart = new Chart(ctx, config);
}

function resetChart() {
    // Reset live chart
    if (liveChart) {
        liveChart.destroy();
        liveChart = null;
    }
}

function updateRoad() {
    currentRoad = document.getElementById("road").value.trim() || "Not Set";
    updateTableHeader(); // Sync table header
}

function updateTableHeader() {
    const roadName = currentRoad || "Not Set";
    document.getElementById("recap-header").textContent = `Recap Road - ${roadName}`;
}

function startTimer() {
    if (!timerInterval) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            elapsed = Date.now() - startTime;
            document.getElementById("elapsed-time").textContent = formatTime(elapsed);
        }, 1000);

        // Start auto-saving every 10 seconds
        if (!autoSaveInterval) {
            autoSaveInterval = setInterval(() => {
                autoSaveEntry();
            }, 10000); // 10 seconds
        }
    }
}

function autoSaveEntry() {
    const now = Date.now();
    const duration = now - startTime;

    const formatTimestamp = (ts) => {
        const date = new Date(ts);
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString('en-US', options)
                    .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, '$3-$1-$2 $4');
    };

    const startStr = formatTimestamp(startTime);
    const endStr = formatTimestamp(now);
    const durationStr = formatTime(duration);

    // Insert into table
    const table = document.getElementById("recap-table").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    newRow.insertCell(0).innerHTML = `<strong>Start:</strong> ${startStr}<br><strong>End:</strong> ${endStr}`;
    newRow.insertCell(1).textContent = durationStr;
    newRow.insertCell(2).textContent = counts.car;
    newRow.insertCell(3).textContent = counts.bike;
    newRow.insertCell(4).textContent = counts.truck;
    newRow.insertCell(5).textContent = counts.bus;

    // Optional: Reset counter after each log
    // for (let key in counts) {
    //     counts[key] = 0;
    //     updateDisplay(key);
    // }

    // Update startTime for next interval
    startTime = now;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Format milliseconds into HH:MM:SS
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    let minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    let seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Real-time timestamp update
function updateTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    const formatted = now.toLocaleDateString('en-US', options)
                        .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, '$3-$1-$2 $4');
    document.getElementById("current-timestamp").textContent = formatted;
}

// Update timestamp every second
setInterval(updateTimestamp, 1000);
updateTimestamp(); // Initial call

function maybeStartTimer() {
    if (!timerInterval) {
        startTimer(); // Use existing startTimer function
    }
}

function increment(vehicle) {
    maybeStartTimer(); // Start timer if not already started
    counts[vehicle]++;
    updateDisplay(vehicle);
    updateLiveChart(); // Update chart after change
}

function decrement(vehicle) {
    maybeStartTimer(); // Start timer if not already started
    if (counts[vehicle] > 0) {
        counts[vehicle]--;
        updateDisplay(vehicle);
        updateLiveChart(); // Update chart after change
    }
}

function updateDisplay(vehicle) {
    document.getElementById(vehicle).textContent = counts[vehicle];
}

function saveCount() {
    stopTimer(); // Stops both timer and autosave

    // Save final manual entry
    autoSaveEntry();

    // Reset counters
    for (let key in counts) {
        counts[key] = 0;
        updateDisplay(key);
    }

    // Reset timer
    elapsed = 0;
    startTime = null;
    document.getElementById("elapsed-time").textContent = "00:00:00";
}

function resetTable() {
    if (confirm("Are you sure you want to clear the entire table?")) {
        const tableBody = document.querySelector("#recap-table tbody");
        tableBody.innerHTML = ""; // Clear all rows
    }
}

function resetCounters() {
    if (confirm("Are you sure you want to reset all counters?")) {
        for (let key in counts) {
            counts[key] = 0;
            updateDisplay(key);
        }

        stopTimer();
        elapsed = 0;
        startTime = null;
        document.getElementById("elapsed-time").textContent = "00:00:00";
    }
}