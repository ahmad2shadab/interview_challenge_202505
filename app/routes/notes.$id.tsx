import { MetaFunction } from '@remix-run/node';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { NoteDetail } from '~/components/notes/note-detail';
import { NoteDetailSkeleton } from '~/components/notes/note-detail-skeleton';
import { getNoteById } from '~/services/notes.server';
import { requireUserId } from '~/services/session.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.note) {
    return [
      { title: 'Note Not Found - Notes App' },
      { name: 'description', content: 'The requested note could not be found' },
    ];
  }

  const noteTitle = data.note.title;
  const truncatedTitle =
    noteTitle.length > 50 ? `${noteTitle.substring(0, 50)}...` : noteTitle;

  return [
    { title: `${truncatedTitle} - Notes App` },
    {
      name: 'description',
      content:
        data.note.description?.substring(0, 160) || 'View your note details',
    },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  // SECURITY FIX 1: Authentication Check
  const userId = await requireUserId(request);

  const noteId = parseInt(params.id || '', 10);

  if (isNaN(noteId)) {
    throw new Response('Invalid note ID', { status: 400 });
  }

  const note = await getNoteById(noteId);
  if (!note) {
    throw new Response('Note not found', { status: 404 });
  }

  // SECURITY FIX 2: Authorization Check (Ownership Verification)
  if (note.userId !== userId) {
    throw new Response(
      "Forbidden - You don't have permission to view this note",
      {
        status: 403,
      }
    );
  }

  return json({ note });
}

export default function NoteDetailPage() {
  const { note } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="container py-8">
      {isLoading ? <NoteDetailSkeleton /> : <NoteDetail note={note} />}
    </div>
  );
}
