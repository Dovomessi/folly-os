'use client'

import { useState } from 'react'
import { useStore, type Appointment } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { generateId, formatDateTime } from '@/lib/utils'
import { Plus, Calendar, Clock, Trash2, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface CalendarViewProps {
  projectId: string
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByProject } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')

  const projectAppointments = getAppointmentsByProject(projectId)

  const handleCreate = () => {
    if (!newTitle.trim() || !newStartTime || !newEndTime) return

    const newAppointment: Appointment = {
      id: generateId(),
      title: newTitle,
      description: newDescription || null,
      start_time: new Date(newStartTime).toISOString(),
      end_time: new Date(newEndTime).toISOString(),
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addAppointment(newAppointment)
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = () => {
    if (!editingAppointment || !newTitle.trim() || !newStartTime || !newEndTime) return

    updateAppointment(editingAppointment.id, {
      title: newTitle,
      description: newDescription || null,
      start_time: new Date(newStartTime).toISOString(),
      end_time: new Date(newEndTime).toISOString(),
    })

    setEditingAppointment(null)
    resetForm()
    setIsCreateOpen(false)
  }

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setNewTitle(appointment.title)
    setNewDescription(appointment.description || '')
    setNewStartTime(new Date(appointment.start_time).toISOString().slice(0, 16))
    setNewEndTime(new Date(appointment.end_time).toISOString().slice(0, 16))
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewStartTime('')
    setNewEndTime('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce rendez-vous ?')) {
      deleteAppointment(id)
    }
  }

  // Sort appointments by start time
  const sortedAppointments = [...projectAppointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  // Group by date
  const groupedByDate = sortedAppointments.reduce((acc, appointment) => {
    const date = new Date(appointment.start_time).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(appointment)
    return acc
  }, {} as Record<string, Appointment[]>)

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Rendez-vous</h2>
        <Button
          onClick={() => {
            resetForm()
            setEditingAppointment(null)
            setIsCreateOpen(true)
          }}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      <div className="space-y-4 h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 text-[#8A8F98]">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun rendez-vous</p>
            <p className="text-sm mt-1">Créez votre premier rendez-vous</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, appointments]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-[#8A8F98] mb-2 capitalize">{date}</h3>
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="group bg-[#161922] rounded-lg border border-[#2A2D37] p-4 hover:border-[#5E6AD2]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#F7F8F8] font-medium">{appointment.title}</h4>
                        {appointment.description && (
                          <p className="text-sm text-[#8A8F98] mt-1">{appointment.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#8A8F98]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(appointment.start_time).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(appointment.end_time).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2D37] rounded transition-opacity">
                            <MoreVertical className="w-4 h-4 text-[#8A8F98]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1F232E] border-[#2A2D37]">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(appointment)}
                            className="text-[#F7F8F8] focus:bg-[#2A2D37]"
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(appointment.id)}
                            className="text-red-400 focus:bg-[#2A2D37]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#161922] border-[#2A2D37] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre du rendez-vous"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optionnel)"
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Date et heure de début</Label>
              <Input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Date et heure de fin</Label>
              <Input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="bg-[#0F1115] border-[#2A2D37] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingAppointment(null)
                resetForm()
              }}
              className="border-[#2A2D37] text-[#F7F8F8] hover:bg-[#1F232E]"
            >
              Annuler
            </Button>
            <Button
              onClick={editingAppointment ? handleEdit : handleCreate}
              className="bg-[#5E6AD2] hover:bg-[#4F5BC7] text-white"
            >
              {editingAppointment ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
