import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import { validateName, validateEmail, validatePassword, validateContact, sanitizeForm } from '../utils/validators';

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', contact: '', email: '', password: '', rePassword: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedForm = sanitizeForm(form);
    
    // Validations
    const nameError = validateName(sanitizedForm.firstName);
    if (nameError) return setToast({ message: `First Name: ${nameError}`, type: 'error' });
    
    if (sanitizedForm.lastName) {
      const lastNameError = validateName(sanitizedForm.lastName);
      if (lastNameError) return setToast({ message: `Last Name: ${lastNameError}`, type: 'error' });
    }
    
    const contactError = validateContact(sanitizedForm.contact);
    if (contactError) return setToast({ message: contactError, type: 'error' });
    
    const emailError = validateEmail(sanitizedForm.email);
    if (emailError) return setToast({ message: emailError, type: 'error' });
    
    const passwordError = validatePassword(sanitizedForm.password);
    if (passwordError) return setToast({ message: passwordError, type: 'error' });

    if (sanitizedForm.password !== sanitizedForm.rePassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: sanitizedForm.firstName,
        lastName: sanitizedForm.lastName,
        contact: sanitizedForm.contact,
        email: sanitizedForm.email,
        password: sanitizedForm.password
      });
      setToast({ message: 'Account created! Please wait for admin approval.', type: 'success' });
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Signup failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
      <div className="text-center mb-section-gap max-w-3xl mx-auto">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-base">Become a Member</h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter md:p-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
          <div><label className="font-label-md text-label-md text-on-surface-variant">First Name *</label><input required type="text" className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 focus:ring-primary" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
          <div><label className="font-label-md text-label-md text-on-surface-variant">Last Name (Optional)</label><input type="text" className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
          <div><label className="font-label-md text-label-md text-on-surface-variant">Contact Number *</label><input required type="tel" className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /></div>
          <div><label className="font-label-md text-label-md text-on-surface-variant">Email Address *</label><input required type="email" className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Password *</label>
            <div className="relative"><input required type={showPassword ? 'text' : 'password'} className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 pr-10" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /><span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'visibility' : 'visibility_off'}</span></div>
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Re-enter Password *</label>
            <div className="relative"><input required type={showRePassword ? 'text' : 'password'} className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 pr-10" value={form.rePassword} onChange={e => setForm({...form, rePassword: e.target.value})} /><span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowRePassword(!showRePassword)}>{showRePassword ? 'visibility' : 'visibility_off'}</span></div>
          </div>
          <button type="submit" disabled={loading} className="bg-primary text-on-primary py-3 rounded-lg font-label-md mt-4 hover:bg-secondary transition-all disabled:opacity-50">Create Account</button>
          <p className="text-center text-caption text-on-surface-variant mt-2">Already have an account? <a href="/" className="text-primary hover:underline">Log in here</a></p>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SignUp;