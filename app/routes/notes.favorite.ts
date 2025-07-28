import { json, type ActionFunctionArgs } from '@remix-run/node';
import { requireUserId } from '~/services/session.server';
import { toggleNoteFavorite } from '~/services/notes.server';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const noteId = formData.get('noteId');

    if (!noteId) {
      return json({ error: 'Note ID is required' }, { status: 400 });
    }

    const noteIdNumber = Number.parseInt(noteId.toString(), 10);
    if (isNaN(noteIdNumber)) {
      return json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const updatedNote = await toggleNoteFavorite(noteIdNumber, userId);

    if (!updatedNote) {
      return json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    return json({
      success: true,
      isFavorite: updatedNote.isFavorite,
    });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return json({ error: 'Failed to update favorite status' }, { status: 500 });
  }
}
