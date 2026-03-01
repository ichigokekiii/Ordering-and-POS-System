function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[200] bg-black/10 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="loader" />
      <p className="mt-6 text-sm font-medium text-[#7C8DB8] tracking-wide">
        Loading...
      </p>

      <style>{`
        .loader {
          width: 60px;
          --b: 8px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #7C8DB8;
          -webkit-mask:
            repeating-conic-gradient(#0000 0deg,#000 1deg 70deg,#0000 71deg 90deg),
            radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
          -webkit-mask-composite: destination-in;
                  mask-composite: intersect;
          animation: spinLoader 1s infinite linear;
        }

        @keyframes spinLoader {
          to { transform: rotate(0.5turn); }
        }
      `}</style>
    </div>
  );
}

export default LoadingOverlay;