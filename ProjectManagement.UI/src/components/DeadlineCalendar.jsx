import { useMemo, useState } from 'react'
import './DeadlineCalendar.css'

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

const holidays2026 = [
  { date: '2026-01-01', title: 'Yılbaşı' },
  { date: '2026-03-19', title: 'Ramazan Bayramı Arefesi (yarım gün)' },
  { date: '2026-03-20', title: 'Ramazan Bayramı 1. Gün' },
  { date: '2026-03-21', title: 'Ramazan Bayramı 2. Gün' },
  { date: '2026-03-22', title: 'Ramazan Bayramı 3. Gün' },
  { date: '2026-04-23', title: 'Ulusal Egemenlik ve Çocuk Bayramı' },
  { date: '2026-05-01', title: 'Emek ve Dayanışma Günü' },
  { date: '2026-05-19', title: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı' },
  { date: '2026-05-26', title: 'Kurban Bayramı Arefesi (yarım gün)' },
  { date: '2026-05-27', title: 'Kurban Bayramı 1. Gün' },
  { date: '2026-05-28', title: 'Kurban Bayramı 2. Gün' },
  { date: '2026-05-29', title: 'Kurban Bayramı 3. Gün' },
  { date: '2026-05-30', title: 'Kurban Bayramı 4. Gün' },
  { date: '2026-07-15', title: 'Demokrasi ve Millî Birlik Günü' },
  { date: '2026-08-30', title: 'Zafer Bayramı' },
  { date: '2026-10-28', title: 'Cumhuriyet Bayramı (yarım gün)' },
  { date: '2026-10-29', title: 'Cumhuriyet Bayramı' },
]

function getDateKey(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function DeadlineCalendar({ tasks, projects }) {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const deadlines = useMemo(() => {
    const taskDeadlines = tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: `task-${task.id}`,
        date: task.dueDate,
        dateKey: getDateKey(task.dueDate),
        title: task.title,
        type: 'task',
        label: 'Görev',
      }))

    const projectDeadlines = projects
      .filter((project) => project.endDate)
      .map((project) => ({
        id: `project-${project.id}`,
        date: project.endDate,
        dateKey: getDateKey(project.endDate),
        title: project.name,
        type: 'project',
        label: 'Proje',
      }))

    const holidays = holidays2026.map((holiday, index) => ({
      id: `holiday-${index}`,
      date: holiday.date,
      dateKey: holiday.date,
      title: holiday.title,
      type: 'holiday',
      label: 'Tatil',
    }))

    return [...taskDeadlines, ...projectDeadlines, ...holidays]
      .filter((deadline) => deadline.dateKey)
      .sort((first, second) => new Date(first.date) - new Date(second.date))
  }, [projects, tasks])

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7
  const calendarCells = [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, index) => index + 1),
  ]

  const monthDeadlines = deadlines.filter((deadline) => {
    const date = new Date(deadline.date)
    return date.getFullYear() === year && date.getMonth() === month
  })

  function changeMonth(amount) {
    setVisibleMonth(new Date(year, month + amount, 1))
  }

  return (
    <section className="deadline-panel">
      <div className="deadline-calendar">
        <div className="calendar-header">
          <div>
            <span>Takvim</span>
            <h3>
              {visibleMonth.toLocaleDateString('tr-TR', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
          </div>
          <div className="calendar-navigation">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Önceki ay">
              ‹
            </button>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Sonraki ay">
              ›
            </button>
          </div>
        </div>

        <div className="calendar-grid calendar-weekdays">
          {weekDays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid calendar-days">
          {calendarCells.map((day, index) => {
            if (!day) {
              return <span className="calendar-empty" key={`empty-${index}`} />
            }

            const dateKey = getDateKey(new Date(year, month, day))
            const dayDeadlines = deadlines.filter(
              (deadline) => deadline.dateKey === dateKey,
            )
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()

            return (
              <div
                className={`calendar-day ${isToday ? 'today' : ''}`}
                key={dateKey}
                title={dayDeadlines.map((deadline) => deadline.title).join(', ')}
              >
                <span>{day}</span>
                {dayDeadlines.length > 0 && (
                  <div className="deadline-dots">
                    {dayDeadlines.slice(0, 3).map((deadline) => (
                      <i className={deadline.type} key={deadline.id} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="task" /> Görev</span>
          <span><i className="project" /> Proje</span>
          <span><i className="holiday" /> Resmî tatil</span>
        </div>
      </div>

      <aside className="deadline-list">
        <div className="deadline-list-heading">
          <span>Bu ay</span>
          <strong>{monthDeadlines.length} takvim kaydı</strong>
        </div>

        {monthDeadlines.length === 0 ? (
          <p className="no-deadline">Bu ay için belirlenmiş bir takvim kaydı yok.</p>
        ) : (
          monthDeadlines.map((deadline) => (
            <article className="deadline-item" key={deadline.id}>
              <span className={`deadline-type ${deadline.type}`}>
                {deadline.label}
              </span>
              <div>
                <strong>{deadline.title}</strong>
                <small>
                  {new Date(deadline.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </small>
              </div>
            </article>
          ))
        )}
      </aside>
    </section>
  )
}

export default DeadlineCalendar
