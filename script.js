const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const summary = document.getElementById('summary');
const weightForm = document.getElementById('weightForm');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let weights = JSON.parse(localStorage.getItem('weights')) || {}; 

function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function calculateWeeklyAverage(startDay, endDay) {
    const weeklyWeights = [];
    for (let day = startDay; day <= endDay; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        if (weights[dateKey] !== undefined) {
            weeklyWeights.push(weights[dateKey]);
        }
    }
    if (weeklyWeights.length === 0) return null;
    return (weeklyWeights.reduce((sum, w) => sum + w, 0) / weeklyWeights.length).toFixed(2);
}

function calculateWeightChange() {
    const allWeeks = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);

    for (let i = 1; i <= daysInMonth; i += 7) {
        const average = calculateWeeklyAverage(i, i + 6 > daysInMonth ? daysInMonth : i + 6);
        if (average !== null) allWeeks.push(parseFloat(average));
    }

    if (allWeeks.length < 2) return null;
    return (allWeeks[allWeeks.length - 1] - allWeeks[0]).toFixed(2);
}

function populateCalendar() {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    calendar.innerHTML = '';

    monthYear.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayLabels.forEach(label => {
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('day-label');
        labelDiv.textContent = label;
        calendar.appendChild(labelDiv);
    });

    for (let i = 0; i < (firstDay + 6) % 7; i++) {
        const emptyDiv = document.createElement('div');
        calendar.appendChild(emptyDiv);
    }


    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const weight = weights[dateKey] || null;


        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        let average = null;
        if (dayOfWeek === 0) {
            average = calculateWeeklyAverage(day - 6, day);
            dayDiv.classList.add('sunday');
        }

        dayDiv.innerHTML = `
            <p>${day}</p>
            <p class="weight">${weight !== null ? `${weight} kg` : '-'}</p>
            ${average !== null ? `<p class="average">Avg: ${average} kg</p>` : ''}
        `;

        calendar.appendChild(dayDiv);
    }

    const change = calculateWeightChange();
    summary.textContent = change !== null ? `Change: ${change} kg` : 'Change: -';
    summary.className = change < 0 ? 'loss' : change > 0 ? 'gain' : '';
}

function handleMonthChange(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    }
    populateCalendar();
}

weightForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const weightInput = document.getElementById('weight');
    const weight = parseFloat(weightInput.value);
    if (!isNaN(weight)) {
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        weights[dateKey] = weight;
        localStorage.setItem('weights', JSON.stringify(weights));
        weightInput.value = '';
        populateCalendar();
    } else {
        alert('Please enter a valid weight!');
    }
});

prevMonthButton.addEventListener('click', () => handleMonthChange(-1));
nextMonthButton.addEventListener('click', () => handleMonthChange(1));

populateCalendar();