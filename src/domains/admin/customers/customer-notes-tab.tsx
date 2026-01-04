'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getCustomerNotes, addCustomerNote } from '@/lib/actions/admin-customers'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'

interface CustomerNotesTabProps {
  customerClerkId: string
}

export function CustomerNotesTab({ customerClerkId }: CustomerNotesTabProps) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [isImportant, setIsImportant] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [customerClerkId])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const result = await getCustomerNotes(customerClerkId)
      if (result.success) {
        setNotes(result.notes || [])
      } else {
        toast.error(result.error || 'Failed to load notes')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Note text is required')
      return
    }

    setLoading(true)
    try {
      const result = await addCustomerNote(customerClerkId, noteText, isImportant)
      if (result.success) {
        toast.success('Note added successfully')
        setNoteText('')
        setIsImportant(false)
        setShowAddNote(false)
        loadNotes()
      } else {
        toast.error(result.error || 'Failed to add note')
      }
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6" data-testid="customer-notes-tab">
      {/* Add Note Section */}
      {!showAddNote ? (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowAddNote(true)}
              className="w-full"
              data-testid="show-add-note-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Internal Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="add-note-card">
          <CardHeader>
            <CardTitle>Add Internal Note</CardTitle>
            <CardDescription>
              Internal notes are only visible to admin team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                data-testid="note-textarea"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="important"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked as boolean)}
                data-testid="important-checkbox"
              />
              <label
                htmlFor="important"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as important
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddNote(false)
                  setNoteText('')
                  setIsImportant(false)
                }}
                data-testid="cancel-note-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={loading || !noteText.trim()}
                data-testid="save-note-button"
              >
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <Card data-testid="notes-list-card">
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
          <CardDescription>
            Private notes about this customer (admin-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && notes.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border ${
                    note.is_important
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-muted/50'
                  }`}
                  data-testid={`note-${note.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{note.admin_name || 'Admin'}</p>
                      {note.is_important && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Important
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8" data-testid="no-notes">
              No internal notes yet. Add notes to keep track of important customer information.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

