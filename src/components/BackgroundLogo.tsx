export default function BackgroundLogo() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <div className="text-center">
          {/* Builders Monogram with gradient */}
          <div className="w-96 h-96 mb-4 mx-auto">
            <div className="w-full h-full bg-gradient-to-b from-spotify-green to-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-6xl font-work-sans tracking-tight">B</span>
            </div>
          </div>
          {/* Builders.to text */}
          <div className="text-black font-bold text-4xl font-inter">Builders.to</div>
        </div>
      </div>
    </div>
  );
}
