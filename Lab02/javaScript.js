document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const newDeadlineInput = document.getElementById('new-task-deadline');
    const addTaskBtn = document.getElementById('add-task-btn');
    const searchInput = document.getElementById('search-input');

    let currentEditingIndex = null;

    function getTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            return JSON.parse(storedTasks);
        }
        return [
            { text: "Kliknij, aby edytować to zadanie i zmienić datę", completed: false, deadline: '2025-10-25T10:00' },
            { text: "Zaimplementować edycję daty", completed: true, deadline: '' },
            { text: "Dodać nowy element do listy", completed: false, deadline: '' }
        ];
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    let tasks = getTasks();

    function formatDeadline(datetimeString) {
        if (!datetimeString) return '';
        const date = new Date(datetimeString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return 'Termin: ' + date.toLocaleDateString('pl-PL', options);
    }

    function highlightText(fullText, phrase) {
        if (!phrase || phrase.length < 2) {
            return fullText;
        }

        const lowerCaseText = fullText.toLowerCase();
        const lowerCasePhrase = phrase.toLowerCase();

        let result = '';
        let lastIndex = 0;
        let index = lowerCaseText.indexOf(lowerCasePhrase, lastIndex);

        while (index !== -1) {
            result += fullText.substring(lastIndex, index);

            const match = fullText.substring(index, index + phrase.length);
            result += `<span class="highlight">${match}</span>`;

            lastIndex = index + phrase.length;
            index = lowerCaseText.indexOf(lowerCasePhrase, lastIndex);
        }

        result += fullText.substring(lastIndex);

        return result;
    }

    // ZMODYFIKOWANA FUNKCJA ZAPISU I WALIDACJI (z buforem czasowym)
    function saveEdit(index, listItem) {
        const textInput = listItem.querySelector('.edit-input');
        const deadlineInput = listItem.querySelector('.edit-deadline');

        const newText = textInput.value.trim();
        const newDeadline = deadlineInput.value;

        // Pobieramy oryginalną datę zadania
        const originalDeadline = tasks[index].deadline;

        // --- WALIDACJA TEKSTU ---
        if (newText.length < 3) {
            alert("Treść zadania musi mieć co najmniej 3 znaki.");
            textInput.focus();
            return false;
        }
        if (newText.length > 255) {
            alert("Treść zadania nie może przekraczać 255 znaków.");
            textInput.focus();
            return false;
        }

        // --- WALIDACJA DATY ---
        if (newDeadline) {
            // KLUCZOWA ZMIANA: Jeśli nowa data jest identyczna z pierwotną, pomijamy walidację czasu.
            if (newDeadline !== originalDeadline) {

                const selectedDate = new Date(newDeadline);
                const now = new Date();
                const futureBuffer = 60000; // 60 sekund

                // Walidacja jest uruchamiana tylko, jeśli data została zmieniona
                if (selectedDate.getTime() < now.getTime() + futureBuffer) {
                    alert("Termin wykonania zadania musi być co najmniej 60 sekund w przyszłości.");
                    deadlineInput.focus();
                    return false;
                }
            }
        }

        // --- ZAPIS ZMIAN ---
        tasks[index].text = newText;
        tasks[index].deadline = newDeadline;
        currentEditingIndex = null;
        saveTasks();
        renderTasks();
        return true;
    }

    function renderTasks() {
        const filterText = searchInput.value.toLowerCase();
        taskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-text', task.text.toLowerCase());
            listItem.setAttribute('data-index', index);

            const shouldBeHidden = (filterText.length >= 2 && !task.text.toLowerCase().includes(filterText));
            listItem.style.display = shouldBeHidden ? 'none' : 'flex';

            const taskContentContainer = document.createElement('span');
            taskContentContainer.classList.add('task-content-container');

            if (task.completed) {
                taskContentContainer.classList.add('completed');
            }

            if (currentEditingIndex === index) {

                // --- TRYB EDYCJI ---
                const editFieldsWrapper = document.createElement('div');
                editFieldsWrapper.classList.add('edit-fields-wrapper');

                // 1. Edycja tekstu
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = task.text;
                editInput.classList.add('edit-input');
                editFieldsWrapper.appendChild(editInput);

                // 2. Edycja daty/czasu
                const editDeadline = document.createElement('input');
                editDeadline.type = 'datetime-local';
                editDeadline.value = task.deadline;
                editDeadline.classList.add('edit-deadline');
                editFieldsWrapper.appendChild(editDeadline);

                // 3. Przycisk ZAPISZ (NOWOŚĆ)
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Zapisz';
                saveBtn.classList.add('save-btn');
                saveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    saveEdit(index, listItem);
                });
                editFieldsWrapper.appendChild(saveBtn);

                taskContentContainer.appendChild(editFieldsWrapper);

                setTimeout(() => {
                    editInput.focus();
                    editInput.select();
                }, 0);

                // Zapis po naciśnięciu ENTER
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(index, listItem);
                    }
                });

                editDeadline.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(index, listItem);
                    }
                });


            } else {

                // --- TRYB WYŚWIETLANIA ---
                const textSpan = document.createElement('span');
                textSpan.innerHTML = highlightText(task.text, searchInput.value);

                if (task.deadline) {
                    textSpan.innerHTML += ` <small class="deadline-text">(${formatDeadline(task.deadline)})</small>`;
                }

                taskContentContainer.appendChild(textSpan);

                // NOWA LOGIKA: Pojedyncze kliknięcie przełącza w tryb edycji
                taskContentContainer.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // Jeśli task jest ukończony, pojedyncze kliknięcie zmieni jego status.
                    if (task.completed) {
                        tasks[index].completed = false;
                        saveTasks();
                        renderTasks();
                    } else {
                        // Jeśli nie jest ukończony, wejdź w tryb edycji
                        currentEditingIndex = index;
                        renderTasks();
                    }
                });

                // DODATKOWA LOGIKA: Przełączanie statusu ukończenia przez podwójne kliknięcie
                taskContentContainer.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                    renderTasks();
                });
            }


            listItem.appendChild(taskContentContainer);

            // Przycisk usuwania
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Usuń';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tasks.splice(index, 1);
                currentEditingIndex = null;
                saveTasks();
                renderTasks();
            });

            listItem.appendChild(deleteBtn);
            taskList.appendChild(listItem);
        });
    }

    // ***************************************************************
    // USUNIĘTO WSZYSTKIE PROBLEMATYCZNE LISTENERY 'click' I 'blur'.
    // Zapis odbywa się tylko przez przycisk "Zapisz" lub naciśnięcie "Enter".
    // ***************************************************************

    function applySearchFilter() {
        renderTasks();
    }

    searchInput.addEventListener('input', applySearchFilter);

    // ZMODYFIKOWANA FUNKCJA DODAWANIA (z buforem czasowym)
    function addTask() {
        const text = newTaskInput.value.trim();
        const deadline = newDeadlineInput.value;

        if (text.length < 3) {
            alert("Treść zadania musi mieć co najmniej 3 znaki.");
            newTaskInput.focus();
            return;
        }
        if (text.length > 255) {
            alert("Treść zadania nie może przekraczać 255 znaków.");
            newTaskInput.focus();
            return;
        }

        if (deadline) {
            const selectedDate = new Date(deadline);
            const now = new Date();

            const futureBuffer = 60000; // 60 sekund

            if (selectedDate.getTime() < now.getTime() + futureBuffer) {
                alert("Termin wykonania zadania musi być co najmniej 60 sekund w przyszłości, aby uniknąć problemów z zapisem i strefami czasowymi.");
                newDeadlineInput.focus();
                return;
            }
        }

        tasks.push({
            text: text,
            completed: false,
            deadline: deadline
        });
        newTaskInput.value = '';
        newDeadlineInput.value = '';
        saveTasks();
        renderTasks();
    }

    addTaskBtn.addEventListener('click', addTask);

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    renderTasks();
});