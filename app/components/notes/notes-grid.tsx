import type { Note } from "~/db/schema"
import { NoteCard } from "./note-card"
import { Star } from "lucide-react"

type SerializedNote = Omit<Note, "createdAt"> & { createdAt: string }

interface NotesGridProps {
  notes: SerializedNote[]
  emptyMessage?: string
}

export function NotesGrid({ notes, emptyMessage = "No notes found." }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Separate favorites for visual organization (optional enhancement)
  const favoriteNotes = notes.filter((note) => note.isFavorite)
  const regularNotes = notes.filter((note) => !note.isFavorite)

  return (
    <div className="space-y-6">
      {/* Show favorites section if any exist */}
      {favoriteNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Favorites ({favoriteNotes.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Show regular notes */}
      {regularNotes.length > 0 && (
        <div>
          {favoriteNotes.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground mb-4">All Notes ({regularNotes.length})</h3>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
