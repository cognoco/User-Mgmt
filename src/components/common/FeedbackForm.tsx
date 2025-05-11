import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { feedbackCategoryEnum } from '@/types/feedback';

interface FeedbackFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CATEGORY_OPTIONS = feedbackCategoryEnum.options;

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle screenshot file selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setScreenshot(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!category) {
      setError(t('please select a feedback type'));
      return;
    }
    if (!message.trim()) {
      setError(t('please enter your feedback'));
      return;
    }
    setLoading(true);
    let screenshotUrl: string | null = null;
    try {
      // Upload screenshot if present
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `screenshot-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(`feedback/${fileName}`, screenshot, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('screenshots')
          .getPublicUrl(`feedback/${fileName}`);
        screenshotUrl = publicUrlData?.publicUrl || null;
      }
      // Insert feedback
      const { error: insertError } = await supabase.from('feedback').insert([
        {
          category,
          message,
          screenshotUrl,
          createdAt: new Date().toISOString(),
        },
      ]);
      if (insertError) throw new Error(insertError.message);
      setSuccess(true);
      setCategory('');
      setMessage('');
      setScreenshot(null);
      setScreenshotPreview(null);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || t('error submitting feedback'));
      onError?.(err.message || t('error submitting feedback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow" aria-label={t('submit feedback')}>
      <h2 className="text-xl font-bold mb-4">{t('submit feedback')}</h2>
      {error && <div role="alert" className="text-red-600 mb-2">{error}</div>}
      {success && <div role="status" className="text-green-600 mb-2">{t('thank you for your feedback')}</div>}
      <div className="mb-4">
        <label htmlFor="feedback-type" className="block mb-1">{t('feedback type')}</label>
        <select
          id="feedback-type"
          name="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border rounded px-2 py-1"
          aria-required="true"
        >
          <option value="">{t('select type')}</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{t(opt)}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="feedback-message" className="block mb-1">{t('message')}</label>
        <textarea
          id="feedback-message"
          name="message"
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border rounded px-2 py-1"
          aria-required="true"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="feedback-screenshot" className="block mb-1">{t('attach screenshot (optional)')}</label>
        <input
          id="feedback-screenshot"
          name="screenshot"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleScreenshotChange}
          className="w-full"
        />
        {screenshotPreview && (
          <img src={screenshotPreview} alt={t('screenshot preview')} className="mt-2 max-h-40 rounded border" />
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-1 rounded"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? t('submitting...') : t('submit feedback')}
      </button>
    </form>
  );
};

export default FeedbackForm;
// Props: onSuccess, onError for host integration
// Emits: calls these props on respective actions
// Accessible: all fields labeled, ARIA roles for error/success
// i18n: all text via useTranslation
// Integrates Supabase, supports screenshot upload 