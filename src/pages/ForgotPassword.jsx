import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return setMessage({ text: 'Invalid email', error: true });
    setMessage({ text: `Reset link sent to ${email} (demo)`, error: false });
    setEmail('');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
      <div className="text-center mb-section-gap max-w-3xl mx-auto">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-base">Reset Your Password</h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      <div className="max-w-md mx-auto bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
          <div><label className="font-label-md text-label-md text-on-surface-variant">Email Address</label><input type="email" required className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <button type="submit" className="bg-primary text-on-primary py-3 rounded-lg font-label-md hover:bg-secondary">Send Reset Link</button>
        </form>
        {message && <div className={`mt-4 p-3 rounded-lg text-center ${message.error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary'}`}>{message.text}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;