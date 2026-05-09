
document.addEventListener("DOMContentLoaded", () => {

    const savedTheme = localStorage.getItem("theme");
    if(savedTheme === "dark"){
        document.documentElement.classList.add("dark");
    }

    function getCSSVar(name){
        return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    }
    let habitChartInstance = null;
    let moodChartInstance = null;

    function refreshCharts(){
        renderHabitChart();
        renderMoodChart();
    }
    const today = new Date().toDateString();
    let trackerData = JSON.parse(localStorage.getItem("trackerData")) || {};
    const now = new Date();
    let activeMonth = now.getMonth();     
    const currentYear = now.getFullYear(); 

    const monthSelect = document.querySelector("#month-select");
    if(monthSelect){
        monthSelect.value = activeMonth;
    }

    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabs = document.querySelectorAll(".tab");

    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");

    const toggle = document.getElementById("theme-toggle");
    if(toggle){
        toggle.addEventListener("click" , ()=>{
            document.documentElement.classList.toggle("dark");

            if(document.documentElement.classList.contains("dark")){
                localStorage.setItem("theme" , "dark");
            }else{
                localStorage.setItem("theme" , "light");
            }
            refreshCharts();
        });
    }

    if(!trackerData[today]){
        trackerData[today] = {
            habits: [
                { name: "Drink Water", done: false },
                { name: "Read 10 pages", done: false },
                { name: "Workout", done: false },
                { name: "No junk food", done: false },
                { name: "Meditate", done: false }
            ],
            tasks: [],
            mood: null,
            water: 0,
            journal: "",
            gratitude: ""
        };
    }

    function saveData(){
        localStorage.setItem("trackerData", JSON.stringify(trackerData));
    }

    const habitList = document.querySelector("#habit-list");
    const moodHeading = document.querySelector("#mood-heading");
    const moodButtons = document.querySelectorAll(".mood-btn");
    const glasses = document.querySelectorAll(".glass");
    const journalInput = document.querySelector("#journal-input");
    const summaryText = document.querySelector("#summary-text");
    const gratitudeInput = document.getElementById("gratitude-input");
    const saveGratitudeBtn = document.getElementById("save-gratitude");
    const datepicker = document.getElementById("journal-date-picker");

    const quotes = {
        happy: "Keep shining, you're doing amazing",
        good: "You're on the right track",
        neutral: "Stay steady, better days ahead",
        sad: "It's okay to feel this way",
        angry: "Take a breath, you got this"
    };

    let habits = trackerData[today].habits || [];

    if(saveGratitudeBtn){
        saveGratitudeBtn.addEventListener("click" , ()=>{
            const value = gratitudeInput.value.trim();
            trackerData[today].gratitude = value;
            saveData();
        });
    }

    function renderHabits(){
        habitList.innerHTML = "";

        habits.forEach((habit, index)=>{
            const div = document.createElement("div");
            div.classList.add("habit-item");

            div.innerHTML = `
                <input type="checkbox" data-index="${index}" ${habit.done ? "checked" : ""}>
                <span class="${habit.done ? "completed" : ""}">${habit.name}</span>
            `;

            habitList.appendChild(div);
        });
    }

    habitList.addEventListener("change", (e)=>{
        const checkbox = e.target;
        const index = checkbox.dataset.index;

        habits[index].done = checkbox.checked;

        trackerData[today].habits = habits;
        saveData();
        updateSummary();
        renderHabits();
    });

    moodButtons.forEach(button=>{
        button.addEventListener("click", ()=>{

            const selectedMood = button.dataset.mood;

            if(button.classList.contains("active")){
                button.classList.remove("active");
                moodHeading.textContent = "How are you feeling today?";

                trackerData[today].mood = null;
                saveData();
                updateSummary();
                return;
            }

            moodButtons.forEach(btn=>btn.classList.remove("active"));
            button.classList.add("active");

            moodHeading.textContent = `${button.textContent} ${quotes[selectedMood]}`;

            trackerData[today].mood = selectedMood;
            saveData();
            updateSummary();
        });
    });

    function loadMood(){
        const mood = trackerData[today].mood;

        if(mood){
            moodHeading.textContent = `${getEmoji(mood)} ${quotes[mood]}`;

            moodButtons.forEach(btn=>{
                if(btn.dataset.mood === mood){
                    btn.classList.add("active");
                }
            });
        } else {
            moodHeading.textContent = "How are you feeling today?";
        }
    }

    function loadGratitude(){
        if(gratitudeInput && trackerData[today]){
            gratitudeInput.value = trackerData[today].gratitude || "";
        }
    }

    if(gratitudeInput) loadGratitude();

    function renderJournalByDate(dateStr){
        const display = document.getElementById("journal-display");
        if(!display) return;

        const selectedDate = new Date(dateStr).toDateString();
        const data = trackerData[selectedDate];

        if(!data){
            display.innerHTML = `<p> class="empty-state"> No entry for this day </p>`;
            return;
        }

        display.innerHTML = `
            <div class="daily-insights">
                <h3> Daily insights </h3>
                <p>${data.journal || "No Journal entry"} </p>
            </div>
            
            <div class="grateful">
                <h3> Grateful for :- </h3>
                <p> ${data.gratitude || "No Journal entry"} </p>
            </div>
        `;
    }

    if(datepicker){
        datepicker.addEventListener("change" , (e)=>{
            renderJournalByDate(e.target.value);
        });
    }
    
    function getEmoji(mood){
        const map = {
            happy: "😄",
            good: "🙂",
            neutral: "😐",
            sad: "😔",
            angry: "😡"
        };
        return map[mood];
    }

    glasses.forEach(glass=>{
        glass.addEventListener("click", ()=>{
            const index = parseInt(glass.dataset.index);

            let current = trackerData[today].water;

            if(current === index){
                trackerData[today].water = 0;
            } else {
                trackerData[today].water = index;
            }

            updateWater(trackerData[today].water);
            saveData();
            updateSummary();
        });
    });

    function updateWater(count){
        glasses.forEach(glass=>{
            const idx = parseInt(glass.dataset.index);

            if(idx <= count){
                glass.classList.add("filled");
            } else {
                glass.classList.remove("filled");
            }
        });
    }

    function loadWater(){
        updateWater(trackerData[today].water);
    }

    journalInput.addEventListener("input", ()=>{
        trackerData[today].journal = journalInput.value;
        saveData();
    });

    function loadJournal(){
        journalInput.value = trackerData[today].journal;
    }

    if(habitList) renderHabits();
    if(moodHeading) loadMood();
    if(glasses.length) loadWater();
    if(journalInput) loadJournal();
    if(summaryText) updateSummary();
    if(document.getElementById("habitChart")) renderHabitChart();
    if(document.getElementById("moodChart")) renderMoodChart();
    if(document.getElementById("streak-container")) renderStreakHeatmap();
    if(document.getElementById("heatmap")) renderHeatmap();
    if(document.getElementById("habit-tracker")) renderHabitTracker();


    function updateSummary(){
        const data = trackerData[today];
        if(!data) return;

        const tasks = data.tasks || [];
        const habits = data.habits || [];

        // ================= TASK METRICS (PRIMARY PRODUCTIVITY) =================
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.done).length;
        const taskProductivity = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        // ================= HABIT METRICS (SECONDARY INSIGHT) =================
        const totalHabits = habits.length;
        const completedHabits = habits.filter(h => h.done).length;
        const habitRate = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

        const water = data.water;
        const mood = data.mood || "not selected";

        let insight = "";

        if(taskProductivity >= 80){
            insight = "🔥 Excellent productivity! Keep the momentum going.";
        } else if(taskProductivity >= 50){
            insight = "🙂 Good progress, You’re on the right track.";
        } else if(taskProductivity > 0){
            insight = "⚡ Small steps matter, Try completing 1 more task.";
        } else {
            insight = "🧠 Start with one small task today.";
        }

        summaryText.innerHTML = `
            <div class="progress-container">

                <!-- 🔥 MAIN HERO METRIC -->
                <div class="progress-hero">
                    <h1>${taskProductivity}%</h1>
                </div>

                <!-- 📊 STATS ROW -->
                <div class="progress-stats">
                    <div class="stat">
                        <span>${completedTasks}/${totalTasks}</span>
                        <label>Tasks</label>
                    </div>
                    <div class="stat">
                        <span>${completedHabits}/${totalHabits}</span>
                        <label>Habits</label>
                    </div>
                    <div class="stat">
                        <span>${water}</span>
                        <label>Water</label>
                    </div>
                </div>

                <!-- 🧠 MOOD + INSIGHT -->
                <p class="progress-insight">${insight}</p>

            </div>
        `;
    }

    function renderHabitChart(){
        const textColor = getCSSVar("--text-primary");
        const gridColor = getCSSVar("--chart-grid");
        const canvas = document.getElementById("habitChart");
        if(!canvas) return;

        const labels = [];
        const dataPoints = [];

        const sortedDates = Object.keys(trackerData)
        .map(d => new Date(d))
        .filter(d => !isNaN(d)) 
        .sort((a,b) => a-b);

        sortedDates.forEach(d => {
            if (
                d.getMonth() === activeMonth &&
                d.getFullYear() === currentYear
            ) {
                const dateStr = d.toDateString();
                const dayData = trackerData[dateStr];

                if (!dayData) return;

                const tasks = dayData.tasks || [];
                const total = tasks.length;
                const done = tasks.filter(t => t.done).length;

                const percent = total === 0 ? 0 : Math.round((done / total) * 100);

                labels.push(`Day ${d.getDate()}`);
                dataPoints.push(percent);
            }
        });
        const ctx = document.getElementById("habitChart").getContext("2d");
        if(habitChartInstance){
            habitChartInstance.destroy();
        }
        habitChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Productivity %",
                    data: dataPoints,

                    borderColor: getCSSVar("--chart-line"),
                    backgroundColor: getCSSVar("--chart-fill"),

                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: getCSSVar("--chart-point"),
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio : false,
                animation: {
                    duration: 800,
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        labels: {
                            color: getCSSVar("--chart-text"),
                            opacity: 0.5
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: getCSSVar("--text-primary")
                        },
                        grid: {
                            color: getCSSVar("--chart-grid"),
                            opacity: 0.5
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    function renderMoodChart(){

    const textColor = getCSSVar("--text-primary");
    const gridColor = getCSSVar("--chart-grid");

    const canvas = document.getElementById("moodChart");
    if(!canvas) return;

    const labels = [];
    const dataPoints = [];

    // Mood → numeric value
    const moodValue = {
        angry: 1,
        sad: 2,
        neutral: 3,
        good: 4,
        happy: 5
    };

    // We go through sorted dates (time series)
    const sortedDates = Object.keys(trackerData)
        .map(d => new Date(d))
        .filter(d => !isNaN(d))
        .sort((a, b) => a - b);

    sortedDates.forEach(d => {

        if (
            d.getMonth() === activeMonth &&
            d.getFullYear() === currentYear
        ){
            const dateStr = d.toDateString();
            const dayData = trackerData[dateStr];

            if (!dayData || !dayData.mood) return;

            // X-axis → date
            labels.push(d.getDate()); // day of month

            // Y-axis → mood intensity
            dataPoints.push(moodValue[dayData.mood]);
        }
    });

    const ctx = canvas.getContext("2d");

    if (moodChartInstance) {
        moodChartInstance.destroy();
    }

    moodChartInstance = new Chart(ctx, {
        type: "line", 

        data: {
            labels: labels,
            datasets: [{
                label: "Mood Trend",
                data: dataPoints,

                borderColor: getCSSVar("--chart-line"),
                backgroundColor: getCSSVar("--chart-fill"),

                borderWidth: 3,
                tension: 0.4,
                fill: true,

                pointRadius: 4,
                pointBackgroundColor: [
                    "#f44336",
                    "#ff9800",
                    "#cddc39",
                    "#4caf50",
                    "#367a38"
                ]
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 900,
                easing: "easeOutQuart"
            },

            plugins: {
                legend: {
                    labels: {
                        color: getCSSVar("--text-primary")
                    }
                }
            },

            scales: {
                y: {
                    min: 1,
                    max: 5,

                    ticks: {
                        stepSize: 1,
                        color: textColor,

                        // Convert numbers back to mood labels
                        callback: function(value){
                            const reverse = {
                                1: "😡 Angry",
                                2: "😔 Sad",
                                3: "😐 Neutral",
                                4: "🙂 Good",
                                5: "😄 Happy"
                            };
                            return reverse[value];
                        }
                    },
                    grid:{
                        color: gridColor,
                        opacity: 0.5
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Days of Month",
                        color: getCSSVar("--text-primary")
                    },
                    ticks: {
                        color: textColor
                    },
                    grid:{
                        color: gridColor
                    }
                }
            }
        }
    });
}

    monthSelect.addEventListener("change" , () => {
        activeMonth = parseInt(monthSelect.value);
        renderHabitChart();
        renderMoodChart();
    });

    function renderStreakHeatmap(){
        const container = document.querySelector("#streak-container");
        container.innerHTML = "";

        const sortedDates = Object.keys(trackerData)
        .map(d => new Date(d))
        .sort((a,b) => a-b);

        if(sortedDates.length === 0) return;
        const sampleDay = trackerData[sortedDates[0].toDateString()];
        const habitNames = sampleDay.habits.map(h => h.name);

        const table = document.createElement("table");
        const headerRow = document.createElement("tr");

        headerRow.innerHTML = `<th>Habit</th>`;
        sortedDates.forEach(d => {
            const th = document.createElement("th");
            th.textContent = d.getDate();
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        habitNames.forEach((habitName, habitIndex) => {

            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            nameCell.textContent = habitName;
            row.appendChild(nameCell);
            sortedDates.forEach(d => {
                const dateStr = d.toDateString();
                const dayData = trackerData[dateStr];
                const cell = document.createElement("td");
                if(dayData.habits[habitIndex].done){
                    cell.classList.add("done");
                }else{
                    cell.classList.add("not-done");
                }
                row.appendChild(cell);
            });
            table.appendChild(row);
        });
        container.appendChild(table);
    }

    tabButtons.forEach(button => {
        button.addEventListener("click" , ()=>{
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => {
                btn.classList.remove("active");
            });
            tabs.forEach(tab => {
                tab.classList.remove("active");
            });
            button.classList.add("active");

            document.getElementById(targetTab).classList.add("active");

            if(targetTab === "analytics"){
                renderHabitChart();
                renderMoodChart();
            }
            if(targetTab === "history"){
                renderHeatmap();
            }
            if(targetTab === "logs"){
                renderHabitTracker();
            }
        });
    });

    function renderHeatmap() {

        const container = document.getElementById("heatmap");
        if (!container) return;

        container.innerHTML = "";

        const totalDays = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - totalDays);

        const startDay = startDate.getDay(); // 0 = Sunday
        startDate.setDate(startDate.getDate() - startDay);

        for (let i = 0; i < totalDays + startDay; i++) {

            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dateStr = date.toDateString();
            const dayData = trackerData[dateStr];

            let level = 0;
            let completed = 0;
            let total = 0;

            // ✅ If data exists → calculate completion
            if (dayData && dayData.tasks) {

                total = dayData.tasks.length;
                completed = dayData.tasks.filter(h => h.done).length;

                const percent = total ? completed / total : 0;

                if (percent === 0) level = 0;
                else if (percent < 0.4) level = 1;
                else if (percent < 0.7) level = 2;
                else if (percent < 1) level = 3;
                else level = 4;
            }

            const cell = document.createElement("div");
            cell.classList.add("heatmap-cell", `level-${level}`);

            cell.title = `${dateStr} | ${completed}/${total} tasks`;

            container.appendChild(cell);
        }
    }
    renderHabits();
    updateSummary();

    if(!trackerData[today].tasks){
        trackerData[today].tasks = [];
    }

    function renderTasks(){
        if(!taskList) return;
        taskList.innerHTML = "";
        trackerData[today].tasks.forEach((task,index)=>{
            const div = document.createElement("div");
            div.classList.add("task-item");
            if(task.done) div.classList.add("completed");
            div.innerHTML = `
                <input type="checkbox" data-index="${index}" ${task.done ? "checked" : ""}>
                <span>${task.name}</span>
            `;
            taskList.appendChild(div);
        });
    }
    if(addTaskBtn){
        addTaskBtn.addEventListener("click", ()=>{
            const value = taskInput.value.trim();
            if(!value) return;

            trackerData[today].tasks.push({
                name: value,
                done: false
            });

            taskInput.value = "";
            saveData();
            renderTasks();
            renderHeatmap(); 
        });
    }
    if(taskList){
        taskList.addEventListener("change", (e)=>{
            const index = e.target.dataset.index;

            trackerData[today].tasks[index].done = e.target.checked;

            saveData();
            renderTasks();
            renderHeatmap(); 
        });
    }
    renderTasks();

    function renderHabitTracker(){

        const table = document.getElementById("habit-tracker");
        if(!table) return;

        table.innerHTML = "";

        const days = 30;

        // ✅ Get last 30 days
        const dates = [];
        const todayDate = new Date();

        for(let i = days - 1; i >= 0; i--){
            const d = new Date();
            d.setDate(todayDate.getDate() - i);
            dates.push(new Date(d));
        }

        // ✅ Get habit names from today
        const todayData = trackerData[new Date().toDateString()];
        if(!todayData) return;

        const habitNames = todayData.habits.map(h => h.name);

        // ================= HEADER ROW =================
        const headerRow = document.createElement("tr");

        // First empty cell
        headerRow.innerHTML = `<th>Habit</th>`;

        dates.forEach(d => {
            const th = document.createElement("th");
            th.textContent = d.getDate(); // show day number
            headerRow.appendChild(th);
        });

        table.appendChild(headerRow);

        // ================= DATA ROWS =================
        habitNames.forEach((habitName, habitIndex) => {

            const row = document.createElement("tr");

            // Habit name cell
            const nameCell = document.createElement("td");
            nameCell.textContent = habitName;
            row.appendChild(nameCell);

            // Loop through each date
            dates.forEach(d => {

                const dateStr = d.toDateString();
                const dayData = trackerData[dateStr];

                const cell = document.createElement("td");

                if(dayData && dayData.habits){

                    const done = dayData.habits[habitIndex].done;

                    if(done){
                        cell.classList.add("habit-done");
                    }else{
                        cell.classList.add("habit-missed");
                    }

                }else{
                    cell.classList.add("habit-missed");
                }

                cell.title = dateStr;

                row.appendChild(cell);
            });

            table.appendChild(row);
        });
    }
});

