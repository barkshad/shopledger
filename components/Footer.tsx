import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center py-6 mt-8">
      <p className="text-sm text-subtle-text dark:text-dark-subtle-text">
        © {new Date().getFullYear()} ShopLedger | Built by Shadrack Baraka
      </p>
    </footer>
  );
};

export default Footer;
