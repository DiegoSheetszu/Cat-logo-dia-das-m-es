export default function Loading() {
  return (
    <main aria-live="polite" className="loading-screen">
      <span className="loading-mark" aria-hidden="true" />
      <p>Preparando seu espaço de trabalho...</p>
    </main>
  );
}
