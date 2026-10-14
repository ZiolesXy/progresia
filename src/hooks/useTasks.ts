import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'

export interface Task {
  id: string
  group_id: string
  title: string
  description: string | null
  assignee_id: string | null
  deadline: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  created_by: string | null
  created_at: string
  assignee?: {
    full_name: string
    student_id: string
  } | null
}

export function useTasks(groupId: string | undefined) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!groupId || !user) {
      // oxlint-disable react/set-state-in-effect
      setTasks([])
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select(`
            *,
            assignee:assignee_id (full_name, student_id)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Format data agar sesuai dengan interface Task
        const formattedTasks = (data || []).map((task: any) => ({
          ...task,
          assignee: Array.isArray(task.assignee) ? task.assignee[0] : task.assignee,
        }))

        setTasks(formattedTasks)
      } catch (err: any) {
        setError(err.message || 'Gagal memuat tugas')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [groupId, user])

  return { tasks, loading, error }
}