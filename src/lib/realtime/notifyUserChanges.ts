import { supabase } from '@/lib/supabase';

export async function notifyUserChanges(
  eventType: 'UPDATE' | 'INSERT' | 'DELETE',
  userId: string,
  newData?: any,
  oldData?: any
) {
  try {
    const payload = {
      type: 'user_change',
      event: eventType,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        new: newData,
        old: oldData,
      },
    };

    await supabase.channel('admin_notifications').send({
      type: 'broadcast',
      event: 'user_change',
      payload,
    });

    return true;
  } catch (error) {
    console.error('Failed to notify about user changes:', error);
    return false;
  }
}
