import { motion } from 'framer-motion';
import Image from 'next/image'; // Add for the logo
import Link from 'next/link';  // Add for linking
import { FaQuestionCircle } from 'react-icons/fa';

const Footer = () => (
  <motion.footer
    animate={{ opacity: [0, 1] }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
    className="w-full py-6 px-8 bg-black/40 backdrop-blur-lg text-white flex items-center justify-between"

  >
    {/* Logo at the bottom left */}
    <div className="flex items-center space-x-2">
      <Image src="/logo.png" alt="Glint Logo" width={80} height={40} />
    </div>

    {/* Centered Footer Content */}
    <div className="flex-1 text-center">
      <p className="text-sm">&copy; 2025 Glint. All Rights Reserved.</p>
      <div className="text-xs text-gray-300">
        {/* Linking to placeholder pages */}
        <Link href="/about">
          <span className="inline-block px-6 py-2 text-xl font-medium text-white hover:underline transition-all duration-300">
            About Glint
          </span>
        </Link>
        <Link href="/help">
          <span className="inline-flex items-center space-x-2 px-6 py-2 text-xl font-medium text-white hover:underline transition-all duration-300">
            <FaQuestionCircle /> {/* Help Icon */}
            <span>Help</span>
          </span>
        </Link>
      </div>
    </div>
  </motion.footer>
);

export default Footer;
