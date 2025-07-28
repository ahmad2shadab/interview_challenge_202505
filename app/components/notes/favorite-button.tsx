'use client';

import type React from 'react';

import { useFetcher } from '@remix-run/react';
import { Star } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface FavoriteButtonProps {
  noteId: number;
  isFavorite: boolean;
  className?: string;
}

export function FavoriteButton({
  noteId,
  isFavorite,
  className,
}: FavoriteButtonProps) {
  const fetcher = useFetcher();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent click events

    fetcher.submit(
      { noteId: noteId.toString() },
      { method: 'POST', action: '/notes/favorite' }
    );
  };

  // Optimistic UI - show expected state while loading
  const isCurrentlyFavorite = fetcher.formData ? !isFavorite : isFavorite;
  const isLoading = fetcher.state !== 'idle';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn('h-8 w-8 hover:bg-transparent', className)}
      title={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn('h-4 w-4 transition-all duration-200', {
          'fill-yellow-400 text-yellow-400': isCurrentlyFavorite,
          'text-gray-400 hover:text-yellow-400': !isCurrentlyFavorite,
          'opacity-50': isLoading,
        })}
      />
    </Button>
  );
}
// This component allows users to toggle the favorite status of a note.
