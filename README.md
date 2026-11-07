# 🌸 Welcome to Bloom

Bloom is a privacy-focused platform designed to help individuals manage, track, and document their gender-affirming transition journey in a safe, secure, and supportive environment.

Transitioning can involve appointments, medications, emotional changes, physical milestones, and personal reflection. Bloom aims to simplify that process by providing the tools needed to stay organized while ensuring that users maintain complete control over their data and privacy.

Our goal is to create a free, accessible, and inclusive application that empowers users throughout every stage of their journey.

## 🎯 Mission

Bloom was created with a simple mission:

To provide a safe, free, and private platform that supports individuals throughout their gender-affirming journey while giving them complete ownership of their personal information.

Privacy, accessibility, and community support are at the core of everything Bloom is built around.

## ✨ Features

The initial release focuses on creating a strong and sustainable foundation that can grow over time.

### 1. Transition Tracking

Track important aspects of your journey in one place.

#### 📅 Appointment Management

- Schedule and organize medical appointments
- Keep track of upcoming consultations
- Store notes and outcomes from appointments
- Set reminders for future visits

#### 💊 Medication Tracking

- Record medications and dosages
- Track when medications were taken
- Monitor adherence over time
- View medication history

#### 📈 Progress & Symptom Tracking

- Log physical and emotional changes
- Record symptoms and side effects
- Track milestones and achievements
- Build a timeline of your transition journey

### 2. Personal Journal

A private space to document your experiences.

Features may include:

- Daily journal entries
- Mood tracking
- Personal reflections
- Goal setting
- Milestone documentation

Your journal helps create a meaningful record of your journey while allowing you to reflect on your growth and progress over time.

### 3. Resources & Support Networks

Finding reliable information can be difficult. Bloom aims to provide access to:

- Educational resources
- Transition-related guides
- Mental health resources
- Crisis support contacts
- LGBTQ+ organizations and communities
- Local and online support networks

## 🔒 Privacy & Security

Privacy is one of Bloom's highest priorities.

Bloom is being developed with the principle that:

- Users own their data
- Personal information should remain private
- No data is shared without explicit consent
- Security and confidentiality come first
- Users maintain control over what they store and share

Our commitment is to create an environment where users can confidently manage their journey without fear of unnecessary exposure or misuse of personal information.

## 🚀 Future Plans

While the current focus is on establishing a solid foundation, future updates may include:

- Secure cloud backups
- Data export options
- Advanced analytics and progress insights
- Photo timeline tracking
- Goal and milestone achievements
- Provider and care team management
- Community resource directories
- Mobile applications
- Accessibility improvements
- Customizable dashboards

As Bloom grows, the goal is to continually expand features based on user needs while maintaining simplicity, privacy, and long-term sustainability.

## ❤️ Why Bloom?

Transition journeys are deeply personal, and many existing tools are either too general, overly complicated, or lack a strong focus on privacy.

Bloom aims to be different by providing a dedicated space built specifically for people undergoing gender-affirming transitions, offering the tools needed to stay organized, informed, and supported throughout the entire process.

## 🌱 Status

Bloom is currently in active development.

The current objective is to establish a reliable core experience centered around transition tracking, journaling, and access to support resources before expanding into more advanced functionality.

## Current app prototype

The initial Flask page provides a private dashboard for a daily mood check-in, medication reminders, appointments, journal reflections, and personal milestones. These entries are stored in the browser's local storage on the current device; they are not sent to the Flask server or synced between devices.

Browser local storage is not encrypted by Bloom. Avoid using this prototype on a shared device for information you need to keep confidential, and use **Clear my data** to remove Bloom entries from the current browser.

Each tool shows its saved tracking history: daily moods, medication check-ins, past appointments, journal entries, and milestones. Only the latest mood for each day is kept. Medication history records days marked as taken; unchecking a day or removing the medication removes those records. Removing an appointment, journal entry, or milestone also removes it from its history. Milestones created before dates were added appear as "Date not recorded."

Entries and their history stay in the same browser storage and are removed together by **Clear data**. They are not encrypted, synced, or kept in a separate activity log. If browser storage is unavailable or full, Bloom reports the error and does not treat the attempted change as saved.
