import { db, notes, type Note, type NewNote } from '~/db/schema';
import { sql } from 'drizzle-orm';

export async function createNote(data: NewNote): Promise<Note> {
  const [note] = await db.insert(notes).values(data).returning();
  return note;
}

export async function getNoteById(id: number): Promise<Note | null> {
  const [note] = await db
    .select()
    .from(notes)
    .where(sql`${notes.id} = ${id}`);
  return note || null;
}

export async function getNotesByUserId(
  userId: number,
  { limit = 1000 }: { limit?: number } = {} // Default limit to 1000
): Promise<{ notes: Note[] }> {
  const notesList = await db
    .select()
    .from(notes)
    .where(sql`${notes.userId} = ${userId}`)
    .orderBy(sql`${notes.createdAt} DESC`)
    .limit(limit);

  return {
    notes: notesList,
  };
}

export async function updateNote(
  id: number,
  userId: number,
  data: Partial<NewNote>
): Promise<Note | null> {
  const [note] = await db
    .update(notes)
    .set(data)
    .where(sql`${notes.id} = ${id} AND ${notes.userId} = ${userId}`)
    .returning();
  return note || null;
}

export async function deleteNote(id: number, userId: number): Promise<boolean> {
  const [note] = await db
    .delete(notes)
    .where(sql`${notes.id} = ${id} AND ${notes.userId} = ${userId}`)
    .returning();
  return !!note;
}

// New function for toggling favorite status
export async function toggleNoteFavorite(id: number, userId: number): Promise<Note | null> {
  const [note] = await db
    .update(notes)
    .set({ isFavorite: sql`NOT ${notes.isFavorite}` })
    .where(sql`${notes.id} = ${id} AND ${notes.userId} = ${userId}`)
    .returning()
  return note || null
}
