import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Component Model để tải file .glb
function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={1.0} />; 
}

// THAY ĐỔI: Nhận prop modelPath thay vì modelFile
const Pet3DViewer = ({ modelPath }) => {
  console.log('📦 Pet3DViewer received modelPath:', modelPath); // DEBUG LOG
  
  if (!modelPath) {
    return <div className="viewer-error">Không có model 3D cho thú cưng này.</div>;
  }

  // Nếu modelPath đã là full URL, dùng trực tiếp
  // Nếu chỉ là tên file, thêm prefix
  const fullModelPath = modelPath.startsWith('http') 
    ? modelPath 
    : `http://localhost:5000${modelPath}`;
  
  console.log('🚀 Loading model from:', fullModelPath); // DEBUG LOG

  return (
    <div className="pet-3d-viewer-container">
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        <Suspense fallback={null}>
          <Model modelPath={fullModelPath} />
        </Suspense>
        
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Pet3DViewer;