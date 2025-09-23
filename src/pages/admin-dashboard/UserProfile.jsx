import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, isAdminUser } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../components/AppIcon'
import Button from '../../components/ui/Button'

const BUCKET = 'user-media'

const AdminUserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [media, setMedia] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filter, setFilter] = useState('all') // all | image | video | flagged

  const loadUser = async () => {
    try {
      setLoadingUser(true)
      const { data, error } = await supabase
        ?.from('profiles')
        ?.select('id, email, full_name, points, is_admin, is_active, created_at')
        ?.eq('id', id)
        ?.single()
      if (error) throw error
      setUser(data)
    } catch (e) {
      setError(e?.message || 'Failed to load user')
    } finally {
      setLoadingUser(false)
    }
  }

  const loadMedia = async () => {
    try {
      setLoadingMedia(true)
      const { data, error } = await supabase
        ?.from('media_files')
        ?.select('*')
        ?.eq('user_id', id)
        ?.neq('status', 'deleted')
        ?.order('uploaded_at', { ascending: false })
      if (error) throw error

      const processed = await Promise.all(
        (data || []).map(async (m) => {
          let signedUrl = null
          if (m?.file_path) {
            try {
              const { data: urlData } = await supabase
                ?.storage
                ?.from(BUCKET)
                ?.createSignedUrl(m?.file_path, 3600)
              signedUrl = urlData?.signedUrl || null
            } catch {}
          }
          return {
            id: m?.id,
            name: m?.filename || m?.file_path?.split('/')?.pop(),
            type: m?.media_type || (m?.mime_type?.startsWith('video') ? 'video' : 'image'),
            size: m?.file_size ? `${(m?.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadDate: m?.uploaded_at ? new Date(m?.uploaded_at).toLocaleString() : 'Unknown',
            url: signedUrl,
            filePath: m?.file_path,
            status: m?.status,
            progressType: m?.progress_type,
            description: m?.description,
            mimeType: m?.mime_type,
          }
        })
      )

      setMedia(processed)
    } catch (e) {
      setError(e?.message || 'Failed to load media')
      setMedia([])
    } finally {
      setLoadingMedia(false)
    }
  }

  useEffect(() => {
    const verify = async () => {
      if (!authUser) {
        navigate('/user-login')
        return
      }
      if (isAdminUser(authUser)) {
        await Promise.all([loadUser(), loadMedia()])
        return
      }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', authUser.id).single()
      if (profile?.is_admin) {
        await Promise.all([loadUser(), loadMedia()])
      } else {
        navigate('/dashboard')
      }
    }
    if (id) verify()
  }, [id, authUser])

  const filteredSorted = useMemo(() => {
    let arr = media
    if (filter === 'image') arr = arr.filter((m) => m.type === 'image')
    if (filter === 'video') arr = arr.filter((m) => m.type === 'video')
    if (filter === 'flagged') arr = arr.filter((m) => m.status === 'flagged')
    const sorted = [...arr]
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => (new Date(b.uploadDate) - new Date(a.uploadDate)))
        break
      case 'oldest':
        sorted.sort((a, b) => (new Date(a.uploadDate) - new Date(b.uploadDate)))
        break
      case 'size':
        sorted.sort((a, b) => (parseFloat(b.size) || 0) - (parseFloat(a.size) || 0))
        break
      default:
        break
    }
    return sorted
  }, [media, sortBy, filter])

  const handleAction = async (action, item) => {
    try {
      switch (action) {
        case 'download': {
          const { data, error } = await supabase?.storage?.from(BUCKET)?.download(item?.filePath)
          if (error) throw error
          const url = URL.createObjectURL(data)
          const link = document.createElement('a')
          link.href = url
          link.download = item?.name || 'download'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          break
        }
        case 'flag':
        case 'unflag': {
          const newStatus = action === 'flag' ? 'flagged' : 'active'
          const { error } = await supabase
            ?.from('media_files')
            ?.update({ status: newStatus, updated_at: new Date().toISOString() })
            ?.eq('id', item?.id)
          if (error) throw error
          await loadMedia()
          break
        }
        case 'delete': {
          if (!confirm(`Delete "${item?.name}"? This cannot be undone.`)) return
          const { error: dbError } = await supabase
            ?.from('media_files')
            ?.update({ status: 'deleted', updated_at: new Date().toISOString() })
            ?.eq('id', item?.id)
          if (dbError) throw dbError
          if (item?.filePath) {
            await supabase?.storage?.from(BUCKET)?.remove([item?.filePath])
          }
          await loadMedia()
          break
        }
        default:
          break
      }
    } catch (e) {
      alert(`Action failed: ${e?.message}`)
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto" />
          <p className="mt-2 text-muted-foreground">User not found</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/admin-dashboard')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user?.full_name || user?.email}</h1>
              <p className="text-sm text-muted-foreground">{user?.email} • {user?.is_admin ? 'Admin' : 'User'} • {user?.is_active !== false ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm">
              <Icon name="Star" size={16} color="#7c3aed" /> <span className="ml-1 align-middle font-medium">Points: {user?.points ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Filter</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                <option value="all">All</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="size">File size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-card rounded-xl p-6 border border-border">
          {loadingMedia ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSorted?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Image" size={48} className="text-muted-foreground mx-auto" />
              <p className="mt-2 text-muted-foreground">No media uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSorted.map((m) => (
                <div key={m.id} className={`relative rounded-xl border overflow-hidden ${m.status === 'flagged' ? 'border-red-300 bg-red-50' : 'border-border bg-background'}`}>
                  {/* Badges */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1">
                    {m.progressType && (
                      <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">{m.progressType}</span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${m.status === 'active' ? 'bg-green-500 text-white' : m.status === 'flagged' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>{m.status}</span>
                  </div>

                  {/* Preview */}
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {m.url ? (
                      m.type === 'image' ? (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-4 shadow-lg"><Icon name="Play" size={24} /></div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Icon name={m.type === 'video' ? 'Video' : 'Image'} size={48} />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => handleAction('download', m)}><Icon name="Download" size={16} /></Button>
                      <Button size="sm" variant="secondary" onClick={() => handleAction(m.status === 'flagged' ? 'unflag' : 'flag', m)}><Icon name="Flag" size={16} /></Button>
                      <Button size="sm" variant="secondary" onClick={() => handleAction('delete', m)}><Icon name="Trash2" size={16} /></Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" title={m.name}>{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.size} • {m.uploadDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserProfile
