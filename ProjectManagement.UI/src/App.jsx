import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('token')),
  )

  const [projects, setProjects] = useState([])
  const [projectMessage, setProjectMessage] = useState('')
  const [tasks, setTasks] = useState([])
  const [taskMessage, setTaskMessage] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [timeLogResult, setTimeLogResult] = useState(null)
  const [timeLogMessage, setTimeLogMessage] = useState('')
  const [isTimeLogLoading, setIsTimeLogLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    const token = localStorage.getItem('token')

    async function getProjects() {
      try {
        const response = await fetch('http://localhost:5050/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setProjectMessage(data.message || 'Projeler alınamadı.')
          return
        }

        setProjects(data)
        setProjectMessage('')
      } catch {
        setProjectMessage('Backend sunucusuna bağlanılamadı.')
      }
    }

    async function getTasks() {
      try {
        const response = await fetch('http://localhost:5050/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setTaskMessage(data.message || 'Görevler alınamadı.')
          return
        }

        setTasks(data)
        setTaskMessage('')
      } catch {
        setTaskMessage('Backend sunucusuna bağlanılamadı.')
      }
    }

    getProjects()
    getTasks()
  }, [isLoggedIn])

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Giriş işlemi başarısız.')
        return
      }

      localStorage.setItem('token', data.token)
      setActiveSection('')
      setIsLoggedIn(true)
    } catch {
      setMessage('Backend sunucusuna bağlanılamadı.')
    } finally {
      setIsLoading(false)
    }
  }

  async function getTimeLogs() {
    if (!selectedTaskId) {
      setTimeLogMessage('Önce bir görev seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setTimeLogMessage('')
    setIsTimeLogLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${selectedTaskId}/time-logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTimeLogResult(null)
        setTimeLogMessage(data.message || 'Zaman kayıtları alınamadı.')
        return
      }

      setTimeLogResult(data)
    } catch {
      setTimeLogResult(null)
      setTimeLogMessage('Backend sunucusuna bağlanılamadı.')
    } finally {
      setIsTimeLogLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setActiveSection('')
    setProjects([])
    setTasks([])
    setSelectedTaskId('')
    setTimeLogResult(null)
    setTimeLogMessage('')
    setEmail('')
    setPassword('')
    setMessage('')
  }

  function toggleSection(sectionName) {
    setActiveSection((currentSection) =>
      currentSection === sectionName ? '' : sectionName,
    )
  }

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Proje Yönetim Sistemi</h1>

          <button type="button" onClick={handleLogout}>
          Çıkış Yap
          </button>
        </header>

        <main className="dashboard-content">
          <h2>Ana Sayfa</h2>
          <p>Sisteme başarıyla giriş yaptınız.</p>

          <div className="menu-cards">
            <button
              className="menu-card"
              type="button"
              onClick={() => toggleSection('projects')}
            >
              <h3>
                {activeSection === 'projects' ? 'Projeleri Gizle' : 'Projeler'}
              </h3>
              <p>Erişebildiğiniz projeleri görüntüleyin.</p>
            </button>

            <button
              className="menu-card"
              type="button"
              onClick={() => toggleSection('tasks')}
            >
              <h3>
                {activeSection === 'tasks' ? 'Görevleri Gizle' : 'Görevler'}
              </h3>
              <p>Görevlerinizi görüntüleyin ve yönetin.</p>
            </button>

            <button
              className="menu-card"
              type="button"
              onClick={() => toggleSection('timeLogs')}
            >
              <h3>
                {activeSection === 'timeLogs'
                  ? 'Zaman Kayıtlarını Gizle'
                  : 'Zaman Kayıtları'}
              </h3>
              <p>Görevlere eklenen çalışma sürelerini görüntüleyin.</p>
            </button>
          </div>

          {activeSection === 'projects' && (
            <section className="content-section">
              <h2>Projelerim</h2>

              {projectMessage && <p className="message">{projectMessage}</p>}

              {projects.length === 0 && !projectMessage && (
                <p>Görüntülenecek proje bulunamadı.</p>
              )}

              <div className="item-list">
                {projects.map((project) => (
                  <article className="item-card" key={project.id}>
                    <h3>{project.name}</h3>
                    <p>
                      {project.description || 'Proje açıklaması bulunmuyor.'}
                    </p>
                    <p>
                      <strong>Durum:</strong> {project.status}
                    </p>
                    <p>
                      <strong>Başlangıç:</strong>{' '}
                      {new Date(project.startDate).toLocaleDateString('tr-TR')}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="content-section">
              <h2>Görevlerim</h2>

              {taskMessage && <p className="message">{taskMessage}</p>}

              {tasks.length === 0 && !taskMessage && (
                <p>Görüntülenecek görev bulunamadı.</p>
              )}

              <div className="item-list">
                {tasks.map((task) => (
                  <article className="item-card" key={task.id}>
                    <h3>{task.title}</h3>
                    <p>{task.description || 'Görev açıklaması bulunmuyor.'}</p>
                    <p>
                      <strong>Durum:</strong> {task.status}
                    </p>
                    <p>
                      <strong>Öncelik:</strong> {task.priority}
                    </p>
                    <p>
                      <strong>Proje ID:</strong> {task.projectId}
                    </p>
                    {task.dueDate && (
                      <p>
                        <strong>Teslim tarihi:</strong>{' '}
                        {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'timeLogs' && (
            <section className="content-section">
              <h2>Zaman Kayıtları</h2>

              <div className="time-log-controls">
                <label htmlFor="task-select">Görev seçin</label>

                <select
                  id="task-select"
                  value={selectedTaskId}
                  onChange={(event) => {
                    setSelectedTaskId(event.target.value)
                    setTimeLogResult(null)
                    setTimeLogMessage('')
                  }}
                >
                  <option value="">Görev seçiniz</option>

                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={getTimeLogs}
                  disabled={isTimeLogLoading}
                >
                  {isTimeLogLoading ? 'Yükleniyor...' : 'Kayıtları Göster'}
                </button>
              </div>

              {timeLogMessage && <p className="message">{timeLogMessage}</p>}

              {timeLogResult && (
                <>
                  <p className="total-hours">
                    <strong>Toplam çalışma süresi:</strong>{' '}
                    {timeLogResult.totalHours} saat
                  </p>

                  {timeLogResult.timeLogs.length === 0 ? (
                    <p>Bu göreve ait zaman kaydı bulunamadı.</p>
                  ) : (
                    <div className="item-list">
                      {timeLogResult.timeLogs.map((timeLog) => (
                        <article className="item-card" key={timeLog.id}>
                          <h3>{timeLog.hours} saat</h3>
                          <p>
                            {timeLog.description || 'Açıklama bulunmuyor.'}
                          </p>
                          <p>
                            <strong>Çalışma tarihi:</strong>{' '}
                            {new Date(timeLog.workDate).toLocaleDateString(
                              'tr-TR',
                            )}
                          </p>
                          <p>
                            <strong>Kullanıcı ID:</strong> {timeLog.userId}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Proje Yönetim Sistemi</h1>
        <p>Hesabınıza giriş yapın</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-posta</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta adresiniz"
            required
          />

          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Şifreniz"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <button className="register-button" type="button">
          Kayıt Ol
        </button>
      </div>
    </div>
  )
}

export default App
