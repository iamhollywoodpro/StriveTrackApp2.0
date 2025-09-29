import React, { useState } from 'react';
import Icon from './ui/Icon';
import Button from './ui/Button';
import Input from './ui/Input';

const FriendInvitation = ({ isOpen, onClose, onSendInvitation }) => {
  const [inviteMethod, setInviteMethod] = useState('email'); // email or phone
  const [contactValue, setContactValue] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const defaultMessage = `Hey! I'm using StriveTrack 2.0 to track my fitness goals and would love to have you join me! It's an amazing app for tracking workouts, nutrition, habits, and progress. Let's motivate each other! 💪`;

  const validateInput = () => {
    if (!contactValue.trim()) {
      setError(`Please enter a valid ${inviteMethod}`);
      return false;
    }

    if (inviteMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactValue)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else if (inviteMethod === 'phone') {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(contactValue)) {
        setError('Please enter a valid phone number');
        return false;
      }
    }

    return true;
  };

  const handleSendInvitation = async () => {
    if (!validateInput()) return;

    try {
      setSending(true);
      setError('');

      const invitationData = {
        method: inviteMethod,
        contact: contactValue,
        message: message || defaultMessage,
        timestamp: new Date().toISOString()
      };

      await onSendInvitation(invitationData);

      // Reset form
      setContactValue('');
      setMessage('');
      onClose();
      
      // Show success message (this could be handled by parent component)
      alert(`Invitation sent successfully via ${inviteMethod}!`);

    } catch (err) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-elevation-3 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Invite a Friend
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Invitation Method */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              How would you like to invite them?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInviteMethod('email')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  inviteMethod === 'email'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="Mail" size={20} className="mx-auto mb-2" />
                <div className="text-sm font-medium">Email</div>
              </button>
              <button
                onClick={() => setInviteMethod('phone')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  inviteMethod === 'phone'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="Phone" size={20} className="mx-auto mb-2" />
                <div className="text-sm font-medium">SMS</div>
              </button>
            </div>
          </div>

          {/* Contact Input */}
          <div>
            <Input
              label={inviteMethod === 'email' ? 'Email Address' : 'Phone Number'}
              type={inviteMethod === 'email' ? 'email' : 'tel'}
              value={contactValue}
              onChange={(e) => {
                setContactValue(e.target.value);
                setError('');
              }}
              placeholder={
                inviteMethod === 'email' 
                  ? 'friend@example.com' 
                  : '+1 (555) 123-4567'
              }
              disabled={sending}
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows="3"
              placeholder={defaultMessage}
              disabled={sending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to use the default invitation message
            </p>
          </div>

          {/* Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Preview:</h4>
            <div className="text-sm text-muted-foreground">
              <div className="mb-2">
                <span className="font-medium">To:</span> {contactValue || `[${inviteMethod}]`}
              </div>
              <div className="bg-white/70 rounded p-2 text-xs">
                {message || defaultMessage}
              </div>
              <div className="mt-2 text-xs">
                <span className="font-medium">From:</span> StriveTrack 2.0 App
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              fullWidth
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={!contactValue || sending}
              fullWidth
              iconName={sending ? "Loader2" : "Send"}
              iconPosition="left"
            >
              {sending ? 'Sending...' : `Send ${inviteMethod === 'email' ? 'Email' : 'SMS'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendInvitation;