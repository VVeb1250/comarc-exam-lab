export default function SvgBlock({ source, label = 'ภาพประกอบ' }) {
  return (
    <figure className="diagram-card inline-diagram">
      <div className="diagram-heading"><strong>{label}</strong></div>
      <div className="diagram-svg" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: source }} />
    </figure>
  );
}
