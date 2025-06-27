import { useEffect, useState } from 'react';

const WeddingInvitation = () => {
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure proper loading
    const timer = setTimeout(() => {
      try {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
          // Use window.location.replace for a more reliable redirect
          window.location.replace('/wedding.html');
        }
      } catch (error) {
        console.error('Failed to redirect to wedding.html:', error);
        // Fallback: try regular href assignment
        try {
          window.location.href = '/wedding.html';
        } catch (fallbackError) {
          console.error('Fallback redirect also failed:', fallbackError);
          setRedirecting(false);
        }
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while redirecting
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Tajawal, sans-serif',
      fontSize: '18px',
      zIndex: 9999
    }}>
      {redirecting ? (
        <>
          {/* Loading animation */}
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          
          <div style={{ textAlign: 'center', direction: 'rtl' }}>
            <p style={{ marginBottom: '10px' }}>جاري تحميل الدعوة...</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Loading Wedding Invitation...</p>
          </div>
          
          {/* Fallback link */}
          <a 
            href="/wedding.html" 
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            اضغط هنا إذا لم يتم التحميل تلقائياً
          </a>
        </>
      ) : (
        <div style={{ textAlign: 'center', direction: 'rtl' }}>
          <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>
            عذراً، حدث خطأ في تحميل الدعوة
          </p>
          <a 
            href="/wedding.html" 
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            اضغط هنا لعرض الدعوة
          </a>
        </div>
      )}
      
      {/* CSS for spin animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default WeddingInvitation;