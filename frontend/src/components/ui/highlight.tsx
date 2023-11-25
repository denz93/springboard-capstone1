
function Highlight({children, highlight}: {children: string | undefined, highlight: string | undefined}) {
  if (highlight === undefined) return <span>{children}</span>
  if (children === undefined) return <span></span>
  
  const lowerCaseChildren = children.toLocaleLowerCase()
  const lowerCaseHightlight = highlight.toLocaleLowerCase()

  const index = lowerCaseChildren.indexOf(lowerCaseHightlight);
  if (index === -1) return <span>{children}</span>
  const before = children.slice(0, index);
  const after = children.slice(index + highlight.length);
  const h = children.slice(index, index + highlight.length);
  return (
    <span>
      {before}
      <span className='font-extrabold bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text'>{h}</span>
      {after}
    </span>
  );
}

export default Highlight;