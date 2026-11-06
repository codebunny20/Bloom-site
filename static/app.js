(() => {
    const storageKey = "bloom.app.v1";
    const today = new Date();
    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
    const moodMessages = {
        great: "Let yourself enjoy the good moments. You deserve them.",
        okay: "Okay is a place to be. Thanks for checking in with yourself.",
        low: "You don't have to figure everything out today. One small thing is enough.",
        tough: "Take a breath. You deserve care, especially on the hard days."
    };
    const emptyState = () => ({ moods: {}, medications: [], appointments: [], journal: [], milestones: [] });
    const saveStatus = document.getElementById("save-status");
    let state = emptyState();
    let storageIssue = false;

    function setStatus(message, isError = false) {
        if (!saveStatus) return;
        saveStatus.textContent = message;
        saveStatus.classList.toggle("status-error", isError);
    }

    function loadState() {
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            const valid = parsed && typeof parsed === "object"
                && parsed.moods && typeof parsed.moods === "object"
                && ["medications", "appointments", "journal", "milestones"].every(key => Array.isArray(parsed[key]));
            if (!valid) throw new Error("Saved Bloom data has an unexpected format.");
            state = parsed;
        } catch (error) {
            storageIssue = true;
            setStatus("Saved data could not be read. Clear data to start fresh.", true);
            console.error("Bloom could not read saved data.", error);
        }
    }

    function persist() {
        if (storageIssue) {
            setStatus("Changes aren't being saved. Clear data to start fresh.", true);
            return false;
        }
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
            setStatus("Saved on this device.");
            return true;
        } catch (error) {
            setStatus("Couldn't save. Check your browser's available storage.", true);
            console.error("Bloom could not save data to this browser.", error);
            return false;
        }
    }

    function on(id, type, handler) {
        const node = document.getElementById(id);
        if (node) node.addEventListener(type, handler);
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function addRemoveButton(onClick, label) {
        const button = element("button", "remove-button", "×");
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.addEventListener("click", onClick);
        return button;
    }

    function displayDate(dateString, options = { month: "short", day: "numeric", year: "numeric" }) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(undefined, options);
    }

    function renderMoods() {
        document.querySelectorAll(".mood-option").forEach(button => {
            const selected = state.moods[todayKey] === button.dataset.mood;
            button.setAttribute("aria-pressed", String(selected));
        });
        const response = document.getElementById("mood-response");
        if (!response) return;
        response.textContent = state.moods[todayKey]
            ? moodMessages[state.moods[todayKey]]
            : "Whatever today feels like, you belong here.";
    }

    function renderMedications() {
        const list = document.getElementById("medication-list");
        if (!list) return;
        list.replaceChildren();
        if (!state.medications.length) {
            list.append(element("p", "empty-state", "No medications added yet. Add one if it would be helpful."));
            return;
        }
        state.medications.forEach(medication => {
            const completed = Boolean(medication.taken && medication.taken[todayKey]);
            const row = element("div", `list-item${completed ? " is-complete" : ""}`);
            const check = element("button", "check-button", "✓");
            check.type = "button";
            check.setAttribute("aria-label", `${completed ? "Mark" : "Mark"} ${medication.name} ${completed ? "not taken" : "taken"} today`);
            check.setAttribute("aria-pressed", String(completed));
            check.addEventListener("click", () => {
                medication.taken = medication.taken || {};
                medication.taken[todayKey] = !completed;
                persist();
                renderMedications();
            });
            const main = element("div", "list-item-main");
            main.append(element("div", "list-item-title", medication.name));
            if (medication.dose) main.append(element("div", "list-item-meta", medication.dose));
            row.append(check, main, addRemoveButton(() => {
                state.medications = state.medications.filter(item => item.id !== medication.id);
                persist();
                renderMedications();
            }, `Remove ${medication.name}`));
            list.append(row);
        });
    }

    function renderAppointments() {
        const list = document.getElementById("appointment-list");
        if (!list) return;
        list.replaceChildren();
        const appointments = [...state.appointments].sort((a, b) => a.date.localeCompare(b.date));
        if (!appointments.length) {
            list.append(element("p", "empty-state", "Nothing on the calendar yet. Add a date when you're ready."));
            return;
        }
        appointments.forEach(appointment => {
            const row = element("div", "list-item");
            const main = element("div", "list-item-main");
            main.append(element("div", "list-item-title", appointment.title));
            main.append(element("div", "list-item-meta", displayDate(appointment.date)));
            row.append(main, addRemoveButton(() => {
                state.appointments = state.appointments.filter(item => item.id !== appointment.id);
                persist();
                renderAppointments();
            }, `Remove appointment: ${appointment.title}`));
            list.append(row);
        });
    }

    function renderJournal() {
        const list = document.getElementById("journal-list");
        if (!list) return;
        list.replaceChildren();
        state.journal.slice(0, Number(list.dataset.limit) || undefined).forEach(entry => {
            const article = element("article", "journal-entry");
            const header = element("div", "journal-entry-header");
            header.append(element("time", "", displayDate(entry.date)));
            header.append(addRemoveButton(() => {
                state.journal = state.journal.filter(item => item.id !== entry.id);
                persist();
                renderJournal();
            }, "Remove journal entry"));
            article.append(header, element("p", "", entry.text));
            list.append(article);
        });
    }

    function renderMilestones() {
        const list = document.getElementById("milestone-list");
        if (!list) return;
        list.replaceChildren();
        [...state.milestones].forEach(milestone => {
            const item = element("li");
            item.append(element("span", "milestone-star", "✧"));
            item.append(element("span", "milestone-text", milestone.text));
            item.append(addRemoveButton(() => {
                state.milestones = state.milestones.filter(entry => entry.id !== milestone.id);
                persist();
                renderMilestones();
            }, "Remove milestone"));
            list.append(item);
        });
    }

    function render() {
        renderMoods();
        renderMedications();
        renderAppointments();
        renderJournal();
        renderMilestones();
    }

    function newId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const dateLabel = document.getElementById("today-date");
    if (dateLabel) dateLabel.textContent = today.toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric"
    }).toUpperCase();
    const appointmentDate = document.getElementById("appointment-date");
    if (appointmentDate) appointmentDate.min = todayKey;

    document.querySelectorAll(".mood-option").forEach(button => {
        button.addEventListener("click", () => {
            state.moods[todayKey] = button.dataset.mood;
            persist();
            renderMoods();
        });
    });

    on("medication-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        state.medications.push({
            id: newId(),
            name: data.get("name").trim(),
            dose: data.get("dose").trim(),
            taken: {}
        });
        persist();
        renderMedications();
        form.reset();
    });

    on("appointment-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        state.appointments.push({
            id: newId(),
            title: data.get("title").trim(),
            date: data.get("date")
        });
        persist();
        renderAppointments();
        form.reset();
        appointmentDate.min = todayKey;
    });

    on("journal-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("entry").trim();
        if (!text) return;
        state.journal.unshift({ id: newId(), date: todayKey, text });
        persist();
        renderJournal();
        form.reset();
    });

    on("milestone-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("milestone").trim();
        if (!text) return;
        state.milestones.unshift({ id: newId(), text });
        persist();
        renderMilestones();
        form.reset();
    });

    on("clear-data", "click", () => {
        if (!window.confirm("Clear all Bloom entries saved in this browser? This cannot be undone.")) return;
        try {
            localStorage.removeItem(storageKey);
            state = emptyState();
            storageIssue = false;
            setStatus("Your browser data has been cleared.");
            render();
        } catch (error) {
            setStatus("Couldn't clear saved data. Check your browser settings.", true);
            console.error("Bloom could not clear saved data.", error);
        }
    });

    loadState();
    render();
})();
