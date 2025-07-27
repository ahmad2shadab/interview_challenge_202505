import { useEffect, useRef, useState } from 'react';
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { type NoteForm } from '~/schemas/notes';

interface NoteFormProps {
  defaultValues?: Partial<NoteForm>;
  onSuccess?: () => void;
  isOpen?: boolean; // ← NEW: Track if form is open
}

export function NoteForm({
  defaultValues = {},
  onSuccess,
  isOpen,
}: NoteFormProps) {
  const actionData = useActionData<{
    success: boolean;
    errors?: Record<string, string[]>;
  }>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastSuccessTime, setLastSuccessTime] = useState<number>(0);

  const isSubmitting = navigation.state === 'submitting';

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setHasSubmitted(true);
    submit(formData, { method: 'post' });
  };

  // Handle success with better timing control
  useEffect(() => {
    if (actionData?.success && hasSubmitted && isOpen) {
      const currentTime = Date.now();

      // Prevent duplicate success handling within 1 second
      if (currentTime - lastSuccessTime > 1000) {
        console.log('🎉 Form success detected - processing...');

        // Reset form
        formRef.current?.reset();

        // Update last success time
        setLastSuccessTime(currentTime);

        // Small delay to ensure smooth UX
        setTimeout(() => {
          onSuccess?.();
          setHasSubmitted(false); // Reset for next submission
        }, 100);
      }
    }
  }, [actionData?.success, hasSubmitted, isOpen, onSuccess, lastSuccessTime]);

  // Reset state when form is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setHasSubmitted(false);
    }
  }, [isOpen]);

  // Reset state when navigation completes
  useEffect(() => {
    if (navigation.state === 'idle' && hasSubmitted) {
      // Additional cleanup after navigation settles
      const timer = setTimeout(() => {
        if (!isSubmitting) {
          setHasSubmitted(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [navigation.state, hasSubmitted, isSubmitting]);

  return (
    <Form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues.title}
          required
          maxLength={255}
          aria-invalid={actionData?.errors?.title ? true : undefined}
          aria-errormessage={actionData?.errors?.title?.join(', ')}
        />
        {actionData?.errors?.title && (
          <p className="text-sm text-red-500" id="title-error">
            {actionData.errors.title.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description}
          required
          rows={5}
          maxLength={10000}
          placeholder="Write your note here..."
          aria-invalid={actionData?.errors?.description ? true : undefined}
          aria-errormessage={actionData?.errors?.description?.join(', ')}
        />
        {actionData?.errors?.description && (
          <p className="text-sm text-red-500" id="description-error">
            {actionData.errors.description.join(', ')}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Note'}
      </Button>
    </Form>
  );
}
