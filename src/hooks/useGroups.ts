import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'

export interface Group {
  id: string
  name: string
  course_name: string
  description: string | null
  capacity: number
  invite_code: string
  leader_id: string
  created_at: string
  member_count?: number
  is_leader?: boolean
}

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setGroups([])
      setLoading(false)
      return
    }

    const fetchGroups = async () => {
      setLoading(true)
      setError(null)

      try {
        // Ambil semua kelompok yang diikuti user
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', user.id)

        if (membershipError) throw membershipError

        if (!memberships || memberships.length === 0) {
          setGroups([])
          setLoading(false)
          return
        }

        const groupIds = memberships.map(m => m.group_id)

        // Ambil detail kelompok
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('created_at', { ascending: false })

        if (groupsError) throw groupsError

        // Hitung jumlah anggota untuk setiap kelompok
        const groupsWithCount = await Promise.all(
          (groupsData || []).map(async (group) => {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)

            return {
              ...group,
              member_count: count || 0,
              is_leader: memberships.find(m => m.group_id === group.id)?.role === 'leader'
            }
          })
        )

        setGroups(groupsWithCount)
      } catch (err: any) {
        setError(err.message || 'Gagal memuat kelompok')
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [user])

  return { groups, loading, error }
}