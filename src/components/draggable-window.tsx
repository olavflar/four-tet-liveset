import { useState, useRef, useEffect, ReactNode } from 'react';

interface DraggableWindowProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  initialPosition: { x: number; y: number };
  width?: string;
  height?: string;
  zIndex?: number;
  onFocus?: () => void;
  statusBar?: ReactNode;
}

export function DraggableWindow({
  title,
  icon,
  children,
  initialPosition,
  width = 'auto',
  height = 'auto',
  zIndex = 1,
  onFocus,
  statusBar
}: DraggableWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.title')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      onFocus?.();
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragStart.y));
        
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={windowRef}
      className="retro-window"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        height,
        zIndex,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="retro-title-bar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="title">
          {icon}
          <span>{title}</span>
        </div>
        <div className="controls">
          <button className="retro-window-btn">_</button>
          <button className="retro-window-btn">□</button>
          <button className="retro-window-btn">×</button>
        </div>
      </div>
      
      <div style={{ height: 'calc(100% - 25px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
        
        {statusBar && (
          <div className="retro-status-bar">
            {statusBar}
          </div>
        )}
      </div>
    </div>
  );
}