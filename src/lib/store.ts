import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  project_id: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  project_id: string
  created_at: string
  updated_at: string
}

export interface Password {
  id: string
  name: string
  username: string
  password: string
  url: string | null
  notes: string | null
  project_id: string
  created_at: string
  updated_at: string
}

interface StoreState {
  // Projects
  projects: Project[]
  selectedProjectId: string | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  selectProject: (id: string | null) => void
  
  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByProject: (projectId: string) => Task[]
  
  // Appointments
  appointments: Appointment[]
  setAppointments: (appointments: Appointment[]) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
  getAppointmentsByProject: (projectId: string) => Appointment[]
  
  // Notes
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  getNotesByProject: (projectId: string) => Note[]
  
  // Passwords
  passwords: Password[]
  setPasswords: (passwords: Password[]) => void
  addPassword: (password: Password) => void
  updatePassword: (id: string, updates: Partial<Password>) => void
  deletePassword: (id: string) => void
  getPasswordsByProject: (projectId: string) => Password[]
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Projects
      projects: [],
      selectedProjectId: null,
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
        ),
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      })),
      selectProject: (id) => set({ selectedProjectId: id }),
      
      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        ),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.project_id === projectId)
      },
      
      // Appointments
      appointments: [],
      setAppointments: (appointments) => set({ appointments }),
      addAppointment: (appointment) => set((state) => ({ 
        appointments: [...state.appointments, appointment] 
      })),
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map((a) => 
          a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
        ),
      })),
      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
      })),
      getAppointmentsByProject: (projectId) => {
        return get().appointments.filter((a) => a.project_id === projectId)
      },
      
      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => 
          n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
        ),
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),
      getNotesByProject: (projectId) => {
        return get().notes.filter((n) => n.project_id === projectId)
      },
      
      // Passwords
      passwords: [],
      setPasswords: (passwords) => set({ passwords }),
      addPassword: (password) => set((state) => ({ 
        passwords: [...state.passwords, password] 
      })),
      updatePassword: (id, updates) => set((state) => ({
        passwords: state.passwords.map((p) => 
          p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
        ),
      })),
      deletePassword: (id) => set((state) => ({
        passwords: state.passwords.filter((p) => p.id !== id),
      })),
      getPasswordsByProject: (projectId) => {
        return get().passwords.filter((p) => p.project_id === projectId)
      },
    }),
    {
      name: 'folly-os-storage',
    }
  )
)
