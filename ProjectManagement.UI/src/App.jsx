import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'

const taskStatusLabels = {
  0: 'Yapılacak',
  1: 'Devam Ediyor',
  2: 'İncelemede',
  3: 'Tamamlandı',
  ToDo: 'Yapılacak',
  InProgress: 'Devam Ediyor',
  InReview: 'İncelemede',
  Done: 'Tamamlandı',
}

const taskPriorityLabels = {
  0: 'Düşük',
  1: 'Orta',
  2: 'Yüksek',
  3: 'Kritik',
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Critical: 'Kritik',
}

const projectStatusLabels = {
  0: 'Planlama',
  1: 'Aktif',
  2: 'Beklemede',
  3: 'Tamamlandı',
  4: 'İptal Edildi',
  Planning: 'Planlama',
  Active: 'Aktif',
  OnHold: 'Beklemede',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
}

function getTaskStatusLabel(status) {
  return taskStatusLabels[status] ?? status
}

function getTaskPriorityLabel(priority) {
  return taskPriorityLabels[priority] ?? priority
}

function getProjectStatusLabel(status) {
  return projectStatusLabels[status] ?? status
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getTaskStatusClass(status) {
  const value = typeof status === 'number' ? status : { ToDo: 0, InProgress: 1, InReview: 2, Done: 3 }[status]
  return `status-badge task-status-${value}`
}

function getPriorityClass(priority) {
  const value = typeof priority === 'number' ? priority : { Low: 0, Medium: 1, High: 2, Critical: 3 }[priority]
  return `status-badge priority-${value}`
}

function NavigationIcon({ name }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    projects: <><path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" /></>,
    tasks: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 9 2 2 4-4M8 15h8" /></>,
    members: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    comments: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></>,
    timeLogs: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 8h4M19 6v4" /></>,
  }

  return (
    <span className="menu-card-icon" aria-hidden="true">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  )
}

function getHistoryValue(changeType, value, getUserName) {
  if (!value) {
    return 'Boş'
  }

  if (changeType === 'StatusChanged') {
    return getTaskStatusLabel(value)
  }

  if (changeType === 'PriorityChanged') {
    return getTaskPriorityLabel(value)
  }

  if (changeType === 'AssignedUserChanged') {
    return getUserName(value)
  }

  return value
}

function getUserFromToken(token) {
  if (!token) {
    return null
  }

  try {
    const tokenPayload = token.split('.')[1]
    const base64 = tokenPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(tokenPayload.length / 4) * 4, '=')
    const payload = JSON.parse(atob(base64))

    return {
      id: payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
      email:
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
      role: payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ],
    }
  } catch {
    return null
  }
}

