import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { validateName, validateEmail, validatePassword, validateContact, sanitizeForm } from '../utils/validators';

const Home = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [toast, setToast] = useState(null);
  
  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotData, setForgotData] = useState({ firstName: '', email: '', contact: '', newPassword: '', verifyPassword: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotVerifyPassword, setShowForgotVerifyPassword] = useState(false);

  // Signup State
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', contact: '', email: '', password: '', rePassword: '' });
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupRePassword, setShowSignupRePassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    const sanitizedForm = sanitizeForm(signupForm);
    
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
    
    setSignupLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: sanitizedForm.firstName,
        lastName: sanitizedForm.lastName,
        contact: sanitizedForm.contact,
        email: sanitizedForm.email,
        password: sanitizedForm.password
      });
      setToast({ message: 'Account created! Please wait for admin approval.', type: 'success' });
      setSignupForm({ firstName: '', lastName: '', contact: '', email: '', password: '', rePassword: '' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Signup failed', type: 'error' });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeForm(loginData);
    
    const emailError = validateEmail(sanitized.email);
    if (emailError) return setToast({ message: emailError, type: 'error' });
    
    const passwordError = validatePassword(sanitized.password);
    if (passwordError) return setToast({ message: passwordError, type: 'error' });

    setLoginLoading(true);
    try {
      const res = await login(sanitized.email, sanitized.password);
      if (res.user.role === 'admin-pending') {
        setToast({ message: 'Admin login detected. Redirecting...', type: 'success' });
        navigate('/admin');
      } else if (res.user.status === 'active') {
        setToast({ message: `Welcome back, ${res.user.firstName}!`, type: 'success' });
        navigate('/planner');
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeForm(forgotData);

    const nameError = validateName(sanitized.firstName);
    if (nameError) return setToast({ message: nameError, type: 'error' });

    const emailError = validateEmail(sanitized.email);
    if (emailError) return setToast({ message: emailError, type: 'error' });

    const contactError = validateContact(sanitized.contact);
    if (contactError) return setToast({ message: contactError, type: 'error' });

    const passwordError = validatePassword(sanitized.newPassword);
    if (passwordError) return setToast({ message: passwordError, type: 'error' });

    if (sanitized.newPassword !== sanitized.verifyPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', sanitized);
      setToast({ message: res.data.message || 'Password reset successfully', type: 'success' });
      setForgotMode(false);
      setForgotData({ firstName: '', email: '', contact: '', newPassword: '', verifyPassword: '' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error resetting password', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
      {/* Hero Section */}
      <div className="text-center mb-section-gap max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline-xl text-headline-xl text-primary mb-base"
        >
          Enter Your Private Study Sanctuary
        </motion.h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-gutter">
          SELENOPHILE STUDY ZONE is a dedicated <span className="font-bold text-primary">self-study zone</span> designed
          for deep work and intellectual focus.
        </p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter flex-grow flex flex-col justify-center"
          >
            <span className="material-symbols-outlined text-primary text-5xl mb-base">menu_book</span>
            <h2 className="font-headline-md text-headline-md text-primary mb-base">Traditional Weight, Modern Speed</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Our aesthetic balances the gravitas of an ancient university hall with the seamless efficiency of a digital workstation.
            </p>
          </motion.div>
          <div className="rounded-xl overflow-hidden relative h-64 md:h-96 lg:h-64 border border-surface-variant">
            <img className="w-full h-full object-cover" alt="Quiet study desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1n0V02NqGAsaxrDFXbFxAzzxpc0dwGJQhdl1ilNmbXmpK3B-2PFfUarOIcGKl44luw_sytsqIykHv_sGwpefOF6G5MZHdetW7GqHz6SpQ4SMjaG3pV-px_VdsVMxG43X1p5K9xQYHRsXUlDB_JLeOHeCzaZsFgf1QiUIm9-vdtg2b5mV-OVDRpoAldChbO5vmzJ68a7qUUQktLZ1pPyXFGlfKkq7JjZ3BndNnpIydREQ8hraQ-4Bl5yK2bV1XAZ3TbnsfCYtjhz3f" />
          </div>
        </div>

        {/* Right Panel: Forms */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          
          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter flex flex-col flex-grow relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md text-primary">Become a Member</h3>
            </div>
            <form className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar" onSubmit={handleSignup}>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">First Name *</label>
                <input required className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g., Sher Jahan" value={signupForm.firstName} onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Last Name <span className="text-xs font-normal text-on-surface-variant/70">(Optional)</span></label>
                <input className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g., Doe" value={signupForm.lastName} onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Contact Number *</label>
                <input required type="tel" className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="+91 9999-111-0000" value={signupForm.contact} onChange={(e) => setSignupForm({ ...signupForm, contact: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Email Address *</label>
                <input required type="email" className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="name@example.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Password *</label>
                <div className="relative">
                  <input required type={showSignupPassword ? "text" : "password"} className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full pr-10 text-sm" placeholder="••••••••" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">{showSignupPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Re-enter Password *</label>
                <div className="relative">
                  <input required type={showSignupRePassword ? "text" : "password"} className="bg-surface-bright border border-surface-variant rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full pr-10 text-sm" placeholder="••••••••" value={signupForm.rePassword} onChange={(e) => setSignupForm({ ...signupForm, rePassword: e.target.value })} />
                  <button type="button" onClick={() => setShowSignupRePassword(!showSignupRePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">{showSignupRePassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={signupLoading}
                className="bg-primary text-on-primary py-2.5 rounded-lg font-label-md mt-2 hover:bg-secondary transition-all active:opacity-80 disabled:opacity-50"
              >
                {signupLoading ? 'Signing up...' : 'Create Account'}
              </button>
            </form>
          </motion.div>

          {/* Login Form / Forgot Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-high border border-outline-variant rounded-xl p-gutter flex flex-col justify-between overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {!forgotMode ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col justify-between h-full"
                >
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-gutter">Existing Scholars</h3>
                    <form className="flex flex-col gap-gutter" onSubmit={handleLogin}>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
                        <input
                          required
                          type="email"
                          className="bg-surface-bright border border-surface-variant rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="Email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="font-label-md text-label-md text-on-surface-variant">Password</label>
                          <button type="button" onClick={() => setForgotMode(true)} className="font-caption text-caption text-primary hover:text-tertiary-fixed-dim transition-colors">
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            required
                            type={showPassword ? "text" : "password"}
                            className="bg-surface-bright border border-surface-variant rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full pr-10"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="bg-primary-container text-on-primary py-3 rounded-lg font-label-md mt-base hover:bg-primary transition-all active:opacity-80 text-white disabled:opacity-50"
                      >
                        {loginLoading ? 'Logging in...' : 'Access Workspace'}
                      </button>
                    </form>
                  </div>
                  <div className="mt-gutter pt-gutter border-t border-outline-variant">
                    <p className="font-caption text-caption text-on-surface-variant text-center">By logging in, you agree to our Zone Rules.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col justify-between h-full"
                >
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-gutter flex items-center gap-2">
                      <button type="button" onClick={() => setForgotMode(false)} className="material-symbols-outlined hover:text-secondary transition-colors">arrow_back</button>
                      Reset Password
                    </h3>
                    <form className="flex flex-col gap-3" onSubmit={handleForgotPassword}>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">First Name</label>
                        <input
                          required
                          type="text"
                          className="bg-surface-bright border border-surface-variant rounded-lg p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="Julian"
                          value={forgotData.firstName}
                          onChange={(e) => setForgotData({ ...forgotData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
                        <input
                          required
                          type="email"
                          className="bg-surface-bright border border-surface-variant rounded-lg p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="Email"
                          value={forgotData.email}
                          onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">Contact Number</label>
                        <input
                          required
                          type="tel"
                          className="bg-surface-bright border border-surface-variant rounded-lg p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="+1 (555) 000-0000"
                          value={forgotData.contact}
                          onChange={(e) => setForgotData({ ...forgotData, contact: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="font-label-md text-label-md text-on-surface-variant">New Password</label>
                        <div className="relative">
                          <input
                            required
                            type={showForgotNewPassword ? "text" : "password"}
                            className="bg-surface-bright border border-surface-variant rounded-lg p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full pr-10"
                            placeholder="••••••••"
                            value={forgotData.newPassword}
                            onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">{showForgotNewPassword ? 'visibility' : 'visibility_off'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">Re-enter Password to Verify</label>
                        <div className="relative">
                          <input
                            required
                            type={showForgotVerifyPassword ? "text" : "password"}
                            className="bg-surface-bright border border-surface-variant rounded-lg p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full pr-10"
                            placeholder="••••••••"
                            value={forgotData.verifyPassword}
                            onChange={(e) => setForgotData({ ...forgotData, verifyPassword: e.target.value })}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowForgotVerifyPassword(!showForgotVerifyPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">{showForgotVerifyPassword ? 'visibility' : 'visibility_off'}</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="bg-primary-container text-on-primary py-2.5 rounded-lg font-label-md mt-2 hover:bg-primary transition-all active:opacity-80 text-white disabled:opacity-50"
                      >
                        {forgotLoading ? 'Resetting...' : 'Create New Password'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="mt-section-gap bg-surface-container border border-surface-variant rounded-xl p-gutter md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-base">
          {[
            { icon: 'timer', label: 'Distraction Free', value: '100%' },
            { icon: 'auto_stories', label: 'Learners got their creative and focused zone', value: '100+' },
            { icon: 'architecture', label: 'built for discipline orientation', value: 'Zone' },
            { icon: 'palette', label: 'creative and planner zones', value: 'Access' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-surface-container-lowest p-gutter rounded-xl border border-surface-variant flex flex-col items-center text-center shadow-sm"
            >
              <span className="material-symbols-outlined text-primary mb-2 text-3xl">{item.icon}</span>
              <span className="font-headline-md text-primary text-2xl">{item.value}</span>
              <span className="font-caption text-caption uppercase tracking-wider">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Home;