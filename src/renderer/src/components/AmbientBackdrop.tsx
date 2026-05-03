import { usePlayer } from '../store/player';

/**
 * Full-app ambient backdrop. Reads the current track's accent color and
 * paints a soft, slowly-rotating gradient behind everything.
 */
export function AmbientBackdrop() {
  const current = usePlayer((s) => s.current);
  const accent = current?.accent ?? '#5E6AD2';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -top-1/3 -left-1/4 h-[120vh] w-[120vh] rounded-full blur-3xl opacity-40 animate-spin-slow"
        style={{
          background: `radial-gradient(closest-side, ${accent}, transparent 65%)`
        }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[120vh] w-[120vh] rounded-full blur-3xl opacity-30 animate-spin-slow"
        style={{
          background: `radial-gradient(closest-side, #5E6AD2, transparent 65%)`,
          animationDuration: '36s',
          animationDirection: 'reverse'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/30 via-bg-base/85 to-bg-deep" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
          backgroundSize: '3px 3px'
        }}
      />
    </div>
  );
}