function App() {

  const navigate = useNavigate()
  const location = useLocation()

  const sectionRoutes = {
    projects: '/projects',
    tasks: '/tasks',
    members: '/members',
    timeLogs: '/time-logs',
    comments: '/comments',
    users: '/users',
  }

  const routeSections = {
    '/projects': 'projects',
    '/tasks': 'tasks',
    '/members': 'members',
    '/time-logs': 'timeLogs',
    '/comments': 'comments',
    '/users': 'users',
  }

  const activeSection = routeSections[location.pathname] || ''

  const pageTitles = {
    projects: 'Projeler',
    tasks: 'Görevler',
    members: 'Proje Üyeleri',
    timeLogs: 'Zaman Kayıtları',
    comments: 'Yorumlar',
    users: 'Kullanıcı Yönetimi',
  }
  
  const currentPageTitle = pageTitles[activeSection] || 'Genel Bakış'
  const todayText = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date())

  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('token')),
  )
  const [currentUser, setCurrentUser] = useState(() =>
    getUserFromToken(localStorage.getItem('token')),
  )

  const [projects, setProjects] = useState([])
  const [projectMessage, setProjectMessage] = useState('')
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectStartDate, setNewProjectStartDate] = useState('')
  const [newProjectEndDate, setNewProjectEndDate] = useState('')
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null)
  const [selectedProjectDetailMembers, setSelectedProjectDetailMembers] =
    useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [editProjectStartDate, setEditProjectStartDate] = useState('')
  const [editProjectEndDate, setEditProjectEndDate] = useState('')
  const [editProjectStatus, setEditProjectStatus] = useState('0')
  const [tasks, setTasks] = useState([])
  const [taskMessage, setTaskMessage] = useState('')
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null)
  const [taskActionMessage, setTaskActionMessage] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('1')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState('0')
  const [assignmentTask, setAssignmentTask] = useState(null)
  const [assignmentMembers, setAssignmentMembers] = useState([])
  const [assignmentUserId, setAssignmentUserId] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState('1')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskEstimatedHours, setEditTaskEstimatedHours] = useState('0')
  const [historyTask, setHistoryTask] = useState(null)
  const [taskHistories, setTaskHistories] = useState([])
  const [users, setUsers] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [showInactiveUsers, setShowInactiveUsers] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projectMembers, setProjectMembers] = useState([])
  const [availableProjectUsers, setAvailableProjectUsers] = useState([])
  const [membersByProject, setMembersByProject] = useState({})
  const [memberMessage, setMemberMessage] = useState('')
  const [isMemberLoading, setIsMemberLoading] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Member')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [timeLogResult, setTimeLogResult] = useState(null)
  const [timeLogMessage, setTimeLogMessage] = useState('')
  const [isTimeLogLoading, setIsTimeLogLoading] = useState(false)
  const [showTimeLogModal, setShowTimeLogModal] = useState(false)
  const [newTimeLogHours, setNewTimeLogHours] = useState('')
  const [newTimeLogDescription, setNewTimeLogDescription] = useState('')
  const [newTimeLogWorkDate, setNewTimeLogWorkDate] = useState('')
  const [commentTaskId, setCommentTaskId] = useState('')
  const [comments, setComments] = useState([])
  const [commentMessage, setCommentMessage] = useState('')
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

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

    async function getUsers() {
      if (currentUser?.role !== 'Admin') {
        return
      }

      try {
        const response = await fetch('http://localhost:5050/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setUserMessage(data.message || 'Kullanıcılar alınamadı.')
          return
        }

        setUsers(data)
        setUserMessage('')
      } catch {
        setUserMessage('Backend sunucusuna bağlanılamadı.')
      }
    }

    getProjects()
    getTasks()
    getUsers()
  }, [isLoggedIn, currentUser?.role])

  useEffect(() => {
    if (!isLoggedIn || tasks.length === 0) return

    const token = localStorage.getItem('token')
    const projectIds = [...new Set(tasks.map((task) => task.projectId))]

    async function loadTaskProjectMembers() {
      const results = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const response = await fetch(
              `http://localhost:5050/api/projects/${projectId}/members`,
              { headers: { Authorization: `Bearer ${token}` } },
            )

            if (!response.ok) return [projectId, []]
            return [projectId, await response.json()]
          } catch {
            return [projectId, []]
          }
        }),
      )

      setMembersByProject(Object.fromEntries(results))
    }

    loadTaskProjectMembers()
  }, [isLoggedIn, tasks])

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
      setCurrentUser(getUserFromToken(data.token))
      setIsLoggedIn(true)
      navigate('/dashboard')
    } catch {
      setMessage('Backend sunucusuna bağlanılamadı.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Kayıt işlemi başarısız.')
        return
      }

      setFirstName('')
      setLastName('')
      setPassword('')
      setIsRegisterMode(false)
      setMessage('Kayıt başarılı. Şimdi hesabınıza giriş yapabilirsiniz.')
    } catch {
      setMessage('Backend sunucusuna bağlanılamadı.')
    } finally {
      setIsLoading(false)
    }
  }

  async function getTimeLogs(taskId = selectedTaskId) {
    if (!taskId) {
      setTimeLogMessage('Önce bir görev seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setTimeLogMessage('')
    setIsTimeLogLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${taskId}/time-logs`,
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

  async function createTimeLog(event) {
    event.preventDefault()

    if (!selectedTaskId) {
      setTimeLogMessage('Önce bir görev seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setTimeLogMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${selectedTaskId}/time-logs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hours: Number(newTimeLogHours),
            description: newTimeLogDescription || null,
            workDate: new Date(
              `${newTimeLogWorkDate}T12:00:00`,
            ).toISOString(),
          }),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        setTimeLogMessage(data.message || 'Zaman kaydı eklenemedi.')
        return
      }

      setTimeLogResult((currentResult) => ({
        taskId: Number(selectedTaskId),
        totalHours: (currentResult?.totalHours || 0) + Number(data.hours),
        timeLogs: [...(currentResult?.timeLogs || []), data],
      }))
      setNewTimeLogHours('')
      setNewTimeLogDescription('')
      setNewTimeLogWorkDate('')
      setShowTimeLogModal(false)
      setTimeLogMessage('Zaman kaydı eklendi.')
    } catch {
      setTimeLogMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function getComments(taskId = commentTaskId) {
    if (!taskId) {
      setCommentMessage('Önce bir görev seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setCommentMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${taskId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const data = await response.json()

      if (!response.ok) {
        setCommentMessage(data.message || 'Yorumlar alınamadı.')
        return
      }

      setComments(data)
    } catch {
      setCommentMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function createComment(event) {
    event.preventDefault()
    const token = localStorage.getItem('token')
    setCommentMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${commentTaskId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newCommentContent }),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        setCommentMessage(data.message || 'Yorum eklenemedi.')
        return
      }

      setComments((currentComments) => [...currentComments, data])
      setNewCommentContent('')
      setShowCommentModal(false)
      setCommentMessage('Yorum eklendi.')
    } catch {
      setCommentMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function updateComment(event) {
    event.preventDefault()
    const token = localStorage.getItem('token')
    setCommentMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${commentTaskId}/comments/${editingCommentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editingCommentContent }),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        setCommentMessage(data.message || 'Yorum güncellenemedi.')
        return
      }

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === data.id ? data : comment,
        ),
      )
      setEditingCommentId(null)
      setEditingCommentContent('')
      setCommentMessage('Yorum güncellendi.')
    } catch {
      setCommentMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function deleteComment(comment) {
    if (!window.confirm('Bu yorumu silmek istiyor musunuz?')) return

    const token = localStorage.getItem('token')
    setCommentMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${commentTaskId}/comments/${comment.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) {
        const data = await response.json()
        setCommentMessage(data.message || 'Yorum silinemedi.')
        return
      }

      setComments((currentComments) =>
        currentComments.filter(
          (currentComment) => currentComment.id !== comment.id,
        ),
      )
      setCommentMessage('Yorum silindi.')
    } catch {
      setCommentMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function createProject(event) {
    event.preventDefault()

    const token = localStorage.getItem('token')
    setProjectMessage('')

    try {
      const response = await fetch('http://localhost:5050/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription || null,
          startDate: new Date(`${newProjectStartDate}T12:00:00`).toISOString(),
          endDate: newProjectEndDate
            ? new Date(`${newProjectEndDate}T12:00:00`).toISOString()
            : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setProjectMessage(data.message || 'Proje oluşturulamadı.')
        return
      }

      setProjects((currentProjects) => [...currentProjects, data])
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectStartDate('')
      setNewProjectEndDate('')
      setShowCreateProjectModal(false)
      setProjectMessage('Yeni proje oluşturuldu.')
    } catch {
      setProjectMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function getProjectDetail(projectId) {
    const token = localStorage.getItem('token')
    setProjectMessage('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [projectResponse, membersResponse] = await Promise.all([
        fetch(`http://localhost:5050/api/projects/${projectId}`, { headers }),
        fetch(`http://localhost:5050/api/projects/${projectId}/members`, {
          headers,
        }),
      ])
      const data = await projectResponse.json()

      if (!projectResponse.ok) {
        setProjectMessage(data.message || 'Proje detayı alınamadı.')
        return
      }

      setSelectedProjectDetail(data)
      setSelectedProjectDetailMembers(
        membersResponse.ok ? await membersResponse.json() : [],
      )
    } catch {
      setProjectMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  function openProjectEdit(project) {
    const statusValues = {
      Planning: 0,
      Active: 1,
      OnHold: 2,
      Completed: 3,
      Cancelled: 4,
    }

    setEditingProject(project)
    setEditProjectName(project.name)
    setEditProjectDescription(project.description || '')
    setEditProjectStartDate(project.startDate?.slice(0, 10) || '')
    setEditProjectEndDate(project.endDate?.slice(0, 10) || '')
    setEditProjectStatus(
      String(
        typeof project.status === 'number'
          ? project.status
          : statusValues[project.status] ?? 0,
      ),
    )
    setProjectMessage('')
  }

  async function updateProject(event) {
    event.preventDefault()
    if (!editingProject) return

    const token = localStorage.getItem('token')
    setProjectMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${editingProject.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editProjectName,
            description: editProjectDescription || null,
            startDate: new Date(
              `${editProjectStartDate}T12:00:00`,
            ).toISOString(),
            endDate: editProjectEndDate
              ? new Date(`${editProjectEndDate}T12:00:00`).toISOString()
              : null,
            status: Number(editProjectStatus),
          }),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        setProjectMessage(data.message || 'Proje güncellenemedi.')
        return
      }

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === data.id ? data : project,
        ),
      )
      setSelectedProjectDetail((detail) =>
        detail?.id === data.id ? data : detail,
      )
      setSelectedProjectDetail((detail) =>
        detail?.id === data.id ? data : detail,
      )
      setEditingProject(null)
      setProjectMessage('Proje bilgileri güncellendi.')
    } catch {
      setProjectMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function archiveProject(project) {
    const token = localStorage.getItem('token')
    setProjectMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${project.id}/archive`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json()

      if (!response.ok) {
        setProjectMessage(data.message || 'Proje arşivlenemedi.')
        return
      }

      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === data.id ? data : currentProject,
        ),
      )
      setProjectMessage('Proje arşivlendi.')
    } catch {
      setProjectMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`${project.name} projesini silmek istiyor musunuz?`)) {
      return
    }

    const token = localStorage.getItem('token')
    setProjectMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${project.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) {
        const data = await response.json()
        setProjectMessage(data.message || 'Proje silinemedi.')
        return
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (currentProject) => currentProject.id !== project.id,
        ),
      )
      setSelectedProjectDetail(null)
      setProjectMessage('Proje silindi.')
    } catch {
      setProjectMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function getTaskDetail(taskId) {
    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev detayı alınamadı.')
        return
      }

      setSelectedTaskDetail(data)
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function updateTaskStatus(taskId, status) {
    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${taskId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: Number(status) }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev durumu güncellenemedi.')
        return
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === data.id ? data : task)),
      )
      setSelectedTaskDetail((currentDetail) =>
        currentDetail?.id === data.id ? data : currentDetail,
      )
      setTaskActionMessage('Görev durumu güncellendi.')
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function createTask(event) {
    event.preventDefault()

    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch('http://localhost:5050/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || null,
          projectId: Number(newTaskProjectId),
          assignedToUserId: null,
          priority: Number(newTaskPriority),
          dueDate: newTaskDueDate
            ? new Date(`${newTaskDueDate}T12:00:00`).toISOString()
            : null,
          estimatedHours: Number(newTaskEstimatedHours),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev oluşturulamadı.')
        return
      }

      setTasks((currentTasks) => [...currentTasks, data])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskProjectId('')
      setNewTaskPriority('1')
      setNewTaskDueDate('')
      setNewTaskEstimatedHours('0')
      setShowCreateTaskModal(false)
      setTaskActionMessage('Yeni görev oluşturuldu.')
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function openTaskAssignment(task) {
    const token = localStorage.getItem('token')
    setTaskActionMessage('')
    setAssignmentTask(task)
    setAssignmentMembers([])
    setAssignmentUserId('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${task.projectId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Proje üyeleri alınamadı.')
        return
      }

      setAssignmentMembers(data)
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function assignTask(event) {
    event.preventDefault()

    if (!assignmentTask || !assignmentUserId) {
      return
    }

    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${assignmentTask.id}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assignedToUserId: Number(assignmentUserId),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev kullanıcıya atanamadı.')
        return
      }

      const assignedMember = assignmentMembers.find(
        (member) => member.userId === Number(assignmentUserId),
      )
      const updatedTask = {
        ...data,
        assignedToUserName:
          data.assignedToUserName || assignedMember?.userName || null,
        assignedToUserEmail:
          data.assignedToUserEmail || assignedMember?.email || null,
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      )
      setSelectedTaskDetail((currentDetail) =>
        currentDetail?.id === updatedTask.id ? updatedTask : currentDetail,
      )
      setAssignmentTask(null)
      setAssignmentMembers([])
      setAssignmentUserId('')
      setTaskActionMessage('Görev kullanıcıya atandı.')
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  function openTaskEdit(task) {
    const priorityValues = {
      Low: 0,
      Medium: 1,
      High: 2,
      Critical: 3,
    }

    setEditingTask(task)
    setEditTaskTitle(task.title)
    setEditTaskDescription(task.description || '')
    setEditTaskPriority(
      String(
        typeof task.priority === 'number'
          ? task.priority
          : priorityValues[task.priority] ?? 1,
      ),
    )
    setEditTaskDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setEditTaskEstimatedHours(String(task.estimatedHours ?? 0))
    setTaskActionMessage('')
  }

  async function updateTask(event) {
    event.preventDefault()

    if (!editingTask) {
      return
    }

    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${editingTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTaskTitle,
            description: editTaskDescription || null,
            priority: Number(editTaskPriority),
            dueDate: editTaskDueDate
              ? new Date(`${editTaskDueDate}T12:00:00`).toISOString()
              : null,
            estimatedHours: Number(editTaskEstimatedHours),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev güncellenemedi.')
        return
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === data.id ? data : task)),
      )
      setSelectedTaskDetail((currentDetail) =>
        currentDetail?.id === data.id ? data : currentDetail,
      )
      setEditingTask(null)
      setTaskActionMessage('Görev bilgileri güncellendi.')
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function getTaskHistories(task) {
    const token = localStorage.getItem('token')
    setTaskActionMessage('')
    setHistoryTask(task)
    setTaskHistories([])

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${task.id}/histories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setTaskActionMessage(data.message || 'Görev geçmişi alınamadı.')
        return
      }

      setTaskHistories(data)
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function deleteTask(task) {
    const shouldDelete = window.confirm(
      `${task.title} görevini silmek istiyor musunuz?`,
    )

    if (!shouldDelete) {
      return
    }

    const token = localStorage.getItem('token')
    setTaskActionMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${task.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const data = await response.json()
        setTaskActionMessage(data.message || 'Görev silinemedi.')
        return
      }

      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== task.id),
      )
      if (selectedTaskDetail?.id === task.id) {
        setSelectedTaskDetail(null)
      }
      if (historyTask?.id === task.id) {
        setHistoryTask(null)
        setTaskHistories([])
      }
      setTaskActionMessage('Görev silindi.')
    } catch {
      setTaskActionMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function updateUserStatus(user) {
    const token = localStorage.getItem('token')
    setUserMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !user.isActive,
          }),
        },
      )

      if (response.status === 401) {
        setUserMessage('Oturum süresi dolmuş. Tekrar giriş yapın.')
        return
      }

      if (response.status === 403) {
        setUserMessage('Bu işlem için yetkiniz yok.')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setUserMessage(data.message || 'Kullanıcı durumu değiştirilemedi.')
        return
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUserItem) =>
          currentUserItem.id === data.id ? data : currentUserItem,
        ),
      )
    } catch {
      setUserMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function updateUserRole(user, newRole) {
    const token = localStorage.getItem('token')
    const roleValues = {
      Admin: 0,
      ProjectManager: 1,
      TeamMember: 2,
    }

    setUserMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/users/${user.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: roleValues[newRole],
          }),
        },
      )

      if (response.status === 401) {
        setUserMessage('Oturum süresi dolmuş. Tekrar giriş yapın.')
        return
      }

      if (response.status === 403) {
        setUserMessage('Bu işlem için yetkiniz yok.')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setUserMessage(data.message || 'Kullanıcı rolü değiştirilemedi.')
        return
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUserItem) =>
          currentUserItem.id === data.id ? data : currentUserItem,
        ),
      )
    } catch {
      setUserMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function getProjectMembers(projectId = selectedProjectId) {
    if (!projectId) {
      setMemberMessage('Önce bir proje seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setMemberMessage('')
    setIsMemberLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${projectId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 401) {
        setMemberMessage('Oturum süresi dolmuş. Tekrar giriş yapın.')
        return
      }

      if (response.status === 403) {
        setMemberMessage('Bu projenin üyelerini görüntüleme yetkiniz yok.')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setMemberMessage(data.message || 'Proje üyeleri alınamadı.')
        return
      }

      setProjectMembers(data)

      const selectedMemberProject = projects.find(
        (project) => project.id === Number(projectId),
      )
      const canManageSelectedProject =
        currentUser?.role === 'Admin' ||
        Number(currentUser?.id) === selectedMemberProject?.ownerId

      if (canManageSelectedProject) {
        const availableUsersResponse = await fetch(
          `http://localhost:5050/api/projects/${projectId}/members/available-users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        const availableUsersData = await availableUsersResponse.json()

        if (!availableUsersResponse.ok) {
          setMemberMessage(
            availableUsersData.message || 'Eklenebilecek kullanıcılar alınamadı.',
          )
          return
        }

        setAvailableProjectUsers(availableUsersData)
      }
    } catch {
      setMemberMessage('Backend sunucusuna bağlanılamadı.')
    } finally {
      setIsMemberLoading(false)
    }
  }

  async function addProjectMember(event) {
    event.preventDefault()

    if (!selectedProjectId || !newMemberUserId) {
      setMemberMessage('Proje ve kullanıcı bilgilerini girin.')
      return
    }

    const roleValues = {
      Member: 0,
      Contributor: 1,
      Viewer: 2,
    }
    const token = localStorage.getItem('token')
    setMemberMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${selectedProjectId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(newMemberUserId),
            role: roleValues[newMemberRole],
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setMemberMessage(data.message || 'Proje üyesi eklenemedi.')
        return
      }

      setProjectMembers((currentMembers) => [...currentMembers, data])
      setAvailableProjectUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== Number(newMemberUserId)),
      )
      setNewMemberUserId('')
      setNewMemberRole('Member')
      setShowMemberModal(false)
      setMemberMessage('Üye projeye eklendi.')
    } catch {
      setMemberMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function updateProjectMemberRole(member, newRole) {
    const roleValues = {
      Member: 0,
      Contributor: 1,
      Viewer: 2,
    }
    const token = localStorage.getItem('token')
    setMemberMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${selectedProjectId}/members/${member.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: roleValues[newRole],
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setMemberMessage(data.message || 'Proje üyesinin rolü değiştirilemedi.')
        return
      }

      setProjectMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === data.id ? data : currentMember,
        ),
      )
    } catch {
      setMemberMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  async function removeProjectMember(member) {
    const memberName =
      member.userName || member.email || `Kullanıcı ${member.userId}`
    const shouldRemove = window.confirm(
      `${memberName} isimli üyeyi projeden çıkarmak istiyor musunuz?`,
    )

    if (!shouldRemove) {
      return
    }

    const token = localStorage.getItem('token')
    setMemberMessage('')

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${selectedProjectId}/members/${member.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const data = await response.json()
        setMemberMessage(data.message || 'Proje üyesi çıkarılamadı.')
        return
      }

      setProjectMembers((currentMembers) =>
        currentMembers.filter((currentMember) => currentMember.id !== member.id),
      )
      setMemberMessage('Üye projeden çıkarıldı.')
    } catch {
      setMemberMessage('Backend sunucusuna bağlanılamadı.')
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setCurrentUser(null)
    navigate('/')
    setProjects([])
    setNewProjectName('')
    setNewProjectDescription('')
    setNewProjectStartDate('')
    setNewProjectEndDate('')
    setSelectedProjectDetail(null)
    setSelectedProjectDetailMembers([])
    setEditingProject(null)
    setTasks([])
    setSelectedTaskDetail(null)
    setTaskActionMessage('')
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskProjectId('')
    setNewTaskPriority('1')
    setNewTaskDueDate('')
    setNewTaskEstimatedHours('0')
    setAssignmentTask(null)
    setAssignmentMembers([])
    setAssignmentUserId('')
    setEditingTask(null)
    setHistoryTask(null)
    setTaskHistories([])
    setUsers([])
    setShowInactiveUsers(false)
    setSelectedProjectId('')
    setProjectMembers([])
    setAvailableProjectUsers([])
    setMembersByProject({})
    setMemberMessage('')
    setNewMemberUserId('')
    setNewMemberRole('Member')
    setSelectedTaskId('')
    setTimeLogResult(null)
    setTimeLogMessage('')
    setNewTimeLogHours('')
    setNewTimeLogDescription('')
    setNewTimeLogWorkDate('')
    setCommentTaskId('')
    setComments([])
    setCommentMessage('')
    setNewCommentContent('')
    setEditingCommentId(null)
    setEditingCommentContent('')
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setIsRegisterMode(false)
    setMessage('')
  }

  function toggleSection(sectionName) {
    navigate(sectionRoutes[sectionName])
  }

  const selectedProject = projects.find(
    (project) => project.id === Number(selectedProjectId),
  )
  const canManageMembers =
    currentUser?.role === 'Admin' ||
    Number(currentUser?.id) === selectedProject?.ownerId

  function getProjectName(projectId) {
    const project = projects.find(
      (currentProject) => currentProject.id === Number(projectId),
    )

    return project?.name || `Proje ${projectId}`
  }

  function getUserNameById(userId) {
    const numericUserId = Number(userId)

    if (!Number.isFinite(numericUserId)) {
      return 'Atanmamış'
    }

    if (numericUserId === Number(currentUser?.id)) {
      return currentUser?.name || currentUser?.email || `Kullanıcı ${userId}`
    }

    const user = users.find((currentUserItem) => currentUserItem.id === numericUserId)

    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      return fullName || user.email || `Kullanıcı ${userId}`
    }

    const projectMember = Object.values(membersByProject)
      .flat()
      .find((member) => member.userId === numericUserId)

    return (
      projectMember?.userName ||
      projectMember?.email ||
      `Kullanıcı ${userId}`
    )
  }

  function isProjectOwner(projectId) {
    const project = projects.find(
      (currentProject) => currentProject.id === Number(projectId),
    )
    return Number(currentUser?.id) === project?.ownerId
  }

  function getCurrentMembership(projectId) {
    return (membersByProject[projectId] || []).find(
      (member) => member.userId === Number(currentUser?.id),
    )
  }

  function canManageTask(task) {
    return currentUser?.role === 'Admin' || isProjectOwner(task.projectId)
  }

  function canChangeTaskStatus(task) {
    const membership = getCurrentMembership(task.projectId)
    return (
      canManageTask(task) ||
      (task.assignedToUserId === Number(currentUser?.id) &&
        membership?.role !== 'Viewer' &&
        Boolean(membership))
    )
  }

  function canAddRecordToTask(taskId) {
    const task = tasks.find((currentTask) => currentTask.id === Number(taskId))
    if (!task) return false

    const membership = getCurrentMembership(task.projectId)
    return (
      canManageTask(task) ||
      (task.assignedToUserId === Number(currentUser?.id) &&
        membership?.role !== 'Viewer' &&
        Boolean(membership))
    )
  }

  function canCommentOnTask(taskId) {
    const task = tasks.find((currentTask) => currentTask.id === Number(taskId))
    if (!task) return false
    const membership = getCurrentMembership(task.projectId)

    return (
      canManageTask(task) ||
      (Boolean(membership) && membership.role !== 'Viewer')
    )
  }

  const overviewStatusGroups = [
    { key: 0, title: 'Yapılacak', className: 'todo' },
    { key: 1, title: 'Devam Ediyor', className: 'progress' },
    { key: 2, title: 'İncelemede', className: 'review' },
    { key: 3, title: 'Tamamlandı', className: 'done' },
  ]

  const getTaskStatusValue = (status) =>
    typeof status === 'number'
      ? status
      : { ToDo: 0, InProgress: 1, InReview: 2, Done: 3 }[status]

  const upcomingTasks = tasks
    .filter((task) => task.dueDate && getTaskStatusValue(task.status) !== 3)
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
    .slice(0, 4)

  const overviewUserName =
    currentUser?.name || currentUser?.email?.split('@')[0] || 'Kullanıcı'

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-brand">
            <span className="header-brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <div>
              <h1>Proje Yönetim Sistemi</h1>
              <small>Çalışma alanı</small>
            </div>
          </div>

          <div className="user-area">
            <span className="header-user-avatar" aria-hidden="true">
              {getInitials(currentUser?.name || currentUser?.email)}
            </span>
            <div className="user-info">
              <span>{currentUser?.email}</span>
              <strong>{currentUser?.role}</strong>
            </div>

            <button className="header-logout-button" type="button" onClick={handleLogout}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
              <span>Çıkış</span>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="page-heading">
            <div>
              <span>PROJE YÖNETİMİ</span>
              <h2>{currentPageTitle}</h2>
            </div>
            {location.pathname === '/dashboard' && (
              <p>Projelerinizi, görevlerinizi ve yaklaşan teslimleri takip edin.</p>
            )}
          </div>

          <div className="menu-cards">
          <span className="menu-section-label">MENÜ</span>
          <button
  className={`menu-card ${
    location.pathname === '/dashboard' ? 'active' : ''
  }`}
  type="button"
  onClick={() => navigate('/dashboard')}
