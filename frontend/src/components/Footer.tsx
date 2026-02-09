import { motion } from 'framer-motion';
import Image from 'next/image';

const Footer = () => (
  <motion.footer
    animate={{ opacity: [0, 1] }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
    className="w-full py-6 px-8 bg-black/40 backdrop-blur-lg text-white flex items-center justify-between"

  >
    {/* Logo at the bottom left */}
    <div className="flex items-center space-x-2">
      <Image src="/glint-logo.png" alt="Glint Logo" width={80} height={40} />
    </div>

    {/* Centered Footer Content */}
    <div className="flex-1 text-center">
      <p className="text-sm">&copy; 2025 Glint. All Rights Reserved.</p>
    </div>
  </motion.footer>
);

export default Footer;
