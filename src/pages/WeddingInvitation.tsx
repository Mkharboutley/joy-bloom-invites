import { useEffect } from 'react';

const WeddingInvitation = () => {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/wedding.html';
  }, []);

  // Show loading while redirecting
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Tajawal, sans-serif',
      fontSize: '18px'
    }}>
      جاري تحميل الدعوة...
    </div>
  );
};

export default WeddingInvitation;