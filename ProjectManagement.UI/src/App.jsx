import { useEffect, useState } from 'react'
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

function getTaskStatusClass(status) {
  const value = typeof status === 'number' ? status : { ToDo: 0, InProgress: 1, InReview: 2, Done: 3 }[status]
  return `status-badge task-status-${value}`
}

function getPriorityClass(priority) {
  const value = typeof priority === 'number' ? priority : { Low: 0, Medium: 1, High: 2, Critical: 3 }[priority]
  return `status-badge priority-${value}`
}

function getHistoryValue(changeType, value) {
  if (!value) {
    return 'Boş'
  }

  if (changeType === 'StatusChanged') {
    return getTaskStatusLabel(value)
  }

  if (changeType === 'PriorityChanged') {
    return getTaskPriorityLabel(value)
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
  const [membersByProject, setMembersByProject] = useState({})
  const [memberMessage, setMemberMessage] = useState('')
  const [isMemberLoading, setIsMemberLoading] = useState(false)
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Member')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [timeLogResult, setTimeLogResult] = useState(null)
  const [timeLogMessage, setTimeLogMessage] = useState('')
  const [isTimeLogLoading, setIsTimeLogLoading] = useState(false)
  const [newTimeLogHours, setNewTimeLogHours] = useState('')
  const [newTimeLogDescription, setNewTimeLogDescription] = useState('')
  const [newTimeLogWorkDate, setNewTimeLogWorkDate] = useState('')
  const [commentTaskId, setCommentTaskId] = useState('')
  const [comments, setComments] = useState([])
  const [commentMessage, setCommentMessage] = useState('')
  const [newCommentContent, setNewCommentContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
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
      setActiveSection('')
      setIsLoggedIn(true)
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

  async function getProjectMembers() {
    if (!selectedProjectId) {
      setMemberMessage('Önce bir proje seçin.')
      return
    }

    const token = localStorage.getItem('token')
    setMemberMessage('')
    setIsMemberLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${selectedProjectId}/members`,
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
      setNewMemberUserId('')
      setNewMemberRole('Member')
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
    setActiveSection('')
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
    setActiveSection((currentSection) =>
      currentSection === sectionName ? '' : sectionName,
    )
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

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Proje Yönetim Sistemi</h1>

          <div className="user-area">
            <div className="user-info">
              <span>{currentUser?.email}</span>
              <strong>{currentUser?.role}</strong>
            </div>

            <button type="button" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <h2>Ana Sayfa</h2>
          <p>Sisteme başarıyla giriş yaptınız.</p>

          <div className="menu-cards">
            <button
              className={`menu-card ${activeSection === 'projects' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('projects')}
            >
              <h3>
                {activeSection === 'projects' ? 'Projeleri Gizle' : 'Projeler'}
              </h3>
              <p>Erişebildiğiniz projeleri görüntüleyin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'tasks' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('tasks')}
            >
              <h3>
                {activeSection === 'tasks' ? 'Görevleri Gizle' : 'Görevler'}
              </h3>
              <p>Görevlerinizi görüntüleyin ve yönetin.</p>
            </button>

            <button
              className={`menu-card ${activeSection === 'timeLogs' ? 'active' : ''}`}
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

            <button
              className={`menu-card ${activeSection === 'comments' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('comments')}
            >
              <h3>Yorumlar</h3>
              <p>Görevlerdeki yorumları görüntüleyin ve yönetin.</p>
            </button>

            {currentUser?.role === 'Admin' && (
              <button
                className={`menu-card ${activeSection === 'users' ? 'active' : ''}`}
                type="button"
                onClick={() => toggleSection('users')}
              >
                <h3>Kullanıcı Yönetimi</h3>
                <p>Kullanıcıları ve sistem rollerini yönetin.</p>
              </button>
            )}

            <button
              className={`menu-card ${activeSection === 'members' ? 'active' : ''}`}
              type="button"
              onClick={() => toggleSection('members')}
            >
              <h3>Proje Üyeleri</h3>
              <p>Projelerdeki aktif ekip üyelerini görüntüleyin.</p>
            </button>
          </div>

          {activeSection === 'users' && currentUser?.role === 'Admin' && (
            <section className="content-section">
              <h2>Kullanıcı Yönetimi</h2>

              <label className="user-filter">
                <input
                  type="checkbox"
                  checked={showInactiveUsers}
                  onChange={(event) => setShowInactiveUsers(event.target.checked)}
                />
                Pasif kullanıcıları göster
              </label>

              {userMessage && <p className="message">{userMessage}</p>}

              {users.length === 0 && !userMessage && (
                <p>Görüntülenecek kullanıcı bulunamadı.</p>
              )}

              <div className="item-list">
                {users
                  .filter((user) => showInactiveUsers || user.isActive)
                  .map((user) => (
                  <article className="item-card" key={user.id}>
                    <h3>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p>{user.email}</p>
                    <p>
                      <strong>Sistem rolü:</strong> {user.role}
                    </p>

                    <label className="role-field">
                      Rolü değiştir
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

                    <p>
                      <strong>Durum:</strong>{' '}
                      <span
                        className={user.isActive ? 'status-active' : 'status-passive'}
                      >
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </p>
                    {user.department && (
                      <p>
                        <strong>Departman:</strong> {user.department}
                      </p>
                    )}

                    {Number(currentUser.id) === user.id ? (
                      <button className="user-action-button" type="button" disabled>
                        Mevcut hesap
                      </button>
                    ) : (
                      <button
                        className="user-action-button"
                        type="button"
                        onClick={() => updateUserStatus(user)}
                      >
                        {user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      </button>
                    )}
                  </article>
                  ))}
              </div>
            </section>
          )}

          {activeSection === 'members' && (
            <section className="content-section">
              <h2>Proje Üyeleri</h2>

              <div className="member-controls">
                <label htmlFor="member-project-select">Proje seçin</label>

                <select
                  id="member-project-select"
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(event.target.value)
                    setProjectMembers([])
                    setMemberMessage('')
                    setNewMemberUserId('')
                    setNewMemberRole('Member')
                  }}
                >
                  <option value="">Proje seçiniz</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={getProjectMembers}
                  disabled={isMemberLoading}
                >
                  {isMemberLoading ? 'Yükleniyor...' : 'Üyeleri Göster'}
                </button>
              </div>

              {memberMessage && <p className="message">{memberMessage}</p>}

              {selectedProjectId && canManageMembers && (
                <form className="member-form" onSubmit={addProjectMember}>
                  <h3>Projeye Üye Ekle</h3>

                  <label htmlFor="new-member-user-id">Kullanıcı ID</label>
                  <input
                    id="new-member-user-id"
                    type="number"
                    min="1"
                    value={newMemberUserId}
                    onChange={(event) => setNewMemberUserId(event.target.value)}
                    required
                  />

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

                  <button type="submit">Üye Ekle</button>
                </form>
              )}

              {selectedProjectId &&
                projectMembers.length === 0 &&
                !memberMessage &&
                !isMemberLoading && <p>Bu projede aktif üye bulunamadı.</p>}

              <div className="item-list">
                {projectMembers.map((member) => (
                  <article className="item-card" key={member.id}>
                    <h3>
                      {member.userName || `Kullanıcı ${member.userId}`}
                    </h3>
                    <p>{member.email || 'E-posta bilgisi bulunmuyor.'}</p>
                    <p>
                      <strong>Kullanıcı ID:</strong> {member.userId}
                    </p>
                    <p>
                      <strong>Proje rolü:</strong> {member.role}
                    </p>

                    {canManageMembers && (
                      <label className="role-field">
                        Proje rolünü değiştir
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
                    <p>
                      <strong>Katılım tarihi:</strong>{' '}
                      {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                    </p>

                    {canManageMembers && (
                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => removeProjectMember(member)}
                      >
                        Üyeyi Çıkar
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="content-section">
              <h2>Projelerim</h2>

              {projectMessage && <p className="message">{projectMessage}</p>}

              {(currentUser?.role === 'Admin' ||
                currentUser?.role === 'ProjectManager') && (
                <form className="project-form" onSubmit={createProject}>
                  <h3>Yeni Proje Oluştur</h3>

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
                <form className="project-form" onSubmit={updateProject}>
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

              <div className="item-list">
                {projects.map((project) => (
                  <article className="item-card" key={project.id}>
                    <h3>{project.name}</h3>
                    <p>
                      {project.description || 'Proje açıklaması bulunmuyor.'}
                    </p>
                    <p>
                      <strong>Durum:</strong>{' '}
                      <span className="status-badge project-status">
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Başlangıç:</strong>{' '}
                      {new Date(project.startDate).toLocaleDateString('tr-TR')}
                    </p>
                    <button className="user-action-button" type="button" onClick={() => getProjectDetail(project.id)}>
                      Detayı Göster
                    </button>
                    {(currentUser?.role === 'Admin' || Number(currentUser?.id) === project.ownerId) && (
                      <>
                        <button className="user-action-button" type="button" onClick={() => openProjectEdit(project)}>
                          Projeyi Düzenle
                        </button>
                        {!project.isArchived && (
                          <button className="archive-button" type="button" onClick={() => archiveProject(project)}>
                            Arşivle
                          </button>
                        )}
                        <button className="remove-button" type="button" onClick={() => deleteProject(project)}>
                          Projeyi Sil
                        </button>
                      </>
                    )}
                  </article>
                ))}
              </div>

              {selectedProjectDetail && (
                <div className="task-detail">
                  <div className="task-detail-header">
                    <h3>Proje Detayı</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectDetail(null)
                        setSelectedProjectDetailMembers([])
                      }}
                    >
                      Kapat
                    </button>
                  </div>
                  <p><strong>Proje:</strong> {selectedProjectDetail.name}</p>
                  <p><strong>Açıklama:</strong> {selectedProjectDetail.description || 'Açıklama bulunmuyor.'}</p>
                  <p><strong>Durum:</strong> {getProjectStatusLabel(selectedProjectDetail.status)}</p>
                  <p><strong>Başlangıç:</strong> {new Date(selectedProjectDetail.startDate).toLocaleDateString('tr-TR')}</p>
                  <p><strong>Bitiş:</strong> {selectedProjectDetail.endDate ? new Date(selectedProjectDetail.endDate).toLocaleDateString('tr-TR') : 'Belirlenmedi'}</p>
                  <p><strong>Arşiv durumu:</strong> {selectedProjectDetail.isArchived ? 'Arşivlendi' : 'Aktif'}</p>

                  <h4>Proje Ekibi</h4>
                  {selectedProjectDetailMembers.length === 0 ? (
                    <p>Bu projede aktif ekip üyesi bulunmuyor.</p>
                  ) : (
                    <div className="project-detail-members">
                      {selectedProjectDetailMembers.map((member) => (
                        <div key={member.id} className="project-detail-member">
                          <strong>
                            {member.userName || `Kullanıcı ${member.userId}`}
                          </strong>
                          <span>{member.email}</span>
                          <span>Proje rolü: {member.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="content-section">
              <h2>Görevlerim</h2>

              {taskMessage && <p className="message">{taskMessage}</p>}
              {taskActionMessage && (
                <p className="message">{taskActionMessage}</p>
              )}

              {(currentUser?.role === 'Admin' ||
                projects.some(
                  (project) =>
                    project.ownerId === Number(currentUser?.id),
                )) && (
                <form className="task-form" onSubmit={createTask}>
                  <h3>Yeni Görev Oluştur</h3>

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
                <form className="task-form" onSubmit={assignTask}>
                  <div className="task-detail-header">
                    <h3>{assignmentTask.title} Görevini Ata</h3>
                    <button
                      type="button"
                      onClick={() => setAssignmentTask(null)}
                    >
                      Kapat
                    </button>
                  </div>

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
                <form className="task-form" onSubmit={updateTask}>
                  <div className="task-detail-header">
                    <h3>Görevi Düzenle</h3>
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                    >
                      Kapat
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
                <div className="task-detail">
                  <div className="task-detail-header">
                    <h3>{historyTask.title} – Değişiklik Geçmişi</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryTask(null)
                        setTaskHistories([])
                      }}
                    >
                      Kapat
                    </button>
                  </div>

                  {taskHistories.length === 0 ? (
                    <p>Bu görev için değişiklik kaydı bulunamadı.</p>
                  ) : (
                    <div className="history-list">
                      {taskHistories.map((history) => (
                        <div className="history-item" key={history.id}>
                          <strong>{history.description}</strong>
                          <span>
                            {getHistoryValue(
                              history.changeType,
                              history.oldValue,
                            )}{' '}
                            →{' '}
                            {getHistoryValue(
                              history.changeType,
                              history.newValue,
                            )}
                          </span>
                          <span>
                            İşlemi yapan: {history.changedByUserName}
                          </span>
                          <span>
                            {new Date(history.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tasks.length === 0 && !taskMessage && (
                <p>Görüntülenecek görev bulunamadı.</p>
              )}

              <div className="item-list">
                {tasks.map((task) => (
                  <article className="item-card" key={task.id}>
                    <h3>{task.title}</h3>
                    <p>{task.description || 'Görev açıklaması bulunmuyor.'}</p>
                    <p>
                      <strong>Durum:</strong>{' '}
                      <span className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Öncelik:</strong>{' '}
                      <span className={getPriorityClass(task.priority)}>
                        {getTaskPriorityLabel(task.priority)}
                      </span>
                    </p>
                    <p>
                      <strong>Proje:</strong> {getProjectName(task.projectId)}
                    </p>
                    <p>
                      <strong>Atanan kişi:</strong>{' '}
                      {task.assignedToUserName || 'Henüz atanmadı'}
                    </p>
                    {task.dueDate && (
                      <p>
                        <strong>Teslim tarihi:</strong>{' '}
                        {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}

                    {canChangeTaskStatus(task) && (
                      <label className="task-status-field">
                        Durumu değiştir
                        <select
                        value={
                          typeof task.status === 'number'
                            ? task.status
                            : {
                                ToDo: 0,
                                InProgress: 1,
                                InReview: 2,
                                Done: 3,
                              }[task.status]
                        }
                        onChange={(event) =>
                          updateTaskStatus(task.id, event.target.value)
                        }
                        >
                          <option value="0">Yapılacak</option>
                          <option value="1">Devam Ediyor</option>
                          <option value="2">İncelemede</option>
                          <option value="3">Tamamlandı</option>
                        </select>
                      </label>
                    )}

                    <button
                      className="user-action-button"
                      type="button"
                      onClick={() => getTaskDetail(task.id)}
                    >
                      Detayı Göster
                    </button>

                    <button
                      className="user-action-button"
                      type="button"
                      onClick={() => getTaskHistories(task)}
                    >
                      Geçmişi Göster
                    </button>

                    {canManageTask(task) && (
                      <>
                        <button
                          className="user-action-button"
                          type="button"
                          onClick={() => openTaskEdit(task)}
                        >
                          Görevi Düzenle
                        </button>
                        <button
                          className="user-action-button"
                          type="button"
                          onClick={() => openTaskAssignment(task)}
                        >
                          Görev Ata
                        </button>
                        <button
                          className="remove-button"
                          type="button"
                          onClick={() => deleteTask(task)}
                        >
                          Görevi Sil
                        </button>
                      </>
                    )}
                  </article>
                ))}
              </div>

              {selectedTaskDetail && (
                <div className="task-detail">
                  <div className="task-detail-header">
                    <h3>Görev Detayı</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedTaskDetail(null)}
                    >
                      Kapat
                    </button>
                  </div>
                  <p>
                    <strong>Başlık:</strong> {selectedTaskDetail.title}
                  </p>
                  <p>
                    <strong>Açıklama:</strong>{' '}
                    {selectedTaskDetail.description || 'Açıklama bulunmuyor.'}
                  </p>
                  <p>
                    <strong>Proje:</strong>{' '}
                    {getProjectName(selectedTaskDetail.projectId)}
                  </p>
                  <p>
                    <strong>Durum:</strong>{' '}
                    {getTaskStatusLabel(selectedTaskDetail.status)}
                  </p>
                  <p>
                    <strong>Öncelik:</strong>{' '}
                    {getTaskPriorityLabel(selectedTaskDetail.priority)}
                  </p>
                  <p>
                    <strong>Tahmini süre:</strong>{' '}
                    {selectedTaskDetail.estimatedHours ?? 0} saat
                  </p>
                  <p>
                    <strong>Atanan kişi:</strong>{' '}
                    {selectedTaskDetail.assignedToUserName || 'Henüz atanmadı'}
                  </p>
                  {selectedTaskDetail.assignedToUserEmail && (
                    <p>
                      <strong>E-posta:</strong>{' '}
                      {selectedTaskDetail.assignedToUserEmail}
                    </p>
                  )}
                </div>
              )}
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

              {selectedTaskId && canAddRecordToTask(selectedTaskId) && (
                <form className="task-form" onSubmit={createTimeLog}>
                  <h3>Çalışma Süresi Ekle</h3>

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
                            <strong>Çalışan:</strong>{' '}
                            {timeLog.userName || `Kullanıcı ${timeLog.userId}`}
                          </p>
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

          {activeSection === 'comments' && (
            <section className="content-section">
              <h2>Görev Yorumları</h2>

              <div className="time-log-controls">
                <label htmlFor="comment-task-select">Görev seçin</label>
                <select
                  id="comment-task-select"
                  value={commentTaskId}
                  onChange={(event) => {
                    setCommentTaskId(event.target.value)
                    setComments([])
                    setCommentMessage('')
                    setEditingCommentId(null)
                  }}
                >
                  <option value="">Görev seçiniz</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} – {getProjectName(task.projectId)}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => getComments()}>
                  Yorumları Göster
                </button>
              </div>

              {commentTaskId && canCommentOnTask(commentTaskId) && (
                <form className="task-form" onSubmit={createComment}>
                  <h3>Yeni Yorum Ekle</h3>
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
                <form className="task-form" onSubmit={updateComment}>
                  <h3>Yorumu Düzenle</h3>
                  <textarea
                    rows="3"
                    value={editingCommentContent}
                    onChange={(event) =>
                      setEditingCommentContent(event.target.value)
                    }
                    required
                  />
                  <button type="submit">Yorumu Kaydet</button>
                  <button
                    type="button"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Vazgeç
                  </button>
                </form>
              )}

              {commentMessage && <p className="message">{commentMessage}</p>}

              {commentTaskId && comments.length === 0 && !commentMessage && (
                <p>Bu göreve henüz yorum eklenmemiş.</p>
              )}

              <div className="item-list">
                {comments.map((comment) => {
                  const canManageComment =
                    currentUser?.role === 'Admin' ||
                    Number(currentUser?.id) === comment.userId

                  return (
                    <article className="item-card" key={comment.id}>
                      <p>{comment.content}</p>
                      <p>
                        <strong>Yazan:</strong>{' '}
                        {Number(currentUser?.id) === comment.userId
                          ? 'Siz'
                          : comment.userName ||
                            comment.email ||
                            `Kullanıcı ${comment.userId}`}
                      </p>
                      <p>
                        <strong>Tarih:</strong>{' '}
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </p>
                      {comment.updatedAt && <small>Düzenlendi</small>}
                      {canManageComment && (
                        <>
                          <button
                            className="user-action-button"
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.id)
                              setEditingCommentContent(comment.content)
                            }}
                          >
                            Yorumu Düzenle
                          </button>
                          <button
                            className="remove-button"
                            type="button"
                            onClick={() => deleteComment(comment)}
                          >
                            Yorumu Sil
                          </button>
                        </>
                      )}
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
