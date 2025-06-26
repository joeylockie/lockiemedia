// public/calendar_main.js

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';
import CalendarService from './calendarService.js';

const CalendarUI = (() => {
    // --- State ---
    let currentDate = new Date();
    let activeEventId = null;

    // --- DOM Elements ---
    let calendarGrid, currentMonthYearEl, prevMonthBtn, nextMonthBtn;
    let eventModal, eventModalTitle, eventForm, eventIdInput, eventTitleInput, eventStartDateInput, eventEndDateInput, eventStartTimeInput, eventEndTimeInput, eventDescriptionInput, cancelEventBtn;
    let viewEventModal, viewEventTitle, viewEventTime, viewEventDescription, closeViewEventBtn, editEventBtn, deleteEventBtn;

    function getDOMElements() {
        calendarGrid = document.getElementById('calendarGrid');
        currentMonthYearEl = document.getElementById('currentMonthYear');
        prevMonthBtn = document.getElementById('prevMonthBtn');
        nextMonthBtn = document.getElementById('nextMonthBtn');
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
        viewEventModal = document.getElementById('viewEventModal');
        viewEventTitle = document.getElementById('viewEventTitle');
        viewEventTime = document.getElementById('viewEventTime');
        viewEventDescription = document.getElementById('viewEventDescription');
        closeViewEventBtn = document.getElementById('closeViewEventBtn');
        editEventBtn = document.getElementById('editEventBtn');
        deleteEventBtn = document.getElementById('deleteEventBtn');
    }

    function renderCalendar() {
        if (!calendarGrid || !currentMonthYearEl) {
            LoggingService.error("[CalendarUI] Calendar grid or month/year element not found.", null, { functionName: 'renderCalendar'});
            return;
        }

        calendarGrid.innerHTML = '';
        currentMonthYearEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // FIX: Add day names header
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day-header'; // Use pre-defined class
            dayEl.textContent = day;
            calendarGrid.appendChild(dayEl);
        });
        
        // Loop for the day squares
        const totalDaysToRender = (firstDayOfMonth + daysInMonth) > 35 ? 42 : 35;
        for (let i = 0; i < totalDaysToRender; i++) {
            const daySquare = document.createElement('div');
            daySquare.className = 'calendar-day-square'; // Use pre-defined class
            
            const dayOfMonth = i - firstDayOfMonth + 1;
            
            if (i >= firstDayOfMonth && dayOfMonth <= daysInMonth) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
                daySquare.dataset.date = dateStr;

                const dayNumber = document.createElement('span');
                dayNumber.className = 'calendar-day-number'; // Use pre-defined class
                dayNumber.textContent = dayOfMonth;
                daySquare.appendChild(dayNumber);

                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'space-y-1 mt-1 overflow-y-auto';
                
                const events = CalendarService.getEvents().filter(event => {
                    const eventStart = new Date(event.startTime);
                    const eventEnd = new Date(event.endTime);
                    const currentDayStart = new Date(dateStr + "T00:00:00");
                    const currentDayEnd = new Date(dateStr + "T23:59:59");
                    return currentDayStart <= eventEnd && currentDayEnd >= eventStart;
                });
                
                events.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event-pill'; // Use pre-defined class
                    eventEl.textContent = event.title;
                    eventEl.dataset.eventId = event.id;
                    eventEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openViewEventModal(event.id);
                    });
                    eventsContainer.appendChild(eventEl);
                });

                daySquare.appendChild(eventsContainer);
                daySquare.addEventListener('click', () => openEventModal(null, dateStr));

            } else {
                daySquare.classList.add('other-month'); // Use pre-defined class
            }
            calendarGrid.appendChild(daySquare);
        }
    }
    
    function openEventModal(eventId = null, preselectedDate = null) {
        eventForm.reset();
        activeEventId = eventId;

        if (eventId) {
            const event = CalendarService.getEventById(eventId);
            if (!event) return;
            eventModalTitle.textContent = 'Edit Event';
            eventIdInput.value = event.id;
            eventTitleInput.value = event.title;
            eventDescriptionInput.value = event.description || '';
            eventStartDateInput.value = event.startTime.split('T')[0];
            eventEndDateInput.value = event.endTime.split('T')[0];
            eventStartTimeInput.value = event.isAllDay ? '' : event.startTime.split('T')[1];
            eventEndTimeInput.value = event.isAllDay ? '' : event.endTime.split('T')[1];
        } else {
            eventModalTitle.textContent = 'Add Event';
            eventIdInput.value = '';
            if(preselectedDate) {
                eventStartDateInput.value = preselectedDate;
                eventEndDateInput.value = preselectedDate;
            }
        }
        eventModal.classList.remove('hidden');
    }

    function closeEventModal() {
        eventModal.classList.add('hidden');
    }
    
    function openViewEventModal(eventId) {
        const event = CalendarService.getEventById(eventId);
        if (!event) return;

        activeEventId = eventId;
        viewEventTitle.textContent = event.title;
        
        let timeString = new Date(event.startTime).toLocaleDateString();
        if(!event.isAllDay) {
            timeString += ` at ${new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
        if (event.endTime.split('T')[0] !== event.startTime.split('T')[0]) {
             timeString += ` until ${new Date(event.endTime).toLocaleDateString()}`;
        }
        if(!event.isAllDay) {
             timeString += ` ${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
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
        
        const startTime = eventStartTimeInput.value ? `${eventStartDateInput.value}T${eventStartTimeInput.value}` : `${eventStartDateInput.value}T00:00:00`;
        const endTime = eventEndTimeInput.value ? `${eventEndDateInput.value}T${eventEndTimeInput.value}` : `${eventEndDateInput.value}T23:59:59`;
        
        const eventData = {
            title: eventTitleInput.value,
            description: eventDescriptionInput.value,
            startTime,
            endTime,
        };
        
        if (activeEventId) {
            await CalendarService.updateEvent(activeEventId, eventData);
        } else {
            await CalendarService.addEvent(eventData);
        }
        closeEventModal();
    }
    
    async function handleDeleteEvent() {
        if(activeEventId && confirm('Are you sure you want to delete this event?')) {
            await CalendarService.deleteEvent(activeEventId);
            closeViewEventModal();
        }
    }

    function setupEventListeners() {
        prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        eventForm.addEventListener('submit', handleEventFormSubmit);
        cancelEventBtn.addEventListener('click', closeEventModal);
        closeViewEventBtn.addEventListener('click', closeViewEventModal);
        deleteEventBtn.addEventListener('click', handleDeleteEvent);
        editEventBtn.addEventListener('click', () => {
            closeViewEventModal();
            openEventModal(activeEventId);
        });
        
        EventBus.subscribe('calendarEventsChanged', renderCalendar);
    }

    return {
        initialize: () => {
            getDOMElements();
            setupEventListeners();
            renderCalendar();
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