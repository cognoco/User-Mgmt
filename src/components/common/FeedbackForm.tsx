import React from 'react';

/**
 * FeedbackForm Component
 * Placeholder for submitting user feedback.
 */
export const FeedbackForm: React.FC = () => {
  return (
    <form>
      <h2>Submit Feedback</h2>
      <label htmlFor="feedback-type">Type:</label>
      <select id="feedback-type" name="type">
        <option value="bug">Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="general">General Feedback</option>
      </select>
      <br />
      <label htmlFor="feedback-message">Message:</label>
      <textarea id="feedback-message" name="message" rows={4} cols={50}></textarea>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default FeedbackForm; 