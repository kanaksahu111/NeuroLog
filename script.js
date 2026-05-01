
document.addEventListener("DOMContentLoaded", () => {
    let habitChartInstance = null;
    let moodChartInstance = null;

    const today = new Date().toDateString();
    let trackerData = JSON.parse(localStorage.getItem("trackerData")) || {};
    const now = new Date();
    let activeMonth = now.getMonth();     
    const currentYear = now.getFullYear();   
    const monthSelect = document.querySelector("#month-select");
    monthSelect.value = activeMonth;
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabs = document.querySelectorAll(".tab");

    if(!trackerData[today]){
        trackerData[today] = {
            habits: [
                { name: "Drink Water", done: false },
                { name: "Read 10 pages", done: false },
                { name: "Workout", done: false },
                { name: "No junk food", done: false },
                { name: "Meditate", done: false }
            ],
            mood: null,
            water: 0,
            journal: ""
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

    const quotes = {
        happy: "Keep shining, you're doing amazing",
        good: "You're on the right track",
        neutral: "Stay steady, better days ahead",
        sad: "It's okay to feel this way",
        angry: "Take a breath, you got this"
    };

    let habits = trackerData[today].habits || [];

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

    renderHabits();
    loadMood();
    loadWater();
    loadJournal();
    renderHabitChart();
    ``
    renderMoodChart();
    renderStreakHeatmap();
    updateSummary();

    function updateSummary(){
        const data = trackerData[today];
        if(!data) return;

        const totalHabits = data.habits.length;
        const completedHabits = data.habits.filter(h => h.done).length;
        const water = data.water;
        const mood = data.mood ? data.mood: "not selected";
        const productivity = totalHabits ? Math.round((completedHabits/totalHabits)*100) : 0;       
        summaryText.innerHTML = `
        <strong>Habits:</strong> ${completedHabits}/${totalHabits} completed <br>
        <strong>Water:</strong> ${water} glasses <br>
        <strong>Mood:</strong> ${mood} <br>
        <strong>Productivity:</strong> ${productivity}% 
    `};

    function renderHabitChart(){
        const labels = [];
        const dataPoints = [];

        for(let date in trackerData){
            const d = new Date(date);

            if(
                d.getMonth() === activeMonth &&
                d.getFullYear() === currentYear
            ){
                const dayData = trackerData[date];
                const total = dayData.habits.length;
                const done = dayData.habits.filter(h=>h.done).length;
                const percent = total ? Math.round((done/total)*100) : 0;

                labels.push(d.getDate());
                dataPoints.push(percent);
            }
        }
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
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    function renderMoodChart(){

        const moodCount = {
            happy: 0,
            good: 0,
            neutral: 0,
            sad: 0,
            angry: 0
        };

        for(let date in trackerData){
            const d = new Date(date);

            if(
                d.getMonth() === activeMonth &&
                d.getFullYear() === currentYear
            ){
                const mood = trackerData[date].mood;
                if(mood){
                    moodCount[mood]++;
                }
            }
        }

        const ctx = document.getElementById("moodChart").getContext("2d");
        if(moodChartInstance){
            moodChartInstance.destroy();
        }
        moodChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(moodCount),
                datasets: [{
                    data: Object.values(moodCount)
                }]
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

            // 👉 Create a row for each habit
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
        });
    });
});





