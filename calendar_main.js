import LoggingService from './loggingService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';
import CalendarService from './calendarService.js';
import * as TaskService from './taskService.js';
import { formatDate } from './utils.js';
import NotificationService from './notificationService.js';

const CalendarUI = (() => {
    // --- State ---
    let currentDate = new Date();
    let activeEventId = null;
    let currentView = 'month'; // 'month', 'week', or 'day'
    let selectedColor = 'sky-500'; // Default color
    let draggedEventId = null;
    let timeIndicatorInterval = null;
    // REMOVED: let notificationCheckInterval = null;
    let datePicker = null;
    let holidays = []; // To store fetched holidays

    // --- DOM Elements ---
    let calendarGrid, weekDayViewContainer, currentMonthYearEl, prevMonthBtn, nextMonthBtn, todayBtn;
    let monthViewBtn, weekViewBtn, dayViewBtn;
    let eventModal, eventModalTitle, eventForm, eventIdInput, eventTitleInput, eventStartDateInput, eventEndDateInput, eventStartTimeInput, eventEndTimeInput, eventDescriptionInput, cancelEventBtn, isAllDayCheckbox, timeInputsContainer, colorPalette, eventLocationInput, eventRecurrenceInput;
    let viewEventModal, viewEventTitle, viewEventTime, viewEventLocation, viewEventDescription, closeViewEventBtn, editEventBtn, deleteEventBtn;
    let settingsModal, closeSettingsBtn, settingsDoneBtn, enableNotificationsToggle, notifyMinutesBeforeInput, notificationPermissionStatusText, showHolidaysToggle;

    function getDOMElements() {
        calendarGrid = document.getElementById('calendarGrid');
        weekDayViewContainer = document.getElementById('weekDayViewContainer');
        currentMonthYearEl = document.getElementById('currentMonthYear');
        prevMonthBtn = document.getElementById('prevMonthBtn');
        nextMonthBtn = document.getElementById('nextMonthBtn');
        todayBtn = document.getElementById('todayBtn');
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
        eventLocationInput = document.getElementById('eventLocation');
        eventRecurrenceInput = document.getElementById('eventRecurrence');
        viewEventModal = document.getElementById('viewEventModal');
        viewEventTitle = document.getElementById('viewEventTitle');
        viewEventTime = document.getElementById('viewEventTime');
        viewEventLocation = document.getElementById('viewEventLocation');
        viewEventDescription = document.getElementById('viewEventDescription');
        closeViewEventBtn = document.getElementById('closeViewEventBtn');
        editEventBtn = document.getElementById('editEventBtn');
        deleteEventBtn = document.getElementById('deleteEventBtn');
        settingsModal = document.getElementById('settingsModal');
        closeSettingsBtn = document.getElementById('closeSettingsBtn');
        settingsDoneBtn = document.getElementById('settingsDoneBtn');
        enableNotificationsToggle = document.getElementById('enableNotificationsToggle');
        notifyMinutesBeforeInput = document.getElementById('notifyMinutesBefore');
        notificationPermissionStatusText = document.getElementById('notificationPermissionStatusText');
        showHolidaysToggle = document.getElementById('showHolidaysToggle');
    }

    async function fetchHolidays(year) {
        const isEnabled = localStorage.getItem('showCanadianHolidays') === 'true';
        if (!isEnabled) {
            holidays = [];
            return;
        }
        try {
            const response = await fetch(`https://canada-holidays.ca/api/v1/holidays?year=${year}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            holidays = data.holidays;
        } catch (error) {
            LoggingService.error('[CalendarUI] Could not fetch holiday data.', error);
            holidays = [];
        }
    }

    function getRecurrenceEvents(event, viewStartDate, viewEndDate) {
        if (!event.recurrence || event.recurrence === 'none') {
            return [];
        }

        const occurrences = [];
        let current = new Date(event.startTime);
        
        while (current <= viewEndDate) {
            if (current >= viewStartDate) {
                const occurrence = { ...event, startTime: current.toISOString(), endTime: new Date(current.getTime() + (new Date(event.endTime).getTime() - new Date(event.startTime).getTime())).toISOString() };
                occurrences.push(occurrence);
            }

            switch (event.recurrence) {
                case 'daily':
                    current.setDate(current.getDate() + 1);
                    break;
                case 'weekly':
                    current.setDate(current.getDate() + 7);
                    break;
                case 'bi-weekly':
                    current.setDate(current.getDate() + 14);
                    break;
                case 'monthly':
                    current.setMonth(current.getMonth() + 1);
                    break;
                case 'yearly':
                    current.setFullYear(current.getFullYear() + 1);
                    break;
                default:
                    return occurrences;
            }
        }
        return occurrences;
    }

    async function updateView() {
        if (timeIndicatorInterval) clearInterval(timeIndicatorInterval);
        await fetchHolidays(currentDate.getFullYear());

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

    function updateCurrentTimeIndicator() {
        const now = new Date();
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23,59,59,999);

        if (now < startOfDay || now > endOfDay && currentView !== 'week') {
             const existingIndicator = weekDayViewContainer.querySelector('.current-time-indicator');
             if (existingIndicator) existingIndicator.remove();
             return;
        }
        
        const timeGrid = weekDayViewContainer.querySelector('.day-view-time-grid, .week-view-time-grid');
        if (!timeGrid) return;

        let indicator = timeGrid.querySelector('.current-time-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'current-time-indicator';
            timeGrid.appendChild(indicator);
        }

        const minutesPastMidnight = now.getHours() * 60 + now.getMinutes();
        const topPosition = (minutesPastMidnight / 1440) * (24 * 60);
        indicator.style.top = `${topPosition}px`;
    }

    function renderMonthView() {
        calendarGrid.innerHTML = '';
        calendarGrid.classList.remove('hidden');
        weekDayViewContainer.classList.add('hidden');
        currentMonthYearEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const allTasks = AppStore.getTasks() || [];
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day-header';
            dayEl.textContent = day;
            calendarGrid.appendChild(dayEl);
        });

        const totalDaysToRender = (firstDayOfMonth.getDay() + lastDayOfMonth.getDate()) > 35 ? 42 : 35;
        for (let i = 0; i < totalDaysToRender; i++) {
            const daySquare = document.createElement('div');
            daySquare.className = 'calendar-day-square';
            const dayOfMonth = i - firstDayOfMonth.getDay() + 1;

            if (i >= firstDayOfMonth.getDay() && dayOfMonth <= lastDayOfMonth.getDate()) {
                const date = new Date(year, month, dayOfMonth);
                const dateStr = date.toISOString().split('T')[0];
                daySquare.dataset.date = dateStr;

                if (dateStr === todayStr) {
                    daySquare.classList.add('today-marker');
                }

                const dayNumber = document.createElement('span');
                dayNumber.className = 'calendar-day-number';
                dayNumber.textContent = dayOfMonth;
                daySquare.appendChild(dayNumber);

                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'space-y-1 mt-1 overflow-y-auto';

                const allEvents = CalendarService.getEvents();
                let eventsForDay = [];

                allEvents.forEach(event => {
                    if (event.recurrence && event.recurrence !== 'none') {
                        const occurrences = getRecurrenceEvents(event, firstDayOfMonth, lastDayOfMonth);
                        occurrences.forEach(occ => {
                            if (new Date(occ.startTime).toISOString().split('T')[0] === dateStr) {
                                eventsForDay.push(occ);
                            }
                        });
                    } else {
                        const eventStart = new Date(event.startTime);
                        const eventEnd = new Date(event.endTime);
                        const currentDayStart = new Date(dateStr + "T00:00:00");
                        const currentDayEnd = new Date(dateStr + "T23:59:59");
                        if (currentDayStart <= eventEnd && currentDayEnd >= eventStart) {
                            eventsForDay.push(event);
                        }
                    }
                });

                holidays.forEach(holiday => {
                    if (holiday.date === dateStr) {
                        const holidayEl = document.createElement('div');
                        holidayEl.className = 'holiday-pill';
                        holidayEl.textContent = holiday.nameEn;
                        itemsContainer.appendChild(holidayEl);
                    }
                });

                eventsForDay.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event-pill';
                    eventEl.draggable = true;
                    const colorClass = `bg-${event.color || 'sky-500'}`;
                    eventEl.classList.add(colorClass.replace('500', '600'));
                    eventEl.textContent = event.title;
                    eventEl.dataset.eventId = event.id;
                    eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                    eventEl.addEventListener('dragstart', (e) => {
                        e.stopPropagation();
                        draggedEventId = event.id;
                    });
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
        weekDayViewContainer.innerHTML = '';

        const today = new Date();
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        currentMonthYearEl.textContent = `${formatDate(firstDayOfWeek)} - ${formatDate(lastDayOfWeek)}`;

        const grid = document.createElement('div');
        grid.className = 'week-view-grid';

        const header = document.createElement('div');
        header.className = 'week-view-header';
        header.style.gridColumn = '2';
        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(day.getDate() + i);
            const headerCell = document.createElement('div');
            headerCell.className = 'text-center font-semibold text-slate-300 py-2 border-b-2 border-slate-700';
            let dayClass = (day.toDateString() === today.toDateString()) ? 'text-sky-400' : '';
            headerCell.innerHTML = `<span class="text-xs">${day.toLocaleString('default', { weekday: 'short' })}</span><br><span class="text-lg ${dayClass}">${day.getDate()}</span>`;
            header.appendChild(headerCell);
        }
        grid.appendChild(header);

        const allDayLabel = document.createElement('div');
        allDayLabel.textContent = 'all-day';
        allDayLabel.className = 'text-xs text-right pr-2 py-1 text-slate-400';
        allDayLabel.style.gridRow = '2';
        grid.appendChild(allDayLabel);

        const allDaySection = document.createElement('div');
        allDaySection.className = 'week-view-all-day-section';
        allDaySection.style.gridRow = '2';
        const allDayColumns = [];
        for (let i = 0; i < 7; i++) {
            const col = document.createElement('div');
            col.className = 'all-day-column';
            allDaySection.appendChild(col);
            allDayColumns.push(col);
        }
        grid.appendChild(allDaySection);

        const timeGrid = document.createElement('div');
        timeGrid.className = 'week-view-time-grid';
        const timedDayColumns = [];
        for (let i = 0; i < 24; i++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = i === 0 ? '' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
            timeLabel.style.gridRow = i + 1;
            timeGrid.appendChild(timeLabel);
        }
        for (let j = 0; j < 7; j++) {
            const dayCol = document.createElement('div');
            dayCol.className = 'day-column';
            dayCol.style.gridColumn = j + 2;
            dayCol.style.gridRow = '1 / -1';
            for (let i = 0; i < 24; i++) {
                const slot = document.createElement('div');
                slot.className = 'hour-slot';
                dayCol.appendChild(slot);
            }
            timeGrid.appendChild(dayCol);
            timedDayColumns.push(dayCol);
        }
        grid.appendChild(timeGrid);

        const eventsThisWeek = CalendarService.getEvents().filter(event => {
            const eventStart = new Date(event.startTime);
            return eventStart >= firstDayOfWeek && eventStart <= lastDayOfWeek;
        });

        eventsThisWeek.forEach(event => {
            const eventStart = new Date(event.startTime);
            const dayIndex = eventStart.getDay();

            if (event.isAllDay) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-pill all-day-event';
                eventEl.classList.add(`bg-${event.color || 'sky-600'}`);
                eventEl.textContent = event.title;
                eventEl.dataset.eventId = event.id;
                eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                allDayColumns[dayIndex].appendChild(eventEl);
            } else {
                const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                const endMinutes = new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes();
                let duration = endMinutes - startMinutes;
                if(duration < 30) duration = 30;

                const eventEl = document.createElement('div');
                eventEl.className = 'week-event';
                eventEl.classList.add(`bg-${event.color || 'sky-600'}`);
                eventEl.innerHTML = `<strong class="font-semibold">${event.title}</strong><br><span class="text-xs">${eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                eventEl.style.top = `${(startMinutes / 60) * 60}px`;
                eventEl.style.height = `${(duration / 60) * 60}px`;
                eventEl.dataset.eventId = event.id;
                eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                timedDayColumns[dayIndex].appendChild(eventEl);
            }
        });
        
        weekDayViewContainer.appendChild(grid);
        
        updateCurrentTimeIndicator();
        timeIndicatorInterval = setInterval(updateCurrentTimeIndicator, 60000);
    }

    function renderDayView() {
        calendarGrid.classList.add('hidden');
        weekDayViewContainer.classList.remove('hidden');
        weekDayViewContainer.innerHTML = '';

        currentMonthYearEl.textContent = currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const grid = document.createElement('div');
        grid.className = 'day-view-grid';

        const allDayLabel = document.createElement('div');
        allDayLabel.textContent = 'all-day';
        allDayLabel.className = 'text-xs text-right pr-2 py-1 text-slate-400';
        allDayLabel.style.gridRow = '2';
        grid.appendChild(allDayLabel);

        const allDaySection = document.createElement('div');
        allDaySection.className = 'day-view-all-day-section';
        allDaySection.style.gridRow = '2';
        grid.appendChild(allDaySection);

        const timeGrid = document.createElement('div');
        timeGrid.className = 'day-view-time-grid';
        
        for (let i = 0; i < 24; i++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = i === 0 ? '' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
            timeLabel.style.gridRow = i + 1;
            timeGrid.appendChild(timeLabel);
        }

        const dayCol = document.createElement('div');
        dayCol.className = 'day-column';
        dayCol.style.gridColumn = 2;
        dayCol.style.gridRow = '1 / -1';
        for (let i = 0; i < 24; i++) {
            const slot = document.createElement('div');
            slot.className = 'hour-slot';
            dayCol.appendChild(slot);
        }
        timeGrid.appendChild(dayCol);
        grid.appendChild(timeGrid);

        const dayStart = new Date(currentDate);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23,59,59,999);

        const eventsToday = CalendarService.getEvents().filter(event => {
            const eventStart = new Date(event.startTime);
            return eventStart >= dayStart && eventStart <= dayEnd;
        });

        eventsToday.forEach(event => {
            if (event.isAllDay) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-pill all-day-event';
                eventEl.classList.add(`bg-${event.color || 'sky-600'}`);
                eventEl.textContent = event.title;
                eventEl.dataset.eventId = event.id;
                eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                allDaySection.appendChild(eventEl);
            } else {
                const eventStart = new Date(event.startTime);
                const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                const endMinutes = new Date(event.endTime).getHours() * 60 + new Date(event.endTime).getMinutes();
                let duration = endMinutes - startMinutes;
                if(duration < 30) duration = 30;

                const eventEl = document.createElement('div');
                eventEl.className = 'week-event';
                eventEl.classList.add(`bg-${event.color || 'sky-600'}`);
                eventEl.innerHTML = `<strong class="font-semibold">${event.title}</strong><br><span class="text-xs">${eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                eventEl.style.top = `${(startMinutes / 60) * 60}px`;
                eventEl.style.height = `${(duration / 60) * 60}px`;
                eventEl.dataset.eventId = event.id;
                eventEl.addEventListener('click', (e) => { e.stopPropagation(); openViewEventModal(event.id); });
                dayCol.appendChild(eventEl);
            }
        });
        
        weekDayViewContainer.appendChild(grid);
        
        updateCurrentTimeIndicator();
        timeIndicatorInterval = setInterval(updateCurrentTimeIndicator, 60000);
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
            eventLocationInput.value = event.location || '';
            eventRecurrenceInput.value = event.recurrence || 'none';
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
            eventRecurrenceInput.value = 'none';
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
        viewEventLocation.textContent = event.location || 'Not specified';
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
            location: eventLocationInput.value,
            recurrence: eventRecurrenceInput.value,
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

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    async function handleDrop(e) {
        e.preventDefault();
        const targetDaySquare = e.target.closest('.calendar-day-square');
        if (!targetDaySquare || !draggedEventId) return;

        const newDateStr = targetDaySquare.dataset.date;
        const event = CalendarService.getEventById(Number(draggedEventId));
        if (!event) return;

        const originalStartDate = new Date(event.startTime);
        const originalEndDate = new Date(event.endTime);
        const durationMs = originalEndDate.getTime() - originalStartDate.getTime();
        
        const newStartDate = new Date(newDateStr + 'T' + originalStartDate.toTimeString().split(' ')[0]);
        const newEndDate = new Date(newStartDate.getTime() + durationMs);

        const updatedEventData = {
            ...event,
            startTime: newStartDate.toISOString(),
            endTime: newEndDate.toISOString(),
        };

        await CalendarService.updateEvent(event.id, updatedEventData);
        draggedEventId = null;
    }

    function openSettingsModal() {
        settingsModal.classList.remove('hidden');
        updateNotificationStatusUI();
        showHolidaysToggle.checked = localStorage.getItem('showCanadianHolidays') === 'true';
    }

    function closeSettingsModal() {
        settingsModal.classList.add('hidden');
    }

    function updateNotificationStatusUI() {
        const permission = NotificationService.getPermissionStatus();
        let statusText = 'Unknown';
        if (permission === 'granted') statusText = 'Granted';
        else if (permission === 'denied') statusText = 'Denied by browser';
        else statusText = 'Not Granted';
        notificationPermissionStatusText.textContent = `Browser Permission: ${statusText}`;

        // START OF MODIFICATION
        const prefs = AppStore.getUserPreferences()?.calendarNotifications || {};
        enableNotificationsToggle.checked = prefs.enabled && (permission === 'granted');
        notifyMinutesBeforeInput.value = prefs.notifyMinutesBefore || 15;
        // END OF MODIFICATION
    }

    async function handleEnableNotificationsToggle(e) {
        const isEnabled = e.target.checked;
        let permissionGranted = NotificationService.getPermissionStatus() === 'granted';

        if (isEnabled && !permissionGranted) {
            const permission = await NotificationService.requestPermission();
            permissionGranted = permission === 'granted';
        }

        // START OF MODIFICATION
        const prefs = AppStore.getUserPreferences();
        await AppStore.setUserPreferences({
            ...prefs,
            calendarNotifications: {
                ...(prefs.calendarNotifications || {}),
                enabled: isEnabled && permissionGranted,
            }
        });
        // END OF MODIFICATION
        updateNotificationStatusUI();
    }
    
    // REMOVED startNotificationChecker, stopNotificationChecker, and checkForUpcomingEvents

    function handleShowHolidaysToggle(e) {
        const isEnabled = e.target.checked;
        localStorage.setItem('showCanadianHolidays', isEnabled);
        updateView();
    }
    
    function handleMouseWheel(e) {
        if (currentView === 'month') {
            e.preventDefault();
            if (e.deltaY < 0) {
                // Scroll up
                currentDate.setMonth(currentDate.getMonth() - 1);
            } else {
                // Scroll down
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            updateView();
        }
    }

    function setupEventListeners() {
        prevMonthBtn.addEventListener('click', () => {
            const d = currentView === 'week' ? 7 : (currentView === 'day' ? 1 : 0);
            if (d > 0) currentDate.setDate(currentDate.getDate() - d);
            else currentDate.setMonth(currentDate.getMonth() - 1);
            updateView();
        });
        nextMonthBtn.addEventListener('click', () => {
            const d = currentView === 'week' ? 7 : (currentView === 'day' ? 1 : 0);
            if (d > 0) currentDate.setDate(currentDate.getDate() + d);
            else currentDate.setMonth(currentDate.getMonth() + 1);
            updateView();
        });

        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
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
        document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
        settingsDoneBtn.addEventListener('click', closeSettingsModal);
        enableNotificationsToggle.addEventListener('change', handleEnableNotificationsToggle);
        showHolidaysToggle.addEventListener('change', handleShowHolidaysToggle);
        
        // START OF MODIFICATION
        notifyMinutesBeforeInput.addEventListener('change', async (e) => {
            const prefs = AppStore.getUserPreferences();
            await AppStore.setUserPreferences({
                ...prefs,
                calendarNotifications: {
                    ...(prefs.calendarNotifications || {}),
                    notifyMinutesBefore: parseInt(e.target.value, 10) || 15,
                }
            });
        });
        // END OF MODIFICATION

        editEventBtn.addEventListener('click', () => {
            const eventIdToEdit = activeEventId;
            closeViewEventModal();
            openEventModal(eventIdToEdit);
        });
        
        calendarGrid.addEventListener('dragover', handleDragOver);
        calendarGrid.addEventListener('drop', handleDrop);
        calendarGrid.addEventListener('wheel', handleMouseWheel);
        
        EventBus.subscribe('calendarEventsChanged', updateView);
        EventBus.subscribe('tasksChanged', updateView);
    }

    function initializeDatePicker() {
        if (datePicker) {
            datePicker.destroy();
        }
        datePicker = flatpickr(currentMonthYearEl, {
            defaultDate: currentDate,
            onChange: function(selectedDates) {
                if (selectedDates[0]) {
                    currentDate = selectedDates[0];
                    updateView();
                }
            },
        });
    }

    return {
        initialize: () => {
            getDOMElements();
            setupEventListeners();
            initializeDatePicker();
            updateView();
            // REMOVED initial call to startNotificationChecker
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
        document.body.innerHTML = '<p class="text-white text-center p-8">Could not load the Calendar app. Please check the console for errors and try refreshing the page.</p>';
    }
});