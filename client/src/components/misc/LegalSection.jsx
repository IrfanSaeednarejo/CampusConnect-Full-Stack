export default function LegalSection({
  title,
  content,
  list,
  className = "",
  titleClassName = "",
  contentClassName = "",
  listClassName = "",
}) {
  return (
    <section className={className}>
      <h2 className={titleClassName}>{title}</h2>
      <p className={contentClassName}>{content}</p>
      {list && (
        <ul className={listClassName}>
          {list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
