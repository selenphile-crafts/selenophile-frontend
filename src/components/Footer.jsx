import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full mt-section-gap bg-surface-container-high border-t border-surface-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter flex flex-col md:flex-row justify-between items-center gap-base">
        <div className="font-headline-md text-headline-md text-primary">Selenophile</div>
        <div className="flex gap-gutter flex-wrap justify-center">
          <Link className="font-caption text-caption text-on-surface-variant hover:text-secondary underline transition-all" to="/connectus">Connect Us</Link>
          <Link className="font-caption text-caption text-on-surface-variant hover:text-secondary underline transition-all" to="/connectus#policy">Privacy Policy</Link>
          <Link className="font-caption text-caption text-on-surface-variant hover:text-secondary underline transition-all" to="/connectus#rules">Zone rules</Link>
          <Link className="font-caption text-caption text-on-surface-variant hover:text-secondary underline transition-all" to="/connectus#resources">Resources</Link>
        </div>
        <p className="font-caption text-caption text-on-surface-variant text-center">
          © 2026 Selenophile Zone. Built for serious study.{' '}
          <span className="font-bold text-primary">@developed by Team ~Selenophile</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;