(() => {
    const storageKey = "bloom.app.v1";
    function dateKey(date = new Date()) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }
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
            if (!stored) {
                state = emptyState();
                storageIssue = false;
                return;
            }
            const parsed = JSON.parse(stored);
            const valid = parsed && typeof parsed === "object"
                && parsed.moods && typeof parsed.moods === "object"
                && ["medications", "appointments", "journal", "milestones"].every(key => Array.isArray(parsed[key]));
            if (!valid) throw new Error("Saved Bloom data has an unexpected format.");
            state = parsed;
            storageIssue = false;
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

    function changeState(change) {
        const previous = JSON.stringify(state);
        change();
        const saved = persist();
        if (!saved) state = JSON.parse(previous);
        render();
        return saved;
    }

    function on(id, type, handler) {
        const node = document.getElementById(id);
        if (node) node.addEventListener(type, handler);
    }

    on("sidebar-toggle", "click", event => {
        const button = event.currentTarget;
        const collapsed = document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");
        const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
        button.setAttribute("aria-expanded", String(!collapsed));
        button.setAttribute("aria-label", label);
        button.title = label;
        button.textContent = collapsed ? "›" : "‹";
    });

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

    function historyRow(title, date) {
        const row = element("div", "list-item");
        const main = element("div", "list-item-main");
        main.append(element("div", "list-item-title", title));
        main.append(element("div", "list-item-meta", displayDate(date)));
        row.append(main);
        return row;
    }

    function renderMoods() {
        const todayKey = dateKey();
        document.querySelectorAll(".mood-option").forEach(button => {
            const selected = state.moods[todayKey] === button.dataset.mood;
            button.setAttribute("aria-pressed", String(selected));
        });
        const response = document.getElementById("mood-response");
        if (response) {
            response.textContent = state.moods[todayKey]
                ? moodMessages[state.moods[todayKey]]
                : "Whatever today feels like, you belong here.";
        }
        const history = document.getElementById("mood-history");
        if (!history) return;
        history.replaceChildren();
        const entries = Object.entries(state.moods).sort(([a], [b]) => b.localeCompare(a));
        if (!entries.length) history.append(element("p", "empty-state", "No mood check-ins yet."));
        entries.forEach(([date, mood]) => {
            const label = mood.charAt(0).toUpperCase() + mood.slice(1);
            history.append(historyRow(label, date));
        });
    }

    function renderMedications() {
        const list = document.getElementById("medication-list");
        if (!list) return;
        const todayKey = dateKey();
        list.replaceChildren();
        if (!state.medications.length) {
            list.append(element("p", "empty-state", "No medications added yet. Add one if it would be helpful."));
        }
        state.medications.forEach(medication => {
            const completed = Boolean(medication.taken && medication.taken[todayKey]);
            const row = element("div", `list-item${completed ? " is-complete" : ""}`);
            const check = element("button", "check-button", "✓");
            check.type = "button";
            check.setAttribute("aria-label", `${completed ? "Mark" : "Mark"} ${medication.name} ${completed ? "not taken" : "taken"} today`);
            check.setAttribute("aria-pressed", String(completed));
            check.addEventListener("click", () => {
                changeState(() => {
                    medication.taken = medication.taken || {};
                    const currentDate = dateKey();
                    medication.taken[currentDate] = !medication.taken[currentDate];
                });
            });
            const main = element("div", "list-item-main");
            main.append(element("div", "list-item-title", medication.name));
            if (medication.dose) main.append(element("div", "list-item-meta", medication.dose));
            row.append(check, main, addRemoveButton(() => {
                changeState(() => {
                    state.medications = state.medications.filter(item => item.id !== medication.id);
                });
            }, `Remove ${medication.name}`));
            list.append(row);
        });
        const history = document.getElementById("medication-history");
        if (!history) return;
        history.replaceChildren();
        const entries = state.medications.flatMap(medication =>
            Object.entries(medication.taken || {})
                .filter(([, taken]) => taken)
                .map(([date]) => ({ date, title: medication.dose ? `${medication.name} — ${medication.dose}` : medication.name }))
        ).sort((a, b) => b.date.localeCompare(a.date));
        if (!entries.length) history.append(element("p", "empty-state", "No medication check-ins yet."));
        entries.forEach(entry => history.append(historyRow(entry.title, entry.date)));
    }

    function renderAppointments() {
        const list = document.getElementById("appointment-list");
        if (!list) return;
        list.replaceChildren();
        const history = document.getElementById("appointment-history");
        if (history) history.replaceChildren();
        const todayKey = dateKey();
        const appointments = [...state.appointments].sort((a, b) => a.date.localeCompare(b.date));
        const upcoming = appointments.filter(appointment => appointment.date >= todayKey);
        const past = appointments.filter(appointment => appointment.date < todayKey).reverse();
        if (!upcoming.length) {
            list.append(element("p", "empty-state", "Nothing on the calendar yet. Add a date when you're ready."));
        }
        if (history && !past.length) history.append(element("p", "empty-state", "No past appointments yet."));
        function appendAppointment(container, appointment) {
            const row = element("div", "list-item");
            const main = element("div", "list-item-main");
            main.append(element("div", "list-item-title", appointment.title));
            main.append(element("div", "list-item-meta", displayDate(appointment.date)));
            row.append(main, addRemoveButton(() => {
                changeState(() => {
                    state.appointments = state.appointments.filter(item => item.id !== appointment.id);
                });
            }, `Remove appointment: ${appointment.title}`));
            container.append(row);
        }
        upcoming.forEach(appointment => appendAppointment(list, appointment));
        if (history) past.forEach(appointment => appendAppointment(history, appointment));
    }

    function renderJournal() {
        const list = document.getElementById("journal-list");
        if (!list) return;
        list.replaceChildren();
        if (!state.journal.length) list.append(element("p", "empty-state", "No journal entries yet."));
        state.journal.slice(0, Number(list.dataset.limit) || undefined).forEach(entry => {
            const article = element("article", "journal-entry");
            const header = element("div", "journal-entry-header");
            header.append(element("time", "", displayDate(entry.date)));
            header.append(addRemoveButton(() => {
                changeState(() => {
                    state.journal = state.journal.filter(item => item.id !== entry.id);
                });
            }, "Remove journal entry"));
            article.append(header, element("p", "", entry.text));
            list.append(article);
        });
    }

    function renderMilestones() {
        const list = document.getElementById("milestone-list");
        if (!list) return;
        list.replaceChildren();
        if (!state.milestones.length) list.append(element("li", "empty-state", "No milestones yet."));
        [...state.milestones].forEach(milestone => {
            const item = element("li");
            item.append(element("span", "milestone-star", "✧"));
            item.append(element("span", "milestone-text", milestone.text));
            item.append(element("span", "milestone-date", milestone.date ? displayDate(milestone.date) : "Date not recorded"));
            item.append(addRemoveButton(() => {
                changeState(() => {
                    state.milestones = state.milestones.filter(entry => entry.id !== milestone.id);
                });
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
    const appointmentDate = document.getElementById("appointment-date");
    let displayedDate;
    function refreshDate() {
        const today = new Date();
        const todayKey = dateKey(today);
        if (displayedDate === todayKey) return;
        displayedDate = todayKey;
        if (dateLabel) dateLabel.textContent = today.toLocaleDateString(undefined, {
            weekday: "long", month: "long", day: "numeric"
        }).toUpperCase();
        if (appointmentDate) appointmentDate.min = todayKey;
        render();
    }

    document.querySelectorAll(".mood-option").forEach(button => {
        button.addEventListener("click", () => {
            changeState(() => {
                state.moods[dateKey()] = button.dataset.mood;
            });
        });
    });

    on("medication-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const saved = changeState(() => {
            state.medications.push({
                id: newId(),
                name: data.get("name").trim(),
                dose: data.get("dose").trim(),
                taken: {}
            });
        });
        if (saved) form.reset();
    });

    on("appointment-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const saved = changeState(() => {
            state.appointments.push({
                id: newId(),
                title: data.get("title").trim(),
                date: data.get("date")
            });
        });
        if (saved) form.reset();
    });

    on("journal-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("entry").trim();
        if (!text) return;
        const saved = changeState(() => {
            state.journal.unshift({ id: newId(), date: dateKey(), text });
        });
        if (saved) form.reset();
    });

    on("milestone-form", "submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("milestone").trim();
        if (!text) return;
        const saved = changeState(() => {
            state.milestones.unshift({ id: newId(), date: dateKey(), text });
        });
        if (saved) form.reset();
    });

    on("clear-data", "click", () => {
        clearData();
    });

    on("settings-clear-data", "click", () => {
        clearData();
    });

    on("export-data", "click", () => {
        if (storageIssue) {
            setStatus("Couldn't export because the saved data could not be read. Clear data to start fresh.", true);
            return;
        }
        let downloadUrl;
        try {
            const file = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
            downloadUrl = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `bloom-data-${dateKey()}.json`;
            link.click();
            const objectUrl = downloadUrl;
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            downloadUrl = null;
            setStatus("Your data export has been downloaded.");
        } catch (error) {
            setStatus("Couldn't export your data. Check your browser settings and try again.", true);
            console.error("Bloom could not export saved data.", error);
        } finally {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        }
    });

    function clearData() {
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
    }

    loadState();
    refreshDate();
    setInterval(refreshDate, 60000);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) refreshDate();
    });
    window.addEventListener("storage", event => {
        if (event.key !== storageKey && event.key !== null) return;
        loadState();
        if (!storageIssue) setStatus("Saved on this device.");
        render();
    });
})();