>
  <NavigationIcon name="overview" />
  <h3>Genel Bakış</h3>
  <p>Dashboard sayfasına dönün.</p>
</button>

            <button
              className={`menu-card ${activeSection === 'projects' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('projects')}
            >
              <NavigationIcon name="projects" />
              <h3>Projeler</h3>
              <p>Erişebildiğiniz projeleri görüntüleyin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'tasks' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('tasks')}
            >
              <NavigationIcon name="tasks" />
              <h3>Görevler</h3>
              <p>Görevlerinizi görüntüleyin ve yönetin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'members' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('members')}
            >
              <NavigationIcon name="members" />
              <h3>Proje Üyeleri</h3>
              <p>Projelerdeki aktif ekip üyelerini görüntüleyin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'comments' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('comments')}
            >
              <NavigationIcon name="comments" />
              <h3>Yorumlar</h3>
              <p>Görevlerdeki yorumları görüntüleyin ve yönetin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'timeLogs' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('timeLogs')}
            >
              <NavigationIcon name="timeLogs" />
              <h3>Zaman Kayıtları</h3>
              <p>Görevlere eklenen çalışma sürelerini görüntüleyin.</p>
            </button>

            {currentUser?.role === 'Admin' && (
              <button
                className={`menu-card ${activeSection === 'users' ? 'active' : ''}`}
                type="button"
                onClick={() => toggleSection('users')}
              >
                <NavigationIcon name="users" />
                <h3>Kullanıcı Yönetimi</h3>
                <p>Kullanıcıları ve sistem rollerini yönetin.</p>
              </button>
            )}

            <div className="navigation-date" aria-label={`Bugün ${todayText}`}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <span>{todayText}</span>
            </div>
          </div>

          {location.pathname === '/dashboard' && (
            <>
              <section className="workspace-overview">
                <div className="workspace-main">
                  <div className="workspace-welcome">
                    <div>
                      <span className="workspace-eyebrow">ÇALIŞMA ALANI</span>
                      <h2>Merhaba, {overviewUserName}</h2>
                      <p>Projelerinizdeki güncel işleri tek ekrandan takip edin.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/tasks')}>
                      Görevleri aç
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>

                  <div className="workspace-project-strip">
                    <div className="workspace-section-heading">
                      <div>
                        <span>AKTİF ÇALIŞMALAR</span>
                        <h3>Projeler</h3>
                      </div>
                      <button type="button" onClick={() => navigate('/projects')}>
                        Tümünü gör
                      </button>
                    </div>

                    <div className="workspace-project-list">
                      {projects.slice(0, 4).map((project, index) => {
                        const projectTasks = tasks.filter(
                          (task) => Number(task.projectId) === Number(project.id),
                        )

                        return (
                          <button
                            className={`workspace-project-item project-color-${index % 4}`}
                            key={project.id}
                            type="button"
                            onClick={() => navigate('/projects')}
                          >
                            <span className="workspace-project-icon" aria-hidden="true">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                              </svg>
                            </span>
                            <span className="workspace-project-copy">
                              <strong>{project.name}</strong>
                              <small>{projectTasks.length} görev</small>
                            </span>
                            <span className="workspace-project-arrow" aria-hidden="true">→</span>
                          </button>
                        )
                      })}

                      {projects.length === 0 && (
                        <p className="workspace-empty">Henüz erişebildiğiniz bir proje yok.</p>
                      )}
                    </div>
                  </div>

                  <div className="workspace-task-board">
                    <div className="workspace-section-heading">
                      <div>
                        <span>GÜNCEL DURUM</span>
                        <h3>Görev Akışı</h3>
                      </div>
                      <strong>{tasks.length} görev</strong>
                    </div>

                    <div className="workspace-task-columns">
                      {overviewStatusGroups.map((group) => {
                        const groupTasks = tasks.filter(
                          (task) => getTaskStatusValue(task.status) === group.key,
                        )

                        return (
                          <div className={`workspace-task-column ${group.className}`} key={group.key}>
                            <div className="workspace-column-title">
                              <span />
                              <strong>{group.title}</strong>
                              <b>{groupTasks.length}</b>
                            </div>

                            {groupTasks.slice(0, 3).map((task) => (
                              <button
                                className="workspace-task-preview"
                                key={task.id}
                                type="button"
                                onClick={() => navigate('/tasks')}
                              >
                                <strong>{task.title}</strong>
                                <small>{getProjectName(task.projectId)}</small>
                                <span>{getTaskPriorityLabel(task.priority)}</span>
                              </button>
                            ))}

                            {groupTasks.length === 0 && <small className="workspace-no-task">Görev yok</small>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <aside className="workspace-sidebar">
                  <div className="workspace-profile">
                    <span className="workspace-avatar">{getInitials(overviewUserName)}</span>
                    <strong>{overviewUserName}</strong>
                    <small>{currentUser?.role}</small>
                  </div>

                  <div className="workspace-quick-counts">
                    <div><strong>{projects.length}</strong><span>Proje</span></div>
                    <div><strong>{tasks.length}</strong><span>Görev</span></div>
                    <div>
                      <strong>{tasks.filter((task) => getTaskStatusValue(task.status) === 3).length}</strong>
                      <span>Tamamlandı</span>
                    </div>
                  </div>

                  <div className="workspace-plan">
                    <div className="workspace-section-heading">
                      <div>
                        <span>PLAN</span>
                        <h3>Yaklaşan Teslimler</h3>
                      </div>
                    </div>

                    {upcomingTasks.map((task, index) => (
                      <button
                        className={`workspace-plan-item plan-color-${index % 4}`}
                        key={task.id}
                        type="button"
                        onClick={() => navigate('/tasks')}
                      >
                        <span>{new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit' })}</span>
                        <div>
                          <strong>{task.title}</strong>
                          <small>{new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</small>
                        </div>
                      </button>
                    ))}

                    {upcomingTasks.length === 0 && (
                      <p className="workspace-empty">Yaklaşan bir teslim bulunmuyor.</p>
                    )}
                  </div>
                </aside>
              </section>
            </>
)}

          {activeSection === 'users' && currentUser?.role === 'Admin' && (
            <section className="content-section user-page-section">

              <div className="user-management-toolbar">
                <div className="user-management-intro">
                  <span className="user-management-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M19 8v6M22 11h-6" />
                    </svg>
                  </span>
                  <div>
                    <strong>Sistem Kullanıcıları</strong>
                    <small>Rolleri ve hesap durumlarını yönetin</small>
                  </div>
                </div>

                <div className="user-statistics">
                  <span><strong>{users.filter((user) => user.isActive).length}</strong> Aktif</span>
                  <span><strong>{users.filter((user) => !user.isActive).length}</strong> Pasif</span>
                </div>

                <label className="user-filter-switch">
                  <input
                    type="checkbox"
                    checked={showInactiveUsers}
                    onChange={(event) => setShowInactiveUsers(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true"><i /></span>
                  Pasif kullanıcıları göster
                </label>
              </div>

              {userMessage && <p className="message">{userMessage}</p>}

              {users.length === 0 && !userMessage && (
                <p>Görüntülenecek kullanıcı bulunamadı.</p>
              )}

              <div className="user-list">
                {users
                  .filter((user) => showInactiveUsers || user.isActive)
                  .map((user) => (
                  <article className={`user-row ${!user.isActive ? 'passive' : ''}`} key={user.id}>
                    <span className="user-list-avatar">
                      {getInitials(`${user.firstName} ${user.lastName}`)}
                    </span>

                    <div className="user-list-identity">
                      <div>
                        <strong>{user.firstName} {user.lastName}</strong>
                        {Number(currentUser.id) === user.id && (
                          <small className="current-account-label">Mevcut hesap</small>
                        )}
                      </div>
                      <span>{user.email}</span>
                      {user.department && <small>{user.department}</small>}
                    </div>

                    <label className="user-role-field">
                      <span>Sistem rolü</span>
                      <select
                        value={user.role}
                        disabled={Number(currentUser.id) === user.id}
                        onChange={(event) =>
                          updateUserRole(user, event.target.value)
                        }
                      >
                        <option value="Admin">Admin</option>
                        <option value="ProjectManager">ProjectManager</option>
                        <option value="TeamMember">TeamMember</option>
                      </select>
                    </label>

                    <span className={`user-status-pill ${user.isActive ? 'active' : 'passive'}`}>
                      <i /> {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>

                    {Number(currentUser.id) === user.id ? (
                      <button className="user-status-button" type="button" disabled>
                        Değiştirilemez
                      </button>
                    ) : (
                      <button
                        className="user-status-button"
                        type="button"
                        onClick={() => updateUserStatus(user)}
                      >
                        {user.isActive ? 'Pasife Al' : 'Aktifleştir'}
                      </button>
                    )}
                  </article>
                  ))}
              </div>
            </section>
          )}

          {activeSection === 'members' && (
            <section className="content-section member-page-section">
              <div className="member-page-intro">
                <div className="member-page-intro-copy">
                  <span className="member-page-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M19 8v6M22 11h-6" />
                    </svg>
                  </span>
                  <div>
                    <span>EKİP ALANI</span>
                    <h2>Proje Üyeleri</h2>
                    <p>Projelerde çalışan kişileri ve proje içindeki rollerini yönetin.</p>
                  </div>
                </div>

                <div className="member-page-counts">
                  <div><strong>{projects.length}</strong><span>Proje</span></div>
                  <div><strong>{selectedProjectId ? projectMembers.length : '—'}</strong><span>Seçili Ekip</span></div>
                </div>
              </div>

              <div className="comment-section-heading">
                <div>
                  <h3>{selectedProjectId ? selectedProject?.name || 'Seçilen proje' : 'Proje seçin'}</h3>
                  <p>
                    {selectedProjectId
                      ? 'Projenin ekip üyelerini aşağıda yönetebilirsiniz.'
                      : 'Ekibini görmek için aşağıdaki projelerden birine tıklayın.'}
                  </p>
                </div>
                {selectedProjectId && (
                  <div className="comment-heading-actions">
                    <button
                      className="comment-back-button"
                      type="button"
                      onClick={() => {
                        setSelectedProjectId('')
                        setProjectMembers([])
                        setAvailableProjectUsers([])
                        setMemberMessage('')
                        setShowMemberModal(false)
                      }}
                    >
                      ← Başka Proje Seç
                    </button>
                    {canManageMembers && (
                      <button type="button" onClick={() => setShowMemberModal(true)}>
                        + Üye Ekle
                      </button>
                    )}
                  </div>
                )}
              </div>

              {projects.length === 0 ? (
                <p className="comment-empty-tasks">Görüntüleyebileceğiniz bir proje bulunmuyor.</p>
              ) : (
                <div className="member-project-list">
                  {(selectedProjectId
                    ? projects.filter((project) => project.id === Number(selectedProjectId))
                    : projects
                  ).map((project) => (
                    <button
                      className={`member-project-row ${Number(selectedProjectId) === project.id ? 'selected' : ''}`}
                      type="button"
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(String(project.id))
                        setProjectMembers([])
                        setAvailableProjectUsers([])
                        setMemberMessage('')
                        setShowMemberModal(false)
                        getProjectMembers(project.id)
                      }}
                    >
                      <span className="project-list-icon" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
                        </svg>
                      </span>
                      <span className="project-list-name">
                        <strong>{project.name}</strong>
                        <small>Ekip üyelerini görüntüleyin</small>
                      </span>
                      <span className="status-badge project-status">{getProjectStatusLabel(project.status)}</span>
                    </button>
                  ))}
                </div>
              )}

              {isMemberLoading && <p className="message">Proje üyeleri yükleniyor...</p>}

              {memberMessage && <p className="message">{memberMessage}</p>}

              {selectedProjectId && canManageMembers && showMemberModal && (
                <form className="member-form member-modal-form" onSubmit={addProjectMember}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Ekip Yönetimi</span>
                      <h3>Projeye Üye Ekle</h3>
                    </div>
                    <button className="modal-close-button" type="button" onClick={() => setShowMemberModal(false)} aria-label="Pencereyi kapat">×</button>
                  </div>

                  <label htmlFor="new-member-user-id">Kullanıcı</label>
                  <select
                    id="new-member-user-id"
                    value={newMemberUserId}
                    onChange={(event) => setNewMemberUserId(event.target.value)}
                    required
                  >
                    <option value="">Kullanıcı seçiniz</option>
                    {availableProjectUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.email}
                      </option>
                    ))}
                  </select>

                  {availableProjectUsers.length === 0 && (
                    <p>Bu projeye eklenebilecek aktif kullanıcı bulunmuyor.</p>
                  )}

                  <label htmlFor="new-member-role">Proje rolü</label>
                  <select
                    id="new-member-role"
                    value={newMemberRole}
                    onChange={(event) => setNewMemberRole(event.target.value)}
                  >
                    <option value="Member">Member</option>
                    <option value="Contributor">Contributor</option>
                    <option value="Viewer">Viewer</option>
                  </select>

                  <button type="submit" disabled={!newMemberUserId}>
                    Üye Ekle
                  </button>
                </form>
              )}

              {selectedProjectId &&
                projectMembers.length === 0 &&
                !memberMessage &&
                !isMemberLoading && <p>Bu projede aktif üye bulunamadı.</p>}

              <div className="member-list">
                {projectMembers.map((member) => (
                  <article className="member-row" key={member.id}>
                    <span className="member-avatar">{getInitials(member.userName || member.email)}</span>
                    <div className="member-identity">
                      <strong>{member.userName || `Kullanıcı ${member.userId}`}</strong>
                      <span>{member.email || 'E-posta bilgisi bulunmuyor.'}</span>
                    </div>

                    {canManageMembers && (
                      <label className="role-field">
                        <span>Proje rolü</span>
                        <select
                          value={member.role}
                          onChange={(event) =>
                            updateProjectMemberRole(member, event.target.value)
                          }
                        >
                          <option value="Member">Member</option>
                          <option value="Contributor">Contributor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </label>
                    )}
                    {!canManageMembers && <span className="member-role-label">{member.role}</span>}
                    <span className="member-joined-date">
                      {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                    </span>

                    {canManageMembers && (
                      <button
                        className="member-remove-button"
                        type="button"
                        onClick={() => removeProjectMember(member)}
                      >
                        Çıkar
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="content-section project-page-section">
              <div className="project-page-intro">
                <div className="project-page-intro-copy">
                  <span className="project-page-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                      <path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" />
                    </svg>
                  </span>
                  <div>
                    <span>PROJE ALANI</span>
                    <h2>Projelerim</h2>
                    <p>Erişebildiğiniz projeleri görüntüleyin ve yönetin.</p>
                  </div>
                </div>

                <div className="project-page-counts">
                  <div><strong>{projects.length}</strong><span>Toplam</span></div>
                  <div><strong>{projects.filter((project) => project.status === 1 || project.status === 'Active').length}</strong><span>Aktif</span></div>
                  <div><strong>{projects.filter((project) => project.status === 3 || project.status === 'Completed').length}</strong><span>Tamamlanan</span></div>
                </div>
              </div>

              {(currentUser?.role === 'Admin' ||
              currentUser?.role === 'ProjectManager') && (
              <button
              className="primary-action-button"
              type="button"
              onClick={() => setShowCreateProjectModal(true)}
              >
              + Yeni Proje
              </button>
          )}

              {projectMessage && <p className="message">{projectMessage}</p>}

              {(currentUser?.role === 'Admin' ||
                currentUser?.role === 'ProjectManager') && showCreateProjectModal && (
                  <form className="project-form modal-form" onSubmit={createProject}>
                  <div className="modal-header">
                  <h3>Yeni Proje Oluştur</h3>

                  <button
                  className="modal-close-button"
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  >
                  ×
                  </button>
                  </div>
                  <label htmlFor="new-project-name">Proje adı</label>
                  <input
                    id="new-project-name"
                    type="text"
                    maxLength="200"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                    required
                  />

                  <label htmlFor="new-project-description">Açıklama</label>
                  <textarea
                    id="new-project-description"
                    rows="3"
                    value={newProjectDescription}
                    onChange={(event) =>
                      setNewProjectDescription(event.target.value)
                    }
                  />

                  <label htmlFor="new-project-start-date">
                    Başlangıç tarihi
                  </label>
                  <input
                    id="new-project-start-date"
                    type="date"
                    value={newProjectStartDate}
                    onChange={(event) =>
                      setNewProjectStartDate(event.target.value)
                    }
                    required
                  />

                  <label htmlFor="new-project-end-date">Bitiş tarihi</label>
                  <input
                    id="new-project-end-date"
                    type="date"
                    min={newProjectStartDate || undefined}
                    value={newProjectEndDate}
                    onChange={(event) =>
                      setNewProjectEndDate(event.target.value)
                    }
                  />

                  <button type="submit">Proje Oluştur</button>
                </form>
              )}

              {editingProject && (
                <form className="project-form modal-form" onSubmit={updateProject}>
                  <div className="task-detail-header">
                    <h3>Projeyi Düzenle</h3>
                    <button type="button" onClick={() => setEditingProject(null)}>
                      Kapat
                    </button>
                  </div>
                  <label htmlFor="edit-project-name">Proje adı</label>
                  <input id="edit-project-name" value={editProjectName} onChange={(event) => setEditProjectName(event.target.value)} required />
                  <label htmlFor="edit-project-description">Açıklama</label>
                  <textarea id="edit-project-description" rows="3" value={editProjectDescription} onChange={(event) => setEditProjectDescription(event.target.value)} />
                  <label htmlFor="edit-project-start">Başlangıç tarihi</label>
                  <input id="edit-project-start" type="date" value={editProjectStartDate} onChange={(event) => setEditProjectStartDate(event.target.value)} required />
                  <label htmlFor="edit-project-end">Bitiş tarihi</label>
                  <input id="edit-project-end" type="date" min={editProjectStartDate || undefined} value={editProjectEndDate} onChange={(event) => setEditProjectEndDate(event.target.value)} />
                  <label htmlFor="edit-project-status">Durum</label>
                  <select id="edit-project-status" value={editProjectStatus} onChange={(event) => setEditProjectStatus(event.target.value)}>
                    <option value="0">Planlama</option>
                    <option value="1">Aktif</option>
                    <option value="2">Beklemede</option>
                    <option value="3">Tamamlandı</option>
                    <option value="4">İptal Edildi</option>
                  </select>
                  <button type="submit">Değişiklikleri Kaydet</button>
                </form>
              )}

              {projects.length === 0 && !projectMessage && (
                <p>Görüntülenecek proje bulunamadı.</p>
              )}

              <div className="project-summary-list">
                {projects.map((project) => (
                  <button
                    className={`project-list-row project-row-status-${project.status}`}
                    type="button"
                    key={project.id}
                    onClick={() => getProjectDetail(project.id)}
                  >
                    <span className="project-list-icon" aria-hidden="true">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
                      </svg>
                    </span>

                    <span className="project-list-name">
                      <strong>{project.name}</strong>
                      <small>Proje detaylarını görüntüleyin</small>
                    </span>

                    <span className="status-badge project-status">
                      {getProjectStatusLabel(project.status)}
                    </span>

                    <span className="project-list-link">Detayı Aç →</span>
                  </button>
                ))}
              </div>

              {selectedProjectDetail && (
                <div className="task-detail project-detail-modal project-focus-modal">
                  <div className="project-detail-heading">
                    <div className="project-detail-title">
                      <span className="project-detail-icon" aria-hidden="true">
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
                        </svg>
                      </span>
                      <div>
                        <small>Proje Detayı</small>
                        <h3>{selectedProjectDetail.name}</h3>
                      </div>
                    </div>
                    <button
                      className="project-detail-close"
                      type="button"
                      onClick={() => {
                        setSelectedProjectDetail(null)
                        setSelectedProjectDetailMembers([])
                      }}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <div className="project-detail-status-row">
                    <span className="status-badge project-status">
                      {getProjectStatusLabel(selectedProjectDetail.status)}
                    </span>
                    <span
                      className={`archive-state ${
                        selectedProjectDetail.isArchived ? 'archived' : ''
                      }`}
                    >
                      {selectedProjectDetail.isArchived
                        ? 'Arşivlendi'
                        : 'Aktif Proje'}
                    </span>
                  </div>

                  <section className="project-description-box">
                    <span>Açıklama</span>
                    <p>
                      {selectedProjectDetail.description ||
                        'Bu proje için açıklama bulunmuyor.'}
                    </p>
                  </section>

                  <div className="project-info-grid">
                    <article>
                      <span>Başlangıç Tarihi</span>
                      <strong>
                        {new Date(
                          selectedProjectDetail.startDate,
                        ).toLocaleDateString('tr-TR')}
                      </strong>
                    </article>
                    <article>
                      <span>Bitiş Tarihi</span>
                      <strong>
                        {selectedProjectDetail.endDate
                          ? new Date(
                              selectedProjectDetail.endDate,
                            ).toLocaleDateString('tr-TR')
                          : 'Belirlenmedi'}
                      </strong>
                    </article>
                  </div>

                  <div className="project-team-heading">
                    <h4>Proje Ekibi</h4>
                    <span>{selectedProjectDetailMembers.length} aktif üye</span>
                  </div>

                  {selectedProjectDetailMembers.length === 0 ? (
                    <p className="project-empty-team">
                      Bu projede aktif ekip üyesi bulunmuyor.
                    </p>
                  ) : (
                    <div className="project-detail-members">
                      {selectedProjectDetailMembers.map((member) => (
                        <div key={member.id} className="project-detail-member">
                          <strong>
                            {member.userName || `Kullanıcı ${member.userId}`}
                          </strong>
                          <span>{member.email}</span>
                          <span className="member-role-label">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(currentUser?.role === 'Admin' ||
                    Number(currentUser?.id) === selectedProjectDetail.ownerId) && (
                    <div className="project-detail-actions">
                      <button
                        className="user-action-button"
                        type="button"
                        onClick={() => {
                          const projectToEdit = selectedProjectDetail
                          setSelectedProjectDetail(null)
                          setSelectedProjectDetailMembers([])
                          openProjectEdit(projectToEdit)
                        }}
                      >
                        Projeyi Düzenle
                      </button>

                      {!selectedProjectDetail.isArchived && (
                        <button
                          className="archive-button"
                          type="button"
                          onClick={() => archiveProject(selectedProjectDetail)}
                        >
                          Projeyi Arşivle
                        </button>
                      )}

                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => deleteProject(selectedProjectDetail)}
                      >
                        Projeyi Sil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="content-section task-page-section">
              <div className="task-page-intro">
                <div className="task-page-intro-copy">
                  <span className="task-page-icon" aria-hidden="true">
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="3" width="16" height="18" rx="3" />
                      <path d="m8 9 2 2 4-4M8 15h8" />
                    </svg>
                  </span>
                  <div>
                    <span>ÇALIŞMA LİSTESİ</span>
                    <h2>Görevlerim</h2>
                    <p>Görevlerin durumunu, önceliğini ve proje bilgisini takip edin.</p>
                  </div>
                </div>

                <div className="task-page-counts">
                  <div><strong>{tasks.length}</strong><span>Toplam</span></div>
                  <div><strong>{tasks.filter((task) => getTaskStatusValue(task.status) === 1).length}</strong><span>Devam Eden</span></div>
                  <div><strong>{tasks.filter((task) => getTaskStatusValue(task.status) === 3).length}</strong><span>Tamamlanan</span></div>
                </div>
              </div>

              {taskMessage && <p className="message">{taskMessage}</p>}
              {taskActionMessage && (
                <p className="message">{taskActionMessage}</p>
              )}

              {(currentUser?.role === 'Admin' ||
                projects.some(
                  (project) =>
                    project.ownerId === Number(currentUser?.id),
                )) && (
                <button
                  className="primary-action-button"
                  type="button"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  + Yeni Görev
                </button>
              )}

              {(currentUser?.role === 'Admin' ||
                projects.some(
                  (project) =>
                    project.ownerId === Number(currentUser?.id),
                )) && showCreateTaskModal && (
                <form className="task-form task-modal-form" onSubmit={createTask}>
                  <div className="modal-header">
                  <h3>Yeni Görev Oluştur</h3>
                    <button
                      className="modal-close-button"
                      type="button"
                      onClick={() => setShowCreateTaskModal(false)}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <label htmlFor="new-task-project">Proje</label>
                  <select
                    id="new-task-project"
                    value={newTaskProjectId}
                    onChange={(event) =>
                      setNewTaskProjectId(event.target.value)
                    }
                    required
                  >
                    <option value="">Proje seçiniz</option>
                    {projects.map((project) => (
                      (currentUser?.role === 'Admin' ||
                        Number(currentUser?.id) === project.ownerId) && (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      )
                    ))}
                  </select>

                  <label htmlFor="new-task-title">Görev başlığı</label>
                  <input
                    id="new-task-title"
                    type="text"
                    maxLength="200"
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    required
                  />

                  <label htmlFor="new-task-description">Açıklama</label>
                  <textarea
                    id="new-task-description"
                    rows="3"
                    value={newTaskDescription}
                    onChange={(event) =>
                      setNewTaskDescription(event.target.value)
                    }
                  />

                  <label htmlFor="new-task-priority">Öncelik</label>
                  <select
                    id="new-task-priority"
                    value={newTaskPriority}
                    onChange={(event) =>
                      setNewTaskPriority(event.target.value)
                    }
                  >
                    <option value="0">Düşük</option>
                    <option value="1">Orta</option>
                    <option value="2">Yüksek</option>
                    <option value="3">Kritik</option>
                  </select>

                  <label htmlFor="new-task-due-date">Teslim tarihi</label>
                  <input
                    id="new-task-due-date"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(event) => setNewTaskDueDate(event.target.value)}
                  />

                  <label htmlFor="new-task-hours">Tahmini süre (saat)</label>
                  <input
                    id="new-task-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTaskEstimatedHours}
                    onChange={(event) =>
                      setNewTaskEstimatedHours(event.target.value)
                    }
                    required
                  />

                  <button type="submit">Görev Oluştur</button>
                </form>
              )}

              {assignmentTask && (
                <form className="task-form task-modal-form" onSubmit={assignTask}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Görev Atama</span>
                      <h3>{assignmentTask.title}</h3>
                    </div>
                    <button
                      className="modal-close-button"
                      type="button"
                      onClick={() => setAssignmentTask(null)}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <p className="modal-description">
                    Bu görev için projedeki aktif üyelerden birini seçin.
                  </p>

                  <label htmlFor="assignment-user">Proje üyesi</label>
                  <select
                    id="assignment-user"
                    value={assignmentUserId}
                    onChange={(event) =>
                      setAssignmentUserId(event.target.value)
                    }
                    required
                  >
                    <option value="">Üye seçiniz</option>
                    {assignmentMembers.map((member) => (
                      <option key={member.id} value={member.userId}>
                        {member.userName || member.email || `Kullanıcı ${member.userId}`}
                      </option>
                    ))}
                  </select>

                  {assignmentMembers.length === 0 ? (
                    <p>Bu projede atanabilecek aktif üye bulunamadı.</p>
                  ) : (
                    <button type="submit">Görevi Ata</button>
                  )}
                </form>
              )}

              {editingTask && (
                <form className="task-form task-modal-form" onSubmit={updateTask}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Görev İşlemleri</span>
                      <h3>Görevi Düzenle</h3>
                    </div>
                    <button
                      className="modal-close-button"
                      type="button"
                      onClick={() => setEditingTask(null)}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <label htmlFor="edit-task-title">Görev başlığı</label>
                  <input
                    id="edit-task-title"
                    type="text"
                    maxLength="200"
                    value={editTaskTitle}
                    onChange={(event) => setEditTaskTitle(event.target.value)}
                    required
                  />

                  <label htmlFor="edit-task-description">Açıklama</label>
                  <textarea
                    id="edit-task-description"
                    rows="3"
                    value={editTaskDescription}
                    onChange={(event) =>
                      setEditTaskDescription(event.target.value)
                    }
                  />

                  <label htmlFor="edit-task-priority">Öncelik</label>
                  <select
                    id="edit-task-priority"
                    value={editTaskPriority}
                    onChange={(event) =>
                      setEditTaskPriority(event.target.value)
                    }
                  >
                    <option value="0">Düşük</option>
                    <option value="1">Orta</option>
                    <option value="2">Yüksek</option>
                    <option value="3">Kritik</option>
                  </select>

                  <label htmlFor="edit-task-due-date">Teslim tarihi</label>
                  <input
                    id="edit-task-due-date"
                    type="date"
                    value={editTaskDueDate}
                    onChange={(event) =>
                      setEditTaskDueDate(event.target.value)
                    }
                  />

                  <label htmlFor="edit-task-hours">Tahmini süre (saat)</label>
                  <input
                    id="edit-task-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editTaskEstimatedHours}
                    onChange={(event) =>
                      setEditTaskEstimatedHours(event.target.value)
                    }
                    required
                  />

                  <button type="submit">Değişiklikleri Kaydet</button>
                </form>
              )}

              {historyTask && (
                <div className="task-detail task-detail-modal history-modal">
                  <div className="project-detail-heading">
                    <div className="project-detail-title">
                      <span className="history-modal-icon" aria-hidden="true">
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 3-6.7" />
                          <path d="M3 4v5h5M12 7v5l3 2" />
                        </svg>
                      </span>
                      <div>
                        <small>Değişiklik Geçmişi</small>
                        <h3>{historyTask.title}</h3>
                      </div>
                    </div>
                    <button
                      className="project-detail-close"
                      type="button"
                      onClick={() => {
                        setHistoryTask(null)
                        setTaskHistories([])
                      }}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  {taskHistories.length === 0 ? (
                    <p>Bu görev için değişiklik kaydı bulunamadı.</p>
                  ) : (
                    <div className="history-list">
                      {taskHistories.map((history) => (
                        <article className="history-item" key={history.id}>
                          <span className="history-dot" aria-hidden="true" />
                          <div>
                            <strong>{history.description}</strong>
                            <span className="history-change">
                            {getHistoryValue(
                              history.changeType,
                              history.oldValue,
                              getUserNameById,
                            )}{' '}
                            →{' '}
                            {getHistoryValue(
                              history.changeType,
                              history.newValue,
                              getUserNameById,
                            )}
                            </span>
                            <small>
                              {history.changedByUserName} ·{' '}
                              {new Date(history.createdAt).toLocaleString('tr-TR')}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tasks.length === 0 && !taskMessage && (
                <p>Görüntülenecek görev bulunamadı.</p>
              )}

              <div className="task-summary-list">
                {tasks.map((task) => (
                  <button
                    className={`task-list-row task-row-status-${getTaskStatusValue(task.status)}`}
                    type="button"
                    key={task.id}
                    onClick={() => getTaskDetail(task.id)}
                  >
                    <span className="task-list-icon" aria-hidden="true">
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 11l2 2 4-4" />
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                      </svg>
                    </span>
                    <span className="task-list-name">
                      <strong>{task.title}</strong>
                      <small>{getProjectName(task.projectId)}</small>
                    </span>
                    <span className={getPriorityClass(task.priority)}>
                      {getTaskPriorityLabel(task.priority)}
                    </span>
                    <span className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                    </span>
                    <span className="task-list-link">Detayı Aç →</span>
                  </button>
                ))}
              </div>

              {selectedTaskDetail && (
                <div className="task-detail task-detail-modal task-focus-modal">
                  <div className="project-detail-heading">
                    <div className="project-detail-title">
                      <span className="task-list-icon" aria-hidden="true">
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l2 2 4-4" />
                          <rect x="4" y="4" width="16" height="16" rx="3" />
                        </svg>
                      </span>
                      <div>
                        <small>Görev Detayı</small>
                        <h3>{selectedTaskDetail.title}</h3>
                      </div>
                    </div>
                    <button
                      className="project-detail-close"
                      type="button"
                      onClick={() => setSelectedTaskDetail(null)}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <div className="project-detail-status-row">
                    <span className={getTaskStatusClass(selectedTaskDetail.status)}>
                      {getTaskStatusLabel(selectedTaskDetail.status)}
                    </span>
                    <span className={getPriorityClass(selectedTaskDetail.priority)}>
                      {getTaskPriorityLabel(selectedTaskDetail.priority)}
                    </span>
                  </div>

                  <section className="project-description-box">
                    <span>Açıklama</span>
                    <p>
                    {selectedTaskDetail.description || 'Açıklama bulunmuyor.'}
                    </p>
                  </section>

                  <div className="task-info-grid">
                    <article><span>Proje</span><strong>{getProjectName(selectedTaskDetail.projectId)}</strong></article>
                    <article><span>Atanan Kişi</span><strong>{selectedTaskDetail.assignedToUserName || 'Henüz atanmadı'}</strong></article>
                    <article><span>Tahmini Süre</span><strong>{selectedTaskDetail.estimatedHours ?? 0} saat</strong></article>
                    <article><span>Teslim Tarihi</span><strong>{selectedTaskDetail.dueDate ? new Date(selectedTaskDetail.dueDate).toLocaleDateString('tr-TR') : 'Belirlenmedi'}</strong></article>
                  </div>

                  {canChangeTaskStatus(selectedTaskDetail) && (
                    <label className="task-status-field">
                      Durumu değiştir
                      <select
                        value={typeof selectedTaskDetail.status === 'number' ? selectedTaskDetail.status : { ToDo: 0, InProgress: 1, InReview: 2, Done: 3 }[selectedTaskDetail.status]}
                        onChange={(event) => updateTaskStatus(selectedTaskDetail.id, event.target.value)}
                      >
                        <option value="0">Yapılacak</option>
                        <option value="1">Devam Ediyor</option>
                        <option value="2">İncelemede</option>
                        <option value="3">Tamamlandı</option>
                      </select>
                    </label>
                  )}

                  <div className="task-detail-actions">
                    <button className="user-action-button" type="button" onClick={() => { const task = selectedTaskDetail; setSelectedTaskDetail(null); getTaskHistories(task) }}>Geçmişi Göster</button>
                    {canManageTask(selectedTaskDetail) && (
                      <>
                        <button className="user-action-button" type="button" onClick={() => { const task = selectedTaskDetail; setSelectedTaskDetail(null); openTaskEdit(task) }}>Düzenle</button>
                        <button className="user-action-button" type="button" onClick={() => { const task = selectedTaskDetail; setSelectedTaskDetail(null); openTaskAssignment(task) }}>Görev Ata</button>
                        <button className="remove-button" type="button" onClick={() => deleteTask(selectedTaskDetail)}>Sil</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'timeLogs' && (
            <section className="content-section time-log-page-section">
              <div className="time-log-page-intro">
                <div className="time-log-page-intro-copy">
                  <span className="time-log-page-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <div>
                    <span>ÇALIŞMA TAKİBİ</span>
                    <h2>Zaman Kayıtları</h2>
                    <p>Görevlere harcanan süreleri ve çalışma açıklamalarını takip edin.</p>
                  </div>
                </div>

                <div className="time-log-page-counts">
                  <div><strong>{tasks.length}</strong><span>Görev</span></div>
                  <div><strong>{timeLogResult ? timeLogResult.totalHours : '—'}</strong><span>Toplam Saat</span></div>
                </div>
              </div>

              <div className="comment-section-heading">
                <div>
                  <h3>{selectedTaskId ? tasks.find((task) => task.id === Number(selectedTaskId))?.title || 'Seçilen görev' : 'Görev seçin'}</h3>
                  <p>
                    {selectedTaskId
                      ? 'Göreve ait çalışma kayıtlarını aşağıda görüntüleyebilirsiniz.'
                      : 'Zaman kayıtlarını görmek için aşağıdaki görevlerden birine tıklayın.'}
                  </p>
                </div>
                {selectedTaskId && (
                  <div className="comment-heading-actions">
                    <button
                      className="comment-back-button"
                      type="button"
                      onClick={() => {
                        setSelectedTaskId('')
                        setTimeLogResult(null)
                        setTimeLogMessage('')
                        setShowTimeLogModal(false)
                      }}
                    >
                      ← Başka Görev Seç
                    </button>
                    {canAddRecordToTask(selectedTaskId) && (
                      <button type="button" onClick={() => setShowTimeLogModal(true)}>
                        + Yeni Kayıt
                      </button>
                    )}
                  </div>
                )}
              </div>

              {tasks.length === 0 ? (
                <p className="comment-empty-tasks">
                  Zaman kayıtlarını görüntüleyebileceğiniz bir görev bulunmuyor.
                </p>
              ) : (
                <div className="comment-task-list">
                  {(selectedTaskId
                    ? tasks.filter((task) => task.id === Number(selectedTaskId))
                    : tasks
                  ).map((task) => (
                    <button
                      className={`comment-task-row ${
                        Number(selectedTaskId) === task.id ? 'selected' : ''
                      }`}
                      type="button"
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(String(task.id))
                        setTimeLogResult(null)
                        setTimeLogMessage('')
                        setShowTimeLogModal(false)
                        getTimeLogs(task.id)
                      }}
                    >
                      <span className="comment-task-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="8" />
                          <path d="M12 8v4l3 2" />
                        </svg>
                      </span>
                      <span>
                        <strong>{task.title}</strong>
                        <small>{getProjectName(task.projectId)}</small>
                      </span>
                      <span className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {isTimeLogLoading && (
                <p className="message">Zaman kayıtları yükleniyor...</p>
              )}

              {selectedTaskId && canAddRecordToTask(selectedTaskId) && showTimeLogModal && (
                <form className="task-form task-modal-form" onSubmit={createTimeLog}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Çalışma Takibi</span>
                      <h3>Zaman Kaydı Ekle</h3>
                    </div>
                    <button
                      className="modal-close-button"
                      type="button"
                      onClick={() => setShowTimeLogModal(false)}
                      aria-label="Pencereyi kapat"
                    >
                      ×
                    </button>
                  </div>

                  <p className="modal-description">
                    {tasks.find((task) => task.id === Number(selectedTaskId))?.title}
                  </p>

                  <label htmlFor="new-time-log-hours">Çalışma süresi</label>
                  <input
                    id="new-time-log-hours"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newTimeLogHours}
                    onChange={(event) =>
                      setNewTimeLogHours(event.target.value)
                    }
                    required
                  />

                  <label htmlFor="new-time-log-date">Çalışma tarihi</label>
                  <input
                    id="new-time-log-date"
                    type="date"
                    value={newTimeLogWorkDate}
                    onChange={(event) =>
                      setNewTimeLogWorkDate(event.target.value)
                    }
                    required
                  />

                  <label htmlFor="new-time-log-description">Açıklama</label>
                  <textarea
                    id="new-time-log-description"
                    rows="3"
                    value={newTimeLogDescription}
                    onChange={(event) =>
                      setNewTimeLogDescription(event.target.value)
                    }
                  />

                  <button type="submit">Zaman Kaydı Ekle</button>
                </form>
              )}

              {timeLogMessage && <p className="message">{timeLogMessage}</p>}

              {timeLogResult && (
                <>
                  <div className="time-log-summary">
                    <span className="time-log-summary-icon" aria-hidden="true">◷</span>
                    <div>
                      <small>Toplam Çalışma Süresi</small>
                      <strong>{timeLogResult.totalHours} saat</strong>
                    </div>
                    <p>
                      {tasks.find((task) => task.id === Number(selectedTaskId))?.title}
                    </p>
                  </div>

                  {timeLogResult.timeLogs.length === 0 ? (
                    <p>Bu göreve ait zaman kaydı bulunamadı.</p>
                  ) : (
                    <div className="time-log-list">
                      {timeLogResult.timeLogs.map((timeLog) => (
                        <article className="time-log-row" key={timeLog.id}>
                          <div className="time-log-date">
                            <strong>{new Date(timeLog.workDate).getDate()}</strong>
                            <span>{new Date(timeLog.workDate).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                          </div>
                          <div className="time-log-content">
                            <strong>{timeLog.userName || `Kullanıcı ${timeLog.userId}`}</strong>
                            <p>{timeLog.description || 'Açıklama bulunmuyor.'}</p>
                          </div>
                          <span className="time-log-hours">{timeLog.hours} saat</span>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {activeSection === 'comments' && (
            <section className="content-section comment-page-section">
              <div className="comment-page-intro">
                <div className="comment-page-intro-copy">
                  <span className="comment-page-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                      <path d="M8 9h8M8 13h5" />
                    </svg>
                  </span>
                  <div>
                    <span>GÖREV GÖRÜŞMELERİ</span>
                    <h2>Yorumlar</h2>
                    <p>Görevlerle ilgili görüşmeleri görüntüleyin ve ekip ile iletişim kurun.</p>
                  </div>
                </div>

                <div className="comment-page-counts">
                  <div><strong>{tasks.length}</strong><span>Görev</span></div>
                  <div><strong>{commentTaskId ? comments.length : '—'}</strong><span>Seçili Yorumlar</span></div>
                </div>
              </div>

              <div className="comment-section-heading">
                <div>
                  <h3>{commentTaskId ? tasks.find((task) => task.id === Number(commentTaskId))?.title || 'Seçilen görev' : 'Görev seçin'}</h3>
                  <p>
                    {commentTaskId
                      ? 'Göreve ait yorumları aşağıda görüntüleyebilirsiniz.'
                      : 'Yorumlarını görmek için aşağıdaki görevlerden birine tıklayın.'}
                  </p>
                </div>
                {commentTaskId && (
                  <div className="comment-heading-actions">
                    <button
                      className="comment-back-button"
                      type="button"
                      onClick={() => {
                        setCommentTaskId('')
                        setComments([])
                        setCommentMessage('')
                        setEditingCommentId(null)
                        setShowCommentModal(false)
                      }}
                    >
                      ← Başka Görev Seç
                    </button>
                    {canCommentOnTask(commentTaskId) && (
                      <button type="button" onClick={() => setShowCommentModal(true)}>
                        + Yeni Yorum
                      </button>
                    )}
                  </div>
                )}
              </div>

              {tasks.length === 0 ? (
                <p className="comment-empty-tasks">
                  Yorumlarını görüntüleyebileceğiniz bir görev bulunmuyor.
                </p>
              ) : (
                <div className="comment-task-list">
                  {(commentTaskId
                    ? tasks.filter((task) => task.id === Number(commentTaskId))
                    : tasks
                  ).map((task) => (
                    <button
                      className={`comment-task-row ${
                        Number(commentTaskId) === task.id ? 'selected' : ''
                      }`}
                      type="button"
                      key={task.id}
                      onClick={() => {
                        setCommentTaskId(String(task.id))
                        setEditingCommentId(null)
                        setShowCommentModal(false)
                        getComments(task.id)
                      }}
                    >
                      <span className="comment-task-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l2 2 4-4" />
                          <rect x="4" y="4" width="16" height="16" rx="3" />
                        </svg>
                      </span>
                      <span>
                        <strong>{task.title}</strong>
                        <small>{getProjectName(task.projectId)}</small>
                      </span>
                      <span className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {commentTaskId && canCommentOnTask(commentTaskId) && showCommentModal && (
                <form className="task-form task-modal-form" onSubmit={createComment}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Görev Görüşmesi</span>
                      <h3>Yeni Yorum</h3>
                    </div>
                    <button className="modal-close-button" type="button" onClick={() => setShowCommentModal(false)} aria-label="Pencereyi kapat">×</button>
                  </div>
                  <p className="modal-description">
                    {tasks.find((task) => task.id === Number(commentTaskId))?.title}
                  </p>
                  <label htmlFor="new-comment-content">Yorum</label>
                  <textarea
                    id="new-comment-content"
                    rows="3"
                    value={newCommentContent}
                    onChange={(event) =>
                      setNewCommentContent(event.target.value)
                    }
                    required
                  />
                  <button type="submit">Yorum Ekle</button>
                </form>
              )}

              {editingCommentId && (
                <form className="task-form task-modal-form" onSubmit={updateComment}>
                  <div className="modal-header">
                    <div>
                      <span className="modal-eyebrow">Yorum İşlemleri</span>
                      <h3>Yorumu Düzenle</h3>
                    </div>
                    <button className="modal-close-button" type="button" onClick={() => setEditingCommentId(null)} aria-label="Pencereyi kapat">×</button>
                  </div>
                  <textarea
                    rows="3"
                    value={editingCommentContent}
                    onChange={(event) =>
                      setEditingCommentContent(event.target.value)
                    }
                    required
                  />
                  <button type="submit">Yorumu Kaydet</button>
                </form>
              )}

              {commentMessage && <p className="message">{commentMessage}</p>}

              {commentTaskId && comments.length === 0 && !commentMessage && (
                <p>Bu göreve henüz yorum eklenmemiş.</p>
              )}

              <div className="comment-list">
                {comments.map((comment) => {
                  const canManageComment =
                    currentUser?.role === 'Admin' ||
                    Number(currentUser?.id) === comment.userId
                  const authorName =
                    Number(currentUser?.id) === comment.userId
                      ? 'Siz'
                      : comment.userName || comment.email || `Kullanıcı ${comment.userId}`

                  return (
                    <article className="comment-row" key={comment.id}>
                      <span className="comment-avatar">{getInitials(authorName)}</span>
                      <div className="comment-body">
                        <div className="comment-meta">
                          <strong>{authorName}</strong>
                          <span>{new Date(comment.createdAt).toLocaleString('tr-TR')}</span>
                          {comment.updatedAt && <small>Düzenlendi</small>}
                        </div>
                        <p>{comment.content}</p>
                        {canManageComment && (
                          <div className="comment-actions">
                            <button type="button" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content) }}>Düzenle</button>
                            <button className="comment-delete-button" type="button" onClick={() => deleteComment(comment)}>Sil</button>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
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
        <p>
          {isRegisterMode
            ? 'Yeni hesabınızı oluşturun'
            : 'Hesabınıza giriş yapın'}
        </p>

        <form onSubmit={isRegisterMode ? handleRegister : handleSubmit}>
          {isRegisterMode && (
            <>
              <label htmlFor="first-name">Ad</label>
              <input
                id="first-name"
                type="text"
                maxLength="50"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Adınız"
                required
              />

              <label htmlFor="last-name">Soyad</label>
              <input
                id="last-name"
                type="text"
                maxLength="50"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Soyadınız"
                required
              />
            </>
          )}

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
            {isLoading
              ? 'İşlem yapılıyor...'
              : isRegisterMode
                ? 'Kaydı Tamamla'
                : 'Giriş Yap'}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <button
          className="register-button"
          type="button"
          onClick={() => {
            setIsRegisterMode((currentMode) => !currentMode)
            setMessage('')
          }}
        >
          {isRegisterMode ? 'Giriş Ekranına Dön' : 'Kayıt Ol'}
        </button>
      </div>
    </div>
  )
}

export default App
