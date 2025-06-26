import LoggingService from './loggingService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';
import CalendarService from './calendarService.js';
import * as TaskService from './taskService.js';
import { formatDate } from './utils.js';

const CalendarUI = (() => {
    // --- State ---
    let currentDate = new Date();
    let activeEventId = null;
    let currentView = 'month'; // 'month', 'week', or 'day'
    let selectedColor = 'sky-500'; // Default color

    // --- DOM Elements ---
    let calendarGrid, weekDayViewContainer, currentMonthYearEl, prevMonthBtn, nextMonthBtn;
    let monthViewBtn, weekViewBtn, dayViewBtn;
    let eventModal, eventModalTitle, eventForm, eventIdInput, eventTitleInput, eventStartDateInput, eventEndDateInput, eventStartTimeInput, eventEndTimeInput, eventDescriptionInput, cancelEventBtn, isAllDayCheckbox, timeInputsContainer, colorPalette;
    let viewEventModal, viewEventTitle, viewEventTime, viewEventDescription, closeViewEventBtn, editEventBtn, deleteEventBtn;

    function getDOMElements() {
        calendarGrid = document.getElementById('calendarGrid');
        weekDayViewContainer = document.getElementById('weekDayViewContainer');
        currentMonthYearEl = document.getElementById('currentMonthYear');
        prevMonthBtn = document.getElementById('prevMonthBtn');
        nextMonthBtn = document.getElementById('nextMonthBtn');
        monthViewBtn = document.getElementById('monthViewBtn');
        weekViewBtn = document.getElementById('weekViewBtn');
        dayViewBtn = document.getElementById('dayViewBtn');
        eventModal = document.getElementById('eventModal');
        eventModalTitle = document.getElementById('eventModalTitle');
        eventForm = document.getElementById('eventForm');
        eventIdInput = document.getElementById('eventId');
        eventTitleInput = document.getElementById('eventTitle');
        eventStartDateInput = document.getElementById('eventStartDate');
        eventEndDateInput = document.getElementById('eventEndDate');
        eventStartTimeInput = document.getElementById('eventStartTime');
        eventEndTimeInput = document.getElementById('eventEndTime');
        eventDescriptionInput = document.getElementById('eventDescription');
        cancelEventBtn = document.getElementById('cancelEventBtn');
        isAllDayCheckbox = document.getElementById('isAllDay');
        timeInputsContainer = document.getElementById('timeInputsContainer');
        colorPalette = document.getElementById('color-palette');
        viewEventModal = document.getElementById('viewEventModal');
        viewEventTitle = document.getElementById('viewEventTitle');
        viewEventTime = document.getElementById('viewEventTime');
        viewEventDescription = document.getElementById('viewEventDescription');
        closeViewEventBtn = document.getElementById('closeViewEventBtn');
        editEventBtn = document.getElementById('editEventBtn');
        deleteEventBtn = document.getElementById('deleteEventBtn');
    }

    function updateView() {
        const viewRenderers = {
            month: renderMonthView,
            week: renderWeekView,
            day: renderDayView,
        };
        if (viewRenderers[currentView]) viewRenderers[currentView]();
        
        [monthViewBtn, weekViewBtn, dayViewBtn].forEach(btn => {
            btn.classList.remove('bg-sky-600', 'text-white');
            btn.classList.add('hover:bg-slate-700');
        });
        const activeBtn = document.getElementById(`${currentView}ViewBtn`);
        if (activeBtn) {
            activeBtn.classList.add('bg-sky-600', 'text-white');
            activeBtn.classList.remove('hover:bg-slate-700');
        }
    }

    function renderMonthView() {
        calendarGrid.innerHTML = '';
        calendarGrid.classList.remove('hidden');
        weekDayViewContainer.classList.add('hidden');
        currentMonthYearEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const allTasks = AppStore.getTasks() || [];

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day-header';
            dayEl.textContent = day;
            calendarGrid.appendChild(dayEl);
        });

        const totalDaysToRender = (firstDayOfMonth + daysInMonth) > 35 ? 42 : 35;
        for (let i = 0; i < totalDaysToRender; i++) {
            const daySquare = document.createElement('div');
            daySquare.className = 'calendar-day-square';
            const dayOfMonth = i - firstDayOfMonth + 1;

            if (i >= firstDayOfMonth && dayOfMonth <= daysInMonth) {
                const date = new Date(year, month, dayOfMonth);
                const dateStr = date.toISOString().split('T')[0];
                daySquare.dataset.date = dateStr;

                const dayNumber = document.createElement('span');
                dayNumber.className = 'calendar-day-number';
                dayNumber.textContent = dayOfMonth;
                daySquare.appendChild(dayNumber);

                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'space-y-1 mt-1 overflow-y-auto';

                const events = CalendarService.getEvents().filter(event => {
                    const eventStart = new Date(event.startTime);
                    const eventEnd = new Date(event.endTime);
                    const currentDayStart = new Date(dateStr + "T00:00:00");
                    const currentDayEnd = new Date(dateStr + "T23:59:59");
                    return currentDayStart <= eventEnd && currentDayEnd >= eventStart;
                });

                events.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event-pill';
                    const colorClass = `bg-${event.color || 'sky-500'}`;
                    eventEl.classList.add(colorClass.replace('500', '600'));
                    eventEl.textContent = event.title;
                    eventEl.dataset.eventId = event.id;
                    eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                    itemsContainer.appendChild(eventEl);
                });

                const tasks = allTasks.filter(task => task.dueDate === dateStr && !task.completed);
                tasks.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'task-pill';
                    taskEl.innerHTML = `<i class="fas fa-check-circle fa-xs mr-1"></i>${task.text}`;
                    taskEl.title = `Task: ${task.text}`;
                    taskEl.addEventListener('click', (e) => { e.stopPropagation(); alert(`Task due: ${task.text}`); });
                    itemsContainer.appendChild(taskEl);
                });

                daySquare.appendChild(itemsContainer);
                daySquare.addEventListener('click', () => openEventModal(null, dateStr));
            } else {
                daySquare.classList.add('other-month');
            }
            calendarGrid.appendChild(daySquare);
        }
    }

    function renderWeekView() {
        calendarGrid.classList.add('hidden');
        weekDayViewContainer.classList.remove('hidden');
        weekDayViewContainer.innerHTML = ''; // Clear previous content

        // FIX: Create a robust structure for the week view
        const timeGrid = document.createElement('div');
        timeGrid.className = 'time-grid'; // Use the main grid container class

        // Get start of the current week (assuming Sunday is the first day)
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        currentMonthYearEl.textContent = `Week of ${firstDayOfWeek.toLocaleDateString()}`;

        // Add an empty top-left cell for spacing
        timeGrid.appendChild(document.createElement('div')); 

        // Create the 7-day header
        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(day.getDate() + i);
            const headerCell = document.createElement('div');
            headerCell.className = 'text-center font-semibold text-slate-300 py-2 border-b-2 border-slate-700';
            headerCell.innerHTML = `<span class="text-xs">${day.toLocaleString('default', { weekday: 'short' })}</span><br><span class="text-lg">${day.getDate()}</span>`;
            timeGrid.appendChild(headerCell);
        }

        // Create the time labels and the grid cells
        for (let i = 0; i < 24; i++) { // 24 hours
            // Time label
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
            timeLabel.style.gridRow = i + 2;
            timeGrid.appendChild(timeLabel);

            // 7 day columns for this hour
            for (let j = 0; j < 7; j++) {
                const dayColumn = document.createElement('div');
                dayColumn.className = 'day-column';
                dayColumn.style.gridRow = i + 2;
                dayColumn.style.gridColumn = j + 2;

                const hourSlot = document.createElement('div');
                hourSlot.className = 'hour-slot';
                dayColumn.appendChild(hourSlot);
                timeGrid.appendChild(dayColumn);
            }
        }
        
        // Place events on the grid
        const eventsThisWeek = CalendarService.getEvents().filter(event => {
            const eventStart = new Date(event.startTime);
            return eventStart >= firstDayOfWeek && eventStart <= lastDayOfWeek && !event.isAllDay;
        });

        eventsThisWeek.forEach(event => {
            const eventStart = new Date(event.startTime);
            const dayIndex = eventStart.getDay(); // 0=Sun, 6=Sat
            
            const startMinutes = (eventStart.getHours() * 60) + eventStart.getMinutes();
            const endMinutes = new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes();
            const duration = endMinutes - startMinutes;

            const eventEl = document.createElement('div');
            eventEl.className = 'week-event';
            eventEl.classList.add(`bg-${event.color || 'sky-600'}`);
            eventEl.textContent = event.title;
            eventEl.style.top = `${startMinutes}px`; 
            eventEl.style.height = `${duration}px`;
            
            // Find the correct day column to append to
            const targetDayColumn = timeGrid.querySelector(`[style*="grid-column: ${dayIndex + 2};"]`);
            if(targetDayColumn) {
                targetDayColumn.appendChild(eventEl);
            }
        });


        weekDayViewContainer.appendChild(timeGrid);
    }

    function renderDayView() {
        calendarGrid.classList.add('hidden');
        weekDayViewContainer.classList.remove('hidden');
        weekDayViewContainer.innerHTML = 'Day View Coming Soon...';
        currentMonthYearEl.textContent = "Day View";
    }
    
    function setSelectedColor(color) {
        selectedColor = color;
        const dots = colorPalette.querySelectorAll('.color-dot');
        dots.forEach(dot => {
            dot.classList.toggle('selected', dot.dataset.color === color);
        });
    }

    function openEventModal(eventId = null, preselectedDate = null) {
        eventForm.reset();
        activeEventId = eventId;

        if (eventId) {
            const event = CalendarService.getEventById(Number(eventId));
            if (!event) return;
            eventModalTitle.textContent = 'Edit Event';
            eventIdInput.value = event.id;
            eventTitleInput.value = event.title;
            eventDescriptionInput.value = event.description || '';
            isAllDayCheckbox.checked = event.isAllDay;
            setSelectedColor(event.color || 'sky-500');
            eventStartDateInput.value = event.startTime.split('T')[0];
            eventEndDateInput.value = event.endTime.split('T')[0];
            eventStartTimeInput.value = event.isAllDay ? '' : event.startTime.split('T')[1].substring(0, 5);
            eventEndTimeInput.value = event.isAllDay ? '' : event.endTime.split('T')[1].substring(0, 5);
        } else {
            eventModalTitle.textContent = 'Add Event';
            eventIdInput.value = '';
            isAllDayCheckbox.checked = false;
            setSelectedColor('sky-500');
            if(preselectedDate) {
                eventStartDateInput.value = preselectedDate;
                eventEndDateInput.value = preselectedDate;
            }
        }
        
        timeInputsContainer.classList.toggle('hidden', isAllDayCheckbox.checked);
        eventModal.classList.remove('hidden');
    }

    function closeEventModal() {
        eventModal.classList.add('hidden');
    }
    
    function openViewEventModal(eventId) {
        const event = CalendarService.getEventById(Number(eventId));
        if (!event) return;

        activeEventId = eventId;
        viewEventTitle.textContent = event.title;
        
        let timeString = new Date(event.startTime).toLocaleDateString();
        if(!event.isAllDay) {
            timeString += ` at ${new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else {
            timeString += ' (All day)';
        }
        
        if (event.endTime.split('T')[0] !== event.startTime.split('T')[0]) {
             timeString += ` until ${new Date(event.endTime).toLocaleDateString()}`;
             if (!event.isAllDay) {
                 timeString += ` ${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
             }
        }

        viewEventTime.textContent = timeString;
        viewEventDescription.textContent = event.description || 'No description provided.';
        viewEventModal.classList.remove('hidden');
    }
    
    function closeViewEventModal() {
        viewEventModal.classList.add('hidden');
        activeEventId = null;
    }

    async function handleEventFormSubmit(e) {
        e.preventDefault();
        
        const isAllDay = isAllDayCheckbox.checked;
        const startTimeValue = eventStartTimeInput.value || '00:00';
        const endTimeValue = eventEndTimeInput.value || '23:59';

        const startTime = isAllDay ? `${eventStartDateInput.value}T00:00:00` : `${eventStartDateInput.value}T${startTimeValue}`;
        const endTime = isAllDay ? `${eventEndDateInput.value}T23:59:59` : `${eventEndDateInput.value}T${endTimeValue}`;
        
        const eventData = {
            title: eventTitleInput.value,
            description: eventDescriptionInput.value,
            startTime,
            endTime,
            isAllDay,
            color: selectedColor,
        };
        
        if (activeEventId) {
            await CalendarService.updateEvent(Number(activeEventId), eventData);
        } else {
            await CalendarService.addEvent(eventData);
        }
        closeEventModal();
    }
    
    async function handleDeleteEvent() {
        if(activeEventId && confirm('Are you sure you want to delete this event?')) {
            await CalendarService.deleteEvent(Number(activeEventId));
            closeViewEventModal();
        }
    }

    function setupEventListeners() {
        prevMonthBtn.addEventListener('click', () => { 
            const d = currentView === 'week' ? 7 : 0;
            if (d > 0) currentDate.setDate(currentDate.getDate() - d);
            else currentDate.setMonth(currentDate.getMonth() - 1);
            updateView(); 
        });
        nextMonthBtn.addEventListener('click', () => { 
            const d = currentView === 'week' ? 7 : 0;
            if (d > 0) currentDate.setDate(currentDate.getDate() + d);
            else currentDate.setMonth(currentDate.getMonth() + 1);
            updateView(); 
        });

        monthViewBtn.addEventListener('click', () => { currentView = 'month'; updateView(); });
        weekViewBtn.addEventListener('click', () => { currentView = 'week'; updateView(); });
        dayViewBtn.addEventListener('click', () => { currentView = 'day'; updateView(); });
        isAllDayCheckbox.addEventListener('change', (e) => { timeInputsContainer.classList.toggle('hidden', e.target.checked); });

        colorPalette.addEventListener('click', (e) => {
            const dot = e.target.closest('.color-dot');
            if (dot) {
                setSelectedColor(dot.dataset.color);
            }
        });

        eventForm.addEventListener('submit', handleEventFormSubmit);
        cancelEventBtn.addEventListener('click', closeEventModal);
        closeViewEventBtn.addEventListener('click', closeViewEventModal);
        deleteEventBtn.addEventListener('click', handleDeleteEvent);
        
        // FIX: Capture eventId before closing the view modal
        editEventBtn.addEventListener('click', () => {
            const eventIdToEdit = activeEventId;
            closeViewEventModal();
            openEventModal(eventIdToEdit);
        });
        
        EventBus.subscribe('calendarEventsChanged', updateView);
        EventBus.subscribe('tasksChanged', updateView);
    }

    return {
        initialize: () => {
            getDOMElements();
            setupEventListeners();
            updateView();
            LoggingService.info('[CalendarUI] Initialized.');
        }
    };
})();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await AppStore.initializeStore();
        CalendarUI.initialize();
    } catch (error) {
        LoggingService.critical('[CalendarMain] A critical error occurred during calendar initialization.', error);
        document.body.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Calendar app. Please check the console for errors and try refreshing the page.</p>';
    }
});