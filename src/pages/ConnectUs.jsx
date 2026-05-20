import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ConnectUs = () => {
  const location = useLocation();

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // slight delay to ensure render
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-section-gap">
      {/* Hero */}
      <div className="text-center mb-section-gap max-w-3xl mx-auto">
        <motion.h1 {...fadeUp} className="font-headline-xl text-headline-xl text-primary mb-base">Connect With Us</motion.h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-gutter">Reach out through your preferred channel. We're here to help you focus and succeed.</p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-gutter mb-section-gap">
        {[

          { 
            svgIcon: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.394 0 .012 5.382.012 12.018c0 2.122.553 4.195 1.605 6.01L0 24l6.114-1.605c1.76.953 3.74 1.455 5.917 1.455 6.636 0 12.018-5.382 12.018-12.018S18.667 0 12.031 0zm0 21.849c-1.794 0-3.551-.482-5.093-1.396l-.365-.216-3.785.992.993-3.69-.236-.376A9.972 9.972 0 012.012 12.02c0-5.518 4.49-10.008 10.019-10.008 5.518 0 10.008 4.49 10.008 10.008s-4.49 10.008-10.008 10.008zm5.503-7.533c-.302-.151-1.785-.882-2.062-.983-.277-.101-.479-.151-.681.151-.201.302-.78 1.006-.957 1.208-.176.201-.352.226-.654.075-.302-.151-1.275-.471-2.43-1.503-.9-.803-1.507-1.795-1.684-2.097-.176-.302-.019-.465.132-.616.136-.136.302-.352.453-.529.151-.176.201-.302.302-.503.101-.201.05-.377-.025-.529-.075-.151-.681-1.642-.933-2.247-.245-.589-.496-.51-.681-.52-.176-.01-.377-.01-.579-.01-.201 0-.529.076-.806.377-.277.302-1.058 1.033-1.058 2.518 0 1.485 1.083 2.92 1.234 3.121.151.201 2.128 3.248 5.155 4.553.72.312 1.282.498 1.721.637.723.23 1.381.197 1.9.119.585-.088 1.785-.73 2.037-1.435.252-.705.252-1.31.176-1.435-.076-.126-.277-.201-.579-.352z"/></svg>,
            title: 'WhatsApp', 
            description: 'For Account Activation', 
            buttons: [
              { label: 'Chat on WhatsApp →', href: 'https://wa.me/9899044653' }
            ] 
          },
          { 
            svgIcon: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
            title: 'Instagram', 
            description: 'Just for fun', 
            buttons: [
              { label: '@selenophile_study', href: 'https://www.instagram.com/_sher_jahan?igsh=d2VweDI4N245cHdq' }
            ]
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter text-center hover:shadow-lg transition-all group flex flex-col items-center"
          >
            <div className="text-primary w-12 h-12 mb-4 flex items-center justify-center">
              {card.svgIcon}
            </div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">{card.title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow">{card.description}</p>
            <div className="flex flex-col gap-3 w-full mt-auto">
              {card.buttons.map((btn, btnIdx) => (
                <a 
                  key={btnIdx} 
                  href={btn.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block w-full bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-secondary transition-all"
                >
                  {btn.label}
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selenophile Information */}
      <div className="bg-surface-container-high border border-surface-variant rounded-xl p-gutter md:p-10">
        <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-gutter">Selenophile zone information</h2>
        <div className="flex flex-col gap-6">
          <div id="policy" className="bg-surface-bright rounded-xl p-5 border border-surface-variant scroll-mt-24">
            <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-primary text-3xl">privacy_tip</span><h3 className="font-headline-md text-headline-md text-primary">Privacy Policy</h3></div>
            <p className="font-body-md text-body-md text-on-surface-variant">We value your privacy. </p>
          </div>
          <div id="rules" className="bg-surface-bright rounded-xl p-5 border border-surface-variant scroll-mt-24">
  <div className="flex items-center gap-2 mb-3">
    <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
    <h3 className="font-headline-md text-headline-md text-primary">Digital zone rules</h3>
  </div>
  <ul className="list-disc list-inside font-caption text-caption text-on-surface-variant space-y-1">
    <li>Blissful Quiet: Maintain a peaceful atmosphere to help fellow readers focus without distraction</li>
    <li>Fresh Environment: No smoking, vaping, or eating inside — help protect digital zone resources</li>
    <li>Device Etiquette: Switch mobile phones to silent/vibration mode; take voice calls outside</li>
    <li>Digital Spaces: Community Wi-Fi is for educational and research use only (no social media or gaming)</li>
    <li>Workspace Care: Dispose of trash in provided dustbins to keep study spaces pleasant for others</li>
</ul>
</div>
         <div id="resources" className="bg-surface-bright rounded-xl p-5 border border-surface-variant scroll-mt-24">
  <div className="flex items-center gap-2 mb-3">
    <span className="material-symbols-outlined text-primary text-3xl">school</span>
    <h3 className="font-headline-md text-headline-md text-primary">Resources</h3>
  </div>
  <p className="font-body-md text-body-md text-on-surface-variant mb-3">Access free tools to supercharge your deep work sessions.</p>
  <ul className="list-disc list-inside font-caption text-caption text-on-surface-variant space-y-1">
    <li>Focus Timer: Built-in Pomodoro timer to structure your study sessions and track deep work streaks</li>
    <li>Creative Zone: A dedicated space for brainstorming, mind mapping, and sketching ideas digitally</li>
    <li>Sticky Notes Keeper: Save quick thoughts, to-dos, and reminders that stay visible across your sessions</li>
    <li>Resource : Support self-paced learning journeys</li>
</ul>
</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectUs;